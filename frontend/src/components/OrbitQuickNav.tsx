import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Apple,
  CalendarDays,
  ChefHat,
  Coins,
  CookingPot,
  Dumbbell,
  Heart,
  Pause,
  Play,
  Soup,
} from 'lucide-react';
import { createEllipse } from './orbit-geometry';
import '../orbit-quick-nav.css';

const items = [
  { title: 'Khám phá công thức', to: '/cong-thuc', Icon: Soup, tone: 'sage' },
  { title: 'Có gì nấu nấy', to: '/co-gi-nau-nay', Icon: ChefHat, tone: 'mint' },
  { title: 'Thực đơn tuần', to: '/thuc-don', Icon: CalendarDays, tone: 'cream' },
  { title: 'Eat Fit', subtitle: 'Theo mục tiêu', to: '/eat-fit', Icon: Dumbbell, tone: 'sage' },
  { title: 'Ước tính chi phí', to: '/ngan-sach', Icon: Coins, tone: 'cream' },
  { title: 'Dinh dưỡng & Calories', to: '/dinh-duong', Icon: Apple, tone: 'mint' },
  { title: 'Công thức yêu thích', to: '/yeu-thich', Icon: Heart, tone: 'rose' },
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
    let progress = 0,
      lastTime = 0,
      frame = 0;
    let visible = false,
      hovered = false,
      focused = false;
    const paint = () => {
      if (!ellipse) return;
      links.current.forEach((link, index) => {
        if (!link) return;
        const { x, y } = ellipse.at(progress + index / items.length);
        link.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
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
      if (lastTime) progress = (progress + Math.min(time - lastTime, 50) / 56000) % 1;
      lastTime = time;
      paint();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (
        visible &&
        !document.hidden &&
        !hovered &&
        !focused &&
        !manualPause.current &&
        !reducedMotion.matches
      ) {
        frame = requestAnimationFrame(tick);
      }
    };
    const enter = () => {
      hovered = finePointer.matches;
      sync();
    };
    const leave = () => {
      hovered = false;
      sync();
    };
    const focus = () => {
      focused = true;
      sync();
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
        <div className="orbit-ring" aria-hidden="true" />
        <div className="orbit-core" aria-hidden="true">
          <span className="orbit-core-icon">
            <CookingPot strokeWidth={1.5} />
          </span>
          <span className="orbit-eyebrow">COOKORA</span>
          <strong>Bếp của bạn</strong>
          <span className="orbit-core-note">Một vòng, đủ đầy</span>
        </div>
        {items.map(({ title, subtitle, to, Icon, tone }, index) => (
          <Link
            key={to}
            to={to}
            className="orbit-item"
            data-tone={tone}
            ref={(link) => {
              links.current[index] = link;
            }}
          >
            <span className="orbit-item-icon">
              <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="orbit-item-title">{title}</span>
            {subtitle && <small>{subtitle}</small>}
          </Link>
        ))}
      </nav>
      <div className="orbit-footer">
        <span>Mọi điều cho bữa ăn của bạn</span>
        <button
          type="button"
          className="orbit-pause"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? 'Tiếp tục chuyển động tiện ích' : 'Tạm dừng chuyển động tiện ích'}
        >
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? 'Tiếp tục' : 'Tạm dừng'}
        </button>
      </div>
    </section>
  );
}
