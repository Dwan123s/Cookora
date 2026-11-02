import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock3,
  CookingPot,
  Leaf,
  LoaderCircle,
  Minus,
  Plus,
  Salad,
  Search,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import type { Ingredient, MatchResult } from '@cookora/contracts';
import { errorText, FavoriteButton } from '../shared';
import { matcherMedia } from '../matcher-media';

const normalized = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
const displayTitle = (title: string) => title.match(/\(([^()]+)\)\s*$/)?.[1] || title;
const emoji = (name: string) =>
  /cà chua/i.test(name)
    ? '🍅'
    : /trứng/i.test(name)
      ? '🥚'
      : /heo|bò/i.test(name)
        ? '🥩'
        : /gà/i.test(name)
          ? '🍗'
          : /đậu/i.test(name)
            ? '🧈'
            : '🥬';
type Props = {
  ingredients: Ingredient[];
  selected: string[];
  onToggle: (name: string) => void;
  matches: MatchResult[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  servings: number;
  onServings: (servings: number) => void;
};
export function PantryCatalog({
  ingredients,
  selected,
  onToggle,
  matches,
  loading,
  error,
  onRetry,
  servings,
  onServings,
}: Props) {
  const [input, setInput] = useState('');
  const [advanced, setAdvanced] = useState(true);
  const [time, setTime] = useState(0);
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('match');
  const [limit, setLimit] = useState(6);
  const [message, setMessage] = useState('');
  const filtered = [...matches]
    .filter(({ recipe: r }) => {
      const name = normalized(r.title + ' ' + r.category);
      return (
        (!time || (r.totalMinutes !== null && r.totalMinutes <= time)) &&
        (difficulty === 'all' || normalized(r.difficulty) === normalized(difficulty)) &&
        (category === 'all' ||
          (category === 'main' && !/salad|goi|trang mieng/.test(name)) ||
          (category === 'salad' && /salad|goi/.test(name)) ||
          (category === 'quick' && r.totalMinutes !== null && r.totalMinutes <= 20) ||
          (category === 'fit' && /eat fit|eatfit/.test(name)))
      );
    })
    .sort((a, b) =>
      sort === 'time'
        ? (a.recipe.totalMinutes ?? Infinity) - (b.recipe.totalMinutes ?? Infinity)
        : b.score - a.score,
    );
  const addIngredient = () => {
    const name = input.trim();
    if (!name) return;
    if (selected.some((item) => normalized(item) === normalized(name))) {
      setInput('');
      return;
    }
    const known = ingredients.find((item) =>
      [item.name, ...item.aliases].some((alias) => normalized(alias) === normalized(name)),
    );
    if (selected.length >= 50) {
      setMessage('Bạn có thể chọn tối đa 50 nguyên liệu.');
      return;
    }
    onToggle(known?.name || name);
    setInput('');
    setLimit(6);
    setMessage(known ? '' : 'Đã thêm nguyên liệu. Nếu chưa có món phù hợp, bạn có thể thử Trợ lý AI.');
  };
  return (
    <>
      <section className="fridge-card pantry-surface" aria-labelledby="fridge-title">
        <h2 id="fridge-title">
          <ShoppingBasket strokeWidth={1.5} />
          Tủ lạnh của bạn
        </h2>
        <p className="fridge-description">Nhập nguyên liệu bạn đang có (ví dụ: thịt bò, trứng, cà chua...)</p>
        <form
          className="fridge-search"
          onSubmit={(event) => {
            event.preventDefault();
            addIngredient();
          }}
        >
          <Search size={18} />
          <label className="pantry-sr-only" htmlFor="fridge-ingredient">
            Nhập nguyên liệu
          </label>
          <input
            id="fridge-ingredient"
            list="fridge-ingredients"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Nhập nguyên liệu..."
            maxLength={100}
          />
          <datalist id="fridge-ingredients">
            {ingredients.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
          <button type="submit" aria-label="Thêm nguyên liệu" disabled={!input.trim()}>
            <Plus size={23} />
          </button>
        </form>
        <div className="fridge-chips" aria-label="Nguyên liệu trong tủ lạnh">
          {selected.map((name) => (
            <button
              type="button"
              key={name}
              onClick={() => {
                onToggle(name);
                setLimit(6);
              }}
              aria-label={`Bỏ ${name}`}
            >
              <span aria-hidden="true">{emoji(name)}</span>
              <strong>{name}</strong>
              <X size={13} />
            </button>
          ))}
        </div>
        {!selected.length && (
          <p className="fridge-empty">Tủ lạnh đang trống. Thêm nguyên liệu để bắt đầu nhé!</p>
        )}
        <button
          type="button"
          className="fridge-advanced-toggle"
          onClick={() => setAdvanced(!advanced)}
          aria-expanded={advanced}
          aria-controls="fridge-advanced"
        >
          Tùy chọn nâng cao{advanced ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>
        {advanced && (
          <div className="fridge-options" id="fridge-advanced">
            <div>
              <span>
                <Users size={21} />
                Khẩu phần
              </span>
              <div className="fridge-stepper">
                <button
                  type="button"
                  onClick={() => onServings(Math.max(1, servings - 1))}
                  disabled={servings <= 1}
                  aria-label="Giảm khẩu phần"
                >
                  <Minus size={16} />
                </button>
                <span>{servings} người</span>
                <button
                  type="button"
                  onClick={() => onServings(Math.min(20, servings + 1))}
                  disabled={servings >= 20}
                  aria-label="Tăng khẩu phần"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <label htmlFor="fridge-time">
              <span>
                <Clock3 size={20} />
                Thời gian nấu
              </span>
              <select
                id="fridge-time"
                value={time}
                onChange={(event) => {
                  setTime(Number(event.target.value));
                  setLimit(6);
                }}
              >
                <option value={0}>Tất cả</option>
                <option value={15}>≤ 15 phút</option>
                <option value={30}>≤ 30 phút</option>
                <option value={60}>≤ 60 phút</option>
              </select>
            </label>
            <label htmlFor="fridge-difficulty">
              <span>
                <BarChart3 size={20} />
                Độ khó
              </span>
              <select
                id="fridge-difficulty"
                value={difficulty}
                onChange={(event) => {
                  setDifficulty(event.target.value);
                  setLimit(6);
                }}
              >
                <option value="all">Tất cả</option>
                <option value="Dễ">Dễ</option>
                <option value="Vừa">Vừa</option>
                <option value="Khó">Khó</option>
              </select>
            </label>
          </div>
        )}
        <button
          type="button"
          className="pantry-primary fridge-find"
          disabled={loading || !selected.length}
          onClick={() => {
            setLimit(6);
            setMessage('');
            onRetry();
          }}
        >
          {loading ? <LoaderCircle className="spin" size={20} /> : <Sparkles size={20} />}Tìm món phù hợp
          <ArrowRight size={20} />
        </button>
        {message && (
          <p role="status" className="fridge-feedback">
            {message}
          </p>
        )}
      </section>
      <section className="fridge-results" aria-labelledby="fridge-results-title" aria-busy={loading}>
        <div className="fridge-results-heading">
          <h2 id="fridge-results-title">
            <Salad size={31} strokeWidth={1.5} />
            Gợi ý món phù hợp cho bạn
          </h2>
          <span>{filtered.length} món gợi ý</span>
        </div>
        <p className="fridge-results-subtitle">
          Dựa trên {selected.length} nguyên liệu:{' '}
          <strong>{selected.length ? selected.join(', ') : 'Chưa chọn nguyên liệu'}</strong>
        </p>
        <div className="fridge-toolbar">
          <div className="fridge-category-tabs" aria-label="Lọc nhóm món">
            {[
              { key: 'all', label: `Tất cả (${matches.length})`, Icon: null },
              { key: 'main', label: 'Món chính', Icon: Utensils },
              { key: 'salad', label: 'Salad', Icon: Salad },
              { key: 'quick', label: 'Món nhanh', Icon: Clock3 },
              { key: 'fit', label: 'Eat Fit', Icon: ChefHat },
            ].map(({ key, label, Icon }) => (
              <button
                type="button"
                key={key}
                aria-pressed={category === key}
                onClick={() => {
                  setCategory(key);
                  setLimit(6);
                }}
              >
                {Icon && <Icon size={14} />}
                <span>{label}</span>
              </button>
            ))}
          </div>
          <label className="fridge-sort">
            <SlidersHorizontal size={13} />
            <span className="pantry-sr-only">Sắp xếp món</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sắp xếp món">
              <option value="match">Phù hợp nhất</option>
              <option value="time">Nhanh nhất</option>
            </select>
          </label>
        </div>
        {loading ? (
          <div className="pantry-result-status" role="status">
            <LoaderCircle className="spin" />
            <p>Đang tìm món phù hợp…</p>
          </div>
        ) : error ? (
          <div className="pantry-result-status" role="alert">
            <p>{errorText(error)}</p>
            <button type="button" onClick={onRetry}>
              Thử lại
            </button>
          </div>
        ) : filtered.length ? (
          <div className="fridge-dish-grid">
            {filtered.slice(0, limit).map(({ recipe: r, score }) => (
              <article className="fridge-dish-card" key={r.id}>
                <div className="fridge-dish-image">
                  <Link to={`/cong-thuc/${r.slug}`} tabIndex={-1}>
                    <CookingPot aria-hidden="true" />
                    <img
                      src={matcherMedia(r).src}
                      alt={`${matcherMedia(r).label}: ${r.title}`}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  </Link>
                  <FavoriteButton recipe={r} overlay />
                </div>
                <div className="fridge-dish-body">
                  <h3>
                    <Link to={`/cong-thuc/${r.slug}`} title={r.title}>
                      {displayTitle(r.title)}
                    </Link>
                  </h3>
                  <div className="fridge-dish-meta">
                    <span title={r.timingStatus === 'ESTIMATED' ? 'Thời gian dự kiến' : undefined}>
                      <Clock3 size={12} />
                      {r.totalMinutes
                        ? `${r.timingStatus === 'ESTIMATED' ? '~' : ''}${r.totalMinutes} phút`
                        : 'Chưa rõ'}
                    </span>
                    <span>
                      <Users size={12} />
                      {r.baseServings} người
                    </span>
                    <span
                      className={`fridge-difficulty ${normalized(r.difficulty) === 'de' ? 'is-easy' : ''}`}
                    >
                      {r.difficulty.includes('Chưa') ? 'Chưa đánh giá' : r.difficulty}
                    </span>
                  </div>
                  <span className="fridge-match-score" title="Tỷ lệ đối chiếu theo nguyên liệu">
                    Phù hợp {Math.round(score)}%
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="pantry-result-status">
            <Leaf />
            <p>
              {selected.length
                ? 'Chưa có món phù hợp với các bộ lọc hiện tại.'
                : 'Thêm nguyên liệu vào tủ lạnh để nhận gợi ý.'}
            </p>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTime(0);
                  setDifficulty('all');
                  setCategory('all');
                }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
        {filtered.length > limit && (
          <button className="fridge-show-more" type="button" onClick={() => setLimit(limit + 6)}>
            Xem thêm {Math.min(6, filtered.length - limit)} món khác
            <ChevronDown size={16} />
          </button>
        )}
      </section>
    </>
  );
}
