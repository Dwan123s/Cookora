export function createEllipse(width: number, height: number, cardWidth: number, cardHeight: number) {
  const rx = Math.max(0, (width - cardWidth) / 2 - 12);
  const ry = Math.max(0, (height - cardHeight) / 2 - 18);
  const points = Array.from({ length: 513 }, (_, index) => {
    const angle = (index / 512) * Math.PI * 2 - Math.PI / 2;
    return { x: rx * Math.cos(angle), y: ry * Math.sin(angle), distance: 0 };
  });
  for (let index = 1; index < points.length; index++) {
    points[index].distance =
      points[index - 1].distance +
      Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
  }
  const length = points[512].distance;
  return {
    rx,
    ry,
    // Equal travel distances keep the cards apart around the narrow ends, too.
    at(progress: number) {
      const distance = (((progress % 1) + 1) % 1) * length;
      let low = 1,
        high = 512;
      while (low < high) {
        const middle = (low + high) >>> 1;
        if (points[middle].distance < distance) low = middle + 1;
        else high = middle;
      }
      const before = points[low - 1],
        after = points[low];
      const ratio = (distance - before.distance) / (after.distance - before.distance || 1);
      return { x: before.x + (after.x - before.x) * ratio, y: before.y + (after.y - before.y) * ratio };
    },
  };
}
