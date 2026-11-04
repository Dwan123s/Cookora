import { useEffect, useRef, useState, type RefObject } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  ChefHat,
  Coins,
  Heart,
  House,
  LayoutGrid,
  Leaf,
  LogOut,
  MessageCircle,
  Scale,
  Salad,
  Search,
  User,
} from 'lucide-react';
import { request } from '../api';
import { errorText, Modal, useNotice, useUser } from '../shared';

type Props = {
  chatOpen: boolean;
  onChatToggle: () => void;
  onChatClose: () => void;
  chatPanelId: string;
  chatTriggerRef: RefObject<HTMLButtonElement | null>;
};

export function MobileBottomBar({ chatOpen, onChatToggle, onChatClose, chatPanelId, chatTriggerRef }: Props) {
  const location = useLocation();
  const user = useUser();
  const notice = useNotice();
  const [moreOpen, setMoreOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const moreActive = [
    '/co-gi-nau-nay',
    '/eat-fit',
    '/ngan-sach',
    '/yeu-thich',
    '/khau-phan',
    '/dinh-duong',
    '/lo-trinh',
    '/bien-tap',
  ].some((path) => location.pathname === path || location.pathname.startsWith(path + '/'));
  const shoppingActive = location.pathname.startsWith('/di-cho/');
  const overlayOpen = chatOpen || moreOpen;
  const itemClass = (active: boolean) => `mobile-bottom-item${active && !overlayOpen ? ' is-selected' : ''}`;
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const close = () => {
      if (desktop.matches) setMoreOpen(false);
    };
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, []);
  useEffect(() => {
    if (!moreOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [moreOpen]);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await request('/auth/logout', { method: 'POST' });
      window.location.assign('/');
    } catch (error) {
      notice(errorText(error));
      setLoggingOut(false);
    }
  };
  const close = () => setMoreOpen(false);
  const navigate = () => {
    close();
    onChatClose();
  };
  const dismiss = () => {
    close();
    window.requestAnimationFrame(() => moreTriggerRef.current?.focus({ preventScroll: true }));
  };

  return (
    <>
      <nav className="mobile-bottom-bar" aria-label="Điều hướng dưới màn hình">
        <NavLink to="/" end className={({ isActive }) => itemClass(isActive)} onClick={navigate}>
          <House size={22} aria-hidden="true" />
          <span>Trang chủ</span>
        </NavLink>
        <NavLink to="/cong-thuc" className={({ isActive }) => itemClass(isActive)} onClick={navigate}>
          <Search size={22} aria-hidden="true" />
          <span>Khám phá</span>
        </NavLink>
        <button
          type="button"
          ref={chatTriggerRef}
          className={`mobile-bottom-item mobile-bottom-chat${chatOpen ? ' is-selected' : ''}`}
          onClick={onChatToggle}
          aria-label={chatOpen ? 'Đóng trò chuyện với Cookora AI' : 'Mở trò chuyện với Cookora AI'}
          aria-expanded={chatOpen}
          aria-controls={chatOpen ? chatPanelId : undefined}
          aria-haspopup="dialog"
        >
          <span className="mobile-bottom-chat-icon">
            <MessageCircle size={22} aria-hidden="true" />
          </span>
          <span>Chat AI</span>
        </button>
        <NavLink
          to="/thuc-don"
          className={({ isActive }) => itemClass(isActive || shoppingActive)}
          onClick={navigate}
        >
          <CalendarDays size={22} aria-hidden="true" />
          <span>Thực đơn</span>
        </NavLink>
        <button
          type="button"
          ref={moreTriggerRef}
          className={`mobile-bottom-item${moreOpen || (moreActive && !chatOpen) ? ' is-selected' : ''}`}
          onClick={() => {
            onChatClose();
            setMoreOpen(true);
          }}
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
        >
          <LayoutGrid size={22} aria-hidden="true" />
          <span>Thêm</span>
        </button>
      </nav>
      {moreOpen && (
        <Modal title="Bếp của bạn" eyebrow="COOKORA" className="mobile-more-dialog" onClose={dismiss}>
          {user && (
            <p className="mobile-more-user">
              Xin chào, <strong>{user.displayName}</strong>
            </p>
          )}
          <div className="mobile-more-links">
            <NavLink to="/co-gi-nau-nay" onClick={navigate}>
              <ChefHat size={22} />
              <span>
                Có gì nấu nấy<small>Tìm món từ nguyên liệu có sẵn</small>
              </span>
            </NavLink>
            <NavLink to="/eat-fit" onClick={navigate}>
              <Leaf size={22} />
              <span>
                Eat Fit<small>Dinh dưỡng và bữa ăn phù hợp</small>
              </span>
            </NavLink>
            <NavLink to="/ngan-sach" onClick={navigate}>
              <Coins size={22} />
              <span>
                Ước tính chi phí<small>Lên thực đơn theo ngân sách</small>
              </span>
            </NavLink>
            <NavLink to="/dinh-duong" onClick={navigate}>
              <Salad size={22} aria-hidden="true" />
              <span>
                Dinh dưỡng & Calories<small>Tra cứu dinh dưỡng cho bữa ăn</small>
              </span>
            </NavLink>
            <NavLink to="/khau-phan" onClick={navigate}>
              <Scale size={22} aria-hidden="true" />
              <span>
                Điều chỉnh khẩu phần<small>Tính nguyên liệu theo số người</small>
              </span>
            </NavLink>
            <NavLink to="/yeu-thich" onClick={navigate}>
              <Heart size={22} />
              <span>
                Món yêu thích<small>Công thức bạn đã lưu</small>
              </span>
            </NavLink>
            {!user && (
              <Link to="/dang-nhap" onClick={close}>
                <User size={22} />
                <span>
                  Đăng nhập<small>Lưu thực đơn và dữ liệu của bạn</small>
                </span>
              </Link>
            )}
            {user && (
              <button type="button" disabled={loggingOut} onClick={() => void logout()}>
                <LogOut size={22} />
                <span>{loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}</span>
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
