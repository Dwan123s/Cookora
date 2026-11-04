import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, CookingPot, Heart, LogOut, Menu, Search, User, X } from 'lucide-react';
import { request } from '../api';
import { useNotice, useUser } from '../shared';

const primaryLinks = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/cong-thuc', label: 'Khám phá' },
  { to: '/co-gi-nau-nay', label: 'Có gì nấu nấy' },
  { to: '/thuc-don', label: 'Thực đơn tuần' },
  { to: '/eat-fit', label: 'Eat Fit' },
];

export function Header() {
  const user = useUser();
  const notice = useNotice();
  const location = useLocation();
  const [compact, setCompact] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop);
      // Hysteresis keeps the island stable near the collapse threshold.
      setCompact((previous) => (previous ? top > 16 : top > 64));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    // The shared page styles also allow the body to be the scroll container.
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, true);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!toolsRef.current?.contains(target)) setToolsOpen(false);
      if (!headerRef.current?.contains(target)) setMobileMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  const closeMenus = () => {
    setToolsOpen(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    setToolsOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const onResize = () => {
      setToolsOpen(false);
      setMobileMenuOpen(false);
    };
    desktop.addEventListener('change', onResize);
    return () => desktop.removeEventListener('change', onResize);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen && !toolsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileMenuOpen(false);
      setToolsOpen(false);
      (mobileMenuOpen ? menuButtonRef : toolsButtonRef).current?.focus();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen, toolsOpen]);

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
    <>
      <div className="island-header-space" aria-hidden="true" />
      <header ref={headerRef} className="cookora-header island-header" data-compact={compact}>
        <div className="island-shell">
          <div className="island-bar">
            <Link to="/" className="island-brand" aria-label="Cookora Bếp Nhà" onClick={closeMenus}>
              <span className="island-brand-icon">
                <CookingPot size={20} strokeWidth={1.9} />
              </span>
              <span className="island-wordmark">cookora</span>
            </Link>

            <nav className="island-desktop-nav" aria-label="Điều hướng chính">
              {primaryLinks.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className="island-nav-link" onClick={closeMenus}>
                  {label}
                </NavLink>
              ))}
              <div className="island-tools" ref={toolsRef}>
                <button
                  ref={toolsButtonRef}
                  type="button"
                  aria-expanded={toolsOpen}
                  aria-controls="cookora-tools-menu"
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className={`island-nav-link island-tools-toggle${location.pathname === '/ngan-sach' ? ' active' : ''}`}
                >
                  Công cụ <ChevronDown size={14} className={toolsOpen ? 'island-chevron-open' : ''} />
                </button>
                {toolsOpen && (
                  <div id="cookora-tools-menu" className="island-tools-menu island-glass-panel">
                    <NavLink to="/ngan-sach" className="island-menu-link" onClick={closeMenus}>
                      Ước tính chi phí
                    </NavLink>
                  </div>
                )}
              </div>
            </nav>

            <div className="island-actions">
              <Link
                to="/cong-thuc"
                className="island-icon-button island-search"
                title="Tìm kiếm công thức"
                aria-label="Tìm kiếm"
                onClick={closeMenus}
              >
                <Search size={19} strokeWidth={1.8} />
              </Link>
              <NavLink
                to="/yeu-thich"
                className="island-icon-button island-favorites"
                title="Món đã lưu"
                aria-label="Món yêu thích"
                onClick={closeMenus}
              >
                <Heart size={19} strokeWidth={1.8} />
              </NavLink>
              <button
                type="button"
                onClick={() => notice('Bạn chưa có thông báo mới.')}
                className="island-icon-button island-notifications"
                title="Thông báo"
                aria-label="Thông báo"
              >
                <Bell size={19} strokeWidth={1.8} />
              </button>
              {user ? (
                <div className="island-account">
                  <span className="island-avatar" title={user.displayName} aria-label={user.displayName}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="island-icon-button"
                    title="Đăng xuất"
                    aria-label="Đăng xuất"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/dang-nhap" aria-label="Đăng nhập" className="island-login" onClick={closeMenus}>
                  <User size={18} strokeWidth={1.8} />
                  <span>Đăng nhập</span>
                </Link>
              )}
              <button
                type="button"
                ref={menuButtonRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="island-icon-button island-menu-toggle"
                aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="cookora-mobile-menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav
              id="cookora-mobile-menu"
              aria-label="Điều hướng di động"
              className="island-mobile-menu island-glass-panel"
            >
              {user && <p className="island-menu-user">{user.displayName}</p>}
              {primaryLinks.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className="island-menu-link" onClick={closeMenus}>
                  {label}
                </NavLink>
              ))}
              <NavLink to="/yeu-thich" className="island-menu-link" onClick={closeMenus}>
                Món yêu thích
              </NavLink>
              <div className="island-menu-tools">
                <p>Công cụ</p>
                <NavLink to="/ngan-sach" className="island-menu-link" onClick={closeMenus}>
                  Ước tính chi phí
                </NavLink>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
