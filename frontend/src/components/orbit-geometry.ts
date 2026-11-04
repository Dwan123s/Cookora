// Cards stand on a shallow elliptical track, growing as they approach the front.
export function createEllipse(width: number, height: number, cardWidth: number, cardHeight: number) {
  const rx = Math.max(width < 640 ? 290 : 0, (width - cardWidth * 1.08) / 2 - 22);
  const ry = Math.min(26, Math.max(16, height * 0.105));
  return {
    rx,
    ry,
    at(progress: number) {
      // Most of the journey follows the visible front arc, like a display shelf.
      // A short, recessed return arc carries each card back behind the others.
      const phase = (((progress + 0.43) % 1) + 1) % 1;
      const front = phase <= 0.86;
      const lateral = front ? (phase / 0.86) * 2 - 1 : 1 - ((phase - 0.86) / 0.14) * 2;
      const curve = Math.sqrt(Math.max(0, 1 - lateral * lateral));
      const depth = front ? 0.65 + curve * 0.35 : (1 - curve) * 0.65;
      const scale = front ? 0.86 + curve * 0.22 : 0.68 + (1 - curve) * 0.18;
      return {
        x: rx * lateral,
        y: ry * curve * (front ? 1 : -1),
        scale,
        depth,
        rotateY: -lateral * 12,
        rotateZ: lateral * 2.5,
        opacity: front ? 1 : 0.12 + (1 - curve) * 0.88,
        cardHeight: cardHeight * scale,
      };
    },
  };
}
