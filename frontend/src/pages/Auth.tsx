import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CookingPot,
  ChefHat,
  CalendarDays,
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserPlus,
  LoaderCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import type { User as UserType } from '@cookora/contracts';
import { request, setCsrf } from '../api';
import { useUser, errorText, Modal } from '../shared';
import '../auth-reference.css';

function Brand({ badge = false }: { badge?: boolean }) {
  return (
    <Link
      to="/"
      className={`login-brand${badge ? ' login-brand-badge' : ''}`}
      aria-label="Cookora – Về trang chủ"
    >
      <span>
        <CookingPot strokeWidth={1.7} />
      </span>
      <strong>cookora</strong>
    </Link>
  );
}
const benefits = [
  { Icon: ChefHat, title: 'Kho công thức đa dạng', text: 'Việt – Hàn – Nhật – Trung – Thái...' },
  { Icon: CalendarDays, title: 'Lên thực đơn tuần', text: 'Cân bằng dinh dưỡng, tiết kiệm thời gian' },
  { Icon: Leaf, title: 'Eat Fit – Sống khỏe', text: 'Giảm mỡ, tăng cơ, theo mục tiêu cá nhân' },
];
export function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('cookora.remembered-account') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [help, setHelp] = useState<{ title: string; message: string } | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const mutation = useMutation({
    mutationFn: () =>
      request<{ user: UserType; csrfToken: string }>(`/auth/${register ? 'register' : 'login'}`, {
        method: 'POST',
        body: { email, password, ...(register ? { displayName: name } : {}) },
      }),
    onSuccess: (data) => {
      try {
        if (rememberMe) localStorage.setItem('cookora.remembered-account', email.trim());
        else localStorage.removeItem('cookora.remembered-account');
      } catch {
        /* Browser storage is optional. */
      }
      setCsrf(data.data.csrfToken);
      qc.clear();
      qc.setQueryData(['auth'], { data: data.data.user, meta: data.meta });
      const from = location.state?.from;
      navigate(
        typeof from === 'string' &&
          from.startsWith('/') &&
          !from.startsWith('//') &&
          !from.startsWith('/dang-nhap')
          ? from
          : '/thuc-don',
        { replace: true },
      );
    },
  });
  if (user) return <Navigate to="/thuc-don" replace />;
  const switchMode = (next: boolean) => {
    setRegister(next);
    mutation.reset();
  };
  const socialHelp = (provider: string) =>
    setHelp({
      title: `Đăng nhập với ${provider}`,
      message: `${provider} hiện chưa được kết nối với Cookora. Bạn có thể đăng nhập bằng tài khoản Cookora hoặc chọn Đăng ký để tạo tài khoản mới.`,
    });
  return (
    <main className="login-reference">
      <section className="login-story" aria-labelledby="login-story-title">
        <div className="login-story-content">
          <Brand badge />
          <div className="login-headline">
            <h1 id="login-story-title">
              Nấu ngon hơn,
              <br />
              <em>sống lành mạnh hơn</em>
            </h1>
            <span className="login-sunburst" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
          <p className="login-intro">
            Khám phá hàng ngàn công thức, lên thực đơn thông minh
            <br className="login-desktop-break" /> và chăm sóc dinh dưỡng mỗi ngày cùng Cookora.
          </p>
          <ul className="login-benefits">
            {benefits.map(({ Icon, title, text }) => (
              <li key={title}>
                <span>
                  <Icon strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="login-panel" aria-labelledby="login-form-title">
        <div className={`login-card${register ? ' is-register' : ''}`}>
          <svg className="login-leaves" viewBox="0 0 120 100" fill="none" aria-hidden="true">
            <defs>
              <linearGradient
                id="login-leaf-color"
                x1="20"
                y1="5"
                x2="100"
                y2="95"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#81a15b" />
                <stop offset="1" stopColor="#3c7144" />
              </linearGradient>
            </defs>
            <path d="M116 0C90 15 70 39 47 66" stroke="#77915c" strokeWidth="2" />
            <path d="M79 24C45 12 21 25 8 52C40 57 61 45 79 24Z" fill="url(#login-leaf-color)" />
            <path d="M98 14C69 39 66 65 78 94C103 75 111 46 98 14Z" fill="url(#login-leaf-color)" />
            <path d="M112 3C99 16 92 31 85 51M70 29L20 48" stroke="#b2c48a" strokeWidth="1" opacity=".55" />
          </svg>
          <div className="login-card-content">
            <header className="login-card-heading">
              <Brand />
              <h2 id="login-form-title">{register ? 'Tạo tài khoản Cookora' : 'Đăng nhập vào Cookora'}</h2>
              <p>{register ? 'Bắt đầu' : 'Tiếp tục'} hành trình nấu ăn và ăn uống lành mạnh của bạn</p>
            </header>
            <div className="login-switch" aria-label="Chọn đăng nhập hoặc đăng ký">
              <button
                type="button"
                aria-pressed={!register}
                disabled={mutation.isPending}
                onClick={() => switchMode(false)}
              >
                <User size={16} />
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                aria-pressed={register}
                disabled={mutation.isPending}
                onClick={() => switchMode(true)}
              >
                <UserPlus size={17} />
                <span>Đăng ký</span>
              </button>
            </div>
            <form
              className="login-form"
              onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate();
              }}
              aria-busy={mutation.isPending}
            >
              {register && (
                <label className="login-field">
                  <User size={17} aria-hidden="true" />
                  <span className="login-sr-only">Tên của bạn</span>
                  <input
                    name="displayName"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Tên của bạn"
                    disabled={mutation.isPending}
                  />
                </label>
              )}
              <label className="login-field">
                <Mail size={17} aria-hidden="true" />
                <span className="login-sr-only">Email hoặc tên tài khoản</span>
                <input
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email hoặc tên tài khoản"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={mutation.isPending}
                />
              </label>
              <div className="login-field">
                <Lock size={17} aria-hidden="true" />
                <label className="login-sr-only" htmlFor="cookora-password">
                  Mật khẩu
                </label>
                <input
                  id="cookora-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  maxLength={128}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={register ? 'Mật khẩu (ít nhất 6 ký tự)' : 'Mật khẩu'}
                  disabled={mutation.isPending}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                </button>
              </div>
              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => {
                      setRememberMe(event.target.checked);
                      if (!event.target.checked) {
                        try {
                          localStorage.removeItem('cookora.remembered-account');
                        } catch {
                          /* Optional storage. */
                        }
                      }
                    }}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                {!register && (
                  <button
                    type="button"
                    onClick={() =>
                      setHelp({
                        title: 'Quên mật khẩu?',
                        message:
                          'Hãy liên hệ người quản lý tài khoản Cookora để được hỗ trợ khôi phục. Tính năng đặt lại mật khẩu qua email hiện chưa khả dụng.',
                      })
                    }
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              {mutation.isError && (
                <p className="login-error" role="alert">
                  <AlertCircle size={17} />
                  <span>{errorText(mutation.error)}</span>
                </p>
              )}
              <button className="login-submit" type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <LoaderCircle className="spin" size={18} />
                    <span>Đang xử lý…</span>
                  </>
                ) : (
                  <>
                    <span>{register ? 'Đăng ký' : 'Đăng nhập'}</span>
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>
            <div className="login-divider">
              <span>Hoặc {register ? 'đăng ký' : 'đăng nhập'} với</span>
            </div>
            <div className="login-social">
              <button type="button" aria-label="Đăng nhập với Google" onClick={() => socialHelp('Google')}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Đăng nhập với Facebook"
                onClick={() => socialHelp('Facebook')}
              >
                <svg viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button type="button" aria-label="Đăng nhập với Apple" onClick={() => socialHelp('Apple')}>
                <svg viewBox="0 0 24 24" fill="#080b09" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8.92-2.85-.9.04-2 .6-2.65 1.36-.58.67-1.08 1.74-.95 2.77 1 .08 2.06-.52 2.68-1.28z" />
                </svg>
              </button>
            </div>
          </div>
          <svg className="login-wave" viewBox="0 0 500 85" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 35C120-18 227 100 355 57C410 39 461 31 500 0V85H0Z" fill="#dce6cb" />
            <path d="M0 70C120 22 240 105 365 68C430 49 469 56 500 36V85H0Z" fill="#e8edda" opacity=".7" />
          </svg>
          <div className="login-pot" aria-hidden="true">
            <span className="login-sunburst">
              <i />
              <i />
              <i />
            </span>
            <CookingPot strokeWidth={1.5} />
          </div>
        </div>
      </section>
      {help && (
        <Modal title={help.title} onClose={() => setHelp(null)}>
          <p>{help.message}</p>
          <button className="btn" type="button" onClick={() => setHelp(null)}>
            Đã hiểu
          </button>
        </Modal>
      )}
    </main>
  );
}
