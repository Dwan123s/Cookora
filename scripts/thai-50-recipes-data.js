import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputImgDir = path.resolve(__dirname, '../frontend/public/recipes/thai');
if (!fs.existsSync(outputImgDir)) {
  fs.mkdirSync(outputImgDir, { recursive: true });
}

// 50 Thai Recipes Raw Data extracted accurately from prompt
export const THAI_50_RECIPES = [
  // --- PHẦN 1: CÁC MÓN THỊT VÀ HẢI SẢN ---
  {
    id: 1,
    slug: 'pad-krapow-gai',
    title: 'Pad Krapow Gai (Gà xào húng quế thánh)',
    category: 'Thịt & hải sản',
    summary: 'Món gà xào húng quế thánh cay nồng đậm đà, đặc trưng hương vị đường phố Thái Lan.',
    prepMinutes: 10,
    cookMinutes: 10,
    totalMinutes: 20,
    preconditions: 'Dọn nóng cùng cơm; trứng chiên ăn kèm nếu có chuẩn bị riêng.',
    imageQuery: 'Phat_kaphrao',
    ingredients: [
      { name: 'Thịt gà băm', quantity: '150', unit: 'g', role: 'MAIN' },
      { name: 'Húng quế thánh', quantity: '15', unit: 'g', role: 'MAIN' },
      { name: 'Tỏi', quantity: '2', unit: 'tép', role: 'SEASONING' },
      { name: 'Ớt tươi', quantity: '2', unit: 'quả', role: 'SEASONING' },
      { name: 'Dầu hào', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước mắm', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Nước tương', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Đường', quantity: '0.25', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Dầu ăn', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế nguyên liệu', instruction: 'Băm nhỏ tỏi và ớt; nhặt lá húng, rửa sạch, để thật ráo. Trộn dầu hào, nước mắm, nước tương và đường trong chén với 1 thìa canh nước.' },
      { order: 2, title: 'Phi thơm tỏi ớt', instruction: 'Làm nóng chảo ở lửa vừa lớn, cho dầu ăn vào. Thêm tỏi ớt, đảo 15–20 giây đến thơm, không để tỏi cháy nâu.' },
      { order: 3, title: 'Xào gà băm', instruction: 'Cho gà băm vào, dùng sạn tách thịt thành các mẩu nhỏ. Xào 3–4 phút, đảo liên tục để thịt chín đều, không vón thành khối.' },
      { order: 4, title: 'Nêm sốt đậm đà', instruction: 'Rưới chén sốt vào, đảo thêm 1–2 phút đến khi gà chín hoàn toàn và sốt bám thịt. Nếu chảo khô trước khi thịt chín, thêm từng thìa nước.' },
      { order: 5, title: 'Hoàn thành món ăn', instruction: 'Cho lá húng vào, đảo 15–30 giây cho vừa héo rồi tắt bếp. Dọn nóng cùng cơm; trứng chiên ăn kèm nếu có chuẩn bị riêng.' }
    ]
  },
  {
    id: 2,
    slug: 'gai-pad-med-mamuang',
    title: 'Gai Pad Med Mamuang (Gà xào hạt điều)',
    category: 'Thịt & hải sản',
    summary: 'Thịt đùi gà mềm thơm xào cùng hạt điều giòn bùi, ớt chuông ngọt thanh và sốt đậm vị.',
    prepMinutes: 10,
    cookMinutes: 15,
    totalMinutes: 25,
    preconditions: 'Thành phẩm có gà mềm, rau còn hơi giòn, hạt điều không bị ngâm lâu trong sốt.',
    imageQuery: 'Chicken_and_cashew_nuts',
    ingredients: [
      { name: 'Thịt đùi gà', quantity: '150', unit: 'g', role: 'MAIN' },
      { name: 'Hạt điều rang', quantity: '30', unit: 'g', role: 'MAIN' },
      { name: 'Hành tây', quantity: '0.25', unit: 'củ', role: 'SUPPORTING' },
      { name: 'Ớt chuông', quantity: '0.25', unit: 'quả', role: 'SUPPORTING' },
      { name: 'Tỏi', quantity: '1', unit: 'tép', role: 'SEASONING' },
      { name: 'Ớt khô', quantity: '1', unit: 'quả', role: 'SEASONING' },
      { name: 'Dầu hào', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước tương', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Đường', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Dầu ăn', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế & pha sốt', instruction: 'Cắt gà thành miếng khoảng 2 cm; hành tây và ớt chuông cắt miếng tương tự. Băm tỏi. Khuấy dầu hào, nước tương, đường với lượng nước đã ghi thành sốt.' },
      { order: 2, title: 'Rang thơm hạt điều', instruction: 'Cho hạt điều lên chảo khô, đảo lửa nhỏ 1–2 phút cho thơm rồi lấy ra. Nếu dùng ớt khô, cắt khúc và bỏ bớt hạt.' },
      { order: 3, title: 'Xào chín gà', instruction: 'Làm nóng dầu, phi tỏi khoảng 15 giây. Cho gà vào xào lửa vừa lớn 4–5 phút, đến khi thịt chín hoàn toàn.' },
      { order: 4, title: 'Thêm rau củ & sốt', instruction: 'Thêm hành tây, ớt chuông và ớt khô, đảo 1–2 phút. Rưới sốt, xào thêm khoảng 1 phút cho sốt nóng và bám đều.' },
      { order: 5, title: 'Hoàn thiện với hạt điều', instruction: 'Cho hạt điều trở lại chảo, đảo nhanh rồi tắt bếp. Thành phẩm có gà mềm, rau còn hơi giòn, hạt điều không bị ngâm lâu trong sốt.' }
    ]
  },
  {
    id: 3,
    slug: 'gai-yang',
    title: 'Gai Yang (Gà nướng kiểu Thái)',
    category: 'Thịt & hải sản',
    summary: 'Đùi gà ướp sả, rễ ngò và đường thốt nốt nướng xém vàng giòn da, thơm nức mũi.',
    prepMinutes: 15,
    cookMinutes: 45,
    totalMinutes: 60,
    preconditions: 'Ướp đùi gà trong tủ lạnh ít nhất 2 giờ trước khi nướng.',
    imageQuery: 'Kai_yang',
    ingredients: [
      { name: 'Đùi gà', quantity: '300', unit: 'g', role: 'MAIN' },
      { name: 'Tỏi', quantity: '2', unit: 'tép', role: 'SEASONING' },
      { name: 'Rễ ngò', quantity: '1', unit: 'cái', role: 'SEASONING' },
      { name: 'Sả', quantity: '0.5', unit: 'cây', role: 'SEASONING' },
      { name: 'Nước mắm', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước tương', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Dầu hào', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Đường thốt nốt', quantity: '1', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Tiêu', quantity: '0.25', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Dầu ăn', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Khứa thịt & giã gia vị', instruction: 'Thấm khô đùi gà, khứa 2–3 đường vào phần thịt dày. Giã tỏi, rễ ngò và sả đã thái mỏng thành hỗn hợp nhuyễn.' },
      { order: 2, title: 'Ướp thấm vị gà', instruction: 'Trộn hỗn hợp giã với toàn bộ gia vị ướp. Xoa đều lên gà, đưa gia vị vào các đường khứa; đậy kín, để tủ lạnh ít nhất 2 giờ.' },
      { order: 3, title: 'Làm nóng lò nướng', instruction: 'Làm nóng lò ở 190°C khoảng 10 phút. Xếp gà lên vỉ có khay hứng bên dưới, đặt mặt da hướng lên, tránh để các miếng chồng nhau.' },
      { order: 4, title: 'Nướng vàng da', instruction: 'Nướng khoảng 35–45 phút; trở sau 20 phút. Nếu da lên màu quá sớm, che lỏng giấy bạc; không rưới nước ướp sống lên gà gần cuối quá trình.' },
      { order: 5, title: 'Kiểm tra độ chín & chặt miếng', instruction: 'Kiểm tra sát xương và phần thịt dày nhất đã chín hoàn toàn; nếu có nhiệt kế, tâm thịt đạt 74°C. Để nghỉ 5 phút rồi chặt miếng, dùng nóng.' }
    ]
  },
  {
    id: 4,
    slug: 'moo-ping',
    title: 'Moo Ping (Thịt heo xiên nướng)',
    category: 'Thịt & hải sản',
    summary: 'Xiên thịt heo ướp nước cốt dừa nướng than thơm ngậy, ăn kèm xôi dẻo tuyệt hảo.',
    prepMinutes: 15,
    cookMinutes: 15,
    totalMinutes: 30,
    preconditions: 'Ngâm que tre trong nước ít nhất 30 phút để hạn chế cháy khi nướng.',
    imageQuery: 'Mu_ping',
    ingredients: [
      { name: 'Nạc vai heo có mỡ', quantity: '200', unit: 'g', role: 'MAIN' },
      { name: 'Tỏi', quantity: '2', unit: 'tép', role: 'SEASONING' },
      { name: 'Rễ ngò', quantity: '1', unit: 'cái', role: 'SEASONING' },
      { name: 'Nước cốt dừa', quantity: '1.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước mắm', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Dầu hào', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Đường thốt nốt', quantity: '1', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Tiêu', quantity: '0.25', unit: 'thìa cà phê', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Thái thịt & pha sốt ướp', instruction: 'Thái nạc vai ngang thớ thành lát dày khoảng 3–4 mm. Giã tỏi với rễ ngò, trộn nước cốt dừa và các gia vị ướp.' },
      { order: 2, title: 'Ướp thịt trong tủ lạnh', instruction: 'Bóp nhẹ thịt với hỗn hợp ướp, đậy kín và để trong tủ lạnh 2–4 giờ. Ngâm que tre trong nước ít nhất 30 phút để hạn chế cháy khi nướng.' },
      { order: 3, title: 'Xiên thịt vào que', instruction: 'Xiên thịt thành 4–5 que nhỏ, xếp các lát sát nhau vừa phải, không ép thành khối quá dày. Bỏ phần nước ướp sống còn dư.' },
      { order: 4, title: 'Nướng xiên thịt', instruction: 'Làm nóng bếp nướng ở lửa vừa; nướng 10–15 phút, trở mỗi 2–3 phút. Nếu dùng lò, nướng khoảng 200°C và quan sát để tránh cháy đường.' },
      { order: 5, title: 'Hoàn thành', instruction: 'Lấy thịt ra khi chín hoàn toàn, mặt ngoài vàng nâu và có cạnh xém nhẹ. Để nghỉ 2–3 phút; ăn với xôi hoặc rau chuẩn bị riêng.' }
    ]
  },
  {
    id: 5,
    slug: 'kor-moo-yang',
    title: 'Kor Moo Yang (Nạc nọng heo nướng)',
    category: 'Thịt & hải sản',
    summary: 'Nạc nọng heo nướng mềm mọng nước, chấm kèm sốt Nam Jim Jaew cay the chua ngọt.',
    prepMinutes: 15,
    cookMinutes: 25,
    totalMinutes: 40,
    preconditions: 'Thịt nướng xong để nghỉ 5 phút trước khi thái để giữ nước ngọt.',
    imageQuery: 'Pork_neck',
    ingredients: [
      { name: 'Nạc nọng heo', quantity: '200', unit: 'g', role: 'MAIN' },
      { name: 'Tỏi', quantity: '2', unit: 'tép', role: 'SEASONING' },
      { name: 'Rễ ngò', quantity: '1', unit: 'cái', role: 'SEASONING' },
      { name: 'Nước mắm', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Dầu hào', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Đường', quantity: '1', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Cốt chanh', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Thính gạo', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Hành tím', quantity: '1', unit: 'củ', role: 'SEASONING' },
      { name: 'Ớt bột', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế thịt', instruction: 'Thấm khô thịt; nếu miếng dày hơn khoảng 2 cm, xẻ mỏng bớt để dễ chín đều. Giã tỏi và rễ ngò, trộn với phần gia vị ướp.' },
      { order: 2, title: 'Ướp thịt', instruction: 'Xoa gia vị đều hai mặt thịt, đậy kín và ướp trong tủ lạnh khoảng 2 giờ. Trong lúc chờ, thái mỏng một ít hành tím dùng cho nước chấm.' },
      { order: 3, title: 'Pha nước chấm Jaew', instruction: 'Hòa đường với nước mắm và cốt chanh thuộc phần chấm; thêm thính, ớt bột và hành tím. Nêm lại, có thể thêm 1 thìa canh nước ấm nếu quá đậm.' },
      { order: 4, title: 'Nướng thịt', instruction: 'Làm nóng lò 190°C, nướng thịt khoảng 20–30 phút, trở giữa chừng. Thời gian tùy độ dày; kiểm tra bên trong đã chín, không chỉ dựa vào màu mặt ngoài.' },
      { order: 5, title: 'Thái lát & dọn ăn', instruction: 'Để thịt nghỉ 5 phút cho bớt chảy nước rồi thái ngang thớ thành lát mỏng. Dọn cùng nước chấm, dùng khi thịt còn ấm.' }
    ]
  },
  {
    id: 6,
    slug: 'moo-satay',
    title: 'Moo Satay (Thịt heo xiên sốt đậu phộng)',
    category: 'Thịt & hải sản',
    summary: 'Xiên thịt heo ánh vàng nghệ nướng thơm lừng, chấm đẫm sốt đậu phộng béo ngậy.',
    prepMinutes: 15,
    cookMinutes: 15,
    totalMinutes: 30,
    preconditions: 'Nấu sốt đậu phộng ở lửa nhỏ, khuấy đều để không bị bén đáy.',
    imageQuery: 'Satay',
    ingredients: [
      { name: 'Thịt heo thái mỏng', quantity: '175', unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '60', unit: 'ml', role: 'SEASONING' },
      { name: 'Đậu phộng rang giã', quantity: '25', unit: 'g', role: 'MAIN' },
      { name: 'Bột cà ri', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Bột nghệ', quantity: '0.25', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Nước tương', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Sốt cà ri đỏ', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Nước me', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Đường', quantity: '1', unit: 'thìa cà phê', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Ướp thịt màu vàng thơm', instruction: 'Thái thịt mỏng khoảng 3 mm, cắt thành dải để xiên. Trộn 30 ml nước cốt dừa với bột cà ri, nghệ, nước tương và 1/2 thìa cà phê đường.' },
      { order: 2, title: 'Xiên que tre', instruction: 'Ướp thịt với hỗn hợp trên trong tủ lạnh 1 giờ. Ngâm que tre ít nhất 30 phút, sau đó xiên thịt thành từng dải, không cuộn quá dày.' },
      { order: 3, title: 'Chuẩn bị sốt đậu phộng', instruction: 'Cho 30 ml nước cốt dừa còn lại vào nồi nhỏ cùng sốt cà ri đỏ, đậu phộng giã, nước me và 1/2 thìa cà phê đường còn lại.' },
      { order: 4, title: 'Nấu sốt sánh mịn', instruction: 'Nấu sốt ở lửa nhỏ 3–5 phút, khuấy thường xuyên để không khét đáy. Thêm 1–2 thìa canh nước nếu sốt quá đặc, rồi giữ ấm.' },
      { order: 5, title: 'Nướng xiên thịt', instruction: 'Nướng xiên thịt trên lửa vừa khoảng 8–12 phút, trở thường xuyên, đến khi chín và vàng cạnh. Bày thịt với chén sốt riêng, chấm khi ăn.' }
    ]
  },
  {
    id: 7,
    slug: 'gai-tod-hat-yai',
    title: 'Gai Tod Hat Yai (Gà chiên kiểu Hat Yai)',
    category: 'Thịt & hải sản',
    summary: 'Cánh gà chiên giòn tan đậm đà hạt ngò, phủ ngập hành phi thơm lừng trứ danh miền Nam Thái.',
    prepMinutes: 15,
    cookMinutes: 20,
    totalMinutes: 35,
    preconditions: 'Hành phi vừa vàng nhạt vớt ngay vì hành sẽ tiếp tục sậm màu khi nguội.',
    imageQuery: 'Fried_chicken',
    ingredients: [
      { name: 'Cánh hoặc đùi gà nhỏ', quantity: '300', unit: 'g', role: 'MAIN' },
      { name: 'Tỏi', quantity: '3', unit: 'tép', role: 'SEASONING' },
      { name: 'Rễ ngò', quantity: '1', unit: 'cái', role: 'SEASONING' },
      { name: 'Hành tím thái lát', quantity: '1.5', unit: 'củ', role: 'SUPPORTING' },
      { name: 'Bột gạo', quantity: '1.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước mắm', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Bột hạt ngò', quantity: '0.25', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Đường', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Dầu ăn', quantity: '150', unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Ướp gà với hạt ngò', instruction: 'Thấm khô gà, khứa phần thịt dày. Giã tỏi và rễ ngò, trộn cùng nước mắm, đường, tiêu và bột hạt ngò; xoa lên gà, ướp lạnh 2 giờ.' },
      { order: 2, title: 'Phi hành tím giòn rụm', instruction: 'Thái hành tím thành lát mỏng đều, để ráo. Đun dầu lửa vừa nhỏ, cho hành vào phi đến vàng nhạt rồi vớt ngay; hành sẽ tiếp tục sậm màu khi nguội.' },
      { order: 3, title: 'Áo lớp bột mỏng', instruction: 'Trộn gà đã ướp với bột gạo và 1–2 thìa cà phê nước, chỉ tạo lớp áo mỏng. Gạt bớt các mẩu tỏi to dễ cháy trên mặt gà.' },
      { order: 4, title: 'Chiên vàng giòn', instruction: 'Giữ dầu khoảng 165–170°C, chiên từng mẻ, không xếp chật nồi. Cánh gà thường cần 12–16 phút, đùi nhỏ có thể 18–22 phút; trở để vàng đều.' },
      { order: 5, title: 'Rắc hành phi & dùng nóng', instruction: 'Kiểm tra gà chín tận sát xương, tốt nhất tâm thịt đạt 74°C. Vớt lên vỉ cho ráo dầu 3 phút, rắc hành phi rồi dùng nóng.' }
    ]
  },
  {
    id: 8,
    slug: 'pla-neung-manao',
    title: 'Pla Neung Manao (Cá hấp chanh tỏi)',
    category: 'Thịt & hải sản',
    summary: 'Cá hấp sả thanh ngọt quyện sốt chanh ớt chua cay bùng nổ vị giác.',
    prepMinutes: 10,
    cookMinutes: 15,
    totalMinutes: 25,
    preconditions: 'Không hấp cá lâu sau khi rưới chanh để tránh bị đắng.',
    imageQuery: 'Steamed_fish',
    ingredients: [
      { name: 'Cá làm sạch / phi lê', quantity: '350', unit: 'g', role: 'MAIN' },
      { name: 'Sả đập dập', quantity: '1', unit: 'cây', role: 'SEASONING' },
      { name: 'Tỏi băm', quantity: '3', unit: 'tép', role: 'SEASONING' },
      { name: 'Ớt băm', quantity: '1', unit: 'quả', role: 'SEASONING' },
      { name: 'Ngò rí', quantity: '10', unit: 'g', role: 'SEASONING' },
      { name: 'Cốt chanh', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước mắm', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Đường', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Nước dùng', quantity: '40', unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế cá & thảo mộc', instruction: 'Kiểm tra và nhặt hết xương dăm nếu dùng phi lê. Thấm khô cá, khứa nhẹ phần dày; đập dập sả, băm tỏi ớt và cắt ngò rí.' },
      { order: 2, title: 'Xếp sả & chuẩn bị xửng', instruction: 'Đặt sả lên đĩa sâu lòng, xếp cá lên trên. Đun nước xửng thật sôi rồi cho đĩa cá vào, đậy nắp kín.' },
      { order: 3, title: 'Hấp cá chín tới', instruction: 'Hấp lửa vừa lớn khoảng 10–15 phút tùy độ dày. Kiểm tra phần thịt dày nhất chuyển đục hoàn toàn và dễ tách; hấp thêm nếu còn trong ở giữa.' },
      { order: 4, title: 'Pha sốt chanh tỏi', instruction: 'Hòa nước dùng nóng với đường và nước mắm cho tan. Để bớt nóng khoảng 1 phút rồi mới thêm cốt chanh, tỏi và ớt để giữ mùi thơm.' },
      { order: 5, title: 'Rưới sốt & thưởng thức', instruction: 'Chắt bớt nước cá tiết ra nếu quá nhiều, rưới sốt lên cá và rắc ngò. Dùng ngay khi còn nóng, tránh hấp lâu sau khi thêm chanh.' }
    ]
  },
  {
    id: 9,
    slug: 'pla-rad-prik',
    title: 'Pla Rad Prik (Cá chiên sốt ớt)',
    category: 'Thịt & hải sản',
    summary: 'Cá chiên vàng giòn rưới đẫm sốt me ớt chua ngọt mặn mà đậm chất Thái.',
    prepMinutes: 10,
    cookMinutes: 15,
    totalMinutes: 25,
    preconditions: 'Rưới sốt lên cá ngay trước khi ăn để vỏ cá luôn giữ độ giòn.',
    imageQuery: 'Deep-fried_fish',
    ingredients: [
      { name: 'Cá cắt khúc hoặc phi lê', quantity: '300', unit: 'g', role: 'MAIN' },
      { name: 'Tỏi băm', quantity: '2', unit: 'tép', role: 'SEASONING' },
      { name: 'Ớt băm', quantity: '2', unit: 'quả', role: 'SEASONING' },
      { name: 'Nước me pha', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước mắm', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Đường thốt nốt', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Dầu chiên', quantity: '150', unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Thấm khô cá & pha sốt me', instruction: 'Cá làm sạch, bỏ xương lớn nếu cần, thấm thật khô cả mặt ngoài và các khe khứa. Băm nhỏ tỏi và ớt; hòa nước me, nước mắm, đường với nước trong chén.' },
      { order: 2, title: 'Chiên cá lửa vừa', instruction: 'Đun dầu ở khoảng 170–175°C. Đặt cá vào nhẹ tay, tránh nước bắn; để yên vài phút cho mặt cá se rồi mới trở.' },
      { order: 3, title: 'Lấy cá ra vỉ ráo dầu', instruction: 'Chiên cá cắt khúc khoảng 8–12 phút, phi lê mỏng khoảng 5–8 phút, tùy độ dày. Lấy ra khi vàng giòn và thịt chín hoàn toàn, đặt lên vỉ cho ráo.' },
      { order: 4, title: 'Nấu sốt chua ngọt', instruction: 'Chừa khoảng 1 thìa cà phê dầu trong chảo sạch, phi tỏi ớt 15–20 giây. Thêm chén sốt, đun lửa nhỏ 2–3 phút đến sánh nhẹ, nếm lại vị chua ngọt.' },
      { order: 5, title: 'Rưới sốt lên cá giòn', instruction: 'Đặt cá lên đĩa, rưới sốt ngay trước khi ăn rồi thêm ngò rí. Không ngâm cá trong sốt quá lâu để giữ lớp ngoài giòn.' }
    ]
  },
  {
    id: 10,
    slug: 'goong-ob-woon-sen',
    title: 'Goong Ob Woon Sen (Tôm miến om nồi đất)',
    category: 'Thịt & hải sản',
    summary: 'Tôm tươi mọng om cùng miến dai ngấm trọn mỡ ba chỉ, gừng ấm nồng và tiêu đen.',
    prepMinutes: 15,
    cookMinutes: 15,
    totalMinutes: 30,
    preconditions: 'Dùng nồi đất hoặc nồi đáy dày om để giữ nhiệt và sợi miến tơi bóng.',
    imageQuery: 'Kung_op_wunsen',
    ingredients: [
      { name: 'Tôm tươi', quantity: '150', unit: 'g', role: 'MAIN' },
      { name: 'Miến khô', quantity: '50', unit: 'g', role: 'MAIN' },
      { name: 'Thịt ba chỉ heo', quantity: '30', unit: 'g', role: 'SUPPORTING' },
      { name: 'Gừng thái lát', quantity: '10', unit: 'g', role: 'SEASONING' },
      { name: 'Rễ ngò & tỏi', quantity: '2', unit: 'tép', role: 'SEASONING' },
      { name: 'Cần tây', quantity: '20', unit: 'g', role: 'SUPPORTING' },
      { name: 'Dầu hào', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước tương & tương đen', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước dùng', quantity: '110', unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế miến & tôm', instruction: 'Ngâm miến trong nước theo hướng dẫn bao bì, thường 10–15 phút, rồi để ráo. Tôm bỏ chỉ lưng; thái mỏng ba chỉ và gừng, đập tỏi và rễ ngò.' },
      { order: 2, title: 'Trộn sốt cho miến thấm màu', instruction: 'Hòa dầu hào, hai loại nước tương, đường, tiêu với 110 ml nước dùng. Cho miến vào trộn sơ với một ít hỗn hợp sốt để sợi thấm màu.' },
      { order: 3, title: 'Lót đáy nồi xèo mỡ thơm', instruction: 'Lót ba chỉ dưới đáy nồi nhỏ, thêm gừng, tỏi, rễ ngò; đun lửa vừa 1–2 phút cho thơm và thịt bắt đầu ra mỡ.' },
      { order: 4, title: 'Om miến tôm đậy kín nắp', instruction: 'Xếp miến và tôm lên trên, rót toàn bộ phần sốt còn lại, đậy nắp. Om lửa vừa nhỏ 8–12 phút; sau 5 phút mở kiểm tra, thêm từng thìa nước nóng nếu đáy gần khô.' },
      { order: 5, title: 'Thêm cần tây & thưởng thức', instruction: 'Đảo nhẹ miến, kiểm tra tôm đã chín đục và sợi miến mềm, không còn lõi cứng. Thêm cần tây cắt khúc, đậy thêm 30–60 giây rồi tắt bếp, dùng ngay.' }
    ]
  },

  // --- PHẦN 2: CANH CÀ RI VÀ LẨU ---
  {
    id: 11,
    slug: 'tom-yum-goong',
    title: 'Tom Yum Goong (Canh tôm chua cay)',
    category: 'Canh, cà ri & lẩu',
    summary: 'Món súp quốc hồn quốc túy của Thái Lan với tôm ngọt, sả, riềng, lá chanh và tương ớt rang.',
    prepMinutes: 10,
    cookMinutes: 10,
    totalMinutes: 20,
    preconditions: 'Tắt bếp rồi mới thêm cốt chanh và ớt đập dập để giữ mùi thơm thanh túy.',
    imageQuery: 'Tom_yum',
    ingredients: [
      { name: 'Tôm tươi', quantity: '150', unit: 'g', role: 'MAIN' },
      { name: 'Nấm rơm hoặc nấm bào ngư', quantity: '75', unit: 'g', role: 'SUPPORTING' },
      { name: 'Sả cây', quantity: '1', unit: 'cây', role: 'SEASONING' },
      { name: 'Riềng', quantity: '12', unit: 'g', role: 'SEASONING' },
      { name: 'Lá chanh Thái', quantity: '2', unit: 'lá', role: 'SEASONING' },
      { name: 'Nước dùng', quantity: '350', unit: 'ml', role: 'SEASONING' },
      { name: 'Nước mắm', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Cốt chanh', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Tương ớt rang Nam Prik Pao', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế thảo mộc', instruction: 'Tôm bóc vỏ, bỏ chỉ lưng, để ráo. Cắt nấm vừa ăn; đập dập sả và ớt, thái lát riềng, xé lá chanh và bỏ gân giữa.' },
      { order: 2, title: 'Nấu nước dùng thơm sả riềng', instruction: 'Đun 350 ml nước dùng với sả, riềng và lá chanh ở lửa vừa 5–7 phút. Có thể vớt bớt thảo mộc trước khi ăn vì chúng chủ yếu để tạo hương.' },
      { order: 3, title: 'Thêm nấm & tôm', instruction: 'Cho nấm và nam prik pao vào, khuấy tan rồi nấu 2–3 phút. Cho tôm vào, đun nhẹ thêm khoảng 2–3 phút tùy kích thước.' },
      { order: 4, title: 'Nêm vị chua cay', instruction: 'Khi tôm chuyển hồng và phần thịt giữa thân đục hoàn toàn, nêm đường và cho nước mắm từ ít đến nhiều. Không đun tôm quá lâu để tránh dai.' },
      { order: 5, title: 'Vắt chanh sau khi tắt bếp', instruction: 'Tắt bếp rồi mới thêm cốt chanh và ớt đập. Nếm lại vị chua cay mặn, múc ra tô và dùng nóng; bản công thức này không thêm sữa.' }
    ]
  },
  {
    id: 12,
    slug: 'tom-kha-gai',
    title: 'Tom Kha Gai (Canh gà nước cốt dừa)',
    category: 'Canh, cà ri & lẩu',
    summary: 'Canh gà béo thanh dịu nhẹ từ nước cốt dừa, ngát hương riềng non và lá chanh tươi.',
    prepMinutes: 10,
    cookMinutes: 15,
    totalMinutes: 25,
    preconditions: 'Đun lửa nhỏ khi cho nước cốt dừa để canh không bị kết tủa tách dầu.',
    imageQuery: 'Tom_kha_kai',
    ingredients: [
      { name: 'Thịt gà', quantity: '150', unit: 'g', role: 'MAIN' },
      { name: 'Nấm', quantity: '75', unit: 'g', role: 'SUPPORTING' },
      { name: 'Nước cốt dừa', quantity: '150', unit: 'ml', role: 'SEASONING' },
      { name: 'Nước dùng', quantity: '200', unit: 'ml', role: 'SEASONING' },
      { name: 'Riềng', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Sả & lá chanh Thái', quantity: '1', unit: 'cây', role: 'SEASONING' },
      { name: 'Nước mắm & cốt chanh', quantity: '1', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế nguyên liệu', instruction: 'Cắt gà thành miếng mỏng vừa ăn; cắt nấm, đập sả, thái riềng và xé lá chanh. Để riêng cốt chanh, chỉ cho vào cuối.' },
      { order: 2, title: 'Nấu nước dùng thảo mộc', instruction: 'Cho 200 ml nước dùng cùng sả, riềng, lá chanh vào nồi nhỏ, đun sôi nhẹ 5 phút để dậy mùi.' },
      { order: 3, title: 'Nấu chín gà', instruction: 'Cho gà vào, hạ lửa vừa, nấu 5–7 phút tùy độ dày đến khi gà chín hoàn toàn. Hớt bọt nếu có.' },
      { order: 4, title: 'Hòa nước cốt dừa', instruction: 'Thêm nấm và 150 ml nước cốt dừa, khuấy nhẹ, đun lửa nhỏ thêm 3–4 phút. Không để sôi mạnh kéo dài; nêm nước mắm và đường.' },
      { order: 5, title: 'Hoàn thiện vị béo chua nhẹ', instruction: 'Tắt bếp, thêm cốt chanh từng ít một, cho ớt và ngò rí nếu dùng. Canh đạt khi có vị béo nhẹ, chua thanh, gà mềm và nấm chín.' }
    ]
  },
  {
    id: 13,
    slug: 'gaeng-keow-wan-gai',
    title: 'Gaeng Keow Wan Gai (Cà ri xanh gà)',
    category: 'Canh, cà ri & lẩu',
    summary: 'Cà ri xanh cay nồng nàn nấu cùng cà tím giòn ngọt, nước cốt dừa và lá húng quế Thái.',
    prepMinutes: 10,
    cookMinutes: 20,
    totalMinutes: 30,
    preconditions: 'Cà tím Thái ngâm nước muối loãng trước để không bị thâm đen.',
    imageQuery: 'Green_curry',
    ingredients: [
      { name: 'Thịt gà', quantity: '175', unit: 'g', role: 'MAIN' },
      { name: 'Cà tím Thái', quantity: '75', unit: 'g', role: 'SUPPORTING' },
      { name: 'Nước cốt dừa', quantity: '200', unit: 'ml', role: 'SEASONING' },
      { name: 'Sốt cà ri xanh', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Lá chanh Thái & húng quế', quantity: '2', unit: 'lá', role: 'SEASONING' },
      { name: 'Nước mắm & đường thốt nốt', quantity: '1', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế cà tím & gà', instruction: 'Cắt gà thành miếng khoảng 2 cm. Cà tím Thái bổ đôi hoặc tư, ngâm nước rồi để ráo trước khi nấu; nhặt húng quế và xé lá chanh.' },
      { order: 2, title: 'Xào sốt cà ri dậy mùi', instruction: 'Làm nóng dầu ở lửa vừa nhỏ, xào sốt cà ri xanh 30–60 giây. Thêm 50 ml nước cốt dừa, khuấy 1–2 phút cho hỗn hợp thơm, không bị khét.' },
      { order: 3, title: 'Đảo săn thịt gà', instruction: 'Cho gà vào đảo 2–3 phút cho săn. Thêm 150 ml nước cốt dừa còn lại và 75 ml nước, đun sôi nhẹ rồi hạ lửa.' },
      { order: 4, title: 'Nấu cà tím mềm vừa', instruction: 'Nấu khoảng 6–8 phút, cho cà tím vào nấu thêm 5–7 phút đến khi mềm và gà chín hoàn toàn. Nếu sốt cạn quá nhanh, thêm ít nước nóng.' },
      { order: 5, title: 'Nêm nếm & thả húng quế', instruction: 'Nêm nước mắm và đường sau khi thử độ mặn của sốt cà ri. Cho lá chanh, húng quế vào đảo nhẹ, tắt bếp; dùng với cơm hoặc bún chuẩn bị riêng.' }
    ]
  },
  {
    id: 14,
    slug: 'gaeng-phed-gai',
    title: 'Gaeng Phed Gai (Cà ri đỏ gà)',
    category: 'Canh, cà ri & lẩu',
    summary: 'Cà ri đỏ thơm nồng vị ớt khô, măng giòn sần sật và đậu đũa quyện nước cốt dừa óng ả.',
    prepMinutes: 10,
    cookMinutes: 20,
    totalMinutes: 30,
    preconditions: 'Dùng măng đã luộc kỹ để nước cà ri trong thơm tự nhiên.',
    imageQuery: 'Red_curry',
    ingredients: [
      { name: 'Thịt gà', quantity: '175', unit: 'g', role: 'MAIN' },
      { name: 'Măng luộc', quantity: '75', unit: 'g', role: 'SUPPORTING' },
      { name: 'Đậu đũa', quantity: '50', unit: 'g', role: 'SUPPORTING' },
      { name: 'Nước cốt dừa', quantity: '200', unit: 'ml', role: 'SEASONING' },
      { name: 'Sốt cà ri đỏ', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Lá chanh Thái & húng quế', quantity: '2', unit: 'lá', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế măng & đậu đũa', instruction: 'Dùng măng đã luộc kỹ, bỏ nước luộc, rửa rồi để ráo. Thái măng thành sợi hoặc lát, cắt gà miếng 2 cm, đậu đũa khúc 3–4 cm.' },
      { order: 2, title: 'Xào sốt cà ri đỏ', instruction: 'Đun dầu ở lửa vừa nhỏ, cho sốt cà ri đỏ vào xào 30–60 giây. Thêm vài thìa nước cốt dừa, khuấy cho sốt tan và dậy mùi.' },
      { order: 3, title: 'Đảo săn gà', instruction: 'Cho gà vào đảo săn 2–3 phút. Thêm toàn bộ nước cốt dừa còn lại và 75 ml nước, đun sôi nhẹ rồi nấu khoảng 6–8 phút.' },
      { order: 4, title: 'Nấu chín măng đậu', instruction: 'Cho măng, đậu đũa vào, nấu thêm 4–6 phút cho rau chín và gà chín hoàn toàn. Nêm nước mắm, đường từng chút tùy độ mặn của sốt mua sẵn.' },
      { order: 5, title: 'Hoàn thiện', instruction: 'Cho lá chanh xé và húng quế vào, đảo nhẹ 20–30 giây rồi tắt bếp. Cà ri có sốt lỏng vừa, thơm thảo mộc; ăn nóng.' }
    ]
  },
  {
    id: 15,
    slug: 'gaeng-massaman-nuea',
    title: 'Gaeng Massaman Nuea (Cà ri Massaman bò)',
    category: 'Canh, cà ri & lẩu',
    summary: 'Món cà ri vua của ẩm thực thế giới: nạm bò hầm mềm nhừ với khoai tây, đậu phộng và gia vị ấm nồng.',
    prepMinutes: 15,
    cookMinutes: 90,
    totalMinutes: 105,
    preconditions: 'Hầm bò lửa nhỏ đậy hé nắp từ 75-120 phút cho thịt mềm tan.',
    imageQuery: 'Massaman_curry',
    ingredients: [
      { name: 'Bò nạm', quantity: '200', unit: 'g', role: 'MAIN' },
      { name: 'Khoai tây', quantity: '125', unit: 'g', role: 'SUPPORTING' },
      { name: 'Hành tây', quantity: '0.5', unit: 'củ', role: 'SUPPORTING' },
      { name: 'Đậu phộng rang', quantity: '20', unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '200', unit: 'ml', role: 'SEASONING' },
      { name: 'Sốt Massaman', quantity: '18', unit: 'g', role: 'SEASONING' },
      { name: 'Nước me & đường thốt nốt', quantity: '1', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Cắt khối bò & khoai', instruction: 'Cắt bò thành khối 2–3 cm, thấm khô. Gọt khoai tây, cắt khối tương tự; hành tây bổ múi, để riêng đậu phộng rang.' },
      { order: 2, title: 'Xào sốt Massaman', instruction: 'Đun dầu, xào sốt Massaman lửa vừa nhỏ khoảng 1 phút. Thêm bò vào đảo 2–3 phút để sốt bám đều.' },
      { order: 3, title: 'Hầm bò nhỏ lửa', instruction: 'Cho 200 ml nước và 100 ml nước cốt dừa vào nồi nhỏ. Đun sôi nhẹ, đậy hé nắp và hầm lửa nhỏ khoảng 75–120 phút; kiểm tra mỗi 20 phút, thêm nước nóng khi cần.' },
      { order: 4, title: 'Nấu chín khoai tây', instruction: 'Khi bò gần mềm, cho khoai, hành tây, đậu phộng và 100 ml cốt dừa còn lại. Hầm tiếp 15–25 phút đến khi khoai mềm, bò dễ xiên qua bằng đũa.' },
      { order: 5, title: 'Cân bằng chua ngọt béo', instruction: 'Nêm nước mắm, nước me và đường thốt nốt, đun nhẹ thêm 2 phút. Sốt nên sánh vừa, không cạn đặc; dùng nóng cùng cơm chuẩn bị riêng.' }
    ]
  },
  {
    id: 16,
    slug: 'panang-moo',
    title: 'Panang Moo (Cà ri Panang heo)',
    category: 'Canh, cà ri & lẩu',
    summary: 'Cà ri Panang heo sốt đặc sánh bùi béo, thơm lừng lá chanh xắt sợi chỉ nhuyễn.',
    prepMinutes: 10,
    cookMinutes: 15,
    totalMinutes: 25,
    preconditions: 'Món này có sốt sánh đặc vừa, không nhiều nước như canh súp.',
    imageQuery: 'Phanaeng_curry',
    ingredients: [
      { name: 'Nạc vai heo thái mỏng', quantity: '175', unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '150', unit: 'ml', role: 'SEASONING' },
      { name: 'Sốt Panang', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Lá chanh Thái thái sợi', quantity: '2', unit: 'lá', role: 'SEASONING' },
      { name: 'Ớt sừng đỏ', quantity: '1', unit: 'quả', role: 'SEASONING' },
      { name: 'Nước mắm & đường thốt nốt', quantity: '1', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Thái lát heo & lá chanh chỉ', instruction: 'Thái nạc vai ngang thớ thành lát mỏng 2–3 mm. Lá chanh bỏ gân giữa, thái chỉ thật nhỏ; cắt ớt đỏ nếu dùng.' },
      { order: 2, title: 'Phi sốt Panang', instruction: 'Làm nóng dầu trong chảo nhỏ, cho sốt Panang vào xào lửa vừa nhỏ 30–60 giây. Thêm khoảng 40 ml nước cốt dừa, khuấy để sốt hòa đều.' },
      { order: 3, title: 'Đảo tách lát thịt heo', instruction: 'Cho thịt heo vào, đảo 2–3 phút để tách rời các lát thịt và áo sốt. Thêm 110 ml nước cốt dừa còn lại.' },
      { order: 4, title: 'Đun nhỏ lửa sánh sốt', instruction: 'Đun lửa nhỏ khoảng 8–12 phút, đảo thỉnh thoảng đến khi heo chín và sốt sánh bám thịt. Nếu quá đặc trước khi thịt chín, thêm 1–2 thìa canh nước.' },
      { order: 5, title: 'Hoàn thành với lá chanh', instruction: 'Nêm nước mắm và đường, cho lá chanh cùng ớt vào đảo 20–30 giây rồi tắt bếp. Món này có sốt đặc vừa, không nhiều nước như canh cà ri.' }
    ]
  },
  {
    id: 17,
    slug: 'gaeng-kari-gai',
    title: 'Gaeng Kari Gai (Cà ri vàng gà)',
    category: 'Canh, cà ri & lẩu',
    summary: 'Cà ri vàng dịu nhẹ nấu từ đùi gà vàng ruộm, khoai tây mềm bở ngọt bùi.',
    prepMinutes: 10,
    cookMinutes: 30,
    totalMinutes: 40,
    preconditions: 'Kiểm tra gà chín hoàn toàn ở sát xương trước khi dọn ăn.',
    imageQuery: 'Yellow_curry',
    ingredients: [
      { name: 'Đùi gà', quantity: '200', unit: 'g', role: 'MAIN' },
      { name: 'Khoai tây', quantity: '125', unit: 'g', role: 'SUPPORTING' },
      { name: 'Hành tây', quantity: '0.25', unit: 'củ', role: 'SUPPORTING' },
      { name: 'Nước cốt dừa', quantity: '200', unit: 'ml', role: 'SEASONING' },
      { name: 'Sốt cà ri vàng', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm & đường', quantity: '1', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Chặt gà & gọt khoai', instruction: 'Chặt đùi gà thành miếng vừa ăn nếu quá lớn; khoai tây gọt vỏ, cắt khối khoảng 2 cm. Hành tây bổ múi.' },
      { order: 2, title: 'Xào sốt cà ri vàng', instruction: 'Đun dầu, xào sốt cà ri vàng lửa vừa nhỏ 30–60 giây. Cho gà vào đảo 3 phút để gia vị bám mặt ngoài.' },
      { order: 3, title: 'Nấu gà với nước cốt dừa', instruction: 'Thêm nước cốt dừa và 125 ml nước, khuấy đều. Đun sôi nhẹ, hạ lửa, nấu gà khoảng 10 phút.' },
      { order: 4, title: 'Thêm khoai hầm mềm', instruction: 'Cho khoai tây và hành vào, nấu thêm 15–20 phút. Dùng đũa thử khoai đã mềm; kiểm tra gà chín hoàn toàn ở sát xương, thêm nước nóng nếu sốt cạn quá sớm.' },
      { order: 5, title: 'Nêm gia vị vừa miệng', instruction: 'Nêm nước mắm và đường từ ít đến nhiều, đun nhẹ thêm 1 phút rồi tắt bếp. Múc ra tô, dùng nóng với cơm chuẩn bị riêng.' }
    ]
  },
  {
    id: 18,
    slug: 'gaeng-som-goong',
    title: 'Gaeng Som Goong (Canh cà ri chua tôm)',
    category: 'Canh, cà ri & lẩu',
    summary: 'Canh cà ri chua thanh không nước cốt dừa, nấu cùng đu đủ xanh giòn ngọt và tôm tươi.',
    prepMinutes: 10,
    cookMinutes: 15,
    totalMinutes: 25,
    preconditions: 'Canh có vị chua nổi bật, cay vừa, không thêm nước cốt dừa.',
    imageQuery: 'Kaeng_som',
    ingredients: [
      { name: 'Tôm tươi', quantity: '150', unit: 'g', role: 'MAIN' },
      { name: 'Đu đủ xanh thái lát', quantity: '75', unit: 'g', role: 'SUPPORTING' },
      { name: 'Bắp cải', quantity: '75', unit: 'g', role: 'SUPPORTING' },
      { name: 'Thịt cá chín gỡ xương', quantity: '25', unit: 'g', role: 'MAIN' },
      { name: 'Sốt Gaeng Som', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Nước me', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước mắm & đường thốt nốt', quantity: '1', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế tôm & giã cá', instruction: 'Tôm bỏ vỏ và chỉ lưng; gỡ kỹ xương khỏi phần cá đã nấu chín. Đu đủ xanh thái lát mỏng khoảng 3 mm, bắp cải cắt miếng vừa ăn.' },
      { order: 2, title: 'Nấu nước dùng cá cà ri', instruction: 'Giã thịt cá cùng sốt gaeng som đến khi nhuyễn. Hòa hỗn hợp với 350 ml nước trong nồi nhỏ, khuấy rồi đun sôi nhẹ.' },
      { order: 3, title: 'Nấu mềm đu đủ xanh', instruction: 'Cho đu đủ vào nấu 6–10 phút đến khi gần mềm. Thêm bắp cải, nấu tiếp 2–3 phút.' },
      { order: 4, title: 'Thêm tôm tươi', instruction: 'Cho tôm vào, nấu khoảng 2–3 phút đến khi thịt tôm chín đục hoàn toàn. Nêm nước me, nước mắm và đường, thử lại vì sốt cà ri có thể đã mặn.' },
      { order: 5, title: 'Hoàn thành canh chua', instruction: 'Đun nhẹ thêm 30 giây rồi tắt bếp. Canh có vị chua nổi bật, cay vừa; không thêm nước cốt dừa và không nấu tôm lâu sau khi chín.' }
    ]
  },
  {
    id: 19,
    slug: 'gaeng-jued-tao-hoo-moo-sab',
    title: 'Gaeng Jued Tao Hoo Moo Sab (Canh đậu hũ thịt băm)',
    category: 'Canh, cà ri & lẩu',
    summary: 'Canh thanh đạm ngọt nước từ thịt băm vo viên, đậu hũ non mềm mượt và cải thảo.',
    prepMinutes: 10,
    cookMinutes: 15,
    totalMinutes: 25,
    preconditions: 'Khuấy nhẹ tay khi nấu để không làm vỡ miếng đậu hũ non.',
    imageQuery: 'Tom_chut',
    ingredients: [
      { name: 'Thịt heo băm', quantity: '100', unit: 'g', role: 'MAIN' },
      { name: 'Đậu hũ non', quantity: '100', unit: 'g', role: 'MAIN' },
      { name: 'Cải thảo', quantity: '75', unit: 'g', role: 'SUPPORTING' },
      { name: 'Cà rốt', quantity: '0.5', unit: 'củ', role: 'SUPPORTING' },
      { name: 'Nước dùng', quantity: '400', unit: 'ml', role: 'SEASONING' },
      { name: 'Nước tương & nước mắm', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Hành ngò tiêu', quantity: '10', unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế & cắt đậu hũ', instruction: 'Băm tỏi, thái cà rốt lát mỏng, cắt cải thảo khúc 3 cm. Cắt đậu hũ thành miếng lớn để ít bị vỡ.' },
      { order: 2, title: 'Vo viên thịt băm', instruction: 'Trộn thịt băm với tỏi, tiêu và 1/2 thìa cà phê nước tương lấy từ tổng lượng đã ghi. Vo viên nhỏ khoảng 2 cm.' },
      { order: 3, title: 'Nấu cà rốt & viên thịt', instruction: 'Đun 400 ml nước dùng sôi nhẹ, cho cà rốt vào nấu 3–4 phút. Thả từng viên thịt vào, nấu thêm 5–7 phút và hớt bọt.' },
      { order: 4, title: 'Thêm cải thảo & đậu hũ non', instruction: 'Khi viên thịt chín tới giữa, cho cải thảo và đậu hũ vào. Hạ lửa nhỏ, nấu 2–3 phút; không khuấy mạnh để tránh nát đậu.' },
      { order: 5, title: 'Rắc hành ngò thơm', instruction: 'Nêm nước mắm và phần nước tương còn lại, thử độ mặn rồi tắt bếp. Rắc hành lá, ngò rí, dùng nóng; canh nên trong và vị nhẹ.' }
    ]
  },
  {
    id: 20,
    slug: 'jim-jum',
    title: 'Jim Jum (Lẩu thảo mộc kiểu Isan)',
    category: 'Canh, cà ri & lẩu',
    summary: 'Lẩu đất Isan ngát hương sả riềng lá chanh, nhúng thịt tôm tươi rói chấm sốt Jaew đậm đà.',
    prepMinutes: 15,
    cookMinutes: 20,
    totalMinutes: 35,
    preconditions: 'Dùng dụng cụ riêng gắp thực phẩm sống, đợi nước sôi kỹ mới dùng.',
    imageQuery: 'Chim_chum',
    ingredients: [
      { name: 'Thịt heo thái mỏng', quantity: '125', unit: 'g', role: 'MAIN' },
      { name: 'Tôm tươi', quantity: '100', unit: 'g', role: 'MAIN' },
      { name: 'Miến', quantity: '50', unit: 'g', role: 'SUPPORTING' },
      { name: 'Rau cải & bắp cải', quantity: '150', unit: 'g', role: 'SUPPORTING' },
      { name: 'Húng quế Thái', quantity: '20', unit: 'g', role: 'SEASONING' },
      { name: 'Nước dùng', quantity: '500', unit: 'ml', role: 'SEASONING' },
      { name: 'Sả, riềng, lá chanh', quantity: '20', unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm chấm Jaew & cốt chanh', quantity: '1', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sắp đĩa nguyên liệu nhúng', instruction: 'Thái heo mỏng 2–3 mm; sơ chế tôm, ngâm miến mềm rồi để ráo. Rửa rau và húng quế, cắt vừa ăn; để thịt sống trên đĩa riêng.' },
      { order: 2, title: 'Nấu nước lẩu sả riềng', instruction: 'Đập sả, thái riềng, xé lá chanh. Cho vào nồi nhỏ cùng 500 ml nước dùng, đun sôi nhẹ 8–10 phút, nêm phần nước mắm dành cho lẩu.' },
      { order: 3, title: 'Pha sốt chấm Jaew thính', instruction: 'Pha nước chấm: hòa đường với nước mắm và cốt chanh, sau đó thêm thính, tỏi, ớt băm. Có thể pha thêm 1 thìa canh nước nếu cần dịu vị.' },
      { order: 4, title: 'Nhúng thịt tôm chín tới', instruction: 'Giữ nồi sôi nhẹ. Cho từng ít thịt, tôm vào, đợi nước sôi trở lại và nguyên liệu chín hoàn toàn mới ăn; không cho quá nhiều đồ lạnh cùng lúc.' },
      { order: 5, title: 'Thêm rau miến & thưởng thức', instruction: 'Thêm rau và miến sau, nấu đến mềm. Dùng dụng cụ riêng gắp thực phẩm sống, bổ sung nước nóng khi nước lẩu giảm; chấm từng miếng khi ăn.' }
    ]
  },

  // --- PHẦN 3: CƠM MÌ VÀ BÚN ---
  {
    id: 21,
    slug: 'pad-thai-goong',
    title: 'Pad Thai Goong (Hủ tiếu xào tôm)',
    category: 'Cơm, mì & bún',
    summary: 'Hủ tiếu xào tôm chua ngọt hài hòa vị sốt me, giòn bùi đậu phộng rang và giá hẹ tươi.',
    prepMinutes: 15,
    cookMinutes: 10,
    totalMinutes: 25,
    preconditions: 'Xào nhanh tay lửa lớn, vắt chanh theo khẩu vị khi ăn.',
    imageQuery: 'Pad_thai',
    ingredients: [
      { name: 'Bánh phở Pad Thai khô', quantity: '90', unit: 'g', role: 'MAIN' },
      { name: 'Tôm tươi', quantity: '100', unit: 'g', role: 'MAIN' },
      { name: 'Trứng gà', quantity: '1', unit: 'quả', role: 'MAIN' },
      { name: 'Đậu hũ chắc', quantity: '50', unit: 'g', role: 'SUPPORTING' },
      { name: 'Giá đỗ & hẹ', quantity: '65', unit: 'g', role: 'SUPPORTING' },
      { name: 'Đậu phộng rang', quantity: '10', unit: 'g', role: 'SEASONING' },
      { name: 'Nước me', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước mắm & đường thốt nốt', quantity: '1.5', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Ngâm sợi & chuẩn bị rau', instruction: 'Ngâm sợi Pad Thai theo bao bì đến dẻo nhưng chưa mềm nhũn. Tôm bỏ chỉ; đậu hũ cắt nhỏ, hẹ khúc 3 cm, rửa giá và băm hành tím.' },
      { order: 2, title: 'Nấu sốt me đường thốt nốt', instruction: 'Cho nước me, nước mắm, đường vào nồi nhỏ, đun lửa nhỏ 1–2 phút cho đường tan. Nếu nước me quá đặc, thêm 1–2 thìa canh nước rồi để sốt riêng.' },
      { order: 3, title: 'Xào tôm & đậu hũ', instruction: 'Đun dầu, phi hành, xào đậu hũ và tôm khô 1 phút. Thêm tôm tươi, đảo đến vừa chín rồi gạt sang mép chảo.' },
      { order: 4, title: 'Xào trứng & sợi bánh phở', instruction: 'Đập trứng vào chỗ trống, chờ hơi se rồi đảo tơi. Cho sợi và sốt vào, đảo 2–4 phút; thêm từng thìa nước nếu sợi còn cứng, tránh đổ quá nhiều làm nhão.' },
      { order: 5, title: 'Thêm giá hẹ & rắc đậu phộng', instruction: 'Khi sợi mềm, sốt gần ráo, cho giá và hẹ vào đảo 20–30 giây. Cho ra đĩa, rắc đậu phộng; vắt thêm chanh theo khẩu vị khi ăn.' }
    ]
  },
  {
    id: 22,
    slug: 'pad-see-ew',
    title: 'Pad See Ew (Hủ tiếu xào nước tương)',
    category: 'Cơm, mì & bún',
    summary: 'Hủ tiếu bản rộng xào cháy cạnh thơm mùi khói, quyện nước tương đen sánh và cải làn xanh mướt.',
    prepMinutes: 10,
    cookMinutes: 10,
    totalMinutes: 20,
    preconditions: 'Dàn bánh phở áp chảo để tạo mùi xào xém thơm đặc trưng.',
    imageQuery: 'Phat_si-io',
    ingredients: [
      { name: 'Bánh phở tươi bản rộng', quantity: '175', unit: 'g', role: 'MAIN' },
      { name: 'Thịt gà hoặc heo thái mỏng', quantity: '125', unit: 'g', role: 'MAIN' },
      { name: 'Cải làn', quantity: '100', unit: 'g', role: 'SUPPORTING' },
      { name: 'Trứng gà', quantity: '1', unit: 'quả', role: 'MAIN' },
      { name: 'Tỏi băm', quantity: '2', unit: 'tép', role: 'SEASONING' },
      { name: 'Nước tương đen & dầu hào', quantity: '1', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Tách sợi phở & pha sốt', instruction: 'Tách nhẹ các sợi bánh phở; nếu đang lạnh cứng, làm ấm ngắn trước khi tách để tránh gãy. Thái thịt mỏng, cắt cải làn, để riêng thân và lá; băm tỏi.' },
      { order: 2, title: 'Trộn sốt tương', instruction: 'Trộn nước tương, nước tương đen, dầu hào và đường trong chén. Làm nóng chảo với dầu ở lửa vừa lớn.' },
      { order: 3, title: 'Xào thịt & thân cải', instruction: 'Phi tỏi khoảng 15 giây, cho thịt vào đảo 3–5 phút đến chín. Thêm thân cải cùng 1 thìa canh nước, đảo thêm 1 phút.' },
      { order: 4, title: 'Đảo trứng & bánh phở', instruction: 'Gạt thịt và cải sang bên, cho trứng vào đảo tơi. Thêm bánh phở, sốt và lá cải; dùng sạn lật nhẹ để sốt phủ đều, hạn chế băm hoặc đảo mạnh.' },
      { order: 5, title: 'Áp chảo xém cạnh thơm', instruction: 'Dàn bánh phở, để yên 15–20 giây rồi lật, lặp lại 1–2 lần cho có mùi xào thơm. Tắt bếp khi sợi nóng mềm và cải vừa chín, dùng ngay.' }
    ]
  },
  {
    id: 23,
    slug: 'pad-kee-mao',
    title: 'Pad Kee Mao (Hủ tiếu xào cay húng quế)',
    category: 'Cơm, mì & bún',
    summary: 'Món hủ tiếu say rượu cay bùng nổ vị tỏi ớt, húng quế Thái thơm ngào ngạt.',
    prepMinutes: 10,
    cookMinutes: 10,
    totalMinutes: 20,
    preconditions: 'Dùng ngay khi món còn nóng, sợi mềm nhưng không nát.',
    imageQuery: 'Drunken_noodles',
    ingredients: [
      { name: 'Bánh phở tươi bản rộng', quantity: '175', unit: 'g', role: 'MAIN' },
      { name: 'Thịt gà thái mỏng', quantity: '125', unit: 'g', role: 'MAIN' },
      { name: 'Đậu đũa', quantity: '50', unit: 'g', role: 'SUPPORTING' },
      { name: 'Hành tây', quantity: '0.25', unit: 'củ', role: 'SUPPORTING' },
      { name: 'Húng quế Thái', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Tỏi & ớt đập dập', quantity: '2', unit: 'tép', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế rau củ thịt', instruction: 'Tách sợi bánh phở, thái gà mỏng, cắt đậu đũa khúc 3 cm và hành tây múi nhỏ. Giã tỏi ớt, nhặt lá húng và để ráo.' },
      { order: 2, title: 'Phi thơm tỏi ớt nồng', instruction: 'Hòa dầu hào, nước tương, nước mắm và đường thành sốt. Đun chảo nóng, thêm dầu rồi phi tỏi ớt 15–20 giây.' },
      { order: 3, title: 'Xào gà chín cùng đậu đũa', instruction: 'Cho gà vào đảo 3–4 phút đến chín hoàn toàn. Thêm đậu đũa và hành tây, cho 1–2 thìa canh nước rồi xào 2–3 phút cho đậu chín.' },
      { order: 4, title: 'Thêm bánh phở & sốt lửa lớn', instruction: 'Thêm bánh phở và chén sốt, đảo nhẹ trên lửa lớn 1–2 phút đến khi sợi nóng và thấm màu. Nếu sợi dính, nới nhẹ bằng sạn, không đổ nhiều nước.' },
      { order: 5, title: 'Đảo lá húng thơm lừng', instruction: 'Cho lá húng và tiêu xanh nếu dùng vào, đảo thêm 20–30 giây rồi tắt bếp. Dùng ngay khi món còn nóng, sợi mềm nhưng không nát.' }
    ]
  },
  {
    id: 24,
    slug: 'khao-pad-sapparot',
    title: 'Khao Pad Sapparot (Cơm chiên dứa)',
    category: 'Cơm, mì & bún',
    summary: 'Cơm chiên quả dứa rực rỡ sắc vàng bột cà ri, tôm tươi giòn ngọt cùng hạt điều bùi béo.',
    prepMinutes: 10,
    cookMinutes: 12,
    totalMinutes: 22,
    preconditions: 'Dùng cơm nguội bảo quản lạnh để hạt cơm tơi săn, không bị nát.',
    imageQuery: 'Pineapple_fried_rice',
    ingredients: [
      { name: 'Cơm nguội bảo quản lạnh', quantity: '200', unit: 'g', role: 'MAIN' },
      { name: 'Tôm tươi', quantity: '100', unit: 'g', role: 'MAIN' },
      { name: 'Dứa cắt hạt lựu', quantity: '75', unit: 'g', role: 'SUPPORTING' },
      { name: 'Trứng gà', quantity: '1', unit: 'quả', role: 'MAIN' },
      { name: 'Hạt điều rang', quantity: '20', unit: 'g', role: 'SEASONING' },
      { name: 'Đậu Hà Lan & bột cà ri', quantity: '25', unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Chuẩn bị cơm tơi', instruction: 'Dùng cơm đã làm nguội nhanh và bảo quản lạnh, bóp nhẹ cho tơi. Cắt dứa hạt lựu, thấm bớt nước; băm hành tây, sơ chế tôm và rã đông đậu Hà Lan nếu cần.' },
      { order: 2, title: 'Xào tôm chín tới', instruction: 'Làm nóng dầu, xào hành tây khoảng 30 giây. Cho tôm vào xào 1–2 phút đến vừa chín, gạt sang bên.' },
      { order: 3, title: 'Chiên cơm với bột cà ri', instruction: 'Cho trứng vào đảo tơi, tiếp đến cho cơm và bột cà ri. Dùng sạn tách các cục cơm, đảo lửa vừa lớn 2–3 phút.' },
      { order: 4, title: 'Thêm dứa & đậu Hà Lan', instruction: 'Thêm đậu Hà Lan, dứa, nước mắm, nước tương và đường. Đảo thêm 2 phút để đậu chín và cơm nóng đều, bốc hơi rõ.' },
      { order: 5, title: 'Rắc hạt điều giòn bùi', instruction: 'Cho hạt điều vào cuối, đảo 15–20 giây rồi tắt bếp. Cơm đạt khi tơi, không đọng nước dứa; ăn ngay sau khi chiên.' }
    ]
  },
  {
    id: 25,
    slug: 'khao-pad-pu',
    title: 'Khao Pad Pu (Cơm chiên cua)',
    category: 'Cơm, mì & bún',
    summary: 'Cơm chiên thịt cua trắng muốt thơm lừng tỏi phi, hạt cơm săn dẻo vàng óng.',
    prepMinutes: 10,
    cookMinutes: 10,
    totalMinutes: 20,
    preconditions: 'Cua chín cho vào sau cùng đảo nhẹ để không bị vụn nát thịt cua.',
    imageQuery: 'Crab_fried_rice',
    ingredients: [
      { name: 'Cơm nguội bảo quản lạnh', quantity: '200', unit: 'g', role: 'MAIN' },
      { name: 'Thịt cua chín gỡ sạch vỏ', quantity: '75', unit: 'g', role: 'MAIN' },
      { name: 'Trứng gà', quantity: '1', unit: 'quả', role: 'MAIN' },
      { name: 'Tỏi băm & hành lá', quantity: '10', unit: 'g', role: 'SEASONING' },
      { name: 'Dưa chuột ăn kèm', quantity: '50', unit: 'g', role: 'SUPPORTING' },
      { name: 'Nước mắm & tiêu', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Kiểm tra thịt cua', instruction: 'Kiểm tra thịt cua đã gỡ hết mảnh vỏ. Làm tơi cơm lạnh, băm tỏi, thái hành lá và cắt dưa chuột để ăn kèm.' },
      { order: 2, title: 'Phi tỏi & chiên trứng', instruction: 'Làm nóng chảo với dầu, phi tỏi khoảng 15 giây đến thơm. Cho trứng vào, để se vài giây rồi đảo thành mẩu nhỏ.' },
      { order: 3, title: 'Đảo săn hạt cơm', instruction: 'Cho cơm vào, đảo lửa vừa lớn 2–3 phút, miết nhẹ các cục cơm để hạt tơi. Không ép quá mạnh làm nát hạt.' },
      { order: 4, title: 'Thêm thịt cua lật nhẹ', instruction: 'Rưới nước mắm, nước tương và đường quanh cơm, đảo nóng đều. Cho cua chín vào sau, lật nhẹ 1–2 phút để cua nóng mà không vụn nát.' },
      { order: 5, title: 'Rắc tiêu hành lá', instruction: 'Thêm hành lá và tiêu, đảo lần cuối rồi tắt bếp. Dọn cơm ngay với dưa chuột; hạt cơm phải nóng đều, không chỉ ấm bên ngoài.' }
    ]
  },
  {
    id: 26,
    slug: 'khao-man-gai',
    title: 'Khao Man Gai (Cơm gà kiểu Thái)',
    category: 'Cơm, mì & bún',
    summary: 'Cơm nấu mỡ gà bóng bẩy thơm gừng tỏi, đĩa thịt gà luộc mọng nước chấm tương đậu gừng cay.',
    prepMinutes: 15,
    cookMinutes: 35,
    totalMinutes: 50,
    preconditions: 'Dùng nước luộc gà béo ngọt để nấu cơm cho hạt cơm ngấm sâu hương vị.',
    imageQuery: 'Hainanese_chicken_rice',
    ingredients: [
      { name: 'Thịt gà', quantity: '300', unit: 'g', role: 'MAIN' },
      { name: 'Gạo tẻ', quantity: '90', unit: 'g', role: 'MAIN' },
      { name: 'Gừng & tỏi', quantity: '20', unit: 'g', role: 'SEASONING' },
      { name: 'Tương đậu vàng Thái', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Giấm gạo & nước tương', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Dưa chuột & ngò rí', quantity: '50', unit: 'g', role: 'SUPPORTING' }
    ],
    steps: [
      { order: 1, title: 'Luộc gà lấy nước béo', instruction: 'Cho gà vào nồi nhỏ với gừng và nước vừa ngập, đun sôi nhẹ rồi hạ lửa. Luộc khoảng 20–30 phút tùy miếng, đến khi chín tận phần dày nhất; giữ nước luộc để nấu cơm.' },
      { order: 2, title: 'Xào gạo bóng mỡ', instruction: 'Vo 90 g gạo, để ráo. Băm tỏi, phi với mỡ gà hoặc dầu, cho gạo vào đảo 1–2 phút đến khi hạt bóng nhẹ.' },
      { order: 3, title: 'Nấu cơm gà dẻo thơm', instruction: 'Chuyển gạo vào nồi nhỏ hoặc nồi cơm điện phù hợp. Thêm nước luộc theo tỷ lệ loại gạo đang dùng, nêm một ít muối; nấu chín và ủ thêm 10 phút. Nồi quá lớn có thể không nấu đều lượng gạo nhỏ.' },
      { order: 4, title: 'Pha sốt tương gừng đặc trưng', instruction: 'Hòa tương đậu vàng, nước tương, giấm và đường; thêm gừng, tỏi, ớt băm, pha 1–2 thìa canh nước luộc để sốt vừa sánh.' },
      { order: 5, title: 'Thái gà bày đĩa', instruction: 'Thái hoặc chặt gà, xếp lên cơm, thêm dưa chuột và ngò rí. Dọn sốt riêng; nước luộc còn lại có thể đun sôi, nêm nhẹ và dùng kèm.' }
    ]
  },
  {
    id: 27,
    slug: 'khao-soi-gai',
    title: 'Khao Soi Gai (Mì cà ri gà miền Bắc)',
    category: 'Cơm, mì & bún',
    summary: 'Mì cà ri gà Chiang Mai trứ danh với nước dùng cốt dừa sánh đậm, ăn kèm mì trứng chiên giòn rụm.',
    prepMinutes: 15,
    cookMinutes: 35,
    totalMinutes: 50,
    preconditions: 'Chia một phần mì trứng chiên giòn làm topping giòn tan bên trên tô mì.',
    imageQuery: 'Khao_soi',
    ingredients: [
      { name: 'Mì trứng tươi', quantity: '125', unit: 'g', role: 'MAIN' },
      { name: 'Đùi gà', quantity: '200', unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '200', unit: 'ml', role: 'SEASONING' },
      { name: 'Nước dùng', quantity: '200', unit: 'ml', role: 'SEASONING' },
      { name: 'Sốt Khao Soi', quantity: '18', unit: 'g', role: 'SEASONING' },
      { name: 'Cải chua & hành tím chanh', quantity: '50', unit: 'g', role: 'SUPPORTING' }
    ],
    steps: [
      { order: 1, title: 'Chia mì luộc & mì chiên', instruction: 'Chừa khoảng 15–20 g mì trứng để chiên, phần còn lại để luộc. Gà thấm khô; cải chua rửa bớt mặn, vắt ráo, cắt nhỏ; thái hành tím và cắt chanh.' },
      { order: 2, title: 'Xào sốt cà ri Khao Soi', instruction: 'Xào sốt Khao Soi với dầu ở lửa vừa nhỏ 1 phút. Cho gà vào đảo săn, thêm nước cốt dừa và 200 ml nước dùng.' },
      { order: 3, title: 'Nấu đùi gà mềm ngấm sốt', instruction: 'Đun sôi nhẹ rồi hạ lửa, nấu 25–35 phút tùy kích thước đùi gà đến chín mềm. Nêm nước mắm, đường; thêm nước nóng nếu sốt cạn quá nhiều.' },
      { order: 4, title: 'Chiên mì giòn rụm', instruction: 'Chiên phần mì để riêng trong dầu khoảng 170°C đến vàng giòn, thường dưới 1 phút, rồi để ráo. Luộc phần mì còn lại theo bao bì, xả ráo và cho vào tô.' },
      { order: 5, title: 'Chan nước cà ri nóng hổi', instruction: 'Xếp gà lên mì, chan nước cà ri nóng, thêm mì chiên. Dọn cải chua, hành tím và chanh riêng để điều chỉnh vị khi ăn.' }
    ]
  },
  {
    id: 28,
    slug: 'rad-na',
    title: 'Rad Na (Hủ tiếu sốt sánh)',
    category: 'Cơm, mì & bún',
    summary: 'Bánh phở áp chảo xém thơm ngập trong nước sốt sánh mịn thịt heo và cải làn giòn ngọt.',
    prepMinutes: 10,
    cookMinutes: 12,
    totalMinutes: 22,
    preconditions: 'Chan sốt lên bánh phở ngay khi vừa nấu xong để cải làn còn xanh giòn.',
    imageQuery: 'Rat_na',
    ingredients: [
      { name: 'Bánh phở tươi bản rộng', quantity: '175', unit: 'g', role: 'MAIN' },
      { name: 'Thịt heo thái mỏng', quantity: '125', unit: 'g', role: 'MAIN' },
      { name: 'Cải làn', quantity: '100', unit: 'g', role: 'SUPPORTING' },
      { name: 'Bột bắp pha nước', quantity: '0.75', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước dùng', quantity: '225', unit: 'ml', role: 'SEASONING' },
      { name: 'Tương đen & tương đậu', quantity: '1', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế & pha bột bắp', instruction: 'Tách sợi bánh phở, thái thịt mỏng, băm tỏi; cắt cải làn và để riêng thân với lá. Hòa bột bắp với 1,5 thìa canh nước nguội, khuấy tan.' },
      { order: 2, title: 'Áp chảo bánh phở thơm', instruction: 'Dùng khoảng nửa lượng dầu xào bánh phở với nước tương đen trên lửa lớn 1–2 phút cho nóng thơm. Chuyển bánh phở ra đĩa sâu lòng.' },
      { order: 3, title: 'Xào thịt heo & thân cải', instruction: 'Cho dầu còn lại vào chảo, phi tỏi rồi xào thịt 3–4 phút đến chín. Thêm thân cải, 225 ml nước dùng và các gia vị còn lại trừ bột bắp.' },
      { order: 4, title: 'Rót bột tạo độ sánh bóng', instruction: 'Đun sôi nhẹ 2–3 phút, cho lá cải vào. Khuấy lại chén bột, rót từng ít vào chảo đang sôi, vừa rót vừa đảo; dừng khi sốt sánh vừa, không cần dùng hết nếu đã đủ đặc.' },
      { order: 5, title: 'Chan sốt nóng lên bánh phở', instruction: 'Đun thêm khoảng 30–60 giây để bột chín và sốt bóng. Chan ngay lên bánh phở, dùng nóng khi cải còn xanh và sợi chưa ngấm mềm quá.' }
    ]
  },
  {
    id: 29,
    slug: 'pad-woon-sen',
    title: 'Pad Woon Sen (Miến xào kiểu Thái)',
    category: 'Cơm, mì & bún',
    summary: 'Miến xào tơi mềm óng ả cùng thịt gà, bắp cải ngọt và trứng đảo thơm phức.',
    prepMinutes: 10,
    cookMinutes: 10,
    totalMinutes: 20,
    preconditions: 'Dùng ngay để sợi miến không bị vón cục khi nguội.',
    imageQuery: 'Phat_wun_sen',
    ingredients: [
      { name: 'Miến khô', quantity: '75', unit: 'g', role: 'MAIN' },
      { name: 'Thịt gà thái mỏng', quantity: '100', unit: 'g', role: 'MAIN' },
      { name: 'Trứng gà', quantity: '1', unit: 'quả', role: 'MAIN' },
      { name: 'Bắp cải & cà rốt', quantity: '100', unit: 'g', role: 'SUPPORTING' },
      { name: 'Dầu hào & nước tương', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Hành lá tỏi băm', quantity: '10', unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Ngâm miến & pha sốt', instruction: 'Ngâm miến theo bao bì đến mềm, cắt ngắn khoảng 15 cm rồi để ráo. Thái gà mỏng, bắp cải và cà rốt sợi nhỏ; băm tỏi, cắt hành lá.' },
      { order: 2, title: 'Xào gà chín', instruction: 'Hòa dầu hào, nước tương, nước mắm và đường với 2 thìa canh nước. Làm nóng dầu, phi tỏi rồi xào gà 3–4 phút đến chín.' },
      { order: 3, title: 'Đảo trứng & rau củ', instruction: 'Gạt gà sang bên, cho trứng vào đảo tơi. Thêm cà rốt và bắp cải, xào 1–2 phút cho rau bắt đầu mềm.' },
      { order: 4, title: 'Nâng miến đảo tơi sợi', instruction: 'Cho miến và chén sốt vào, dùng đũa kết hợp sạn nâng và trộn sợi 2–3 phút. Thêm nước từng thìa nếu miến còn cứng, không để sợi ngâm trong nhiều nước.' },
      { order: 5, title: 'Rắc hành lá dùng ngay', instruction: 'Khi miến trong, mềm và sốt gần ráo, cho hành lá vào đảo nhanh rồi tắt bếp. Dùng ngay để miến không kết thành khối khi nguội.' }
    ]
  },
  {
    id: 30,
    slug: 'khanom-jeen-nam-ya',
    title: 'Khanom Jeen Nam Ya (Bún cà ri cá)',
    category: 'Cơm, mì & bún',
    summary: 'Tô bún tươi chan ngập sốt cà ri cá giã nhuyễn sánh đậm đà nước cốt dừa, ăn kèm rau sống mát lành.',
    prepMinutes: 15,
    cookMinutes: 20,
    totalMinutes: 35,
    preconditions: 'Gỡ sạch toàn bộ xương dăm của cá trước khi đem giã nhuyễn.',
    imageQuery: 'Khanom_chin',
    ingredients: [
      { name: 'Bún tươi', quantity: '225', unit: 'g', role: 'MAIN' },
      { name: 'Thịt cá trắng', quantity: '125', unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '175', unit: 'ml', role: 'SEASONING' },
      { name: 'Sốt Nam Ya', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Giá đỗ & đậu đũa', quantity: '100', unit: 'g', role: 'SUPPORTING' },
      { name: 'Húng quế Thái', quantity: '15', unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Luộc cá & giã nhuyễn thịt', instruction: 'Kiểm tra cá sạch xương, luộc nhẹ với 175 ml nước khoảng 5–8 phút tùy độ dày đến chín. Gỡ kỹ xương lần nữa, giã hoặc xay thịt cá; giữ nước luộc.' },
      { order: 2, title: 'Chần nhanh giá đậu đũa', instruction: 'Đậu đũa cắt khúc, chần trong nước sôi đến vừa chín; chần nhanh giá rồi để ráo. Nhặt húng quế, rửa sạch và để riêng.' },
      { order: 3, title: 'Xào sốt Nam Ya với cá', instruction: 'Đun dầu, xào sốt nam ya lửa vừa nhỏ khoảng 1 phút. Thêm cá giã vào đảo đều, tiếp đến cho nước luộc cá và nước cốt dừa.' },
      { order: 4, title: 'Nấu sốt cá nhỏ lửa', instruction: 'Nấu lửa nhỏ 10–15 phút, khuấy thỉnh thoảng để cá không lắng và khét đáy. Nêm nước mắm, đường; thêm chút nước nếu sốt đặc quá.' },
      { order: 5, title: 'Chan bún thưởng thức', instruction: 'Làm nóng bún bằng cách trụng nhanh nếu cần, để ráo rồi xếp vào tô. Chan sốt cá nóng, thêm giá, đậu đũa và húng quế; dùng ngay.' }
    ]
  },

  // --- PHẦN 4: GỎI RAU VÀ MÓN ĂN NHẸ ---
  {
    id: 31,
    slug: 'som-tam-thai',
    title: 'Som Tam Thai (Gỏi đu đủ kiểu Thái)',
    category: 'Gỏi & món ăn nhẹ',
    summary: 'Món gỏi đu đủ giã cối huyền thoại hòa quyện bốn vị chua cay mặn ngọt cực kỳ bắt vị.',
    prepMinutes: 15,
    cookMinutes: 0,
    totalMinutes: 15,
    preconditions: 'Dùng ngay sau khi trộn để sợi đu đủ luôn giữ trọn độ giòn mát.',
    imageQuery: 'Green_papaya_salad',
    ingredients: [
      { name: 'Đu đủ xanh bào sợi', quantity: '150', unit: 'g', role: 'MAIN' },
      { name: 'Cà chua bi / cà chua múi', quantity: '40', unit: 'g', role: 'SUPPORTING' },
      { name: 'Đậu đũa', quantity: '30', unit: 'g', role: 'SUPPORTING' },
      { name: 'Tôm khô', quantity: '8', unit: 'g', role: 'SUPPORTING' },
      { name: 'Đậu phộng rang', quantity: '12', unit: 'g', role: 'SEASONING' },
      { name: 'Tỏi & ớt', quantity: '2', unit: 'tép', role: 'SEASONING' },
      { name: 'Nước mắm, cốt chanh & đường thốt nốt', quantity: '2', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Bào sợi đu đủ giòn', instruction: 'Đu đủ gọt vỏ, bỏ hạt, bào sợi; ngâm nước lạnh 5–10 phút rồi để thật ráo. Cà chua bổ múi, đậu đũa cắt khúc 3 cm; rửa nhanh tôm khô nếu quá mặn.' },
      { order: 2, title: 'Giã tỏi ớt đường thốt nốt', instruction: 'Cho tỏi và ớt vào cối, giã dập vừa. Thêm đường, nước mắm và cốt chanh, dùng chày khuấy nhẹ cho đường tan.' },
      { order: 3, title: 'Dằn nhẹ đậu đũa cà chua', instruction: 'Thêm đậu đũa, giã nhẹ vài cái để hơi dập; cho cà chua và tôm khô vào, tiếp tục dằn nhẹ cho ra một ít nước.' },
      { order: 4, title: 'Đảo sợi đu đủ ngấm sốt', instruction: 'Cho đu đủ vào, một tay dùng thìa đảo từ dưới lên, tay kia dùng chày dằn nhẹ khoảng 1 phút để sốt phủ đều. Không giã nát sợi.' },
      { order: 5, title: 'Rắc đậu phộng thưởng thức', instruction: 'Nếm lại độ chua mặn ngọt, cho ra đĩa và rắc đậu phộng ngay trước khi ăn. Dùng ngay để đu đủ giữ độ giòn.' }
    ]
  },
  {
    id: 32,
    slug: 'yam-woon-sen',
    title: 'Yam Woon Sen (Gỏi miến tôm thịt)',
    category: 'Gỏi & món ăn nhẹ',
    summary: 'Gỏi miến trộn tôm tươi và thịt heo băm cay nồng, đậm đà nước mắm chanh tỏi ớt.',
    prepMinutes: 15,
    cookMinutes: 5,
    totalMinutes: 20,
    preconditions: 'Trộn khi miến còn ấm để từng sợi miến ngấm sâu gia vị sốt.',
    imageQuery: 'Yam_wun_sen',
    ingredients: [
      { name: 'Miến khô', quantity: '50', unit: 'g', role: 'MAIN' },
      { name: 'Tôm tươi', quantity: '90', unit: 'g', role: 'MAIN' },
      { name: 'Thịt heo băm', quantity: '60', unit: 'g', role: 'MAIN' },
      { name: 'Hành tây & cà chua', quantity: '50', unit: 'g', role: 'SUPPORTING' },
      { name: 'Cần tây & ngò rí', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm, cốt chanh & ớt băm', quantity: '2', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế miến & tôm thịt', instruction: 'Ngâm miến mềm, cắt ngắn; hành tây thái mỏng, cà chua bổ múi, cần tây và ngò rí cắt khúc. Tôm bỏ chỉ, để riêng thịt băm.' },
      { order: 2, title: 'Luộc miến & tôm', instruction: 'Luộc miến theo bao bì đến vừa chín, vớt để ráo. Luộc tôm riêng khoảng 2–3 phút tùy cỡ đến thịt đục hoàn toàn, vớt ra.' },
      { order: 3, title: 'Nấu chín thịt băm', instruction: 'Cho thịt băm vào nồi nhỏ với 2–3 thìa canh nước, khuấy tơi, nấu 3–4 phút đến chín hoàn toàn; giữ lại một ít nước thịt.' },
      { order: 4, title: 'Trộn miến với sốt chua cay', instruction: 'Hòa nước mắm, cốt chanh, đường, tỏi và ớt băm. Trộn miến còn ấm với sốt và 1–2 thìa canh nước thịt nếu cần để sợi không khô.' },
      { order: 5, title: 'Thêm tôm thịt & rau thơm', instruction: 'Thêm tôm, thịt, hành tây, cà chua và rau thơm, đảo nhẹ cho đều. Nếm lại rồi dùng ngay, không để gỏi đã trộn lâu ở nhiệt độ phòng.' }
    ]
  },
  {
    id: 33,
    slug: 'larb-gai',
    title: 'Larb Gai (Gỏi gà băm thính gạo)',
    category: 'Gỏi & món ăn nhẹ',
    summary: 'Gỏi gà băm trộn thính gạo rang giòn thơm lừng, the cay ớt bột và thơm ngát lá bạc hà.',
    prepMinutes: 10,
    cookMinutes: 8,
    totalMinutes: 18,
    preconditions: 'Thêm rau thơm sau cùng để giữ nguyên độ tươi xanh, không bị nhũn.',
    imageQuery: 'Larb',
    ingredients: [
      { name: 'Thịt gà băm', quantity: '150', unit: 'g', role: 'MAIN' },
      { name: 'Thính gạo rang', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Hành tím thái mỏng', quantity: '1.5', unit: 'củ', role: 'SUPPORTING' },
      { name: 'Bạc hà, ngò rí, hành lá', quantity: '20', unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm & cốt chanh', quantity: '1.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Ớt bột', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Thái rau thơm & chuẩn bị thính', instruction: 'Thái hành tím thật mỏng, cắt hành lá và ngò rí, nhặt lá bạc hà. Nếu tự làm thính, rang gạo sống lửa nhỏ đến vàng thơm, để nguội rồi giã mịn; đong đúng lượng cần dùng.' },
      { order: 2, title: 'Nấu chín gà băm tơi', instruction: 'Cho gà băm vào nồi hoặc chảo nhỏ với 2 thìa canh nước. Đun lửa vừa, dùng thìa tách thịt tơi, nấu 4–5 phút đến chín hoàn toàn.' },
      { order: 3, title: 'Nêm vị chua cay mặn', instruction: 'Tắt bếp và để bớt nóng khoảng 1 phút. Thêm nước mắm, cốt chanh, ớt bột và đường nếu dùng; trộn kỹ.' },
      { order: 4, title: 'Trộn thính gạo rang thơm', instruction: 'Cho thính và hành tím vào, đảo để thấm. Nếu hỗn hợp quá khô, thêm 1 thìa canh nước ấm; món chỉ cần ẩm nhẹ, không ngập sốt.' },
      { order: 5, title: 'Thêm rau thơm tươi', instruction: 'Thêm hành lá, ngò và bạc hà sau cùng để rau không bị nhũn. Dọn với rau sống đã rửa sạch hoặc cơm chuẩn bị riêng, dùng khi còn ấm.' }
    ]
  },
  {
    id: 34,
    slug: 'nam-tok-moo',
    title: 'Nam Tok Moo (Gỏi thịt heo nướng)',
    category: 'Gỏi & món ăn nhẹ',
    summary: 'Món gỏi thác nước trứ danh: thịt nạc nọng nướng xém thái lát mỏng quyện thính gạo thơm phức.',
    prepMinutes: 10,
    cookMinutes: 15,
    totalMinutes: 25,
    preconditions: 'Dùng nước thịt nướng chín tiết ra để pha sốt thính cho ngọt đậm đà.',
    imageQuery: 'Nam_tok',
    ingredients: [
      { name: 'Nạc vai heo', quantity: '175', unit: 'g', role: 'MAIN' },
      { name: 'Hành tím thái mỏng', quantity: '1.5', unit: 'củ', role: 'SUPPORTING' },
      { name: 'Thính gạo rang', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Bạc hà, ngò rí, hành lá', quantity: '20', unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm & cốt chanh', quantity: '1.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Ớt bột', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Ướp thịt nướng sơ', instruction: 'Thấm khô thịt, xẻ bớt nếu dày hơn 2 cm. Ướp với nước tương và tiêu trong tủ lạnh 30 phút; thái mỏng hành tím, cắt hành lá và nhặt rau thơm.' },
      { order: 2, title: 'Nướng thịt chín mọng', instruction: 'Nướng hoặc áp chảo thịt ở lửa vừa, trở đều đến chín hoàn toàn. Với miếng dày 1–2 cm, thường cần khoảng 10–15 phút; kiểm tra giữa miếng trước khi lấy ra.' },
      { order: 3, title: 'Thái lát thịt nghỉ', instruction: 'Để thịt nghỉ 5 phút rồi thái mỏng ngang thớ. Giữ lại phần nước thịt chín tiết ra trên đĩa, không dùng nước ướp sống.' },
      { order: 4, title: 'Trộn sốt thính chanh ớt', instruction: 'Trộn nước mắm, chanh, ớt bột và thính với 1 thìa canh nước ấm hoặc nước thịt chín. Cho thịt và hành tím vào đảo đều.' },
      { order: 5, title: 'Bày đĩa dùng ngay', instruction: 'Thêm hành lá, bạc hà và ngò, trộn nhẹ rồi dọn ngay. Món đạt khi thịt mềm, có vị chua cay và mùi thính rõ, rau thơm chưa héo nhũn.' }
    ]
  },
  {
    id: 35,
    slug: 'yam-nua',
    title: 'Yam Nua (Gỏi bò kiểu Thái)',
    category: 'Gỏi & món ăn nhẹ',
    summary: 'Bò áp chảo mềm mọng thái lát trộn cùng dưa chuột, cà chua mọng nước và sốt chanh ớt.',
    prepMinutes: 10,
    cookMinutes: 8,
    totalMinutes: 18,
    preconditions: 'Áp chảo bò vừa chín tới để thịt mềm ngọt, không bị dai.',
    imageQuery: 'Thai_beef_salad',
    ingredients: [
      { name: 'Bò bít tết thái miếng', quantity: '150', unit: 'g', role: 'MAIN' },
      { name: 'Dưa chuột & cà chua', quantity: '100', unit: 'g', role: 'SUPPORTING' },
      { name: 'Hành tây thái mỏng', quantity: '0.25', unit: 'củ', role: 'SUPPORTING' },
      { name: 'Xà lách, bạc hà, ngò rí', quantity: '40', unit: 'g', role: 'SUPPORTING' },
      { name: 'Nước mắm & cốt chanh', quantity: '1.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Tỏi & ớt băm', quantity: '10', unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế rau củ giòn', instruction: 'Thấm khô bò, để nguyên miếng dày khoảng 1–2 cm. Dưa chuột thái lát, cà chua bổ múi, hành tây thái mỏng; rửa sạch xà lách và rau thơm.' },
      { order: 2, title: 'Pha sốt chanh ớt tỏi', instruction: 'Hòa nước mắm, cốt chanh và đường cho tan, thêm tỏi ớt băm. Nếm trước, để riêng, chưa trộn vào rau.' },
      { order: 3, title: 'Áp chảo thịt bò', instruction: 'Thoa dầu lên bò, làm nóng chảo rồi áp chảo mỗi mặt khoảng 2–4 phút tùy độ dày và độ chín mong muốn. Miếng bò nguyên khối có thể kiểm tra tâm đạt ít nhất 63°C, sau đó nghỉ tối thiểu 3 phút.' },
      { order: 4, title: 'Thái lát bò & trộn gỏi', instruction: 'Thái bò ngang thớ thành lát mỏng. Trộn bò còn hơi ấm với dưa chuột, cà chua, hành tây và phần sốt; đảo nhẹ để tránh rau dập.' },
      { order: 5, title: 'Trình bày trên xà lách', instruction: 'Lót xà lách, cho gỏi lên trên, thêm bạc hà và ngò. Dùng ngay sau khi trộn để rau còn giòn và thịt không bị ngâm lâu trong chanh.' }
    ]
  },
  {
    id: 36,
    slug: 'yam-mamuang',
    title: 'Yam Mamuang (Gỏi xoài xanh)',
    category: 'Gỏi & món ăn nhẹ',
    summary: 'Xoài xanh bào sợi giòn sần sật trộn tôm khô dẻo bùi, nước mắm đường thốt nốt và đậu phộng rang.',
    prepMinutes: 15,
    cookMinutes: 0,
    totalMinutes: 15,
    preconditions: 'Thử độ chua của xoài trước để cân đối lượng chanh và đường thốt nốt.',
    imageQuery: 'Green_mango_salad',
    ingredients: [
      { name: 'Xoài xanh bào sợi', quantity: '150', unit: 'g', role: 'MAIN' },
      { name: 'Tôm khô ngâm mềm', quantity: '10', unit: 'g', role: 'SUPPORTING' },
      { name: 'Đậu phộng rang', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Hành tím thái mỏng', quantity: '1.5', unit: 'củ', role: 'SUPPORTING' },
      { name: 'Nước mắm & đường thốt nốt', quantity: '1.5', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Ớt băm & rau thơm', quantity: '10', unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Bào sợi xoài xanh', instruction: 'Gọt xoài, bào thành sợi, thử trước độ chua của xoài. Thái hành tím mỏng; ngâm tôm khô trong nước ấm 5–10 phút cho mềm rồi để ráo.' },
      { order: 2, title: 'Chuẩn bị tôm khô & đậu phộng', instruction: 'Giã hoặc băm sơ tôm khô nếu con lớn. Giã dập đậu phộng rang, nhặt rau thơm, rửa và để ráo.' },
      { order: 3, title: 'Hòa sốt nước mắm thốt nốt', instruction: 'Hòa đường thốt nốt với nước mắm; nếu đường cứng, thêm 1 thìa cà phê nước ấm. Cho ớt vào, thêm cốt chanh từng ít, giảm hoặc bỏ chanh nếu xoài đã rất chua.' },
      { order: 4, title: 'Trộn nhẹ tay thấm sốt', instruction: 'Trộn xoài, hành tím và tôm khô với sốt khoảng 30–60 giây. Chờ thêm 1–2 phút rồi nếm lại, tránh bóp mạnh làm sợi xoài mềm.' },
      { order: 5, title: 'Rắc đậu phộng thưởng thức', instruction: 'Cho ra đĩa, rắc đậu phộng và rau thơm cuối cùng. Dùng ngay; gỏi ngon khi sợi xoài giòn, sốt cân bằng và không quá nhiều nước.' }
    ]
  },
  {
    id: 37,
    slug: 'tod-man-pla',
    title: 'Tod Man Pla (Chả cá cà ri đỏ)',
    category: 'Gỏi & món ăn nhẹ',
    summary: 'Chả cá dai giòn thơm nức sốt cà ri đỏ và lá chanh chỉ, chấm tương ớt ngọt.',
    prepMinutes: 15,
    cookMinutes: 10,
    totalMinutes: 25,
    preconditions: 'Quết cá lạnh cùng một chiều 3-5 phút cho chả cá đạt độ dai giòn chuẩn vị.',
    imageQuery: 'Fishcake',
    ingredients: [
      { name: 'Cá thác lác xay lạnh', quantity: '175', unit: 'g', role: 'MAIN' },
      { name: 'Trứng gà', quantity: '0.5', unit: 'quả', role: 'MAIN' },
      { name: 'Đậu đũa thái mỏng', quantity: '30', unit: 'g', role: 'SUPPORTING' },
      { name: 'Sốt cà ri đỏ & lá chanh chỉ', quantity: '10', unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm & đường', quantity: '1', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Dầu chiên', quantity: '150', unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Chuẩn bị cá lạnh', instruction: 'Giữ cá xay lạnh đến lúc làm. Đánh tan trứng, lấy khoảng 25 g; thái đậu đũa lát mỏng 2–3 mm, bỏ gân và thái chỉ lá chanh.' },
      { order: 2, title: 'Quết chả cá dẻo quánh', instruction: 'Trộn cá với trứng, sốt cà ri đỏ, nước mắm và đường. Dùng thìa hoặc chày quết cùng một chiều 3–5 phút đến khi hỗn hợp dẻo, dính thành khối.' },
      { order: 3, title: 'Tạo hình miếng dẹt', instruction: 'Trộn đậu đũa và lá chanh vào sau. Thoa ít dầu lên tay, chia hỗn hợp thành 4–5 miếng dẹt, dày khoảng 1 cm.' },
      { order: 4, title: 'Chiên vàng 2 mặt', instruction: 'Đun dầu khoảng 165–170°C, thả từng miếng vào chiên, tránh xếp chật. Chiên khoảng 2–3 phút mỗi mặt tùy kích thước, trở khi mặt dưới đã se vàng.' },
      { order: 5, title: 'Ráo dầu & chấm tương ớt', instruction: 'Vớt ra khi chả vàng đều, phần giữa chín chắc, không còn nhão sống. Để ráo trên vỉ, dùng nóng với tương ớt ngọt chuẩn bị theo phần gia vị.' }
    ]
  },
  {
    id: 38,
    slug: 'poh-pia-tod',
    title: 'Poh Pia Tod (Chả giò kiểu Thái)',
    category: 'Gỏi & món ăn nhẹ',
    summary: 'Chả giò chiên vàng giòn rụm với nhân thịt heo băm, nấm hương và miến thơm tiêu.',
    prepMinutes: 20,
    cookMinutes: 15,
    totalMinutes: 35,
    preconditions: 'Nhân phải để thật nguội trước khi cuốn để vỏ bánh tráng không bị rách.',
    imageQuery: 'Spring_roll',
    ingredients: [
      { name: 'Bánh tráng cuốn chả giò', quantity: '8', unit: 'cái', role: 'MAIN' },
      { name: 'Thịt heo băm', quantity: '75', unit: 'g', role: 'MAIN' },
      { name: 'Miến khô ngâm mềm', quantity: '25', unit: 'g', role: 'SUPPORTING' },
      { name: 'Bắp cải & cà rốt', quantity: '75', unit: 'g', role: 'SUPPORTING' },
      { name: 'Nấm hương ngâm mềm', quantity: '2', unit: 'tai', role: 'SUPPORTING' },
      { name: 'Dầu hào & nước tương', quantity: '1', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế nguyên liệu nhân', instruction: 'Ngâm miến mềm, cắt đoạn 3–4 cm; ngâm nấm hương rồi thái nhỏ. Thái sợi bắp cải và cà rốt, băm tỏi, để tất cả thật ráo.' },
      { order: 2, title: 'Xào nhân chín ráo nước', instruction: 'Phi tỏi với dầu xào, cho thịt băm vào đảo tơi 3–4 phút đến chín. Thêm nấm và rau, xào 2 phút rồi cho miến cùng nước tương, dầu hào, tiêu vào.' },
      { order: 3, title: 'Để nhân nguội hoàn toàn', instruction: 'Đảo đến khi rau chín và nhân khô, không còn nước đọng. Trải nhân ra đĩa cho nguội hoàn toàn; nhân nóng hoặc ướt dễ làm rách vỏ.' },
      { order: 4, title: 'Cuốn chả giò chặt tay', instruction: 'Chia nhân thành 7–8 phần nhỏ. Cuốn chặt vừa tay, gấp hai mép vào trong, dán mép bằng bột mì hòa ít nước; xử lý vỏ theo hướng dẫn của loại đã chọn.' },
      { order: 5, title: 'Chiên vàng giòn', instruction: 'Chiên trong dầu khoảng 165–170°C theo từng mẻ, 4–6 phút đến vàng giòn. Vớt lên vỉ cho ráo; ăn nóng với tương ớt ngọt chuẩn bị riêng.' }
    ]
  },
  {
    id: 39,
    slug: 'pak-boong-fai-daeng',
    title: 'Pak Boong Fai Daeng (Rau muống xào kiểu Thái)',
    category: 'Gỏi & món ăn nhẹ',
    summary: 'Rau muống xào lửa lớn giữ trọn độ giòn xanh ngát, ngậy thơm tương đậu vàng và tỏi đập.',
    prepMinutes: 5,
    cookMinutes: 5,
    totalMinutes: 10,
    preconditions: 'Xào thật nhanh trên chảo lửa cực lớn để cọng rau muống giòn ngọt.',
    imageQuery: 'Water_spinach',
    ingredients: [
      { name: 'Rau muống nhặt sạch', quantity: '200', unit: 'g', role: 'MAIN' },
      { name: 'Tỏi đập dập', quantity: '3', unit: 'tép', role: 'SEASONING' },
      { name: 'Ớt tươi', quantity: '1', unit: 'quả', role: 'SEASONING' },
      { name: 'Dầu hào & tương đậu vàng', quantity: '1', unit: 'thìa canh', role: 'SEASONING' },
      { name: 'Nước tương & đường', quantity: '0.5', unit: 'thìa canh', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Nhặt rau & pha sốt xào', instruction: 'Nhặt rau muống, bỏ cọng già, cắt khúc khoảng 5 cm. Rửa kỹ và để ráo; đập dập tỏi, cắt hoặc đập ớt.' },
      { order: 2, title: 'Chuẩn bị chén sốt tương', instruction: 'Hòa dầu hào, tương đậu vàng, nước tương, đường với lượng nước đã ghi. Chuẩn bị sẵn chén sốt cạnh bếp vì món xào rất nhanh.' },
      { order: 3, title: 'Làm nóng chảo lửa lớn', instruction: 'Làm nóng chảo ở lửa lớn rồi cho dầu. Thêm tỏi và ớt, đảo khoảng 10–15 giây đến thơm, chưa vàng đậm.' },
      { order: 4, title: 'Xào cọng trước lá sau', instruction: 'Cho phần cọng rau vào đảo khoảng 20–30 giây, tiếp đến cho lá và toàn bộ chén sốt. Đảo nhanh 45–60 giây để rau chín đều.' },
      { order: 5, title: 'Trút ra đĩa dùng ngay', instruction: 'Khi lá vừa xẹp, cọng chuyển xanh và còn giòn, tắt bếp ngay. Trút cả rau và nước sốt ra đĩa; không giữ trong chảo nóng lâu vì rau sẽ mềm và sẫm màu.' }
    ]
  },
  {
    id: 40,
    slug: 'khai-jiao',
    title: 'Khai Jiao (Trứng chiên phồng kiểu Thái)',
    category: 'Gỏi & món ăn nhẹ',
    summary: 'Món trứng chiên phồng xốp viền giòn tan thơm nức mùi nước mắm và hành hoa.',
    prepMinutes: 5,
    cookMinutes: 5,
    totalMinutes: 10,
    preconditions: 'Đánh trứng tạo nhiều bọt khí và chiên trong dầu sôi để trứng phồng xốp tối đa.',
    imageQuery: 'Khai_chiao',
    ingredients: [
      { name: 'Trứng gà', quantity: '2', unit: 'quả', role: 'MAIN' },
      { name: 'Hành lá băm', quantity: '1', unit: 'nhánh', role: 'SEASONING' },
      { name: 'Thịt heo băm', quantity: '25', unit: 'g', role: 'SUPPORTING' },
      { name: 'Nước mắm & tiêu', quantity: '0.5', unit: 'thìa cà phê', role: 'SEASONING' },
      { name: 'Dầu ăn chiên phồng', quantity: '50', unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Đập trứng & nêm gia vị', instruction: 'Băm nhỏ hành lá; nếu dùng thịt heo, tách thật tơi. Đập 2 trứng vào tô, thêm nước mắm, tiêu, hành và thịt băm.' },
      { order: 2, title: 'Đánh bông bọt khí', instruction: 'Đánh mạnh 30–45 giây để lòng trắng, lòng đỏ và thịt quyện đều, có ít bọt trên mặt. Dùng chảo nhỏ sâu lòng để lượng dầu đủ tạo độ phồng.' },
      { order: 3, title: 'Rót trứng từ trên cao', instruction: 'Đun dầu ở lửa vừa lớn đến khoảng 170°C. Rót trứng vào giữa chảo từ độ cao vừa phải khoảng 10 cm, cẩn thận dầu bắn.' },
      { order: 4, title: 'Chiên vàng giòn viền', instruction: 'Hạ lửa vừa, chiên 1,5–2 phút đến mặt dưới vàng và mép giòn. Lật nhẹ bằng sạn, chiên mặt còn lại 1–2 phút; nếu có thịt, kiểm tra phần giữa đã chín hoàn toàn.' },
      { order: 5, title: 'Ráo dầu ăn nóng', instruction: 'Vớt trứng lên vỉ hoặc giấy thấm dầu trong 30–60 giây. Dùng nóng khi trứng còn phồng và giòn cạnh, không đậy kín khi vừa chiên xong.' }
    ]
  },

  // --- PHẦN 5: MÓN NGỌT VÀ TRÁNG MIỆNG ---
  {
    id: 41,
    slug: 'khao-niao-mamuang',
    title: 'Khao Niao Mamuang (Xôi xoài)',
    category: 'Tráng miệng & món ngọt',
    summary: 'Món tráng miệng lừng danh: xôi nếp dẻo thơm ngấm cốt dừa béo ngọt ăn cùng lát xoài chín mọng.',
    prepMinutes: 15,
    cookMinutes: 30,
    totalMinutes: 45,
    preconditions: 'Ngâm gạo nếp 4-6 giờ trước khi hấp để xôi chín dẻo mềm không bị sượng.',
    imageQuery: 'Mango_sticky_rice',
    ingredients: [
      { name: 'Gạo nếp', quantity: '60', unit: 'g', role: 'MAIN' },
      { name: 'Xoài chín', quantity: '0.5', unit: 'quả', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '60', unit: 'ml', role: 'SEASONING' },
      { name: 'Đường & muối', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Mè rang thơm', quantity: '5', unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Ngâm & hấp nếp dẻo', instruction: 'Vo 60 g nếp, ngâm nước 4–6 giờ rồi để ráo. Hấp trong xửng lót vải hoặc lá sạch khoảng 25–35 phút, đảo giữa chừng; hạt phải mềm, không còn lõi trắng cứng.' },
      { order: 2, title: 'Nấu nước cốt dừa ngâm xôi', instruction: 'Đun nhẹ 45 ml nước cốt dừa với 12 g đường và phần lớn muối cho tan, không để sôi trào. Giữ lại 15 ml cốt dừa, 3 g đường và chút muối để làm sốt mặt.' },
      { order: 3, title: 'Ủ nếp hút đẫm nước dừa', instruction: 'Cho nếp còn nóng vào tô nhỏ, rưới hỗn hợp cốt dừa ấm, trộn nhẹ rồi đậy khoảng 15–20 phút để nếp hút nước; không nấu lại trên bếp.' },
      { order: 4, title: 'Nấu sốt cốt dừa rưới mặt', instruction: 'Hòa bột gạo với 1 thìa cà phê nước. Đun phần cốt dừa, đường, muối còn lại trong nồi thật nhỏ, cho bột vào khuấy 30–60 giây đến hơi sánh; thêm ít nước nếu quá đặc.' },
      { order: 5, title: 'Gọt xoài & rắc mè', instruction: 'Gọt và thái xoài. Xếp một phần xôi cùng xoài, rưới sốt và rắc mè; dùng trong ngày, bảo quản lạnh phần có cốt dừa nếu chưa ăn ngay.' }
    ]
  },
  {
    id: 42,
    slug: 'tub-tim-grob',
    title: 'Tub Tim Grob (Chè củ năng hạt lựu)',
    category: 'Tráng miệng & món ngọt',
    summary: 'Chè sương sa hạt lựu củ năng đỏ thắm giòn sần sật, chan ngập nước cốt dừa thơm lá dứa và đá lạnh.',
    prepMinutes: 15,
    cookMinutes: 10,
    totalMinutes: 25,
    preconditions: 'Ăn ngay sau khi chan nước cốt dừa để lớp bột năng giữ trọn độ giòn dẻo.',
    imageQuery: 'Thapthim_krop',
    ingredients: [
      { name: 'Củ năng gọt hạt lựu', quantity: '50', unit: 'g', role: 'MAIN' },
      { name: 'Bột năng', quantity: '20', unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '60', unit: 'ml', role: 'SEASONING' },
      { name: 'Đường & lá dứa', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Màu đỏ thực phẩm / nước củ dền', quantity: '5', unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Nhuộm đỏ củ năng', instruction: 'Cắt củ năng thành hạt lựu khoảng 5–7 mm. Ngâm với chút màu thực phẩm đã pha hoặc nước củ dền 5–10 phút, để ráo nhưng giữ bề mặt hơi ẩm.' },
      { order: 2, title: 'Áo đều bột năng', instruction: 'Cho củ năng vào tô, rắc bột năng từng ít, xóc để áo đều. Rây bỏ bột thừa; nếu muốn lớp áo dày hơn, làm ẩm rất nhẹ rồi áo thêm một lớp mỏng.' },
      { order: 3, title: 'Luộc hạt lựu trong vắt', instruction: 'Đun một nồi nước sôi, thả củ năng vào, khuấy nhẹ tránh dính đáy. Khi nổi lên, nấu thêm 1–2 phút đến khi lớp bột trong rồi vớt vào nước lạnh.' },
      { order: 4, title: 'Nấu nước cốt dừa lá dứa', instruction: 'Đun nước cốt dừa với 25 ml nước, đường, muối và lá dứa trên lửa nhỏ 2–3 phút cho đường tan. Tắt bếp, lấy lá dứa ra và để nguội.' },
      { order: 5, title: 'Chan nước dừa & đá mát', instruction: 'Vớt hạt lựu để ráo, cho vào chén, thêm nước dừa và đá theo ý thích. Ăn ngay để lớp bột không bị mềm nhũn khi ngâm lâu.' }
    ]
  },
  {
    id: 43,
    slug: 'kluay-buat-chi',
    title: 'Kluay Buat Chi (Chuối nấu nước cốt dừa)',
    category: 'Tráng miệng & món ngọt',
    summary: 'Chuối xiêm chín dẻo ngọt thanh ninh trong nước cốt dừa béo bùi thoảng hương lá dứa.',
    prepMinutes: 10,
    cookMinutes: 12,
    totalMinutes: 22,
    preconditions: 'Chọn chuối xiêm chín vừa để chuối giữ nguyên miếng đẹp mắt, không bị nát.',
    imageQuery: 'Kluai_buat_chi',
    ingredients: [
      { name: 'Chuối xiêm chín vừa', quantity: '2', unit: 'quả', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '100', unit: 'ml', role: 'SEASONING' },
      { name: 'Đường & muối', quantity: '12', unit: 'g', role: 'SEASONING' },
      { name: 'Lá dứa', quantity: '0.5', unit: 'lá', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Cắt khúc chuối xiêm', instruction: 'Chọn chuối xiêm chín vừa, còn chắc, bóc vỏ, bổ dọc rồi cắt khúc 3–4 cm. Rửa lá dứa, buộc gọn nếu lá dài.' },
      { order: 2, title: 'Đun nước cốt dừa lá dứa', instruction: 'Cho nước, lá dứa và 50 ml nước cốt dừa vào nồi nhỏ. Đun lửa vừa đến sôi nhẹ rồi hạ lửa.' },
      { order: 3, title: 'Nấu chuối lửa nhỏ', instruction: 'Thả chuối vào, nấu khoảng 5–10 phút tùy độ chín. Đảo hoặc lắc nồi thật nhẹ, tránh dùng thìa nghiền vào chuối.' },
      { order: 4, title: 'Thêm cốt dừa đường muối', instruction: 'Khi chuối mềm nhưng chưa nát, cho 50 ml cốt dừa còn lại, đường và một nhúm muối nhỏ. Khuấy nhẹ, đun thêm 1–2 phút cho đường tan.' },
      { order: 5, title: 'Thưởng thức ấm hoặc lạnh', instruction: 'Tắt bếp, lấy lá dứa ra. Dùng ấm hoặc để nguội rồi giữ lạnh; nước dừa phải thơm, không khét đáy và chuối còn nguyên miếng.' }
    ]
  },
  {
    id: 44,
    slug: 'bua-loy',
    title: 'Bua Loy (Chè viên bột nếp nước dừa)',
    category: 'Tráng miệng & món ngọt',
    summary: 'Chè viên bột nếp ngũ sắc mềm dẻo tắm trong làn nước cốt dừa ngọt béo thơm lừng.',
    prepMinutes: 15,
    cookMinutes: 10,
    totalMinutes: 25,
    preconditions: 'Viên bột đạt khi nổi bồng bềnh, dẻo mềm không còn lõi sống.',
    imageQuery: 'Bua_loi',
    ingredients: [
      { name: 'Bột nếp', quantity: '38', unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '100', unit: 'ml', role: 'SEASONING' },
      { name: 'Đường & muối', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Lá dứa', quantity: '0.5', unit: 'lá', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Nhồi bột nếp dẻo mịn', instruction: 'Cho bột nếp vào tô; thêm nước ấm từng thìa, nhồi khoảng 3 phút. Chỉ dùng đủ lượng nước để bột mềm dẻo, vo được viên mà không nứt hoặc chảy dính.' },
      { order: 2, title: 'Vo viên tròn nhỏ', instruction: 'Ngắt bột thành viên nhỏ cỡ 0,8–1 cm, vo tròn và đặt lên đĩa rắc rất ít bột nếp nếu cần. Đậy khăn để bột không khô khi chờ.' },
      { order: 3, title: 'Luộc viên nổi trong veo', instruction: 'Đun nước sôi, thả viên bột vào và khuấy nhẹ. Khi viên nổi lên, nấu thêm 1–2 phút cho chín tới giữa rồi vớt ra ngâm nước nguội ngắn để không dính.' },
      { order: 4, title: 'Nấu nước cốt dừa', instruction: 'Nấu nước cốt dừa với lượng nước đã ghi, đường, muối và lá dứa ở lửa nhỏ 2–3 phút. Khuấy cho đường tan, không đun sôi mạnh.' },
      { order: 5, title: 'Thả viên vào nước dừa', instruction: 'Vớt viên bột để ráo, cho vào nồi nước dừa, đun nhẹ thêm 1–2 phút rồi tắt bếp. Dùng ấm; viên bột đạt khi mềm dẻo và không còn lõi bột sống.' }
    ]
  },
  {
    id: 45,
    slug: 'khanom-krok',
    title: 'Khanom Krok (Bánh dừa khuôn lõm)',
    category: 'Tráng miệng & món ngọt',
    summary: 'Bánh dừa nướng khuôn khọt Thái Lan với lớp vỏ ngoài giòn tan, nhân bên trong béo ngậy tan chảy.',
    prepMinutes: 15,
    cookMinutes: 10,
    totalMinutes: 25,
    preconditions: 'Làm nóng khuôn thật kỹ và quét dầu mỏng trước khi đổ bánh.',
    imageQuery: 'Khanom_khrok',
    ingredients: [
      { name: 'Bột gạo & cơm chín', quantity: '38', unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '88', unit: 'ml', role: 'SEASONING' },
      { name: 'Đường & muối', quantity: '10', unit: 'g', role: 'SEASONING' },
      { name: 'Hành lá hoặc ngô ngọt', quantity: '10', unit: 'g', role: 'SUPPORTING' }
    ],
    steps: [
      { order: 1, title: 'Xay bột nền mịn màng', instruction: 'Xay thật mịn các thành phần bột nền gồm bột gạo, cơm chín, nước cốt dừa và nước; thêm muối dành cho bột nền. Để nghỉ 15–20 phút rồi khuấy lại.' },
      { order: 2, title: 'Khuấy bột mặt béo', instruction: 'Khuấy riêng nước cốt dừa, đường, bột gạo và muối của phần mặt bánh cho tan. Cắt nhỏ hành lá, để ngô chín ráo nước nếu dùng.' },
      { order: 3, title: 'Đổ lớp bột nền', instruction: 'Làm nóng khuôn bánh khọt hoặc khuôn khanom krok ở lửa vừa nhỏ 3–5 phút. Quét một lớp dầu mỏng vào từng lõm, khuấy lại bột nền rồi rót khoảng 2/3 chiều cao lõm.' },
      { order: 4, title: 'Rót lớp cốt dừa rắc hành', instruction: 'Chờ 30–60 giây cho viền se, rót một lớp mỏng hỗn hợp mặt bánh lên trên, thêm hành hoặc ngô. Đậy nắp, nấu lửa nhỏ vừa khoảng 5–8 phút tùy khuôn.' },
      { order: 5, title: 'Lách thìa lấy bánh giòn', instruction: 'Khi mặt bánh đã đông, không còn bột lỏng và đáy vàng giòn, dùng thìa lách quanh mép lấy bánh ra. Nếu mặt còn sống mà đáy đã sậm, hạ lửa và đậy thêm thay vì tăng lửa.' }
    ]
  },
  {
    id: 46,
    slug: 'khanom-chan',
    title: 'Khanom Chan (Bánh hấp nhiều lớp)',
    category: 'Tráng miệng & món ngọt',
    summary: 'Bánh chín tầng mây kiểu Thái với từng lớp bánh dẻo thơm ngát nước cốt dừa và lá dứa xanh ngọc.',
    prepMinutes: 15,
    cookMinutes: 30,
    totalMinutes: 45,
    preconditions: 'Hấp chín từng lớp trước khi đổ lớp tiếp theo để các lớp tách rõ nét.',
    imageQuery: 'Khanom_chan',
    ingredients: [
      { name: 'Bột năng & bột gạo', quantity: '45', unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '100', unit: 'ml', role: 'SEASONING' },
      { name: 'Đường & nước lá dứa', quantity: '40', unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Khuấy hỗn hợp bột dừa', instruction: 'Cho nước cốt dừa và đường vào nồi nhỏ, đun nhẹ cho tan rồi để nguội. Trộn ba loại bột với muối trong tô, rót cốt dừa nguội vào và khuấy thật mịn.' },
      { order: 2, title: 'Chia hai phần màu', instruction: 'Chia hỗn hợp thành hai phần bằng nhau. Một phần thêm 25 ml nước lá dứa, phần kia thêm 25 ml nước lọc; lọc qua rây để loại cục bột.' },
      { order: 3, title: 'Làm nóng khuôn', instruction: 'Quét dầu mỏng vào khuôn nhỏ khoảng 8–10 cm, đặt khuôn vào xửng sôi 3 phút. Khuấy lại bột trước mỗi lần rót vì bột dễ lắng đáy.' },
      { order: 4, title: 'Hấp từng lớp so le', instruction: 'Rót một lớp mỏng khoảng 3–4 mm, đậy nắp và hấp 4–6 phút đến khi lớp bột se, không còn lỏng. Rót tiếp lớp màu còn lại, lặp lại xen kẽ; lau nước đọng trên nắp để không nhỏ xuống bánh.' },
      { order: 5, title: 'Để nguội & cắt miếng dẻo', instruction: 'Sau lớp cuối, hấp thêm 8–10 phút. Lấy khuôn ra, để nguội hoàn toàn ít nhất 1 giờ rồi mới gỡ và cắt; bánh đạt khi các lớp bám nhau, dẻo và không có bột sống.' }
    ]
  },
  {
    id: 47,
    slug: 'sangkaya-fak-thong',
    title: 'Sangkaya Fak Thong (Bí đỏ hấp nhân trứng dừa)',
    category: 'Tráng miệng & món ngọt',
    summary: 'Trái bí đỏ hạt dẻ nhỏ xinh chứa nhân kem trứng cốt dừa mịn mượt, ngọt ngào hấp dẫn.',
    prepMinutes: 15,
    cookMinutes: 35,
    totalMinutes: 50,
    preconditions: 'Không đánh bông trứng để phần kem sữa trứng mịn màng không bị rỗ bọt.',
    imageQuery: 'Sankhaya_faktong',
    ingredients: [
      { name: 'Bí đỏ mini', quantity: '350', unit: 'g', role: 'MAIN' },
      { name: 'Trứng gà', quantity: '1', unit: 'quả', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '45', unit: 'ml', role: 'SEASONING' },
      { name: 'Đường thốt nốt', quantity: '20', unit: 'g', role: 'SEASONING' },
      { name: 'Lá dứa', quantity: '0.5', unit: 'lá', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Cắt nắp & nạo ruột bí', instruction: 'Chọn bí đỏ mini 300–400 g, cắt nắp và lấy hết hạt, ruột xơ; rửa rồi để ráo. Dùng bát nhỏ đỡ bí đứng vững trong xửng; không gọt bỏ vỏ bí.' },
      { order: 2, title: 'Khuấy kem trứng cốt dừa', instruction: 'Đánh nhẹ trứng với 45 ml nước cốt dừa, đường, muối và lá dứa vò nhẹ đến khi đường tan. Không đánh bông; lọc qua rây và hớt bọt.' },
      { order: 3, title: 'Rót nhân vào lòng bí', instruction: 'Rót hỗn hợp vào khoảng 3/4 khoang bí, chừa chỗ nở; nếu dư nhân, hấp trong chén riêng. Đặt nắp bí bên cạnh, không đậy kín lên nhân.' },
      { order: 4, title: 'Hấp lửa nhỏ đông mịn', instruction: 'Cho vào xửng nước sôi, hạ lửa vừa nhỏ và hấp khoảng 25–40 phút tùy kích thước. Kiểm tra từ phút 25: bí phải mềm và nhân đông, que thử ở giữa không dính trứng lỏng; hấp thêm nếu chưa đạt.' },
      { order: 5, title: 'Để nguội cắt múi cau', instruction: 'Tắt bếp, mở hé nắp xửng 5 phút rồi lấy ra, để nguội bớt trước khi cắt. Nếu dùng bí lớn, cân khoảng 200 g phần bí ăn được cho một người và hấp nhân trong chén riêng.' }
    ]
  },
  {
    id: 48,
    slug: 'woon-kati',
    title: 'Woon Kati (Thạch rau câu dừa)',
    category: 'Tráng miệng & món ngọt',
    summary: 'Rau câu dừa hai tầng đẹp mắt: tầng trên béo ngậy nước cốt dừa, tầng dưới trong veo ngọt mát.',
    prepMinutes: 10,
    cookMinutes: 10,
    totalMinutes: 20,
    preconditions: 'Rót tầng trắng khi tầng trong vừa se mặt để hai tầng bám chặt không bị tách rời.',
    imageQuery: 'Coconut_jelly',
    ingredients: [
      { name: 'Nước dừa tươi', quantity: '75', unit: 'ml', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '60', unit: 'ml', role: 'SEASONING' },
      { name: 'Bột rau câu agar', quantity: '2', unit: 'g', role: 'MAIN' },
      { name: 'Đường & muối', quantity: '14', unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Ngâm bột agar', instruction: 'Chuẩn bị hai nồi nhỏ: nồi lớp trong cho nước dừa và agar; nồi lớp trắng cho nước cốt dừa, nước và agar. Ngâm khoảng 10 phút hoặc theo hướng dẫn của loại bột agar đang dùng.' },
      { order: 2, title: 'Nấu tầng trong veo', instruction: 'Đun nồi lớp trong đến sôi, khuấy 1–2 phút cho agar tan hoàn toàn, không còn hạt li ti. Thêm đường, khuấy tan rồi rót vào khuôn nhỏ.' },
      { order: 3, title: 'Nấu tầng cốt dừa béo', instruction: 'Nấu nồi lớp trắng ở lửa vừa nhỏ, khuấy sát đáy đến sôi nhẹ và agar tan. Thêm đường, muối, khuấy đều; giữ ấm, tránh để đông trong nồi.' },
      { order: 4, title: 'Rót lớp cốt dừa lên trên', instruction: 'Khi lớp trong vừa se mặt, chạm nhẹ không dính tay nhưng còn ấm, rót lớp trắng nóng vừa lên một cách nhẹ nhàng. Không chờ lớp dưới lạnh hẳn vì hai lớp dễ tách.' },
      { order: 5, title: 'Làm lạnh & cắt miếng', instruction: 'Để khuôn nguội ở nhiệt độ phòng, sau đó cho vào tủ lạnh khoảng 1–2 giờ đến đông hoàn toàn. Gỡ khuôn hoặc cắt miếng vừa ăn, dùng lạnh.' }
    ]
  },
  {
    id: 49,
    slug: 'kluay-tod',
    title: 'Kluay Tod (Chuối chiên kiểu Thái)',
    category: 'Tráng miệng & món ngọt',
    summary: 'Chuối xiêm tẩm bột mè dừa nạo chiên phồng vàng rụm, ngọt dẻo nóng hổi giòn tan.',
    prepMinutes: 10,
    cookMinutes: 10,
    totalMinutes: 20,
    preconditions: 'Dùng nóng ngay khi vớt ra để vỏ chuối luôn giòn rụm.',
    imageQuery: 'Banana_fritter',
    ingredients: [
      { name: 'Chuối xiêm chín vừa', quantity: '1.5', unit: 'quả', role: 'MAIN' },
      { name: 'Bột gạo & bột mì', quantity: '33', unit: 'g', role: 'MAIN' },
      { name: 'Dừa nạo & mè trắng', quantity: '12', unit: 'g', role: 'SEASONING' },
      { name: 'Dầu chiên giòn', quantity: '150', unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { order: 1, title: 'Cắt lát chuối xiêm', instruction: 'Bóc chuối, bổ dọc thành lát dày khoảng 0,5–0,8 cm. Trộn bột gạo, bột mì, bột nở, đường, muối, dừa nạo và mè trong tô.' },
      { order: 2, title: 'Khuấy bột sệt bám chuối', instruction: 'Thêm khoảng 32 ml nước từng ít, khuấy thành hỗn hợp hơi sệt, đủ bám thành lớp mỏng trên chuối. Để nghỉ 5–10 phút; thêm vài giọt nước nếu đặc quá.' },
      { order: 3, title: 'Nhúng chuối vào bột', instruction: 'Đun dầu trong nồi nhỏ đến khoảng 170°C. Nhúng từng lát chuối vào bột, nhấc lên cho bột thừa chảy bớt rồi thả nhẹ vào dầu.' },
      { order: 4, title: 'Chiên vàng giòn 2 mặt', instruction: 'Chiên theo từng mẻ ít khoảng 3–5 phút, trở khi mặt dưới đã se. Giữ lửa vừa, không để ngoài vàng quá nhanh trong khi lớp bột còn ướt.' },
      { order: 5, title: 'Để ráo dầu dùng nóng', instruction: 'Khi chuối vàng đều, vỏ giòn, vớt lên vỉ và để ráo 2 phút. Dùng nóng, không xếp chồng hoặc đậy kín ngay vì hơi nước làm mềm lớp vỏ.' }
    ]
  },
  {
    id: 50,
    slug: 'khao-tom-mat',
    title: 'Khao Tom Mat (Bánh nếp chuối gói lá)',
    category: 'Tráng miệng & món ngọt',
    summary: 'Bánh nếp dẻo thơm ngấm cốt dừa, ôm trọn nhân chuối ngọt lịm và đậu đen bùi bùi.',
    prepMinutes: 15,
    cookMinutes: 75,
    totalMinutes: 90,
    preconditions: 'Hấp bánh từ 60-90 phút cho hạt nếp trong veo, dẻo mềm hòa quyện nhân chuối.',
    imageQuery: 'Khao_tom_mat',
    ingredients: [
      { name: 'Gạo nếp', quantity: '60', unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', quantity: '60', unit: 'ml', role: 'SEASONING' },
      { name: 'Chuối xiêm nhỏ', quantity: '1', unit: 'quả', role: 'MAIN' },
      { name: 'Đậu đen đã nấu chín', quantity: '15', unit: 'g', role: 'SUPPORTING' },
      { name: 'Đường & muối', quantity: '15', unit: 'g', role: 'SEASONING' },
      { name: 'Lá chuối gói bánh', quantity: '2', unit: 'lá', role: 'SUPPORTING' }
    ],
    steps: [
      { order: 1, title: 'Sơ chế nếp & lá chuối', instruction: 'Vo nếp, ngâm 4–6 giờ rồi để ráo kỹ. Đậu đen phải được nấu chín mềm từ trước; bóc chuối, bổ dọc. Rửa lá chuối, lau khô và hơ nhẹ cho dẻo.' },
      { order: 2, title: 'Xào nếp với nước cốt dừa', instruction: 'Cho nước cốt dừa, đường và muối vào chảo nhỏ, đun cho tan. Thêm nếp, đảo lửa nhỏ khoảng 5–8 phút đến khi hút phần lớn nước nhưng hạt còn cứng bên trong.' },
      { order: 3, title: 'Gói nếp chuối đậu đen', instruction: 'Để nếp bớt nóng. Trải hai lớp lá, cho một lớp nếp, thêm chuối và đậu đen, phủ nếp lên trên; chia thành hai gói nhỏ để một người dùng.' },
      { order: 4, title: 'Buộc chắc & hấp bánh', instruction: 'Gấp hai mép lá ôm kín nhân, gập hai đầu, ghép hai gói và buộc chắc vừa phải. Đặt vào xửng đã có nước sôi, hấp lửa vừa khoảng 60–90 phút; châm thêm nước nóng nếu cần.' },
      { order: 5, title: 'Để nguội thưởng thức', instruction: 'Mở thử một gói: nếp phải trong, mềm dẻo và không còn lõi trắng. Nếu còn sượng, gói lại hấp thêm 10–15 phút; để nguội bớt trước khi mở ăn.' }
    ]
  }
];
