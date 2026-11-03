import { createContext, useContext, useEffect, useRef, useId, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Clock3,
  CookingPot,
  Heart,
  LoaderCircle,
  Minus,
  Plus,
  Users,
  X,
  AlertCircle,
} from 'lucide-react';
import type { Cuisine, Recipe, User } from '@cookora/contracts';
import { request } from './api';
import { m } from 'motion/react';
import { recipeMedia, recipeSummary } from './recipe-media';

export const cuisines: Cuisine[] = [
  { code: 'VN', name: 'Việt Nam', flag: '🇻🇳' },
  { code: 'KR', name: 'Hàn Quốc', flag: '🇰🇷' },
  { code: 'JP', name: 'Nhật Bản', flag: '🇯🇵' },
  { code: 'CN', name: 'Trung Quốc', flag: '🇨🇳' },
  { code: 'TH', name: 'Thái Lan', flag: '🇹🇭' },
  { code: 'IT', name: 'Ý', flag: '🇮🇹' },
  { code: 'WE', name: 'Âu & Mỹ', flag: '🌍' },
];

export const cuisineFor = (code: string) => cuisines.find((c) => c.code === code) || cuisines[0];

export const noticeContext = createContext<(message: string) => void>(() => {});

export const authContext = createContext<User | null>(null);

export const useNotice = () => useContext(noticeContext);

export const useUser = () => useContext(authContext);

export const errorText = (e: unknown) =>
  e instanceof Error ? e.message : 'Có lỗi xảy ra. Vui lòng thử lại.';

export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={25} />
      <span>Đang chuẩn bị căn bếp…</span>
    </div>
  );
}

export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div className="empty">
      <AlertCircle size={32} />
      <h3>Chưa tải được dữ liệu</h3>
      <p>{errorText(error)}</p>
      {retry && (
        <button className="btn secondary" onClick={retry}>
          Thử lại
        </button>
      )}
    </div>
  );
}

export function Empty({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="empty">
      {icon}
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  className = '',
  eyebrow,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      className={`modal ${className}`.trim()}
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-head">
        {eyebrow ? (
          <div className="modal-title-group">
            <p className="modal-eyebrow">{eyebrow}</p>
            <h2 id={titleId}>{title}</h2>
          </div>
        ) : (
          <h2 id={titleId}>{title}</h2>
        )}
        <button className="icon-btn" onClick={onClose} aria-label="Đóng">
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function PageHead({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <m.div className="page-head" initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </m.div>
  );
}

export function Portions({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="portions">
      <button aria-label="Giảm khẩu phần" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus size={15} />
      </button>
      <span>
        <strong>{value}</strong> phần
      </span>
      <button aria-label="Tăng khẩu phần" disabled={value >= 20} onClick={() => onChange(value + 1)}>
        <Plus size={15} />
      </button>
    </div>
  );
}

export function FavoriteButton({ recipe, overlay = false }: { recipe: Recipe; overlay?: boolean }) {
  const user = useUser(),
    navigate = useNavigate(),
    location = useLocation(),
    qc = useQueryClient(),
    notice = useNotice();
  const list = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => request<Recipe[]>('/favorites'),
    enabled: !!user,
  });
  const saved = !!list.data?.data.some((r) => r.id === recipe.id);
  const mutate = useMutation({
    mutationFn: () => request(`/favorites/${recipe.id}`, { method: saved ? 'DELETE' : 'PUT' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      notice(saved ? 'Đã bỏ khỏi công thức yêu thích.' : 'Đã lưu công thức vào bếp của bạn.');
    },
    onError: (e) => notice(errorText(e)),
  });
  return (
    <m.button
      className={`favorite-btn ${overlay ? 'on-image' : ''} ${saved ? 'saved' : ''}`}
      whileTap={{ scale: 0.9 }}
      aria-label={saved ? `Bỏ lưu ${recipe.title}` : `Lưu ${recipe.title}`}
      aria-pressed={saved}
      disabled={mutate.isPending}
      onClick={(e) => {
        e.preventDefault();
        if (!user) navigate('/dang-nhap', { state: { from: location.pathname + location.search } });
        else mutate.mutate();
      }}
    >
      <Heart size={19} fill={saved ? 'currentColor' : 'none'} />
    </m.button>
  );
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const c = cuisineFor(recipe.cuisine);
  const media = recipeMedia(recipe);
  return (
    <article className="recipe-card">
      <div className="recipe-image">
        <Link to={`/cong-thuc/${recipe.slug}`} tabIndex={-1} viewTransition>
          <img
            src={media.src}
            alt={`${media.label}: ${recipe.title}`}
            loading="lazy"
            width="900"
            height="900"
            style={{ viewTransitionName: `recipe-${recipe.id}` }}
          />
        </Link>
        <FavoriteButton recipe={recipe} overlay />
      </div>
      <div className="recipe-card-body">
        <div className="card-kicker">
          <span>{c.name}</span>
          <span className="draft-dot">{recipe.contentStatus === 'DRAFT' ? 'Bản thảo' : 'Đã duyệt'}</span>
        </div>
        <h3>
          <Link to={`/cong-thuc/${recipe.slug}`} viewTransition>
            {recipe.title}
          </Link>
        </h3>
        {recipeSummary(recipe) && <p>{recipeSummary(recipe)}</p>}
        <div className="card-meta">
          <span>
            <Clock3 size={14} />
            {recipe.totalMinutes ? `~${recipe.totalMinutes} phút` : 'Chưa rõ thời gian'}
          </span>
          <span>
            <Users size={14} />
            {recipe.baseServings} phần
          </span>
        </div>
      </div>
    </article>
  );
}

export function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="recipe-grid">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}

export function RequireLogin({ title }: { title: string }) {
  const location = useLocation();
  return (
    <main className="container">
      <Empty icon={<CookingPot size={45} strokeWidth={1.3} />} title={title}>
        <p>Đăng nhập để lưu thực đơn, món yêu thích và danh sách đi chợ của riêng bạn.</p>
        <Link to="/dang-nhap" state={{ from: location.pathname + location.search }} className="btn">
          Đăng nhập <ArrowRight size={16} />
        </Link>
      </Empty>
    </main>
  );
}
