import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEllipse } from '../../frontend/src/components/orbit-geometry';

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-8, `${a} differs from ${b}`);

test('cards grow toward the front and recede behind the elliptical shelf', () => {
  const orbit = createEllipse(1056, 200, 116, 112);
  const front = orbit.at(0),
    back = orbit.at(0.5),
    side = orbit.at(-0.43);
  near(front.x, 0);
  near(front.y, orbit.ry);
  near(back.y, -orbit.ry);
  assert.ok(front.scale > side.scale && side.scale > back.scale);
  assert.ok(front.depth > back.depth);
  assert.ok(back.opacity < 0.2 && front.opacity === 1);
  near(side.x, -orbit.rx);
});

test('orbit wraps continuously and stays finite through every responsive layout', () => {
  const sizes = [
    [1056, 200, 116, 112],
    [852, 200, 116, 112],
    [836, 190, 104, 104],
    [577, 190, 104, 104],
    [592, 180, 96, 96],
    [343, 180, 96, 96],
    [273, 180, 96, 96],
  ];
  for (const [width, height, cardWidth, cardHeight] of sizes) {
    const orbit = createEllipse(width, height, cardWidth, cardHeight);
    for (let frame = 0; frame < 720; frame++) {
      const position = orbit.at(frame / 720);
      for (const value of Object.values(position)) assert.ok(Number.isFinite(value));
      assert.ok(Math.abs(position.x) <= orbit.rx + 1e-8);
      assert.ok(Math.abs(position.y) <= orbit.ry + 1e-8);
      assert.ok(position.scale >= 0.68 && position.scale <= 1.08);
      assert.ok(height * 0.67 + position.y - position.cardHeight >= 0);
      assert.ok(height * 0.67 + position.y <= height);
      const wrapped = orbit.at(frame / 720 + 1);
      near(position.x, wrapped.x);
      near(position.y, wrapped.y);
      near(position.scale, wrapped.scale);
    }
  }
  const orbit = createEllipse(1056, 200, 116, 112);
  for (const boundary of [-0.43, 0.43]) {
    const before = orbit.at(boundary - 1e-9),
      after = orbit.at(boundary + 1e-9);
    assert.ok(Math.hypot(before.x - after.x, before.y - after.y) < 0.02);
    near(orbit.at(boundary).scale, 0.86);
  }
});
