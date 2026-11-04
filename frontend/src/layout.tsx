import { useState, useRef, useEffect, useLayoutEffect, useId, type CSSProperties } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { m, useReducedMotion, useSpring, useTransform, type MotionStyle } from 'motion/react';
import { CookingPot, Heart, Search, User, LogOut, ChevronDown, Menu, X, Bell } from 'lucide-react';
import { useUser, useNotice } from './shared';
import { request } from './api';

const navigationItems = [
  { to: '/', label: 'Trang chủ', width: 88, end: true },
  { to: '/cong-thuc', label: 'Khám phá', width: 88 },
  { to: '/co-gi-nau-nay', label: 'Có gì nấu nấy', width: 128 },
  { to: '/thuc-don', label: 'Thực đơn tuần', width: 128 },
  { to: '/eat-fit', label: 'Eat Fit', width: 72 },
];
const islandSpring = { type: 'spring' as const, stiffness: 420, damping: 36, mass: 0.8 };
const resizeSpring = { stiffness: 260, damping: 30, mass: 1 };
const compactThreshold = 96;
const expandedThreshold = 32;
export function Header({ hidden = false }: { hidden?: boolean }) {
  const user = useUser(),
    notice = useNotice(),
    location = useLocation();
  const reducedMotion = useReducedMotion();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY >= compactThreshold);
  const compactRef = useRef(scrolled);
  const progress = useSpring(scrolled ? 1 : 0, resizeSpring);
  const indicatorX = useSpring(0, islandSpring);
  const indicatorWidth = useSpring(0, islandSpring);
  const indicatorReady = useRef(false);
  const [hasIndicator, setHasIndicator] = useState(false);
  // Tab geometry uses the same ratio as CSS; resizing never chases a second spring.
  const pillX = useTransform([indicatorX, progress], ([x, value]) => Number(x) * (1 - 0.06 * Number(value)));
  const pillWidth = useTransform(
    [indicatorWidth, progress],
    ([width, value]) => Number(width) * (1 - 0.06 * Number(value)),
  );
  const headerRef = useRef<HTMLElement>(null),
    navRef = useRef<HTMLElement>(null),
    toolsRef = useRef<HTMLDivElement>(null);
  const toolsId = useId(),
    mobileId = useId();
  const isToolActive = location.pathname === '/ngan-sach';
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const next = compactRef.current ? y > expandedThreshold : y >= compactThreshold;
      if (next !== compactRef.current) {
        compactRef.current = next;
        setScrolled(next);
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);
  useLayoutEffect(() => {
    if (reducedMotion) progress.jump(scrolled ? 1 : 0);
    else progress.set(scrolled ? 1 : 0);
  }, [scrolled, reducedMotion, progress]);
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!toolsRef.current?.contains(target)) setToolsOpen(false);
      if (!headerRef.current?.contains(target)) setMobileMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setToolsOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);
  useEffect(() => {
    setToolsOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, hidden]);
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav || hidden) return;
    const active = nav.querySelector<HTMLElement>('[aria-current="page"], [data-active="true"]');
    const index = active ? Number(active.dataset.islandIndex) : -1;
    const width = index < 0 ? 0 : (navigationItems[index]?.width ?? 96);
    const x = index < 0 ? 0 : navigationItems.slice(0, index).reduce((sum, item) => sum + item.width + 4, 0);
    const immediate = reducedMotion || !indicatorReady.current;
    if (immediate) {
      indicatorX.jump(x);
      indicatorWidth.jump(width);
    } else {
      indicatorX.set(x);
      indicatorWidth.set(width);
    }
    indicatorReady.current = true;
    setHasIndicator(width > 0);
  }, [location.pathname, hidden, reducedMotion, indicatorX, indicatorWidth]);
  const handleLogout = async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
      notice('Đã đăng xuất tài khoản.');
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };
  return (
    <div className="cookora-header-slot" hidden={hidden}>
      <div className="cookora-header-anchor">
        <m.header
          ref={headerRef}
          className="cookora-header"
          data-scrolled={scrolled}
          data-island-state={scrolled ? 'compact' : 'expanded'}
          initial={false}
          style={{ '--cookora-island-progress': progress } as MotionStyle}
        >
          <div className="cookora-header-glass" aria-hidden="true" />
          <Link to="/" className="cookora-logo" aria-label="Cookora Bếp Nhà">
            <CookingPot className="cookora-logo-icon" strokeWidth={1.8} aria-hidden="true" />
            <span>Cookora</span>
          </Link>
          <nav ref={navRef} className="cookora-island-nav" aria-label="Điều hướng chính">
            <m.span
              className="cookora-active-indicator"
              aria-hidden="true"
              initial={false}
              style={{ x: pillX, width: pillWidth }}
              animate={{ opacity: hasIndicator ? 1 : 0 }}
              transition={reducedMotion ? { duration: 0 } : islandSpring}
            />
            {navigationItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="cookora-nav-item"
                data-island-index={index}
                style={{ '--cookora-tab-width': `${item.width}px` } as CSSProperties}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="cookora-tools" ref={toolsRef}>
              <button
                type="button"
                className="cookora-nav-item cookora-tools-trigger"
                data-island-index={navigationItems.length}
                data-active={isToolActive}
                aria-expanded={toolsOpen}
                aria-controls={toolsId}
                onClick={() => setToolsOpen((value) => !value)}
              >
                Công cụ <ChevronDown size={14} aria-hidden="true" />
              </button>
              {toolsOpen && (
                <m.div
                  className="cookora-header-popover cookora-tools-menu"
                  id={toolsId}
                  initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.16 }}
                >
                  <Link to="/ngan-sach">Ước tính chi phí</Link>
                </m.div>
              )}
            </div>
          </nav>
          <div className="cookora-header-actions">
            <Link
              to="/cong-thuc"
              className="cookora-header-icon cookora-header-search"
              aria-label="Tìm kiếm"
              title="Tìm kiếm công thức"
            >
              <Search aria-hidden="true" />
            </Link>
            <Link
              to="/yeu-thich"
              className="cookora-header-icon cookora-header-favorites"
              aria-label="Món yêu thích"
              title="Món đã lưu"
            >
              <Heart aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="cookora-header-icon cookora-header-notifications"
              aria-label="Thông báo"
              title="Thông báo"
              onClick={() => notice('Bạn chưa có thông báo mới.')}
            >
              <Bell aria-hidden="true" />
              <span className="cookora-notification-dot" />
            </button>
            <div className="cookora-account-slot">
              {user ? (
                <div className="cookora-signed-in" title={user.displayName}>
                  <span className="cookora-avatar" aria-hidden="true">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                  <span className="cookora-account-name">{user.displayName}</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="cookora-logout"
                    aria-label="Đăng xuất"
                    title="Đăng xuất"
                  >
                    <LogOut aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <Link to="/dang-nhap" className="cookora-login">
                  <User aria-hidden="true" />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
            <button
              type="button"
              className="cookora-header-icon cookora-menu-toggle"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls={mobileId}
              onClick={() => setMobileMenuOpen((value) => !value)}
            >
              {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <m.div
              id={mobileId}
              className="cookora-header-popover cookora-mobile-menu"
              initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.16 }}
            >
              <nav aria-label="Điều hướng di động">
                {navigationItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end}>
                    {item.label}
                  </NavLink>
                ))}
                <NavLink to="/ngan-sach">Ước tính chi phí</NavLink>
                <NavLink to="/yeu-thich">Món yêu thích</NavLink>
                <Link to="/cong-thuc">
                  <Search size={18} aria-hidden="true" />
                  Tìm kiếm công thức
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    notice('Bạn chưa có thông báo mới.');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Bell size={18} aria-hidden="true" />
                  Thông báo
                </button>
              </nav>
            </m.div>
          )}
        </m.header>
      </div>
    </div>
  );
}
// Warm Minimal Footer matching uploaded image
export function Footer() {
  return (
    <footer className="bg-[#FAF9F6] border-t border-[#DFE5DD] pt-12 pb-10 mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#DFE5DD]/70">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#47735B] text-white flex items-center justify-center">
              <CookingPot size={18} strokeWidth={2.2} />
            </div>
            <span className="font-semibold text-xl text-[#273D32] tracking-tight">cookora</span>
            <span className="text-[#DFE5DD] hidden sm:inline">|</span>
            <span className="text-xs text-[#5C7065] hidden sm:inline">
              Bếp nhà thông minh cho cuộc sống hiện đại.
            </span>
          </div>

          {/* Center Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#5C7065] font-medium">
            <Link to="/lo-trinh" className="hover:text-[#47735B] transition">
              Về Cookora
            </Link>
            <span className="cursor-pointer hover:text-[#47735B] transition">Điều khoản</span>
            <span className="cursor-pointer hover:text-[#47735B] transition">Chính sách</span>
            <span className="cursor-pointer hover:text-[#47735B] transition">Hỗ trợ</span>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-[#5C7065]">
            <a href="#" className="hover:text-[#47735B] transition text-sm font-semibold">
              f
            </a>
            <a href="#" className="hover:text-[#47735B] transition text-sm font-semibold">
              ▶
            </a>
            <a href="#" className="hover:text-[#47735B] transition text-sm font-semibold">
              📷
            </a>
            <a href="#" className="hover:text-[#47735B] transition text-sm font-semibold">
              ♪
            </a>
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-[#5C7065]/80">
          © {new Date().getFullYear()} Cookora.
        </div>
      </div>
    </footer>
  );
}

export function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
