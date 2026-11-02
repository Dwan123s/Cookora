const fs = require('fs');
const path = require('path');

// 1. UPDATE styles.css
const stylesPath = path.join(__dirname, '..', 'frontend', 'src', 'styles.css');
let css = fs.readFileSync(stylesPath, 'utf8');

const newThemeBlock = `@theme {
  --color-page-bg: #FAF9F6;
  --color-surface: #FFFFFF;
  --color-primary: #47735B;
  --color-primary-hover: #3B634F;
  --color-secondary-bg: #E8F1E9;
  --color-warm-beige: #E9D9C7;
  --color-main-text: #273D32;
  --color-border: #DFE5DD;
  --font-sans: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
:root {
  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #273D32;
  background-color: #FAF9F6;
  font-synthesis: none;
  font-weight: 400;
  --primary: #47735B;
  --primary-hover: #3B634F;
  --secondary-bg: #E8F1E9;
  --warm-beige: #E9D9C7;
  --ink: #273D32;
  --muted: #5C7065;
  --line: #DFE5DD;
  --surface: #FFFFFF;
}

body {
  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #273D32;
  background-color: #FAF9F6;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 600;
  line-height: 1.25;
  color: #273D32;
  letter-spacing: -0.01em;
}

button, input, select, textarea {
  font-family: inherit;
}`;

css = css.replace(/@theme[\s\S]*?body\s*\{[\s\S]*?margin:\s*0;[\s\S]*?\}/, newThemeBlock);
fs.writeFileSync(stylesPath, css);
console.log('1. Updated styles.css with Sage Green & Warm Cream tokens.');

// 2. REFACTOR layout.tsx (Header & Footer matching uploaded image)
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
  const [searchVal, setSearchVal] = useState('');
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(\`/cong-thuc?q=\${encodeURIComponent(searchVal.trim())}\`);
    } else {
      navigate('/cong-thuc');
    }
  };

  const isToolActive = ['/khau-phan', '/ngan-sach', '/bao-quan', '/dinh-duong', '/yeu-thich'].includes(
    location.pathname
  );

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#DFE5DD] transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Cookora Bếp Nhà">
          <div className="w-9 h-9 rounded-xl bg-[#47735B] text-white flex items-center justify-center shadow-xs transition group-hover:bg-[#3B634F]">
            <CookingPot size={20} strokeWidth={2.2} />
          </div>
          <span className="font-semibold text-2xl text-[#273D32] tracking-tight">
            cookora
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-7 text-[14.5px] font-medium text-[#5C7065] h-full"
          aria-label="Điều hướng chính"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? 'text-[#47735B] font-semibold relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#47735B]'
                : 'hover:text-[#273D32] transition h-full flex items-center'
            }
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/cong-thuc"
            className={({ isActive }) =>
              isActive
                ? 'text-[#47735B] font-semibold relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#47735B]'
                : 'hover:text-[#273D32] transition h-full flex items-center'
            }
          >
            Khám phá
          </NavLink>
          <NavLink
            to="/co-gi-nau-nay"
            className={({ isActive }) =>
              isActive
                ? 'text-[#47735B] font-semibold relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#47735B]'
                : 'hover:text-[#273D32] transition h-full flex items-center'
            }
          >
            Có gì nấu nấy
          </NavLink>
          <NavLink
            to="/thuc-don"
            className={({ isActive }) =>
              isActive
                ? 'text-[#47735B] font-semibold relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#47735B]'
                : 'hover:text-[#273D32] transition h-full flex items-center'
            }
          >
            Thực đơn tuần
          </NavLink>
          <NavLink
            to="/eat-fit"
            className={({ isActive }) =>
              isActive
                ? 'text-[#47735B] font-semibold relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#47735B]'
                : 'hover:text-[#273D32] transition h-full flex items-center'
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
                isToolActive ? 'text-[#47735B] font-semibold' : 'hover:text-[#273D32]'
              }\`}
            >
              Công cụ <ChevronDown size={14} className={\`transition-transform duration-200 \${toolsOpen ? 'rotate-180' : ''}\`} />
            </button>

            {toolsOpen && (
              <div className="absolute top-[calc(100%-6px)] left-0 w-56 bg-white rounded-2xl shadow-md border border-[#DFE5DD] p-2 text-sm z-50 space-y-0.5 animate-in fade-in slide-in-from-top-1">
                <Link
                  to="/khau-phan"
                  className="block px-3.5 py-2.5 rounded-xl hover:bg-[#E8F1E9] text-[#273D32] transition"
                >
                  Điều chỉnh khẩu phần
                </Link>
                <Link
                  to="/ngan-sach"
                  className="block px-3.5 py-2.5 rounded-xl hover:bg-[#E8F1E9] text-[#273D32] transition"
                >
                  Ước tính chi phí
                </Link>
                <Link
                  to="/bao-quan"
                  className="block px-3.5 py-2.5 rounded-xl hover:bg-[#E8F1E9] text-[#273D32] transition"
                >
                  Bảo quản thực phẩm
                </Link>
                <Link
                  to="/dinh-duong"
                  className="block px-3.5 py-2.5 rounded-xl hover:bg-[#E8F1E9] text-[#273D32] transition"
                >
                  Dinh dưỡng & Calories
                </Link>
                <Link
                  to="/yeu-thich"
                  className="block px-3.5 py-2.5 rounded-xl hover:bg-[#E8F1E9] text-[#273D32] transition"
                >
                  Công thức yêu thích
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Center Search Pill Input (Matching uploaded image) */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-56 xl:w-64">
          <input
            type="text"
            placeholder="Tìm công thức, nguyên liệu..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-full bg-[#E8F1E9]/60 border border-[#DFE5DD] text-xs font-normal text-[#273D32] placeholder-[#5C7065] focus:outline-hidden focus:bg-white focus:border-[#47735B] transition"
          />
          <Search size={14} className="absolute left-3 text-[#5C7065]" />
        </form>

        {/* Action icons & User profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/yeu-thich"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#5C7065] hover:text-[#273D32] hover:bg-[#E8F1E9] transition"
            title="Món đã lưu"
          >
            <Heart size={18} strokeWidth={1.8} />
          </Link>
          <button
            onClick={() => notice('Bạn chưa có thông báo mới.')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#5C7065] hover:text-[#273D32] hover:bg-[#E8F1E9] transition relative"
            title="Thông báo"
          >
            <Bell size={18} strokeWidth={1.8} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#47735B]" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-[#DFE5DD]">
              <div
                className="w-8 h-8 rounded-full bg-[#47735B] text-white flex items-center justify-center font-medium text-xs tracking-wider"
                title={user.displayName}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C7065] hover:text-stone-900 transition"
                title="Đăng xuất"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/dang-nhap"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#DFE5DD] bg-white text-[#273D32] font-medium text-xs sm:text-sm hover:bg-[#E8F1E9] transition shadow-2xs"
            >
              <User size={14} /> Đăng nhập
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#273D32] hover:bg-[#E8F1E9] transition"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DFE5DD] bg-[#FAF9F6] px-4 py-4 space-y-1 text-sm font-medium animate-in fade-in">
          <Link to="/" className="block px-3 py-2.5 rounded-xl hover:bg-[#E8F1E9] text-[#273D32]">
            Trang chủ
          </Link>
          <Link to="/cong-thuc" className="block px-3 py-2.5 rounded-xl hover:bg-[#E8F1E9] text-[#273D32]">
            Khám phá công thức
          </Link>
          <Link to="/co-gi-nau-nay" className="block px-3 py-2.5 rounded-xl hover:bg-[#E8F1E9] text-[#273D32]">
            Có gì nấu nấy
          </Link>
          <Link to="/thuc-don" className="block px-3 py-2.5 rounded-xl hover:bg-[#E8F1E9] text-[#273D32]">
            Thực đơn tuần
          </Link>
          <Link to="/eat-fit" className="block px-3 py-2.5 rounded-xl hover:bg-[#E8F1E9] text-[#273D32]">
            Eat Fit
          </Link>
          <div className="pt-2 border-t border-[#DFE5DD]">
            <p className="px-3 py-1 text-xs font-semibold text-[#5C7065] uppercase tracking-wider">
              Công cụ
            </p>
            <Link to="/khau-phan" className="block px-3 py-2 rounded-xl hover:bg-[#E8F1E9] text-[#273D32]">
              Điều chỉnh khẩu phần
            </Link>
            <Link to="/ngan-sach" className="block px-3 py-2 rounded-xl hover:bg-[#E8F1E9] text-[#273D32]">
              Ước tính chi phí
            </Link>
            <Link to="/bao-quan" className="block px-3 py-2 rounded-xl hover:bg-[#E8F1E9] text-[#273D32]">
              Bảo quản thực phẩm
            </Link>
            <Link to="/dinh-duong" className="block px-3 py-2 rounded-xl hover:bg-[#E8F1E9] text-[#273D32]">
              Dinh dưỡng & Calories
            </Link>
            <Link to="/yeu-thich" className="block px-3 py-2 rounded-xl hover:bg-[#E8F1E9] text-[#273D32]">
              Công thức yêu thích
            </Link>
          </div>
        </div>
      )}
    </header>
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
            <Link to="/lo-trinh" className="hover:text-[#47735B] transition">Về Cookora</Link>
            <span className="cursor-pointer hover:text-[#47735B] transition">Điều khoản</span>
            <span className="cursor-pointer hover:text-[#47735B] transition">Chính sách</span>
            <span className="cursor-pointer hover:text-[#47735B] transition">Hỗ trợ</span>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-[#5C7065]">
            <a href="#" className="hover:text-[#47735B] transition text-sm font-semibold">f</a>
            <a href="#" className="hover:text-[#47735B] transition text-sm font-semibold">▶</a>
            <a href="#" className="hover:text-[#47735B] transition text-sm font-semibold">📷</a>
            <a href="#" className="hover:text-[#47735B] transition text-sm font-semibold">♪</a>
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-[#5C7065]/80">
          © {new Date().getFullYear()} Cookora. Thiết kế theo phong cách Sage Green & Warm Cream.
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
console.log('2. Refactored layout.tsx with Sage Green & Warm Cream palette.');
