import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CookingPot,
  Heart,
  LogOut,
  Menu,
  Sparkles,
  X,
  Refrigerator,
} from 'lucide-react';
import { request, setCsrf } from './api';
import { useNotice, useUser, errorText } from './shared';

export function Header() {
  const user = useUser(),
    [menu, setMenu] = useState(false),
    qc = useQueryClient(),
    navigate = useNavigate(),
    notice = useNotice();
  const location = useLocation();
  useEffect(() => setMenu(false), [location]);
  const logout = async () => {
    try {
      const result = await request<{ csrfToken: string }>('/auth/logout', { method: 'POST' });
      setCsrf(result.data.csrfToken);
      qc.clear();
      navigate('/');
      notice('Đã đăng xuất.');
    } catch (e) {
      notice(errorText(e));
    }
  };
  return (
    <>
      <header className={`site-header ${location.pathname === '/' ? 'home-reference-header' : ''}`}>
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="Cookora Bếp Nhà">
            <span className="brand-symbol">
              <CookingPot size={27} strokeWidth={1.7} />
            </span>
            <span>
              cookora<span className="brand-dot">.</span>
            </span>
          </Link>
          <nav
            id="main-navigation"
            className={menu ? 'desktop-nav open' : 'desktop-nav'}
            aria-label="Điều hướng chính"
          >
            <NavLink to="/cong-thuc">Khám phá</NavLink>
            <NavLink to="/co-gi-nau-nay">
              Có gì nấu nấy {location.pathname !== '/' && <Sparkles size={12} />}
            </NavLink>
            <NavLink to="/thuc-don">Thực đơn tuần</NavLink>
          </nav>
          <div className="header-actions">
            <NavLink className="header-favorites icon-btn" to="/yeu-thich" aria-label="Món yêu thích">
              <Heart size={21} />
            </NavLink>
            {user ? (
              <>
                <Link className="user-pill" to={user.role !== 'USER' ? '/bien-tap' : '/thuc-don'}>
                  <span>{user.displayName.slice(0, 1).toUpperCase()}</span>
                  <b>{user.displayName}</b>
                </Link>
                <button className="icon-btn logout" onClick={logout} aria-label="Đăng xuất">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link className="btn small" to="/dang-nhap">
                Đăng nhập {location.pathname !== '/' && <ArrowUpRight size={16} />}
              </Link>
            )}
            {location.pathname === '/' && (
              <Link
                className="home-header-arrow"
                to={user ? '/thuc-don' : '/dang-nhap'}
                aria-label="Vào bếp của bạn"
              >
                <ArrowRight size={20} />
              </Link>
            )}
            <button
              className="icon-btn menu-toggle"
              onClick={() => setMenu(!menu)}
              aria-label={menu ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menu}
              aria-controls="main-navigation"
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <nav className="bottom-nav" aria-label="Điều hướng điện thoại">
        <NavLink to="/cong-thuc">
          <BookOpen size={20} />
          Khám phá
        </NavLink>
        <NavLink to="/co-gi-nau-nay">
          <Refrigerator size={20} />
          Nguyên liệu
        </NavLink>
        <NavLink to="/thuc-don">
          <CalendarDays size={20} />
          Thực đơn
        </NavLink>
        <NavLink to="/yeu-thich">
          <Heart size={20} />
          Yêu thích
        </NavLink>
      </nav>
    </>
  );
}

export function Footer() {
  const location = useLocation();
  if (location.pathname === '/')
    return (
      <footer className="home-reference-footer">
        <Link className="home-footer-wordmark" to="/">
          cookora<span>.</span>
        </Link>
        <nav aria-label="Điều hướng cuối trang">
          <Link to="/cong-thuc">Khám phá</Link>
          <Link to="/co-gi-nau-nay">Nguyên liệu</Link>
          <Link to="/thuc-don">Thực đơn</Link>
        </nav>
        <small>Ảnh AI minh họa · Công thức chưa nấu thử</small>
      </footer>
    );
  return (
    <footer className="site-footer">
      <div>
        <Link className="brand" to="/">
          <CookingPot size={26} />
          cookora<span className="brand-dot">.</span>
        </Link>
        <p>Bếp nhà, thêm một chút mới.</p>
      </div>
      <nav>
        <Link to="/cong-thuc">Khám phá</Link>
        <Link to="/co-gi-nau-nay">Có gì nấu nấy</Link>
        <Link to="/thuc-don">Thực đơn tuần</Link>
        <Link to="/lo-trinh">Đang phát triển</Link>
        <Link to="/bien-tap">Biên tập</Link>
      </nav>
      <small>
        Cookora · Bản phát triển local
        <br />
        Công thức mẫu chưa nấu thử.
        <br />
        Ảnh minh họa từ Unsplash và ảnh AI của Cookora.
      </small>
    </footer>
  );
}

export function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
