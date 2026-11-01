import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { m } from 'motion/react';
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CookingPot,
  Leaf,
  Plus,
  Search,
  ShoppingBasket,
  Sparkles,
  Sprout,
  X,
  Users,
} from 'lucide-react';
import type { Ingredient, Recipe } from '@cookora/contracts';
import { request } from '../api';
import { cuisines, ErrorState, Loading, Empty, FavoriteButton } from '../shared';
import { Reveal } from '../motion';
import { recipeMedia } from '../recipe-media';
import { addDays, weekOf } from '../date';

const featuredSlugs = ['dau-hu-sot-ca-chua', 'com-kimchi', 'trung-xao-ca-chua'];
const artFor = (recipe: Recipe) =>
  recipe.contentStatus === 'DRAFT' &&
  recipe.revision === 1 &&
  recipe.imageCredit === 'Unsplash · ảnh minh họa, không phải mẻ nấu thử'
    ? (
        { 'dau-hu-sot-ca-chua': 'tofu', 'com-kimchi': 'kimchi', 'trung-xao-ca-chua': 'eggs' } as Record<
          string,
          string
        >
      )[recipe.slug]
    : undefined;

function HomeRecipeCard({ recipe }: { recipe: Recipe }) {
  const art = artFor(recipe);
  return (
    <m.article className="home-photo-card" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/cong-thuc/${recipe.slug}`}
        className="home-photo-link"
        aria-label={`Xem ${recipe.title}`}
        viewTransition
      >
        {art ? (
          <span
            className={`reference-photo reference-photo-${art}`}
            role="img"
            aria-label={`Ảnh AI minh họa: ${recipe.title}`}
          />
        ) : (
          <img
            src={recipeMedia(recipe).src}
            alt={`Ảnh minh họa ${recipe.title}`}
            loading="lazy"
            width="900"
            height="900"
          />
        )}
        <span className="home-photo-shade" />
        <div className="home-photo-copy">
          <span className="home-photo-cuisine">{cuisines.find((c) => c.code === recipe.cuisine)?.name}</span>
          <h3>{recipe.title.replace(' cho ngày bận rộn', '')}</h3>
          <div className="home-photo-meta">
            <span>
              <Users size={13} />
              {recipe.baseServings} phần
            </span>
            <span className="home-photo-status">
              {recipe.contentStatus === 'DRAFT' ? 'Bản thảo' : 'Đã duyệt'}
            </span>
          </div>
          <p>Công thức mẫu · Chưa nấu thử</p>
        </div>
      </Link>
      <FavoriteButton recipe={recipe} overlay />
    </m.article>
  );
}

const starters = [
  { id: 'egg-edible', label: 'Trứng' },
  { id: 'tomato', label: 'Cà chua' },
  { id: 'tofu-firm', label: 'Đậu hũ' },
];

export function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'ingredients' | 'search'>('ingredients');
  const [selected, setSelected] = useState(starters);
  const [servings, setServings] = useState(2);
  const [term, setTerm] = useState('');
  const [adding, setAdding] = useState(false);
  const [cuisine, setCuisine] = useState('');
  const recipes = useQuery({
    queryKey: ['recipes', 'home'],
    queryFn: () => request<Recipe[]>('/recipes?pageSize=50'),
  });
  const ingredients = useQuery({
    queryKey: ['ingredients'],
    queryFn: () => request<Ingredient[]>('/ingredients'),
    enabled: adding,
  });
  const normalized = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .toLowerCase();
  const choices =
    ingredients.data?.data
      .filter(
        (i) =>
          !selected.some((s) => s.id === i.id) &&
          normalized([i.name, ...i.aliases].join(' ')).includes(normalized(term)),
      )
      .slice(0, 6) || [];
  const featured = featuredSlugs.flatMap((slug) => recipes.data?.data.find((r) => r.slug === slug) || []);
  const shown = cuisine
    ? recipes.data?.data.filter((r) => r.cuisine === cuisine).slice(0, 3) || []
    : featured;
  const submit = () => {
    if (mode === 'search') navigate(`/cong-thuc?${new URLSearchParams({ q: term.trim() })}`);
    else
      navigate(
        `/co-gi-nau-nay?${new URLSearchParams({ tab: 'manual', ingredients: selected.map((s) => s.id).join(','), servings: String(servings) })}`,
      );
  };
  return (
    <main className="home-v2 home-v3">
      <section className="home-intro wrap" aria-labelledby="home-title">
        <div className="home-intro-copy">
          <p className="eyebrow">BẾP NHÀ. CẢM HỨNG MỚI.</p>
          <h1 id="home-title">
            CÓ GÌ,
            <br />
            <span>NẤU NẤY.</span>
          </h1>
          <p className="home-lead">Bớt nghĩ hôm nay ăn gì. Bắt đầu từ những nguyên liệu trong bếp.</p>
        </div>
        <div className="home-food">
          <span className="food-backdrop" />
          <m.div
            className="hero-reference-art"
            role="img"
            aria-label="Ảnh AI minh họa đậu hũ sốt cà chua với cơm, đậu hũ, cà chua và hành lá"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <span className="hero-ingredient ingredient-tofu">Đậu hũ</span>
          <span className="hero-ingredient ingredient-tomato">Cà chua</span>
          <span className="hero-ingredient ingredient-scallion">Hành lá</span>
          <Link
            className="hero-food-arrow"
            to="/cong-thuc/dau-hu-sot-ca-chua"
            aria-label="Xem món đậu hũ sốt cà chua"
          >
            <ArrowRight />
          </Link>
        </div>
        <div className="home-composer">
          <div className="composer-tabs" role="group" aria-label="Cách tìm món">
            <button
              type="button"
              aria-pressed={mode === 'ingredients'}
              className={mode === 'ingredients' ? 'active' : ''}
              onClick={() => {
                setMode('ingredients');
                setTerm('');
              }}
            >
              <Sprout size={18} /> Từ nguyên liệu
            </button>
            <button
              type="button"
              aria-pressed={mode === 'search'}
              className={mode === 'search' ? 'active' : ''}
              onClick={() => {
                setMode('search');
                setTerm('');
                setAdding(false);
              }}
            >
              <Search size={18} /> Tìm công thức
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="composer-field">
              <label className="composer-label" htmlFor={mode === 'search' ? 'home-search' : undefined}>
                {mode === 'ingredients' ? 'Bạn đang có gì trong bếp?' : 'Hôm nay, bạn muốn nấu món gì?'}
              </label>
              {mode === 'ingredients' ? (
                <div className="ingredient-chips">
                  {selected.map((s) => (
                    <m.button
                      key={s.id}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      className="ingredient-chip"
                      aria-label={`Bỏ ${s.label}`}
                      onClick={() => setSelected(selected.filter((i) => i.id !== s.id))}
                    >
                      {s.label}
                      <X size={13} />
                    </m.button>
                  ))}
                  <button
                    type="button"
                    className="ingredient-add"
                    aria-expanded={adding}
                    aria-controls="home-ingredient-options"
                    onClick={() => setAdding(!adding)}
                  >
                    <Plus size={16} />
                    Thêm nguyên liệu
                  </button>
                </div>
              ) : (
                <input
                  id="home-search"
                  className="composer-search"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Tên món hoặc nguyên liệu…"
                  maxLength={100}
                  autoComplete="off"
                />
              )}
            </div>
            {mode === 'ingredients' && (
              <label className="composer-servings">
                <span>
                  <Users size={19} />
                </span>
                <select
                  aria-label="Số người"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} người
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </label>
            )}
            <m.button
              whileTap={{ scale: 0.97 }}
              className="btn composer-submit"
              type="submit"
              disabled={mode === 'ingredients' && !selected.length}
            >
              {mode === 'ingredients' ? 'Tìm món hợp ý' : 'Khám phá món'}
              <ArrowRight size={20} />
            </m.button>
          </form>
          {adding && (
            <div className="composer-options" id="home-ingredient-options">
              <label className="search-input">
                <Search size={17} />
                <input
                  aria-label="Thêm nguyên liệu từ danh mục"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Tìm nguyên liệu…"
                  autoFocus
                />
              </label>
              {ingredients.isPending ? (
                <Loading />
              ) : ingredients.isError ? (
                <ErrorState error={ingredients.error} retry={() => ingredients.refetch()} />
              ) : (
                <div className="composer-option-list">
                  {choices.map((i) => (
                    <button
                      type="button"
                      key={i.id}
                      disabled={selected.length >= 50}
                      onClick={() => {
                        setSelected([...selected, { id: i.id, label: i.name }]);
                        setTerm('');
                      }}
                    >
                      <Plus size={14} />
                      {i.name}
                    </button>
                  ))}
                  {!choices.length && <p className="muted tiny">Không có nguyên liệu phù hợp.</p>}
                </div>
              )}
            </div>
          )}
        </div>
        <Link className="home-explore-link" to="/cong-thuc">
          Hoặc{' '}
          <span>
            khám phá công thức <ArrowRight size={16} />
          </span>
        </Link>
      </section>
      <div className="brand-ribbon" aria-label="Ít lãng phí, nhiều cảm hứng, thêm vị ngon">
        <span>ÍT LÃNG PHÍ.</span>
        <span aria-hidden="true">✳</span>
        <span>NHIỀU CẢM HỨNG.</span>
        <span aria-hidden="true">✳</span>
        <span>THÊM VỊ NGON.</span>
      </div>
      <Reveal className="home-discover wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / KHÁM PHÁ</p>
            <h2>
              Món quen.
              <br />
              Cảm hứng mới.
            </h2>
          </div>
          <Link className="text-link" to="/cong-thuc">
            Xem công thức <ArrowRight size={18} />
          </Link>
        </div>
        <div className="home-cuisines" role="group" aria-label="Lọc công thức theo nền ẩm thực">
          {cuisines.map((c) => (
            <button
              aria-pressed={cuisine === c.code || (!cuisine && c.code === 'VN')}
              key={c.code}
              onClick={() => setCuisine(c.code)}
            >
              {c.name}
            </button>
          ))}
        </div>
        {recipes.isPending ? (
          <Loading />
        ) : recipes.isError ? (
          <ErrorState error={recipes.error} retry={() => recipes.refetch()} />
        ) : shown.length ? (
          <div className={`home-recipe-grid ${shown.length === 1 ? 'single' : ''}`}>
            {shown.map((r) => (
              <HomeRecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        ) : (
          <Empty icon={<BookOpen />} title="Thư viện đang được chuẩn bị">
            <p>Chưa có công thức để hiển thị trong nhóm này.</p>
          </Empty>
        )}
      </Reveal>
      <Reveal className="home-plan-wrap wrap">
        <section className="home-plan">
          <div className="home-plan-copy">
            <p className="eyebrow">02 / NHẸ VIỆC MỖI NGÀY</p>
            <h2>
              Một tuần gọn gàng.
              <br />
              Bữa nào cũng có ý.
            </h2>
            <p>Chọn món, lên thực đơn và gộp danh sách đi chợ.</p>
            <Link className="btn" to="/thuc-don">
              Lên thực đơn tuần <ArrowRight size={19} />
            </Link>
          </div>
          <div className="plan-illustration" aria-label="Minh họa gợi ý thực đơn, chưa phải thực đơn đã lưu">
            <div className="plan-illustration-head">
              <span>
                Thực đơn tuần <small className="plan-preview-label">Mẫu</small>
              </span>
              <div className="plan-preview-nav">
                <Link to={`/thuc-don?week=${addDays(weekOf(), -7)}`} aria-label="Tuần trước">
                  <ChevronLeft />
                </Link>
                <Link to={`/thuc-don?week=${addDays(weekOf(), 7)}`} aria-label="Tuần sau">
                  <ChevronRight />
                </Link>
              </div>
            </div>
            <div className="plan-illustration-days">
              {['Thứ 2', 'Thứ 3', 'Thứ 4'].map((day, i) => (
                <div key={day}>
                  <span>{day}</span>
                  <Link className="plan-mini-meal" to="/thuc-don">
                    {featured[i] ? (
                      <img
                        src={recipeMedia(featured[i]).src}
                        alt="Ảnh AI minh họa"
                        loading="lazy"
                        width="64"
                        height="64"
                      />
                    ) : (
                      <CookingPot size={26} />
                    )}
                    <span>
                      {featured[i]?.title.replace(' cho ngày bận rộn', '') || 'Chọn món'}
                      <small>
                        <Users size={11} />2 phần
                      </small>
                    </span>
                  </Link>
                </div>
              ))}
            </div>
            <Link
              className="plan-illustration-shop"
              to="/thuc-don"
              aria-label="Mở thực đơn và danh sách đi chợ"
            >
              <span>
                <ShoppingBasket size={19} /> Danh sách đi chợ
              </span>
              <span className="plan-grocery-art" aria-hidden="true">
                🍅 🥚 🌱 ◻
              </span>
              <ChevronRight size={19} />
            </Link>
          </div>
        </section>
      </Reveal>
      <section className="home-closing wrap">
        <h2>
          Bếp nhà,
          <br />
          <span>thêm một chút mới.</span>
        </h2>
        <Link to="/cong-thuc" aria-label="Khám phá công thức" className="round-link">
          <ArrowRight />
        </Link>
      </section>
    </main>
  );
}
