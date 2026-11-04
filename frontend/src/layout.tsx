import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CookingPot } from 'lucide-react';
export { Header } from './components/Header';

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
