const fs = require('fs');
const path = require('path');

// 1. UPDATE index.html with Be Vietnam Pro font
const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('Be+Vietnam+Pro')) {
  html = html.replace(
    '</title>',
    `</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap"
      rel="stylesheet"
    />`
  );
  fs.writeFileSync(indexPath, html);
  console.log('1. Updated index.html with Be Vietnam Pro font.');
}

// 2. UPDATE styles.css with Warm Natural Palette
const stylesPath = path.join(__dirname, '..', 'frontend', 'src', 'styles.css');
let css = fs.readFileSync(stylesPath, 'utf8');

// Replace theme block and base variables
const newThemeBlock = `@theme {
  --color-bg-warm: #FAF8F5;
  --color-surface: #FFFFFF;
  --color-primary: #274734;
  --color-primary-hover: #365B43;
  --color-accent: #D17A50;
  --color-main: #202721;
  --color-secondary: #66746B;
  --color-border-warm: #E8E8E1;
  --color-soft-green: #EAF1E9;
  --color-soft-peach: #F9EEE6;
  --font-sans: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
:root {
  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #202721;
  background-color: #FAF8F5;
  font-synthesis: none;
  font-weight: 400;
  --brand: #274734;
  --accent: #D17A50;
  --ink: #202721;
  --muted: #66746B;
  --line: #E8E8E1;
  --green: #274734;
  --soft-green: #EAF1E9;
  --soft-peach: #F9EEE6;
}

body {
  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #202721;
  background-color: #FAF8F5;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 600;
  line-height: 1.25;
  color: #202721;
  letter-spacing: -0.01em;
}

/* Base button and interactive resets */
button, input, select, textarea {
  font-family: inherit;
}`;

// Replace the @theme & :root in styles.css
css = css.replace(/@theme[\s\S]*?body\s*\{[\s\S]*?margin:\s*0;[\s\S]*?\}/, newThemeBlock);
fs.writeFileSync(stylesPath, css);
console.log('2. Updated styles.css with design system tokens and typography.');

// 3. REFACTOR Header and Footer in layout.tsx
const layoutCode = `import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  CookingPot,
  Heart,
  Search,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { useUser, useNotice } from './shared';
import { request } from './api';

export function Header() {
  const user = useUser();
  const notice = useNotice();
  const location = useLocation();
  const navigate = useNavigate();

  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setToolsOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
      notice('Đã đăng xuất tài khoản.');
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const isToolActive = location.pathname === '/ngan-sach';

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E8E1] transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Cookora Bếp Nhà">
          <div className="w-9 h-9 rounded-xl bg-[#274734] text-white flex items-center justify-center shadow-xs transition group-hover:bg-[#365B43]">
            <CookingPot size={20} strokeWidth={2.2} />
          </div>
          <span className="font-semibold text-2xl text-[#202721] tracking-tight">
            cookora
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-8 text-[14.5px] font-medium text-[#66746B] h-full"
          aria-label="Điều hướng chính"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? 'text-[#274734] font-semibold relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#274734]'
                : 'hover:text-[#202721] transition h-full flex items-center'
            }
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/cong-thuc"
            className={({ isActive }) =>
              isActive
                ? 'text-[#274734] font-semibold relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#274734]'
                : 'hover:text-[#202721] transition h-full flex items-center'
            }
          >
            Khám phá
          </NavLink>
          <NavLink
            to="/co-gi-nau-nay"
            className={({ isActive }) =>
              isActive
                ? 'text-[#274734] font-semibold relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#274734]'
                : 'hover:text-[#202721] transition h-full flex items-center'
            }
          >
            Có gì nấu nấy
          </NavLink>
          <NavLink
            to="/thuc-don"
            className={({ isActive }) =>
              isActive
                ? 'text-[#274734] font-semibold relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#274734]'
                : 'hover:text-[#202721] transition h-full flex items-center'
            }
          >
            Thực đơn tuần
          </NavLink>
          <NavLink
            to="/eat-fit"
            className={({ isActive }) =>
              isActive
                ? 'text-[#274734] font-semibold relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#274734]'
                : 'hover:text-[#202721] transition h-full flex items-center'
            }
          >
            Eat Fit
          </NavLink>

          {/* Công cụ dropdown */}
          <div className="relative h-full flex items-center" ref={toolsRef}>
            <button
              type="button"
              onClick={() => setToolsOpen(!toolsOpen)}
              className={\`flex items-center gap-1.5 font-medium transition h-full \${
                isToolActive ? 'text-[#274734] font-semibold' : 'hover:text-[#202721]'
              }\`}
            >
              Công cụ <ChevronDown size={14} className={\`transition-transform duration-200 \${toolsOpen ? 'rotate-180' : ''}\`} />
            </button>

            {toolsOpen && (
              <div className="absolute top-[calc(100%-6px)] left-0 w-56 bg-white rounded-2xl shadow-md border border-[#E8E8E1] p-2 text-sm z-50 space-y-0.5 animate-in fade-in slide-in-from-top-1">
                <Link
                  to="/ngan-sach"
                  className="block px-3.5 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-[#202721] transition"
                >
                  Ước tính chi phí
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Action icons & User profile */}
        <div className="flex items-center gap-3">
          <Link
            to="/cong-thuc"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#66746B] hover:text-[#202721] hover:bg-stone-200/50 transition"
            title="Tìm kiếm"
          >
            <Search size={18} strokeWidth={2} />
          </Link>
          <Link
            to="/yeu-thich"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#66746B] hover:text-[#202721] hover:bg-stone-200/50 transition"
            title="Món đã lưu"
          >
            <Heart size={18} strokeWidth={2} />
          </Link>
          <button
            onClick={() => notice('Bạn chưa có thông báo mới.')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#66746B] hover:text-[#202721] hover:bg-stone-200/50 transition relative"
            title="Thông báo"
          >
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#D17A50]" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-[#E8E8E1]">
              <div
                className="w-8 h-8 rounded-full bg-[#274734] text-white flex items-center justify-center font-semibold text-xs tracking-wider"
                title={user.displayName}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#66746B] hover:text-red-600 transition"
                title="Đăng xuất"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/dang-nhap"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E8E8E1] bg-white text-[#202721] font-medium text-xs sm:text-sm hover:bg-stone-50 transition shadow-2xs"
            >
              <User size={15} /> Đăng nhập
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#202721] hover:bg-stone-200/50 transition"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E8E1] bg-white px-4 py-4 space-y-1 text-sm font-medium animate-in fade-in">
          <Link to="/" className="block px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-[#202721]">
            Trang chủ
          </Link>
          <Link to="/cong-thuc" className="block px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-[#202721]">
            Khám phá công thức
          </Link>
          <Link to="/co-gi-nau-nay" className="block px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-[#202721]">
            Có gì nấu nấy
          </Link>
          <Link to="/thuc-don" className="block px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-[#202721]">
            Thực đơn tuần
          </Link>
          <Link to="/eat-fit" className="block px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-[#202721]">
            Eat Fit
          </Link>
          <div className="pt-2 border-t border-[#E8E8E1]">
            <p className="px-3 py-1 text-xs font-semibold text-[#66746B] uppercase tracking-wider">
              Công cụ
            </p>
            <Link to="/ngan-sach" className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-[#202721]">
              Ước tính chi phí
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#274734] text-white pt-16 pb-12 mt-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand info */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <CookingPot size={18} strokeWidth={2.2} />
              </div>
              <span className="font-semibold text-2xl tracking-tight">cookora</span>
            </Link>
            <p className="text-stone-300 text-sm leading-relaxed max-w-sm">
              Bếp nhà, thêm một chút mới. Nền tảng ẩm thực gia đình giúp bữa ăn mỗi ngày trở nên dễ dàng, lành mạnh và tiết kiệm.
            </p>
          </div>

          {/* Links Column 1: Khám phá */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D17A50]">
              Khám phá
            </p>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link to="/cong-thuc" className="hover:text-white transition">
                  Công thức mới
                </Link>
              </li>
              <li>
                <Link to="/cong-thuc" className="hover:text-white transition">
                  Theo quốc gia
                </Link>
              </li>
              <li>
                <Link to="/co-gi-nau-nay" className="hover:text-white transition">
                  Theo nguyên liệu
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Công cụ */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D17A50]">
              Công cụ
            </p>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link to="/co-gi-nau-nay" className="hover:text-white transition">
                  Có gì nấu nấy
                </Link>
              </li>
              <li>
                <Link to="/thuc-don" className="hover:text-white transition">
                  Thực đơn tuần
                </Link>
              </li>
              <li>
                <Link to="/eat-fit" className="hover:text-white transition">
                  Eat Fit
                </Link>
              </li>
              <li>
                <Link to="/ngan-sach" className="hover:text-white transition">
                  Ước tính chi phí
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Hỗ trợ */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D17A50]">
              Hỗ trợ
            </p>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <span className="cursor-pointer hover:text-white transition">Trung tâm trợ giúp</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition">Góp ý sản phẩm</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition">Liên hệ</span>
              </li>
            </ul>
          </div>

          {/* Links Column 4: Về Cookora */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D17A50]">
              Về Cookora
            </p>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link to="/lo-trinh" className="hover:text-white transition">
                  Lộ trình phát triển
                </Link>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition">Điều khoản sử dụng</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition">Chính sách bảo mật</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Cookora. Bản quyền thuộc về Bếp Nhà.</p>
          <p className="text-stone-400">Thiết kế bởi đội ngũ Cookora · Tinh gọn & ấm áp.</p>
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
`;

fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'src', 'layout.tsx'), layoutCode);
console.log('3. Refactored layout.tsx with new palette & typography.');
