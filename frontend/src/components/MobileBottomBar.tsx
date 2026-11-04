import { useEffect, useState, type RefObject } from 'react';
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
  Search,
  User,
} from 'lucide-react';
import { request } from '../api';
import { errorText, Modal, useNotice, useUser } from '../shared';

type Props = {
  chatOpen: boolean;
  onChatToggle: () => void;
  chatPanelId: string;
  chatTriggerRef: RefObject<HTMLButtonElement | null>;
};

export function MobileBottomBar({ chatOpen, onChatToggle, chatPanelId, chatTriggerRef }: Props) {
  const location = useLocation();
  const user = useUser();
  const notice = useNotice();
  const [moreOpen, setMoreOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const moreActive = [
    '/co-gi-nau-nay',
    '/eat-fit',
    '/ngan-sach',
    '/yeu-thich',
    '/di-cho',
    '/khau-phan',
    '/dinh-duong',
    '/lo-trinh',
    '/bien-tap',
  ].some((path) => location.pathname === path || location.pathname.startsWith(path + '/'));
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

  return (
    <>
      <nav className="mobile-bottom-bar" aria-label="Điều hướng dưới màn hình">
        <NavLink to="/" end className="mobile-bottom-item">
          <House size={21} />
          <span>Trang chủ</span>
        </NavLink>
        <NavLink to="/cong-thuc" className="mobile-bottom-item">
          <Search size={21} />
          <span>Khám phá</span>
        </NavLink>
        <button
          type="button"
          ref={chatTriggerRef}
          className={`mobile-bottom-item mobile-bottom-chat${chatOpen ? ' is-open' : ''}`}
          onClick={onChatToggle}
          aria-label={chatOpen ? 'Đóng trò chuyện với Cookora AI' : 'Mở trò chuyện với Cookora AI'}
          aria-expanded={chatOpen}
          aria-controls={chatOpen ? chatPanelId : undefined}
          aria-haspopup="dialog"
        >
          <span className="mobile-bottom-chat-icon">
            <MessageCircle size={23} />
          </span>
          <span>Chat AI</span>
        </button>
        <NavLink to="/thuc-don" className="mobile-bottom-item">
          <CalendarDays size={21} />
          <span>Thực đơn</span>
        </NavLink>
        <button
          type="button"
          className={`mobile-bottom-item${moreActive || moreOpen ? ' active' : ''}`}
          onClick={() => {
            if (chatOpen) onChatToggle();
            setMoreOpen(true);
          }}
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
        >
          <LayoutGrid size={21} />
          <span>Thêm</span>
        </button>
      </nav>
      {moreOpen && (
        <Modal title="Bếp của bạn" eyebrow="COOKORA" className="mobile-more-dialog" onClose={close}>
          {user && (
            <p className="mobile-more-user">
              Xin chào, <strong>{user.displayName}</strong>
            </p>
          )}
          <div className="mobile-more-links">
            <Link to="/co-gi-nau-nay" onClick={close}>
              <ChefHat size={22} />
              <span>
                Có gì nấu nấy<small>Tìm món từ nguyên liệu có sẵn</small>
              </span>
            </Link>
            <Link to="/eat-fit" onClick={close}>
              <Leaf size={22} />
              <span>
                Eat Fit<small>Dinh dưỡng và bữa ăn phù hợp</small>
              </span>
            </Link>
            <Link to="/ngan-sach" onClick={close}>
              <Coins size={22} />
              <span>
                Ước tính chi phí<small>Lên thực đơn theo ngân sách</small>
              </span>
            </Link>
            <Link to="/yeu-thich" onClick={close}>
              <Heart size={22} />
              <span>
                Món yêu thích<small>Công thức bạn đã lưu</small>
              </span>
            </Link>
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
