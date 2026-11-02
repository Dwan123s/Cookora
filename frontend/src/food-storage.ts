export const safetySources = {
  chart: 'https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts',
  fda: 'https://www.fda.gov/consumers/consumer-updates/are-you-storing-food-safely',
  leftovers: 'https://ask.fsis.usda.gov/article/What-methods-of-reheating-food-are-safe',
  greens: 'https://extension.usu.edu/nutrition/research/spinach',
  rice: 'https://www.gov.uk/government/publications/home-food-fact-checker/home-food-fact-checker',
};
export type StorageEnvironment = 'fridge' | 'freezer';
export type FoodGuide = {
  id: string;
  name: string;
  category: 'meat' | 'vegetables' | 'cooked';
  categoryName: string;
  keywords: string;
  image: string;
  fridge: string;
  freezer: string;
  summary: string;
  packing: string;
  separation: string;
  preparation: string;
  source: string;
  sourceName: string;
};
export const storageGuide: FoodGuide[] = [
  {
    id: 'chicken',
    name: 'Thịt gà tươi',
    category: 'meat',
    categoryName: 'Thịt & gia cầm',
    keywords: 'ga thit song uc ga',
    image: '/images/storage-chicken.webp',
    fridge: '1–2 ngày',
    freezer: '9 tháng (gà cắt miếng)',
    summary: 'Đựng kín, đặt ở ngăn thấp để tránh nước thịt chảy sang món khác.',
    packing: 'Chia phần trong bao bì kín; dùng khay hứng nước rỉ.',
    separation: 'Tách khỏi thực phẩm ăn ngay. Rửa tay và dụng cụ sau khi chạm thịt sống.',
    preparation: 'Rã đông trong ngăn mát; không để trên bàn bếp. Dùng nhiệt kế kiểm tra khi nấu.',
    source: safetySources.chart,
    sourceName: 'FoodSafety.gov · Fresh poultry',
  },
  {
    id: 'fish',
    name: 'Cá tươi nguyên con',
    category: 'meat',
    categoryName: 'Thịt & hải sản',
    keywords: 'ca hai san ca trang',
    image: '/images/storage-fish.webp',
    fridge: '1–3 ngày',
    freezer: '6–8 tháng (cá trắng nạc)',
    summary: 'Cho vào hộp kín, giữ lạnh liên tục và dùng sớm.',
    packing: 'Bọc kín, chia phần; ghi ngày cấp đông trên bao bì.',
    separation: 'Để riêng đồ sống, không để nước cá tiếp xúc món chín.',
    preparation:
      'Rã đông trong ngăn mát. Thời gian đông tùy loại cá; cá béo thường chỉ 2–3 tháng về chất lượng.',
    source: safetySources.chart,
    sourceName: 'FoodSafety.gov · Fin fish',
  },
  {
    id: 'greens',
    name: 'Rau lá xanh',
    category: 'vegetables',
    categoryName: 'Rau củ',
    keywords: 'rau cai bo xoi spinach xa lach',
    image: '/images/storage-greens.webp',
    fridge: '3–5 ngày (cải bó xôi tươi)',
    freezer: 'Chần và đóng gói trước khi đông',
    summary: 'Giữ rau sạch trong túi hoặc hộp, kiểm soát độ ẩm và dùng sớm.',
    packing: 'Để trong ngăn rau. Với rau đóng gói, làm theo nhãn và hạn dùng.',
    separation: 'Giữ rau ăn sống tách khỏi thịt, cá sống và dụng cụ chưa vệ sinh.',
    preparation:
      'Rửa dưới vòi nước trước khi dùng. Đông lạnh làm thay đổi độ giòn; không áp dụng một mốc cho mọi loại rau.',
    source: safetySources.greens,
    sourceName: 'Utah State University Extension · Spinach',
  },
  {
    id: 'poultry',
    name: 'Thịt, gia cầm đã nấu',
    category: 'cooked',
    categoryName: 'Thực phẩm đã nấu',
    keywords: 'ga chin thit kho do an thua',
    image: '/images/gai-yang.webp',
    fridge: '3–4 ngày',
    freezer: '2–6 tháng',
    summary: 'Chia vào hộp nhỏ, nông để làm lạnh nhanh; đậy kín khi bảo quản.',
    packing: 'Làm lạnh kịp thời, không chờ nguội hoàn toàn ngoài bàn bếp.',
    separation: 'Dùng hộp và dụng cụ sạch, để tách biệt thực phẩm sống.',
    preparation:
      'Hâm lại tới 74°C ở tâm bằng nhiệt kế. Đảo đều khi dùng lò vi sóng; hâm nóng không khắc phục việc bảo quản sai.',
    source: safetySources.chart,
    sourceName: 'FoodSafety.gov · Cooked meat or poultry',
  },
  {
    id: 'rice',
    name: 'Cơm đã nấu',
    category: 'cooked',
    categoryName: 'Thực phẩm đã nấu',
    keywords: 'com nguoi rice com chin',
    image: '/images/storage-rice.webp',
    fridge: 'Dùng trong 24 giờ',
    freezer: 'Cấp đông sớm; xem hướng dẫn',
    summary: 'Làm lạnh nhanh, lý tưởng trong 1 giờ, rồi cho vào tủ lạnh.',
    packing: 'Chia cơm thành phần nhỏ. Dùng trong 24 giờ khi giữ trong ngăn mát theo hướng dẫn FSA.',
    separation: 'Dùng dụng cụ sạch, đậy kín và tránh tiếp xúc thực phẩm sống.',
    preparation: 'Chỉ hâm lại một lần, nóng đều toàn bộ. Không dùng lại cơm đã để lâu ngoài nhiệt độ phòng.',
    source: safetySources.rice,
    sourceName: 'UK Food Standards Agency · Home food fact checker',
  },
];
export type Leftover = {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'kg' | 'phần' | 'hộp';
  group: 'poultry' | 'soup' | 'rice' | 'other';
  cookedAt: string;
  storedAt: string;
  environment: StorageEnvironment;
  condition: 'correct' | 'unknown' | 'broken';
  heat: 'normal' | 'hot' | 'unknown';
  riceNotReheated: boolean;
};
export const isLeftovers = (value: unknown): value is Leftover[] =>
  Array.isArray(value) &&
  value.length <= 200 &&
  value.every(
    (l) =>
      typeof l?.id === 'string' &&
      typeof l.name === 'string' &&
      l.name.length > 0 &&
      l.name.length <= 100 &&
      Number.isFinite(l.quantity) &&
      l.quantity > 0 &&
      l.quantity <= 100000 &&
      ['g', 'kg', 'phần', 'hộp'].includes(l.unit) &&
      ['poultry', 'soup', 'rice', 'other'].includes(l.group) &&
      Number.isFinite(Date.parse(l.cookedAt)) &&
      Number.isFinite(Date.parse(l.storedAt)) &&
      ['fridge', 'freezer'].includes(l.environment) &&
      ['correct', 'unknown', 'broken'].includes(l.condition) &&
      ['normal', 'hot', 'unknown'].includes(l.heat) &&
      typeof l.riceNotReheated === 'boolean',
  );
export function leftoverStatus(item: Leftover, now = Date.now()) {
  const cooked = Date.parse(item.cookedAt),
    stored = Date.parse(item.storedAt);
  const unknown = {
    kind: 'unknown',
    label: 'Không đủ thông tin',
    eligible: false,
    deadline: null as number | null,
    detail: 'Cần biết nhóm món, thời điểm và điều kiện bảo quản.',
  };
  if (!Number.isFinite(cooked) || !Number.isFinite(stored) || stored < cooked || cooked > now || stored > now)
    return unknown;
  if (item.condition === 'broken')
    return {
      ...unknown,
      kind: 'unsafe',
      label: 'Bảo quản không đúng',
      detail: 'Không đưa món này vào gợi ý sử dụng lại.',
    };
  if (item.heat === 'unknown') return unknown;
  const coolingLimit = item.heat === 'hot' || item.group === 'rice' ? 3600000 : 7200000;
  if (stored - cooked > coolingLimit)
    return {
      ...unknown,
      kind: 'unsafe',
      label: 'Làm lạnh quá muộn',
      detail: 'Đã vượt thời gian làm lạnh tham khảo; không gợi ý dùng lại.',
    };
  if (
    item.condition !== 'correct' ||
    item.group === 'other' ||
    (item.group === 'rice' && !item.riceNotReheated)
  )
    return unknown;
  if (item.environment === 'freezer')
    return {
      ...unknown,
      kind: 'frozen',
      label: 'Đông lạnh · Xem hướng dẫn',
      detail:
        'Thời gian ngăn đông là mốc chất lượng, không tự xác nhận an toàn. Rã đông trong ngăn mát trước khi dùng.',
    };
  const deadline = cooked + (item.group === 'rice' ? 1 : 3) * 86400000;
  const remaining = deadline - now;
  if (remaining <= 0)
    return {
      kind: 'expired',
      label: 'Đã quá mốc tham khảo',
      eligible: false,
      deadline,
      detail: 'Không dùng để gợi ý món. Mốc tính từ giờ nấu, không được đặt lại khi sửa giờ lưu.',
    };
  return {
    kind: remaining <= 86400000 ? 'soon' : 'ok',
    label: remaining <= 86400000 ? 'Sắp đến mốc dùng' : 'Còn trong mốc tham khảo',
    eligible: true,
    deadline,
    detail: `Còn khoảng ${Math.ceil(remaining / 3600000)} giờ theo dữ liệu bạn ghi. Không phải xác nhận an toàn.`,
  };
}
export const storageDate = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
export function localDateTime() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .format(new Date())
    .replace(' ', 'T');
}
