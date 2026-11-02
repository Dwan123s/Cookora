import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  CookingPot,
  Package,
  Refrigerator,
  Search,
  Snowflake,
  Thermometer,
  X,
} from 'lucide-react';
import { Modal, useNotice } from '../shared';
import { normalizeFood, useToolStorage } from '../tool-data';
import {
  storageGuide,
  safetySources,
  isLeftovers,
  type FoodGuide,
  type Leftover,
  type StorageEnvironment,
} from '../food-storage';
import { LeftoverForm, LeftoverList, LeftoverRecipeSuggestions } from '../components/FoodStorageTools';
import '../tools-reference.css';
const emptyLeftovers: Leftover[] = [];
export function StorageSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="storage-search">
      <Search size={19} />
      <input
        aria-label="Tìm thực phẩm"
        placeholder="Tìm thực phẩm: thịt, cá, rau, cơm..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button aria-label="Xóa tìm kiếm" onClick={() => onChange('')}>
          <X size={16} />
        </button>
      )}
    </label>
  );
}
export function StorageFilters({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="storage-filters" aria-label="Nhóm thực phẩm">
      {[
        { id: 'all', name: 'Tất cả' },
        { id: 'meat', name: 'Thịt & hải sản' },
        { id: 'vegetables', name: 'Rau củ' },
        { id: 'cooked', name: 'Thực phẩm đã nấu' },
      ].map((c) => (
        <button key={c.id} aria-pressed={value === c.id} onClick={() => onChange(c.id)}>
          {c.name}
        </button>
      ))}
    </div>
  );
}
export function StorageCard({
  item,
  environment,
  onDetail,
}: {
  item: FoodGuide;
  environment: StorageEnvironment;
  onDetail: () => void;
}) {
  return (
    <article className="storage-food-card">
      <img src={item.image} alt={item.name} loading="lazy" />
      <div>
        <span className="storage-food-category">{item.categoryName}</span>
        <h3>{item.name}</h3>
        <p>{item.summary}</p>
        <strong className="storage-duration">
          <Clock3 size={14} />
          {item[environment]}
        </strong>
        <button className="tools-outline" onClick={onDetail}>
          Xem hướng dẫn <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}
export function StorageDetail({
  item,
  environment,
  onClose,
}: {
  item: FoodGuide;
  environment: StorageEnvironment;
  onClose: () => void;
}) {
  return (
    <Modal title={item.name} onClose={onClose}>
      <div className="storage-detail">
        <img src={item.image} alt={item.name} />
        <span className="storage-food-category">
          {environment === 'fridge' ? 'Ngăn mát ≤ 4°C' : 'Ngăn đông ≤ −18°C'}
        </span>
        <h3>Thời gian tham khảo</h3>
        <p>
          Ngăn mát: <b>{item.fridge}</b>.<br />
          Ngăn đông: <b>{item.freezer}</b>.
        </p>
        <h3>Đóng gói</h3>
        <p>{item.packing}</p>
        <h3>Tránh nhiễm chéo</h3>
        <p>{item.separation}</p>
        <h3>Rã đông & chế biến</h3>
        <p>{item.preparation}</p>
        <p className="storage-detail-note">
          Mốc tham khảo chỉ áp dụng khi xử lý và giữ lạnh đúng điều kiện. Mốc ngăn đông chủ yếu phản ánh chất
          lượng; không dùng mùi hoặc vẻ ngoài để tự xác nhận an toàn.
        </p>
        <a href={item.source} target="_blank" rel="noreferrer">
          Nguồn: {item.sourceName} <ArrowRight size={13} />
        </a>
        {item.id === 'poultry' && (
          <a href={safetySources.leftovers} target="_blank" rel="noreferrer">
            USDA · Hâm lại đồ ăn thừa
          </a>
        )}
      </div>
    </Modal>
  );
}
export function SafetyTips() {
  return (
    <section className="storage-safety tools-card" aria-label="Mẹo an toàn thực phẩm">
      {[
        {
          icon: Clock3,
          title: 'Làm lạnh đúng thời điểm',
          text: 'Trong 2 giờ; trong 1 giờ nếu trên 32°C. Cơm nên làm lạnh trong 1 giờ.',
        },
        {
          icon: Package,
          title: 'Chia nhỏ, đóng gói sạch',
          text: 'Dùng hộp nhỏ, nông. Không chờ nguội hoàn toàn ngoài nhiệt độ phòng.',
        },
        {
          icon: Thermometer,
          title: 'Hâm nóng đúng nhiệt độ',
          text: 'Dùng nhiệt kế kiểm tra đồ thừa đạt 74°C ở tâm khi hâm lại.',
        },
      ].map(({ icon: Icon, title, text }) => (
        <div key={title}>
          <span className="tools-icon">
            <Icon />
          </span>
          <span>
            <h3>{title}</h3>
            <p>{text}</p>
          </span>
        </div>
      ))}
      <div className="storage-source">
        <b>Nguồn tham khảo</b>
        <a href={safetySources.fda} target="_blank" rel="noreferrer">
          FDA · Bảo quản thực phẩm
        </a>
        <a href={safetySources.chart} target="_blank" rel="noreferrer">
          FoodSafety.gov · Thời gian lưu trữ
        </a>
        <a href={safetySources.leftovers} target="_blank" rel="noreferrer">
          USDA · Hâm lại đồ ăn thừa
        </a>
      </div>
    </section>
  );
}
export function FoodStorage() {
  const [environment, setEnvironment] = useState<StorageEnvironment>('fridge'),
    [search, setSearch] = useState(''),
    [category, setCategory] = useState('all'),
    [detail, setDetail] = useState<FoodGuide | null>(null),
    [showAll, setShowAll] = useState(false),
    [editing, setEditing] = useState<Leftover | null>(null),
    [now, setNow] = useState(Date.now);
  const store = useToolStorage('leftovers', emptyLeftovers, isLeftovers),
    notice = useNotice();
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 30000);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', tick);
    };
  }, []);
  const filtered = storageGuide.filter(
    (item) =>
      (category === 'all' || item.category === category) &&
      normalizeFood(`${item.name} ${item.keywords} ${item.categoryName}`).includes(normalizeFood(search)),
  );
  const visible = search || category !== 'all' || showAll ? filtered : filtered.slice(0, 4);
  const scopedEditing = editing && store.value.some((i) => i.id === editing.id) ? editing : null;
  function submit(item: Leftover) {
    const next = scopedEditing
      ? store.value.map((i) => (i.id === item.id ? item : i))
      : [item, ...store.value];
    if (store.save(next)) {
      notice(scopedEditing ? 'Đã cập nhật món.' : 'Đã thêm món vào tủ lạnh.');
      return true;
    }
    return false;
  }
  function remove(id: string) {
    if (store.save(store.value.filter((i) => i.id !== id))) {
      if (editing?.id === id) setEditing(null);
      notice('Đã xóa món khỏi danh sách trên thiết bị.');
    } else notice('Chưa xóa được món. Kiểm tra quyền lưu trữ của trình duyệt.');
  }
  return (
    <main className="tools-reference storage-reference">
      <section className="tools-hero storage-hero">
        <div>
          <p className="tools-eyebrow">
            BẢO QUẢN THÔNG MINH <span />
          </p>
          <h1>
            Bảo quản đúng, <em>bớt lãng phí</em>
          </h1>
          <p>
            Tra cứu thời gian bảo quản, theo dõi đồ ăn còn dư và khám phá cách
            <br className="tools-desktop-break" /> biến nguyên liệu thành những món ngon mới.
          </p>
        </div>
        <img src="/images/storage-hero.webp" alt="Tủ lạnh có rau, cà chua, trứng và hộp thức ăn kín" />
      </section>
      <div className="storage-dashboard">
        <section className="storage-guide tools-card">
          <div className="storage-guide-head">
            <h2>
              <span className="tools-icon">
                <BookOpen />
              </span>
              Cẩm nang bảo quản thực phẩm
            </h2>
            <div className="tools-segment storage-environments">
              <button aria-pressed={environment === 'fridge'} onClick={() => setEnvironment('fridge')}>
                <Refrigerator size={15} />
                Ngăn mát (≤ 4°C)
              </button>
              <button aria-pressed={environment === 'freezer'} onClick={() => setEnvironment('freezer')}>
                <Snowflake size={15} />
                Ngăn đông (≤ −18°C)
              </button>
            </div>
          </div>
          <StorageSearch value={search} onChange={setSearch} />
          <StorageFilters value={category} onChange={setCategory} />
          <div className="storage-food-grid">
            {visible.map((item) => (
              <StorageCard
                key={item.id}
                item={item}
                environment={environment}
                onDetail={() => setDetail(item)}
              />
            ))}
          </div>
          {!visible.length && (
            <div className="tools-empty">
              <Search />
              <h3>Chưa tìm thấy thực phẩm</h3>
              <p>Thử tên ngắn hơn, ví dụ: gà, cá, rau, cơm.</p>
              <button
                className="tools-outline"
                onClick={() => {
                  setSearch('');
                  setCategory('all');
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
          {!search && category === 'all' && filtered.length > 4 && (
            <button className="tools-more" onClick={() => setShowAll((v) => !v)}>
              {showAll ? 'Thu gọn' : 'Xem thêm hướng dẫn cơm đã nấu'}
              <ArrowRight size={14} />
            </button>
          )}
          <p className="tools-footnote">
            Ngăn mát ≤ 4°C · Ngăn đông ≤ −18°C. Mốc ngăn đông là tham khảo chất lượng. Ảnh minh họa bằng AI.
          </p>
        </section>
        <aside className="storage-leftovers tools-card">
          <h2>
            <span className="tools-icon">
              <Refrigerator />
            </span>
            Tủ lạnh đồ thừa của bạn
          </h2>
          <p className="storage-panel-intro">Ghi lại món đã nấu để biết khi nào nên dùng.</p>
          <LeftoverForm
            editing={scopedEditing}
            cancel={() => setEditing(null)}
            submit={submit}
            count={store.value.length}
          />
          <LeftoverList items={store.value} now={now} edit={setEditing} remove={remove} />
          <LeftoverRecipeSuggestions items={store.value} now={now} />
          <p className="tools-footnote">
            {store.scope} Mốc nhắc dùng dựa trên thông tin bạn ghi nhận, không xác nhận món an toàn.
          </p>
        </aside>
      </div>
      <SafetyTips />
      {detail && <StorageDetail item={detail} environment={environment} onClose={() => setDetail(null)} />}
    </main>
  );
}
