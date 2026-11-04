import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Apple,
  CalendarDays,
  Carrot,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Coins,
  Dumbbell,
  Heart,
  Pause,
  Play,
} from 'lucide-react';
import { createEllipse } from './orbit-geometry';
import '../orbit-quick-nav.css';

const items = [
  { title: 'Công thức', label: 'Khám phá công thức', to: '/cong-thuc', Icon: ChefHat },
  { title: 'Có gì nấu nấy', label: 'Có gì nấu nấy', to: '/co-gi-nau-nay', Icon: Carrot },
  { title: 'Thực đơn tuần', label: 'Thực đơn tuần', to: '/thuc-don', Icon: CalendarDays },
  { title: 'Eat Fit', label: 'Eat Fit theo mục tiêu', to: '/eat-fit', Icon: Dumbbell },
  { title: 'Ngân sách', label: 'Ước tính chi phí', to: '/ngan-sach', Icon: Coins },
  { title: 'Dinh dưỡng', label: 'Dinh dưỡng và Calories', to: '/dinh-duong', Icon: Apple },
  { title: 'Yêu thích', label: 'Công thức yêu thích', to: '/yeu-thich', Icon: Heart },
];

export function OrbitQuickNav() {
  const stage = useRef<HTMLElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const [paused, setPaused] = useState(false);
  const manualPause = useRef(false);
  manualPause.current = paused;

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let ellipse: ReturnType<typeof createEllipse>;
    let progress = -3 / items.length,
      lastTime = 0,
      frame = 0;
    let destination: number | null = null;
    let visible = false,
      hovered = false,
      focused = false;
    const paint = () => {
      if (!ellipse) return;
      links.current.forEach((link, index) => {
        if (!link) return;
        const { x, y, scale, depth, rotateY, rotateZ, opacity } = ellipse.at(progress + index / items.length);
        link.style.transform = `translate(-50%, -100%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) perspective(900px) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        link.style.zIndex = String(10 + Math.round(depth * 100));
        link.style.opacity = opacity.toFixed(3);
        link.style.setProperty('--orbit-depth', depth.toFixed(3));
        link.style.setProperty('--orbit-glow', (depth ** 100).toFixed(3));
      });
    };
    const resize = () => {
      const card = links.current[0];
      if (!card) return;
      ellipse = createEllipse(element.clientWidth, element.clientHeight, card.offsetWidth, card.offsetHeight);
      element.style.setProperty('--orbit-radius-x', `${ellipse.rx}px`);
      element.style.setProperty('--orbit-radius-y', `${ellipse.ry}px`);
      paint();
    };
    const tick = (time: number) => {
      frame = 0;
      const elapsed = lastTime ? Math.min(time - lastTime, 50) : 0;
      if (destination !== null) {
        progress += (destination - progress) * (1 - Math.exp(-elapsed / 100));
        if (Math.abs(destination - progress) < 0.0001) {
          progress = destination;
          destination = null;
        }
      } else if (canRotate()) progress += elapsed / 60000;
      lastTime = time;
      paint();
      if (destination !== null || canRotate()) frame = requestAnimationFrame(tick);
    };
    const canRotate = () =>
      visible && !document.hidden && !hovered && !focused && !manualPause.current && !reducedMotion.matches;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (visible && !document.hidden && (destination !== null || canRotate())) {
        frame = requestAnimationFrame(tick);
      }
    };
    const moveTo = (next: number) => {
      destination = next;
      if (reducedMotion.matches) {
        progress = next;
        destination = null;
        paint();
      }
      sync();
    };
    const step = (event: Event) => {
      moveTo(
        (Math.round((destination ?? progress) * items.length) + (event as CustomEvent<number>).detail) /
          items.length,
      );
    };
    const enter = () => {
      hovered = finePointer.matches;
      sync();
    };
    const leave = () => {
      hovered = false;
      sync();
    };
    const focus = (event: FocusEvent) => {
      focused = true;
      const index = links.current.findIndex((link) => link === event.target);
      if (index < 0) return sync();
      const next = -index / items.length;
      moveTo(next + Math.round(progress - next));
    };
    const blur = (event: FocusEvent) => {
      focused = element.contains(event.relatedTarget as Node | null);
      sync();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    intersection.observe(element);
    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('focusin', focus);
    element.addEventListener('focusout', blur);
    element.addEventListener('orbit-pause-change', sync);
    element.addEventListener('orbit-step', step);
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('focusin', focus);
      element.removeEventListener('focusout', blur);
      element.removeEventListener('orbit-pause-change', sync);
      element.removeEventListener('orbit-step', step);
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    stage.current?.dispatchEvent(new Event('orbit-pause-change'));
  }, [paused]);

  return (
    <section className="home-container orbit-quick-section" aria-label="Tiện ích Cookora">
      <nav className="orbit-stage" ref={stage} aria-label="Khám phá căn bếp">
        <div className="orbit-ambience" aria-hidden="true" />
        <div className="orbit-ring" aria-hidden="true" />
        {items.map(({ title, label, to, Icon }, index) => (
          <Link
            key={to}
            to={to}
            className="orbit-item"
            aria-label={label}
            ref={(link) => {
              links.current[index] = link;
            }}
          >
            <span className="orbit-item-icon">
              <Icon size={32} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="orbit-item-title">{title}</span>
          </Link>
        ))}
      </nav>
      <div className="orbit-footer">
        <div className="orbit-controls">
          <button
            type="button"
            className="orbit-arrow"
            aria-label="Tiện ích trước"
            onClick={() => stage.current?.dispatchEvent(new CustomEvent('orbit-step', { detail: 1 }))}
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="orbit-pause"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? 'Tiếp tục chuyển động tiện ích' : 'Tạm dừng chuyển động tiện ích'}
          >
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="orbit-arrow"
            aria-label="Tiện ích tiếp theo"
            onClick={() => stage.current?.dispatchEvent(new CustomEvent('orbit-step', { detail: -1 }))}
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
