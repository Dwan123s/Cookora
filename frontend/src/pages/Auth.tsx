import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CookingPot, LoaderCircle, Sprout, X } from 'lucide-react';
import type { User } from '@cookora/contracts';
import { request, setCsrf } from '../api';
import { useUser, errorText } from '../shared';

export function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [register, setRegister] = useState(false),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [name, setName] = useState(''),
    qc = useQueryClient(),
    navigate = useNavigate(),
    location = useLocation(),
    user = useUser();
  const mutation = useMutation({
    mutationFn: () =>
      request<{ user: User; csrfToken: string }>(`/auth/${register ? 'register' : 'login'}`, {
        method: 'POST',
        body: { email, password, ...(register ? { displayName: name } : {}) },
      }),
    onSuccess: (data) => {
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
  return (
    <main className="auth-page">
      <div className="auth-story">
        <span className="eyebrow">CHÀO MỪNG VỀ BẾP</span>
        <h1>
          Mỗi ngày,
          <br />
          một chút <em>ngon lành.</em>
        </h1>
        <p>Lưu món mình thích. Lên kế hoạch thật nhẹ. Cùng chăm chút cho những bữa cơm nhà.</p>
        <div className="auth-illustration">
          <CookingPot size={130} strokeWidth={0.8} />
          <Sprout size={60} strokeWidth={1} />
        </div>
      </div>
      <section className="auth-form">
        <h2>{register ? 'Tạo căn bếp của bạn' : 'Rất vui gặp lại bạn'}</h2>
        <p className="muted">
          {register
            ? 'Bắt đầu từ một tài khoản cho riêng mình.'
            : 'Đăng nhập để tiếp tục với những món đã lưu.'}
        </p>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          {register && (
            <label>
              Tên của bạn
              <input
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bạn muốn được gọi là…"
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@example.com"
            />
          </label>
          <div className="password-group">
            <label htmlFor="auth-password">Mật khẩu</label>
            <span className="password-field">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={register ? 'new-password' : 'current-password'}
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 12 ký tự"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </span>
          </div>
          {mutation.isError && (
            <p className="form-error" role="alert">
              {errorText(mutation.error)}
            </p>
          )}
          <button className="btn full" disabled={mutation.isPending}>
            {mutation.isPending ? <LoaderCircle size={17} className="spin" /> : null}
            {register ? 'Tạo tài khoản' : 'Đăng nhập'}
            <ArrowRight size={16} />
          </button>
        </form>
        <p className="auth-switch">
          {register ? 'Đã có tài khoản?' : 'Bạn chưa có tài khoản?'}{' '}
          <button
            onClick={() => {
              setRegister(!register);
              mutation.reset();
            }}
          >
            {register ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </p>
        <p className="data-notice">
          Môi trường phát triển local. Xác minh email và đặt lại mật khẩu qua email chưa được bật; không dùng
          thông tin nhạy cảm.
        </p>
      </section>
    </main>
  );
}
