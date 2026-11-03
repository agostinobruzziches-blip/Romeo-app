import { describe, expect, it } from 'vitest';
import { GUIDE, guideAsText } from '../screens/parent/guideContent';

describe('guida per genitori e tutor', () => {
  it('testo da condividere: nome e aiutante sostituiti, niente segni di formattazione', () => {
    const t = guideAsText('Romeo', 'papà o mamma');
    expect(t).toContain('Romeo');
    expect(t).toContain('Chiedi a papà o mamma');
    expect(t).not.toMatch(/\*\*|\{nome\}|\{aiuto\}/);
  });
  it('ogni sezione ha un titolo e del contenuto, e il grassetto è sempre chiuso', () => {
    for (const s of GUIDE) {
      expect(s.title.length).toBeGreaterThan(3);
      expect(s.blocks.length).toBeGreaterThan(0);
      const all = JSON.stringify(s);
      expect((all.match(/\*\*/g) ?? []).length % 2, s.id).toBe(0);
    }
  });
});
