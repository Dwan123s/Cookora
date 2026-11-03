const fs = require('fs');

const headerCode = `import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  CookingPot,
  Heart,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
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
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/70 py-3 transition-colors">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="Cookora Bếp Nhà">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#EA580C] group-hover:scale-105 transition">
            <CookingPot size={22} strokeWidth={2.2} />
          </div>
          <span className="font-black text-2xl text-stone-900 tracking-tight">
            Cookora
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-8 text-sm font-bold text-stone-600"
          aria-label="Điều hướng chính"
        >
          <NavLink
            to="/cong-thuc"
            className={({ isActive }) =>
              isActive
                ? 'text-[#EA580C] relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#EA580C] after:rounded-full'
                : 'hover:text-stone-900 transition py-1'
            }
          >
            Khám phá
          </NavLink>
          <NavLink
            to="/co-gi-nau-nay"
            className={({ isActive }) =>
              isActive
                ? 'text-[#EA580C] relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#EA580C] after:rounded-full'
                : 'hover:text-stone-900 transition py-1'
            }
          >
            Có gì nấu nấy
          </NavLink>
          <NavLink
            to="/thuc-don"
            className={({ isActive }) =>
              isActive
                ? 'text-[#EA580C] relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#EA580C] after:rounded-full'
                : 'hover:text-stone-900 transition py-1'
            }
          >
            Thực đơn tuần
          </NavLink>
          <NavLink
            to="/eat-fit"
            className={({ isActive }) =>
              isActive
                ? 'text-[#EA580C] relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#EA580C] after:rounded-full'
                : 'hover:text-stone-900 transition py-1'
            }
          >
            Eat Fit
          </NavLink>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/cong-thuc"
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
            aria-label="Tìm kiếm"
          >
            <Search size={19} />
          </Link>

          <Link
            to="/yeu-thich"
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
            aria-label="Món yêu thích"
          >
            <Heart size={19} />
          </Link>

          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition relative"
            aria-label="Thông báo"
          >
            <Bell size={19} />
            <span className="w-2 h-2 rounded-full bg-[#EA580C] absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {/* User Avatar */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.role !== 'USER' ? '/bien-tap' : '/thuc-don'}
                className="w-9 h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-sm shadow-2xs hover:opacity-90 transition overflow-hidden"
              >
                <span>{user.displayName.slice(0, 1).toUpperCase()}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-stone-400 hover:text-stone-700 p-1"
                title="Đăng xuất"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/dang-nhap"
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#EA580C] shadow-2xs hover:scale-105 transition shrink-0"
              title="Đăng nhập tài khoản"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Avatar tài khoản Cookora"
                className="w-full h-full object-cover"
              />
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-2 text-stone-700 hover:text-stone-900"
            onClick={() => setMenu(!menu)}
            aria-label="Menu"
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {menu && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2 text-sm font-bold shadow-md">
          <Link to="/cong-thuc" className="block py-2 text-stone-700 hover:text-[#EA580C]">
            Khám phá
          </Link>
          <Link to="/co-gi-nau-nay" className="block py-2 text-stone-700 hover:text-[#EA580C]">
            Có gì nấu nấy
          </Link>
          <Link to="/thuc-don" className="block py-2 text-stone-700 hover:text-[#EA580C]">
            Thực đơn tuần
          </Link>
          <Link to="/eat-fit" className="block py-2 text-stone-700 hover:text-[#EA580C]">
            Eat Fit
          </Link>
          <Link to="/ngan-sach" className="block py-2 text-stone-700 hover:text-[#EA580C]">
            Ước tính chi phí
          </Link>
          <Link to="/dinh-duong" className="block py-2 text-stone-700 hover:text-[#EA580C]">
            Tra cứu Calo & Dinh dưỡng
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200/80 py-8 text-stone-500 text-xs">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center text-[#EA580C]">
            <CookingPot size={15} />
          </div>
          <span className="font-bold text-stone-900 text-sm">Cookora – Bếp Nhà</span>
        </div>
        <div className="flex flex-wrap gap-6 font-medium">
          <Link to="/cong-thuc" className="hover:text-stone-900">Khám phá</Link>
          <Link to="/co-gi-nau-nay" className="hover:text-stone-900">Có gì nấu nấy</Link>
          <Link to="/thuc-don" className="hover:text-stone-900">Thực đơn tuần</Link>
          <Link to="/eat-fit" className="hover:text-stone-900">Eat Fit</Link>
          <Link to="/ngan-sach" className="hover:text-stone-900">Ước tính chi phí</Link>
        </div>
        <span>© 2026 Cookora. Nấu ngon hơn, dễ hơn mỗi ngày.</span>
      </div>
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
`;

fs.writeFileSync('frontend/src/layout.tsx', headerCode, 'utf8');
console.log('Successfully updated layout.tsx with pixel-perfect Header & Footer');
