import { useEffect, useRef, useState } from 'react';
import { dayKey } from '../core/dates';
import { MIN_ITEMS_BEFORE_OFFER, detectFatigue, type AttemptTrace, type ItemTrace } from '../core/fatigue';
import { mergeQueues, requeue, shorten } from '../core/mission/queue';
import { missionItemCount, secondsPerItem } from '../core/mission/size';
import type { LearningModule, MissionItem, StepEvent } from '../core/module';
import { createRng } from '../core/random';
import { awardMedal, finalizeSession, type RewardSummary } from '../core/rewards';
import { sounds } from '../core/sound';
import { addAttempt, getSettings, recentFirstAttemptMs, saveSession, startSession } from '../db/repo';
import { db, type EndReason, type Session, type Settings } from '../db/schema';
import { T } from '../i18n/testi';
import { activeModules, getModule } from '../modules/registry';
import { BigButton } from '../ui/BigButton';
import { Celebration } from '../ui/Celebration';
import { Guide, Owl } from '../ui/Guide';
import { Medal, Star } from '../ui/Icons';
import { ProgressBar } from '../ui/ProgressBar';
import { CardView } from '../ui/CardView';
import { EPOCH_BY_ID } from '../content/epochs';
import { Screen } from '../ui/Screen';

type Phase =
  | 'caricamento'
  | 'inizio'
  | 'esercizio'
  | 'giusto'
  | 'tenacia'
  | 'soluzione'
  | 'aiuto'
  | 'genitore'
  | 'stanchezza'
  | 'chiusura'
  | 'riepilogo'
  | 'premio'
  | 'carta'
  | 'fine';

interface Run {
  settings: Settings;
  session: Session;
  queue: MissionItem[];
  index: number;
  current: MissionItem;
  attemptNo: number;
  wrong: number;
  /** Risposte finali sbagliate (dopo 3 si mostra la soluzione). */
  finalWrong: number;
  helpLevel: number;
  helpUsed: boolean;
  attemptStart: number;
  pausedAt: number | null;
  pausedMs: number;
  requeued: Set<string>;
  items: ItemTrace[];
  attempts: AttemptTrace[];
  baselineMs: number;
  improvements: string[];
  fatiguePending: boolean;
  rng: ReturnType<typeof createRng>;
  focusLabel: string;
}

export function Mission({ repeat, onExit }: { repeat: boolean; onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('caricamento');
  const [message, setMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [, force] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const run = useRef<Run | null>(null);
  const started = useRef(false);
  const busy = useRef(false);
  const rerender = () => force((n) => n + 1);

  // --- Preparazione: numero fisso di esercizi, deciso adesso
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const settings = await getSettings();
      const modules = activeModules(settings.activeModules);
      const recent = await recentFirstAttemptMs('tabelline');
      const rng = createRng();
      // Il tempo della missione si divide tra i moduli attivi; ognuno riceve un numero FISSO di esercizi.
      const totalWeight = modules.reduce((s, m) => s + m.timeShare, 0);
      const plans = await Promise.all(
        modules.map((m) => {
          const seconds = (settings.missionMinutes * 60 * m.timeShare) / totalWeight;
          const perItem = m.timedFatigue ? secondsPerItem(recent, m.estimatedSecondsPerItem) : m.estimatedSecondsPerItem;
          const count =
            modules.length === 1
              ? missionItemCount(settings.missionMinutes, perItem)
              : Math.min(m.maxItems, Math.max(m.minItems, Math.round(seconds / perItem)));
          return m.plan({ settings, today: dayKey(), rng }, count);
        }),
      );
      const queue = mergeQueues(plans.map((p) => p.items));
      const focusLabel = plans.map((p) => p.focusLabel).join(', e poi ');
      const session = await startSession(queue.length, repeat, focusLabel);
      const median = recent.length ? [...recent].sort((a, b) => a - b)[Math.floor(recent.length / 2)] : 0;
      run.current = {
        settings,
        session,
        queue,
        index: 0,
        current: queue[0],
        attemptNo: 1,
        wrong: 0,
        finalWrong: 0,
        helpLevel: 0,
        helpUsed: false,
        attemptStart: 0,
        pausedAt: null,
        pausedMs: 0,
        requeued: new Set(),
        items: [],
        attempts: [],
        baselineMs: median,
        improvements: [],
        fatiguePending: false,
        rng,
        focusLabel,
      };
      setPhase('inizio');
    })();
  }, [repeat]);

  const r = run.current;
  if (!r || phase === 'caricamento') {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <Owl size={120} />
        </div>
      </Screen>
    );
  }
  const mod: LearningModule = getModule(r.current.moduleId);
  const name = r.settings.childName || 'Esploratore';

  // ---------- azioni ----------
  const beginItem = () => {
    r.attemptNo = 1;
    r.wrong = 0;
    r.finalWrong = 0;
    r.helpLevel = 0;
    r.helpUsed = false;
    r.pausedMs = 0;
    r.attemptStart = performance.now();
    setMessage(null);
    setPhase('esercizio');
  };

  const elapsed = () => Math.round(performance.now() - r.attemptStart - r.pausedMs);

  const finishItem = async (solved: boolean) => {
    const outcome = {
      firstTry: solved && r.wrong === 0,
      solved,
      wrongAttempts: r.wrong,
      helpUsed: r.helpUsed,
      ms: elapsed(),
    };
    const res = await mod.record(r.current, outcome, dayKey());
    r.improvements.push(...res.improvements);
    if (!mod.multiStep && (!outcome.firstTry || outcome.helpUsed) && !r.requeued.has(r.current.key)) {
      const next = requeue(r.queue, r.index, mod.replay(r.current, r.rng));
      if (next) {
        r.queue = next;
        r.requeued.add(r.current.key);
      }
    }
    r.session.doneItems += 1;
    if (!solved) r.session.unsolved += 1;
    await saveSession(r.session);
  };

  const checkFatigue = () => {
    const signals = detectFatigue(r.items, r.attempts, r.baselineMs, Date.now());
    if (!signals.length) return;
    const known = new Set(r.session.fatigueSignals.map((s) => `${s.kind}-${s.itemIndex}`));
    for (const s of signals) if (!known.has(`${s.kind}-${s.itemIndex}`)) r.session.fatigueSignals.push(s);
    if (!r.session.fatigueOffered && r.session.doneItems + 1 >= MIN_ITEMS_BEFORE_OFFER) r.fatiguePending = true;
  };

  const submit = async (answer: unknown) => {
    if (phase !== 'esercizio' || busy.current) return;
    busy.current = true;
    try {
      await handleAnswer(answer);
    } finally {
      busy.current = false;
    }
  };

  const handleAnswer = async (answer: unknown) => {
    const ms = elapsed();
    const ev = mod.evaluate(r.current, answer);
    await addAttempt({
      sessionId: r.session.id,
      moduleId: r.current.moduleId,
      itemKey: r.current.key,
      itemIndex: r.index,
      role: r.current.role,
      format: r.current.format,
      tag: r.current.tag,
      category: r.current.category,
      attemptNo: r.attemptNo,
      correct: ev.correct,
      errorType: ev.errorType,
      ms,
      helpUsed: r.helpUsed ? `livello-${r.helpLevel}` : undefined,
      at: Date.now(),
    });
    r.attempts.push({ correct: ev.correct, ms });
    if (r.attemptNo === 1 && mod.timedFatigue) r.items.push({ itemIndex: r.index, firstCorrect: ev.correct, firstMs: ms });
    checkFatigue();

    if (ev.correct) {
      if (r.wrong === 0) {
        r.session.firstTryCorrect += 1;
        sounds.giusto();
        setPhase('giusto');
      } else {
        r.session.tenacityMedals += 1;
        await awardMedal(r.session.id, `${r.current.key}`);
        sounds.medaglia();
        setPhase('tenacia');
      }
      await finishItem(true);
      return;
    }
    r.wrong += 1;
    r.finalWrong += 1;
    if (r.finalWrong >= 3) {
      await finishItem(false);
      setPhase('soluzione');
      return;
    }
    r.attemptNo += 1;
    r.current = mod.retryItem(r.current);
    r.attemptStart = performance.now();
    r.pausedMs = 0;
    setMessage(r.wrong === 1 ? T.quasi : T.quasiAiuto);
    rerender();
  };

  /** Passo intermedio di un esercizio a più passi: si registra, l'esercizio resta com'è. */
  const step = async (ev: StepEvent) => {
    const ms = elapsed();
    await addAttempt({
      sessionId: r.session.id,
      moduleId: r.current.moduleId,
      itemKey: r.current.key,
      itemIndex: r.index,
      role: r.current.role,
      format: `${r.current.format}:${ev.step}`,
      tag: r.current.tag,
      category: r.current.category,
      attemptNo: r.attemptNo,
      correct: ev.correct,
      errorType: ev.errorType,
      ms,
      helpUsed: r.helpUsed ? `livello-${r.helpLevel}` : undefined,
      at: Date.now(),
    });
    r.attempts.push({ correct: ev.correct, ms });
    if (!ev.correct) {
      r.wrong += 1;
      r.attemptNo += 1;
    }
    // il tempo del passo successivo parte da adesso
    r.attemptStart = performance.now();
    r.pausedMs = 0;
    checkFatigue();
  };

  const end = async (reason: EndReason) => {
    setPhase('chiusura');
    const attempts = await db.attempts.where('sessionId').equals(r.session.id).toArray();
    const improvements = [...r.improvements];
    const milestones: Array<{ ref: string; reason: string }> = [];
    for (const m of activeModules(r.settings.activeModules)) {
      const res = await m.onSessionEnd(r.session, attempts);
      improvements.push(...res.improvements);
      milestones.push(...res.milestones);
    }
    r.improvements = improvements;
    setSummary(await finalizeSession(r.session, reason, improvements, milestones));
    setPhase('riepilogo');
  };

  const next = () => {
    if (r.fatiguePending) {
      r.fatiguePending = false;
      r.session.fatigueOffered = true;
      void saveSession(r.session);
      setPhase('stanchezza');
      return;
    }
    if (r.index + 1 >= r.queue.length) {
      void end('completata');
      return;
    }
    r.index += 1;
    r.current = r.queue[r.index];
    beginItem();
  };

  const openHelp = () => {
    r.helpLevel = Math.min(mod.maxHelpLevel, r.helpLevel + 1);
    if (!r.helpUsed) r.session.helpCount += 1;
    r.helpUsed = true;
    setPhase('aiuto');
  };

  const pause = () => {
    r.pausedAt = performance.now();
    r.session.parentHelpCount += 1;
    setPhase('genitore');
  };
  const resume = () => {
    if (r.pausedAt !== null) r.pausedMs += performance.now() - r.pausedAt;
    r.pausedAt = null;
    setPhase('esercizio');
  };

  // ---------- schermate ----------
  const progress = <ProgressBar done={r.session.doneItems} total={r.queue.length} />;

  if (phase === 'inizio') {
    return (
      <Screen>
        <div className="flex flex-1 flex-col justify-center gap-8">
          <Guide size={110}>
            <p>{T.inizio(r.focusLabel, r.queue.length)}</p>
            <p className="mt-2 font-bold text-terracotta">{T.motto}</p>
          </Guide>
        </div>
        <BigButton onClick={beginItem}>{T.inizioPulsante}</BigButton>
      </Screen>
    );
  }

  if (phase === 'stanchezza') {
    return (
      <Screen>
        {progress}
        <div className="flex flex-1 flex-col justify-center">
          <Guide mood="felice" size={110}>
            {T.stanchezza(name)}
          </Guide>
        </div>
        <div className="flex flex-col gap-2">
          <BigButton onClick={() => void end('stanchezza')}>{T.miFermo}</BigButton>
          <BigButton
            variant="tenue"
            onClick={() => {
              r.queue = shorten(r.queue, r.index, 3);
              r.session.plannedItems = r.queue.length;
              next();
            }}
          >
            {T.ancoraUnPo}
          </BigButton>
        </div>
      </Screen>
    );
  }

  if (phase === 'soluzione') {
    return (
      <Screen>
        {progress}
        <div className="flex flex-1 flex-col items-center justify-center gap-5">
          <p className="text-xl">{T.soluzione}</p>
          <mod.Solution item={r.current} />
        </div>
        <BigButton onClick={next}>{T.hoCapito}</BigButton>
      </Screen>
    );
  }

  if (phase === 'chiusura') {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <Owl size={120} mood="felice" />
        </div>
      </Screen>
    );
  }

  if (phase === 'riepilogo' && summary) {
    return (
      <Screen>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto py-2">
          <Guide mood="felice">{T.riepilogo}</Guide>
          <div className="rounded-2xl bg-white p-4 text-center">
            <p className="text-lg text-inchiostro-2">Conquiste di oggi</p>
            <p className="text-6xl font-bold tabular-nums">{summary.conquiste}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-oliva-chiaro p-3 text-center">
              <Star size={40} />
              <p className="text-4xl font-bold tabular-nums">{summary.firstTry}</p>
              <p className="text-base leading-tight">giuste al primo colpo</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-ambra-chiaro p-3 text-center">
              <Medal size={40} />
              <p className="text-4xl font-bold tabular-nums">{summary.medals}</p>
              <p className="text-base leading-tight">medaglie della tenacia</p>
            </div>
          </div>
          {summary.medals > 0 && (
            <p className="text-center text-lg">
              Ogni medaglia vale come una risposta giusta al primo colpo. <b>{T.motto}</b>
            </p>
          )}
          {r.improvements.length > 0 && (
            <ul className="flex flex-col gap-2">
              {r.improvements.slice(0, 4).map((i) => (
                <li key={i} className="rounded-xl bg-egeo-chiaro px-4 py-2 text-lg">
                  {i}
                </li>
              ))}
            </ul>
          )}
        </div>
        <BigButton
          onClick={() => {
            sounds.festa();
            setPhase('premio');
          }}
        >
          {T.vediPremio}
        </BigButton>
      </Screen>
    );
  }

  if (phase === 'premio' && summary) {
    return (
      <Screen>
        <Celebration />
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <h2 className="text-3xl font-bold">{T.premio}</h2>
          <div className="festa-appare flex gap-1">
            {summary.stars.map((_, i) => (
              <Star key={i} size={64} />
            ))}
          </div>
          <ul className="flex flex-col gap-1 text-xl">
            {summary.stars.map((s, i) => (
              <li key={i}>⭐ {s}</li>
            ))}
          </ul>
          {summary.milestones.map((m) => (
            <p key={m} className="festa-appare rounded-2xl bg-ambra-chiaro px-4 py-3 text-xl font-bold">
              🏆 Traguardo: {m}
            </p>
          ))}
          <p className="text-lg text-inchiostro-2">
            Stelle in tutto: <b>{summary.totalStars}</b> · Medaglie: <b>{summary.totalMedals}</b>
            <br />
            Giorni di esplorazione: <b>{summary.streak.current}</b> di fila ({summary.streak.totalDays} in tutto)
          </p>
        </div>
        <BigButton onClick={() => setPhase(summary.newCards.length ? 'carta' : 'fine')}>{T.avanti}</BigButton>
      </Screen>
    );
  }

  if (phase === 'carta' && summary && summary.newCards[cardIdx]) {
    const card = summary.newCards[cardIdx];
    const epoch = EPOCH_BY_ID[card.epoch];
    const opened = summary.newEpochs.find((e) => e.id === card.epoch);
    const last = cardIdx >= summary.newCards.length - 1;
    return (
      <div style={{ background: epoch.colors.bg }}>
        <Screen>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto py-2 text-center">
            {opened ? (
              <p className="festa-appare rounded-2xl bg-white px-4 py-2 text-xl font-bold" style={{ color: epoch.colors.accent }}>
                Nuova epoca: {opened.name}!
              </p>
            ) : (
              <p className="text-2xl font-bold" style={{ color: epoch.colors.ink }}>
                {card.rare ? 'Carta rara!' : 'Nuova carta!'}
              </p>
            )}
            <div className="festa-appare flex w-full justify-center">
              <CardView id={card.id} owned size="grande" />
            </div>
            <p className="rounded-2xl bg-white p-3 text-lg leading-snug" style={{ color: epoch.colors.ink }}>
              {card.fact}
            </p>
          </div>
          <BigButton onClick={() => (last ? setPhase('fine') : setCardIdx(cardIdx + 1))}>{T.avanti}</BigButton>
        </Screen>
      </div>
    );
  }

  if (phase === 'fine') {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Owl size={150} mood="felice" />
          <h1 className="text-4xl font-bold leading-tight">{T.fine}</h1>
        </div>
        <BigButton onClick={onExit}>{T.esci}</BigButton>
      </Screen>
    );
  }

  // ---------- esercizio (anche "giusto" e "tenacia": stessa schermata, nessun movimento) ----------
  const answered = phase === 'giusto' || phase === 'tenacia';
  const feedback =
    phase === 'giusto' ? (
      <p className="text-2xl font-bold text-oliva">{T.giusto}</p>
    ) : phase === 'tenacia' ? (
      <div className="flex items-center gap-3 rounded-2xl bg-ambra-chiaro px-4 py-2">
        <Medal size={44} />
        <p className="text-left text-xl font-bold leading-tight">
          {T.tenacia}
          <br />
          <span className="text-terracotta">{T.motto}</span>
        </p>
      </div>
    ) : message ? (
      <p className="text-2xl font-bold text-ambra">{message}</p>
    ) : null;

  const toolbar = answered ? (
    <BigButton onClick={next}>{T.avanti}</BigButton>
  ) : (
    <div className="grid grid-cols-2 gap-2">
      <BigButton variant="aiuto" onClick={openHelp} className="text-lg">
        {T.aiutami}
      </BigButton>
      <BigButton variant="tenue" onClick={pause} className="text-lg leading-tight">
        {T.chiedi(r.settings.parentLabel)}
      </BigButton>
    </div>
  );

  const helpOverlay =
    phase === 'aiuto' ? (
      <Screen>
        {progress}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto py-4">
          <Owl size={72} />
          <mod.Help item={r.current} level={r.helpLevel} />
        </div>
        <div className="flex flex-col gap-2">
          {r.helpLevel < mod.maxHelpLevel && (
            <BigButton variant="aiuto" onClick={openHelp}>
              {T.altroAiuto}
            </BigButton>
          )}
          <BigButton onClick={() => setPhase('esercizio')}>{T.tornaAProvare}</BigButton>
        </div>
      </Screen>
    ) : null;

  const parentOverlay =
    phase === 'genitore' ? (
      <Screen>
        {progress}
        <div className="flex flex-1 flex-col justify-center gap-4">
          <h2 className="text-2xl font-bold">Pausa: tocca a {r.settings.parentLabel}</h2>
          <p className="rounded-2xl bg-white p-4 text-lg leading-relaxed">{mod.parentTip(r.current, r.settings)}</p>
          <p className="text-base text-inchiostro-2">
            Se lo vedi stanco va benissimo fermarsi: la missione vale come completata.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <BigButton onClick={resume}>Riprendi</BigButton>
          <BigButton variant="tenue" onClick={() => void end('genitore')}>
            Fermiamoci qui
          </BigButton>
        </div>
      </Screen>
    ) : null;

  // Aiuto e pausa si aprono SOPRA l'esercizio, che resta com'era (risposta scritta, passo del problema).
  const overlay = helpOverlay ?? parentOverlay;
  return (
    <>
      <div className={overlay ? 'hidden' : undefined}>
        <Screen>
          {progress}
          <mod.Exercise
            key={mod.multiStep ? r.current.uid : `${r.current.uid}-${r.attemptNo}`}
            item={r.current}
            attemptNo={r.attemptNo}
            locked={answered}
            onSubmit={(a) => void submit(a)}
            onStep={(ev) => void step(ev)}
            feedback={feedback}
            toolbar={toolbar}
          />
        </Screen>
      </div>
      {overlay}
    </>
  );
}
