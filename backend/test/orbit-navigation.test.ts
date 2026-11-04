import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEllipse } from '../../frontend/src/components/orbit-geometry';

test('seven orbit cards stay within the stage and never overlap throughout a full turn', () => {
  const sizes = [
    [1280, 390, 144, 100],
    [805, 390, 144, 100],
    [836, 460, 124, 96],
    [577, 460, 124, 96],
    [592, 480, 86, 82],
    [343, 480, 86, 82],
    [313, 480, 86, 82],
    [273, 520, 80, 78],
  ];
  for (const [width, height, cardWidth, cardHeight] of sizes) {
    const orbit = createEllipse(width, height, cardWidth, cardHeight);
    for (let frame = 0; frame < 360; frame++) {
      const cards = Array.from({ length: 7 }, (_, index) => orbit.at(frame / 360 + index / 7));
      for (const card of cards) {
        assert.ok(Math.abs(card.x) + cardWidth / 2 <= width / 2);
        assert.ok(Math.abs(card.y) + cardHeight / 2 <= height / 2);
      }
      for (let a = 0; a < cards.length; a++)
        for (let b = a + 1; b < cards.length; b++) {
          assert.ok(
            Math.abs(cards[a].x - cards[b].x) >= cardWidth || Math.abs(cards[a].y - cards[b].y) >= cardHeight,
            `overlap at ${width}px, frame ${frame}, items ${a}/${b}`,
          );
        }
    }
  }
});

test('orbit loops continuously and uses equal travel distances around an ellipse', () => {
  const orbit = createEllipse(1200, 390, 144, 100);
  const first = orbit.at(0),
    last = orbit.at(1);
  assert.deepEqual(first, last);
  const distances = Array.from({ length: 100 }, (_, index) => {
    const a = orbit.at(index / 100),
      b = orbit.at((index + 1) / 100);
    return Math.hypot(a.x - b.x, a.y - b.y);
  });
  assert.ok(Math.max(...distances) / Math.min(...distances) < 1.06);
  const wrapped = orbit.at(-0.25),
    equivalent = orbit.at(0.75);
  assert.deepEqual(wrapped, equivalent);
});
