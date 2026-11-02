import '../backend/src/config';
import { Database } from '../backend/src/db';

interface RawThaiRecipe {
  num: number;
  slug: string;
  title: string;
  category: string;
  prep: number;
  cook: number;
  total: number;
  difficulty: string;
  image: string;
  summary: string;
  ingredients: { name: string; id: string; qty: number; unit: string; role: 'MAIN' | 'SUPPORTING' | 'SEASONING' }[];
  steps: { title: string; instruction: string }[];
}

const THAI_RECIPES: RawThaiRecipe[] = [
  {
    num: 1,
    slug: 'pad-krapow-gai',
    title: 'Pad Krapow Gai (Gà xào húng quế thánh)',
    category: 'Món xào',
    prep: 10,
    cook: 10,
    total: 20,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=1000&q=85',
    summary: 'Món gà xào húng quế thánh cay nồng đậm đà, biểu tượng ẩm thực đường phố Thái Lan.',
    ingredients: [
      { name: 'Thịt gà băm', id: 'minced-chicken', qty: 150, unit: 'g', role: 'MAIN' },
      { name: 'Húng quế thánh', id: 'holy-basil', qty: 15, unit: 'g', role: 'SUPPORTING' },
      { name: 'Tỏi', id: 'garlic', qty: 10, unit: 'g', role: 'SEASONING' },
      { name: 'Ớt hiểm', id: 'thai-chili', qty: 5, unit: 'g', role: 'SEASONING' },
      { name: 'Dầu hào', id: 'oyster-sauce', qty: 8, unit: 'ml', role: 'SEASONING' },
      { name: 'Nước mắm', id: 'fish-sauce', qty: 3, unit: 'ml', role: 'SEASONING' },
      { name: 'Nước tương', id: 'soy-sauce', qty: 3, unit: 'ml', role: 'SEASONING' },
      { name: 'Đường', id: 'sugar', qty: 2, unit: 'g', role: 'SEASONING' },
      { name: 'Dầu ăn', id: 'oil', qty: 8, unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Sơ chế và pha sốt', instruction: 'Băm nhỏ tỏi và ớt; nhặt lá húng, rửa sạch, để thật ráo. Trộn dầu hào, nước mắm, nước tương và đường trong chén với 1 thìa canh nước.' },
      { title: 'Phi thơm tỏi ớt', instruction: 'Làm nóng chảo ở lửa vừa lớn, cho dầu ăn vào. Thêm tỏi ớt, đảo 15–20 giây đến thơm, không để tỏi cháy nâu.' },
      { title: 'Xào săn thịt gà', instruction: 'Cho gà băm vào, dùng sạn tách thịt thành các mẩu nhỏ. Xào 3–4 phút, đảo liên tục để thịt chín đều, không vón thành khối.' },
      { title: 'Thấm đều sốt gia vị', instruction: 'Rưới chén sốt vào, đảo thêm 1–2 phút đến khi gà chín hoàn toàn và sốt bám thịt. Nếu chảo khô trước khi thịt chín, thêm từng thìa nước.' },
      { title: 'Hoàn thành với húng quế', instruction: 'Cho lá húng vào, đảo 15–30 giây cho vừa héo rồi tắt bếp. Dọn nóng cùng cơm; trứng chiên ăn kèm nếu có chuẩn bị riêng.' }
    ]
  },
  {
    num: 2,
    slug: 'gai-pad-med-mamuang',
    title: 'Gai Pad Med Mamuang (Gà xào hạt điều)',
    category: 'Món xào',
    prep: 15,
    cook: 10,
    total: 25,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1000&q=85',
    summary: 'Thịt gà mềm thơm kết hợp hạt điều bùi giòn và sốt đậm đà ngọt dịu.',
    ingredients: [
      { name: 'Thịt đùi gà', id: 'chicken-thigh', qty: 150, unit: 'g', role: 'MAIN' },
      { name: 'Hạt điều rang', id: 'cashew-nuts', qty: 30, unit: 'g', role: 'SUPPORTING' },
      { name: 'Hành tây', id: 'onion', qty: 40, unit: 'g', role: 'SUPPORTING' },
      { name: 'Ớt chuông', id: 'bell-pepper', qty: 40, unit: 'g', role: 'SUPPORTING' },
      { name: 'Dầu hào', id: 'oyster-sauce', qty: 8, unit: 'ml', role: 'SEASONING' },
      { name: 'Nước tương', id: 'soy-sauce', qty: 8, unit: 'ml', role: 'SEASONING' },
      { name: 'Đường', id: 'sugar', qty: 3, unit: 'g', role: 'SEASONING' },
      { name: 'Dầu ăn', id: 'oil', qty: 8, unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Cắt gà và rau củ', instruction: 'Cắt gà thành miếng khoảng 2 cm; hành tây và ớt chuông cắt miếng tương tự. Băm tỏi. Khuấy dầu hào, nước tương, đường với lượng nước đã ghi thành sốt.' },
      { title: 'Rang thơm hạt điều', instruction: 'Cho hạt điều lên chảo khô, đảo lửa nhỏ 1–2 phút cho thơm rồi lấy ra. Nếu dùng ớt khô, cắt khúc và bỏ bớt hạt.' },
      { title: 'Xào chín thịt gà', instruction: 'Làm nóng dầu, phi tỏi khoảng 15 giây. Cho gà vào xào lửa vừa lớn 4–5 phút, đến khi thịt chín hoàn toàn.' },
      { title: 'Thêm rau củ và sốt', instruction: 'Thêm hành tây, ớt chuông và ớt khô, đảo 1–2 phút. Rưới sốt, xào thêm khoảng 1 phút cho sốt nóng và bám đều.' },
      { title: 'Cho hạt điều và hoàn tất', instruction: 'Cho hạt điều trở lại chảo, đảo nhanh rồi tắt bếp. Thành phẩm có gà mềm, rau còn hơi giòn, hạt điều không bị ngâm lâu trong sốt.' }
    ]
  },
  {
    num: 3,
    slug: 'gai-yang',
    title: 'Gai Yang (Gà nướng kiểu Thái)',
    category: 'Món nướng',
    prep: 20,
    cook: 40,
    total: 60,
    difficulty: 'Trung bình',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=1000&q=85',
    summary: 'Đùi gà ướp sả, tỏi, rễ ngò và đường thốt nốt nướng thơm lừng chuẩn vị Isan.',
    ingredients: [
      { name: 'Đùi gà', id: 'chicken-leg', qty: 300, unit: 'g', role: 'MAIN' },
      { name: 'Tỏi', id: 'garlic', qty: 10, unit: 'g', role: 'SEASONING' },
      { name: 'Rễ ngò', id: 'coriander-root', qty: 5, unit: 'g', role: 'SEASONING' },
      { name: 'Sả', id: 'lemongrass', qty: 15, unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm', id: 'fish-sauce', qty: 8, unit: 'ml', role: 'SEASONING' },
      { name: 'Dầu hào', id: 'oyster-sauce', qty: 8, unit: 'ml', role: 'SEASONING' },
      { name: 'Đường thốt nốt', id: 'palm-sugar', qty: 5, unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Sơ chế và giã thảo mộc', instruction: 'Thấm khô đùi gà, khứa 2–3 đường vào phần thịt dày. Giã tỏi, rễ ngò và sả đã thái mỏng thành hỗn hợp nhuyễn.' },
      { title: 'Ướp đùi gà', instruction: 'Trộn hỗn hợp giã với toàn bộ gia vị ướp. Xoa đều lên gà, đưa gia vị vào các đường khứa; đậy kín, để tủ lạnh ít nhất 2 giờ.' },
      { title: 'Làm nóng lò', instruction: 'Làm nóng lò ở 190°C khoảng 10 phút. Xếp gà lên vỉ có khay hứng bên dưới, đặt mặt da hướng lên, tránh để các miếng chồng nhau.' },
      { title: 'Nướng vàng', instruction: 'Nướng khoảng 35–45 phút; trở sau 20 phút. Nếu da lên màu quá sớm, che lỏng giấy bạc; không rưới nước ướp sống lên gà gần cuối quá trình.' },
      { title: 'Kiểm tra độ chín', instruction: 'Kiểm tra sát xương và phần thịt dày nhất đã chín hoàn toàn; nếu có nhiệt kế, tâm thịt đạt 74°C. Để nghỉ 5 phút rồi chặt miếng, dùng nóng.' }
    ]
  },
  {
    num: 4,
    slug: 'moo-ping',
    title: 'Moo Ping (Thịt heo xiên nướng)',
    category: 'Món nướng',
    prep: 25,
    cook: 15,
    total: 40,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=85',
    summary: 'Thịt nạc vai ướp nước cốt dừa và gia vị đậm đà, xiên nướng than vàng óng thơm phức.',
    ingredients: [
      { name: 'Nạc vai heo', id: 'pork-shoulder', qty: 200, unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', id: 'coconut-milk', qty: 25, unit: 'ml', role: 'SEASONING' },
      { name: 'Nước mắm', id: 'fish-sauce', qty: 8, unit: 'ml', role: 'SEASONING' },
      { name: 'Dầu hào', id: 'oyster-sauce', qty: 8, unit: 'ml', role: 'SEASONING' },
      { name: 'Đường thốt nốt', id: 'palm-sugar', qty: 5, unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Thái lát thịt và pha ướp', instruction: 'Thái nạc vai ngang thớ thành lát dày khoảng 3–4 mm. Giã tỏi với rễ ngò, trộn nước cốt dừa và các gia vị ướp.' },
      { title: 'Bóp thịt thấm vị', instruction: 'Bóp nhẹ thịt với hỗn hợp ướp, đậy kín và để trong tủ lạnh 2–4 giờ. Ngâm que tre trong nước ít nhất 30 phút để hạn chế cháy khi nướng.' },
      { title: 'Xiên thịt vào que', instruction: 'Xiên thịt thành 4–5 que nhỏ, xếp các lát sát nhau vừa phải, không ép thành khối quá dày. Bỏ phần nước ướp sống còn dư.' },
      { title: 'Nướng thịt', instruction: 'Làm nóng bếp nướng ở lửa vừa; nướng 10–15 phút, trở mỗi 2–3 phút. Nếu dùng lò, nướng khoảng 200°C và quan sát để tránh cháy đường.' },
      { title: 'Thành phẩm', instruction: 'Lấy thịt ra khi chín hoàn toàn, mặt ngoài vàng nâu và có cạnh xém nhẹ. Để nghỉ 2–3 phút; ăn với xôi hoặc rau chuẩn bị riêng.' }
    ]
  },
  {
    num: 5,
    slug: 'kor-moo-yang',
    title: 'Kor Moo Yang (Nạc nọng heo nướng)',
    category: 'Món nướng',
    prep: 15,
    cook: 25,
    total: 40,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85',
    summary: 'Nạc nọng giòn ngọt nướng xém cạnh, chấm cùng nước sốt Nam Jim Jaew cay nồng.',
    ingredients: [
      { name: 'Nạc nọng heo', id: 'pork-jowl', qty: 200, unit: 'g', role: 'MAIN' },
      { name: 'Nước mắm', id: 'fish-sauce', qty: 15, unit: 'ml', role: 'SEASONING' },
      { name: 'Nước cốt chanh', id: 'lime-juice', qty: 8, unit: 'ml', role: 'SEASONING' },
      { name: 'Thính gạo', id: 'toasted-rice-powder', qty: 3, unit: 'g', role: 'SEASONING' },
      { name: 'Hành tím', id: 'shallots', qty: 10, unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Thấm khô và ướp thịt', instruction: 'Thấm khô thịt; nếu miếng dày hơn khoảng 2 cm, xẻ mỏng bớt để dễ chín đều. Giã tỏi và rễ ngò, trộn với phần gia vị ướp.' },
      { title: 'Xoa gia vị', instruction: 'Xoa gia vị đều hai mặt thịt, đậy kín và ướp trong tủ lạnh khoảng 2 giờ. Trong lúc chờ, thái mỏng một ít hành tím dùng cho nước chấm.' },
      { title: 'Pha nước chấm Nam Jim Jaew', instruction: 'Hòa đường với nước mắm và cốt chanh thuộc phần chấm; thêm thính, ớt bột và hành tím. Nêm lại, có thể thêm 1 thìa canh nước ấm nếu quá đậm.' },
      { title: 'Nướng thịt', instruction: 'Làm nóng lò 190°C, nướng thịt khoảng 20–30 phút, trở giữa chừng. Thời gian tùy độ dày; kiểm tra bên trong đã chín, không chỉ dựa vào màu mặt ngoài.' },
      { title: 'Cắt lát và thưởng thức', instruction: 'Để thịt nghỉ 5 phút cho bớt chảy nước rồi thái ngang thớ thành lát mỏng. Dọn cùng nước chấm, dùng khi thịt còn ấm.' }
    ]
  },
  {
    num: 11,
    slug: 'tom-yum-goong',
    title: 'Tom Yum Goong (Canh tôm chua cay)',
    category: 'Canh & Lẩu',
    prep: 10,
    cook: 15,
    total: 25,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=1000&q=85',
    summary: 'Món canh quốc hồn quốc túy Thái Lan với vị chua thanh, cay nồng và thơm thảo mộc tự nhiên.',
    ingredients: [
      { name: 'Tôm tươi', id: 'shrimp', qty: 150, unit: 'g', role: 'MAIN' },
      { name: 'Nấm rơm hoặc nấm bào ngư', id: 'mushrooms', qty: 75, unit: 'g', role: 'SUPPORTING' },
      { name: 'Sả', id: 'lemongrass', qty: 20, unit: 'g', role: 'SEASONING' },
      { name: 'Riềng', id: 'galangal', qty: 12, unit: 'g', role: 'SEASONING' },
      { name: 'Lá chanh Thái', id: 'kaffir-lime-leaves', qty: 2, unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm', id: 'fish-sauce', qty: 12, unit: 'ml', role: 'SEASONING' },
      { name: 'Nước cốt chanh', id: 'lime-juice', qty: 15, unit: 'ml', role: 'SEASONING' },
      { name: 'Tương ớt Thái nam prik pao', id: 'nam-prik-pao', qty: 8, unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Sơ chế tôm và thảo mộc', instruction: 'Tôm bóc vỏ, bỏ chỉ lưng, để ráo. Cắt nấm vừa ăn; đập dập sả và ớt, thái lát riềng, xé lá chanh và bỏ gân giữa.' },
      { title: 'Nấu nước dùng thơm', instruction: 'Đun 350 ml nước dùng với sả, riềng và lá chanh ở lửa vừa 5–7 phút. Có thể vớt bớt thảo mộc trước khi ăn vì chúng chủ yếu để tạo hương.' },
      { title: 'Thêm nấm và tôm', instruction: 'Cho nấm và nam prik pao vào, khuấy tan rồi nấu 2–3 phút. Cho tôm vào, đun nhẹ thêm khoảng 2–3 phút tùy kích thước.' },
      { title: 'Nêm gia vị', instruction: 'Khi tôm chuyển hồng và phần thịt giữa thân đục hoàn toàn, nêm đường và cho nước mắm từ ít đến nhiều. Không đun tôm quá lâu để tránh dai.' },
      { title: 'Hoàn thiện với chanh tươi', instruction: 'Tắt bếp rồi mới thêm cốt chanh và ớt đập. Nếm lại vị chua cay mặn, múc ra tô và dùng nóng; bản công thức này không thêm sữa.' }
    ]
  },
  {
    num: 12,
    slug: 'tom-kha-gai',
    title: 'Tom Kha Gai (Canh gà nước cốt dừa)',
    category: 'Canh & Lẩu',
    prep: 10,
    cook: 15,
    total: 25,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=85',
    summary: 'Hương vị béo nhẹ của nước cốt dừa hòa quyện cùng riềng, sả và thịt gà mềm thơm dịu dàng.',
    ingredients: [
      { name: 'Thịt gà', id: 'chicken-breast', qty: 150, unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', id: 'coconut-milk', qty: 150, unit: 'ml', role: 'MAIN' },
      { name: 'Nấm', id: 'mushrooms', qty: 75, unit: 'g', role: 'SUPPORTING' },
      { name: 'Riềng', id: 'galangal', qty: 15, unit: 'g', role: 'SEASONING' },
      { name: 'Sả', id: 'lemongrass', qty: 15, unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm', id: 'fish-sauce', qty: 10, unit: 'ml', role: 'SEASONING' },
      { name: 'Nước cốt chanh', id: 'lime-juice', qty: 10, unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Sơ chế nguyên liệu', instruction: 'Cắt gà thành miếng mỏng vừa ăn; cắt nấm, đập sả, thái riềng và xé lá chanh. Để riêng cốt chanh, chỉ cho vào cuối.' },
      { title: 'Đun sôi thảo mộc', instruction: 'Cho 200 ml nước dùng cùng sả, riềng, lá chanh vào nồi nhỏ, đun sôi nhẹ 5 phút để dậy mùi.' },
      { title: 'Nấu gà chín tới', instruction: 'Cho gà vào, hạ lửa vừa, nấu 5–7 phút tùy độ dày đến khi gà chín hoàn toàn. Hớt bọt nếu có.' },
      { title: 'Hòa cốt dừa và nấm', instruction: 'Thêm nấm và 150 ml nước cốt dừa, khuấy nhẹ, đun lửa nhỏ thêm 3–4 phút. Không để sôi mạnh kéo dài; nêm nước mắm và đường.' },
      { title: 'Nêm vị thanh chua', instruction: 'Tắt bếp, thêm cốt chanh từng ít một, cho ớt và ngò rí nếu dùng. Canh đạt khi có vị béo nhẹ, chua thanh, gà mềm và nấm chín.' }
    ]
  },
  {
    num: 13,
    slug: 'gaeng-keow-wan-gai',
    title: 'Gaeng Keow Wan Gai (Cà ri xanh gà)',
    category: 'Cà ri',
    prep: 15,
    cook: 20,
    total: 35,
    difficulty: 'Trung bình',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1000&q=85',
    summary: 'Cà ri xanh gà béo ngậy với cà tím giòn và lá húng quế thơm ngát.',
    ingredients: [
      { name: 'Thịt gà', id: 'chicken-breast', qty: 175, unit: 'g', role: 'MAIN' },
      { name: 'Cà tím Thái', id: 'thai-eggplant', qty: 75, unit: 'g', role: 'SUPPORTING' },
      { name: 'Nước cốt dừa', id: 'coconut-milk', qty: 200, unit: 'ml', role: 'MAIN' },
      { name: 'Sốt cà ri xanh', id: 'green-curry-paste', qty: 15, unit: 'g', role: 'SEASONING' },
      { name: 'Húng quế Thái', id: 'thai-basil', qty: 15, unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm', id: 'fish-sauce', qty: 8, unit: 'ml', role: 'SEASONING' },
      { name: 'Đường thốt nốt', id: 'palm-sugar', qty: 5, unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Sơ chế cà và gà', instruction: 'Cắt gà thành miếng khoảng 2 cm. Cà tím Thái bổ đôi hoặc tư, ngâm nước rồi để ráo trước khi nấu; nhặt húng quế và xé lá chanh.' },
      { title: 'Xào sốt cà ri', instruction: 'Làm nóng dầu ở lửa vừa nhỏ, xào sốt cà ri xanh 30–60 giây. Thêm 50 ml nước cốt dừa, khuấy 1–2 phút cho hỗn hợp thơm, không bị khét.' },
      { title: 'Nấu gà thấm vị', instruction: 'Cho gà vào đảo 2–3 phút cho săn. Thêm 150 ml nước cốt dừa còn lại và 75 ml nước, đun sôi nhẹ rồi hạ lửa.' },
      { title: 'Hầm cà tím', instruction: 'Nấu khoảng 6–8 phút, cho cà tím vào nấu thêm 5–7 phút đến khi mềm và gà chín hoàn toàn. Nếu sốt cạn quá nhanh, thêm ít nước nóng.' },
      { title: 'Thêm thảo mộc', instruction: 'Nêm nước mắm và đường sau khi thử độ mặn của sốt cà ri. Cho lá chanh, húng quế vào đảo nhẹ, tắt bếp; dùng với cơm hoặc bún chuẩn bị riêng.' }
    ]
  },
  {
    num: 21,
    slug: 'pad-thai-goong',
    title: 'Pad Thai Goong (Hủ tiếu xào tôm)',
    category: 'Cơm & Mì',
    prep: 15,
    cook: 10,
    total: 25,
    difficulty: 'Trung bình',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1000&q=85',
    summary: 'Hủ tiếu xào tôm chua ngọt cay bùi, món ăn lừng danh thế giới của đất nước chùa Vàng.',
    ingredients: [
      { name: 'Bánh phở khô Pad Thai', id: 'rice-noodles', qty: 90, unit: 'g', role: 'MAIN' },
      { name: 'Tôm tươi', id: 'shrimp', qty: 100, unit: 'g', role: 'MAIN' },
      { name: 'Trứng gà', id: 'egg', qty: 50, unit: 'g', role: 'SUPPORTING' },
      { name: 'Đậu hũ chắc', id: 'tofu-firm', qty: 50, unit: 'g', role: 'SUPPORTING' },
      { name: 'Giá đỗ', id: 'bean-sprouts', qty: 50, unit: 'g', role: 'SUPPORTING' },
      { name: 'Hẹ lá', id: 'garlic-chives', qty: 15, unit: 'g', role: 'SUPPORTING' },
      { name: 'Đậu phộng rang', id: 'peanuts', qty: 10, unit: 'g', role: 'SEASONING' },
      { name: 'Nước me', id: 'tamarind-paste', qty: 15, unit: 'ml', role: 'SEASONING' },
      { name: 'Nước mắm', id: 'fish-sauce', qty: 10, unit: 'ml', role: 'SEASONING' },
      { name: 'Đường thốt nốt', id: 'palm-sugar', qty: 10, unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Ngâm sợi phở và sơ chế', instruction: 'Ngâm sợi Pad Thai theo bao bì đến dẻo nhưng chưa mềm nhũn. Tôm bỏ chỉ; đậu hũ cắt nhỏ, hẹ khúc 3 cm, rửa giá và băm hành tím.' },
      { title: 'Nấu sốt me', instruction: 'Cho nước me, nước mắm, đường vào nồi nhỏ, đun lửa nhỏ 1–2 phút cho đường tan. Nếu nước me quá đặc, thêm 1–2 thìa canh nước rồi để sốt riêng.' },
      { title: 'Xào tôm và đậu hũ', instruction: 'Đun dầu, phi hành, xào đậu hũ và tôm khô 1 phút. Thêm tôm tươi, đảo đến vừa chín rồi gạt sang mép chảo.' },
      { title: 'Xào trứng và bánh phở', instruction: 'Đập trứng vào chỗ trống, chờ hơi se rồi đảo tơi. Cho sợi và sốt vào, đảo 2–4 phút; thêm từng thìa nước nếu sợi còn cứng, tránh đổ quá nhiều làm nhão.' },
      { title: 'Thêm rau và hoàn tất', instruction: 'Khi sợi mềm, sốt gần ráo, cho giá và hẹ vào đảo 20–30 giây. Cho ra đĩa, rắc đậu phộng; vắt thêm chanh theo khẩu vị khi ăn.' }
    ]
  },
  {
    num: 22,
    slug: 'pad-see-ew',
    title: 'Pad See Ew (Hủ tiếu xào nước tương)',
    category: 'Cơm & Mì',
    prep: 10,
    cook: 10,
    total: 20,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=1000&q=85',
    summary: 'Hủ tiếu bản to xào áp chảo thơm mùi khói cùng thịt gà và cải làn tươi giòn.',
    ingredients: [
      { name: 'Bánh phở tươi bản rộng', id: 'flat-rice-noodles', qty: 175, unit: 'g', role: 'MAIN' },
      { name: 'Thịt gà hoặc heo', id: 'chicken-breast', qty: 125, unit: 'g', role: 'MAIN' },
      { name: 'Cải làn', id: 'chinese-broccoli', qty: 100, unit: 'g', role: 'SUPPORTING' },
      { name: 'Trứng gà', id: 'egg', qty: 50, unit: 'g', role: 'SUPPORTING' },
      { name: 'Nước tương đen', id: 'dark-soy-sauce', qty: 3, unit: 'ml', role: 'SEASONING' },
      { name: 'Dầu hào', id: 'oyster-sauce', qty: 8, unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Tách sợi và sơ chế', instruction: 'Tách nhẹ các sợi bánh phở; nếu đang lạnh cứng, làm ấm ngắn trước khi tách để tránh gãy. Thái thịt mỏng, cắt cải làn, để riêng thân và lá; băm tỏi.' },
      { title: 'Pha sốt tương', instruction: 'Trộn nước tương, nước tương đen, dầu hào và đường trong chén. Làm nóng chảo với dầu ở lửa vừa lớn.' },
      { title: 'Xào thịt và thân cải', instruction: 'Phi tỏi khoảng 15 giây, cho thịt vào đảo 3–5 phút đến chín. Thêm thân cải cùng 1 thìa canh nước, đảo thêm 1 phút.' },
      { title: 'Xào trứng và bánh phở', instruction: 'Gạt thịt và cải sang bên, cho trứng vào đảo tơi. Thêm bánh phở, sốt và lá cải; dùng sạn lật nhẹ để sốt phủ đều, hạn chế băm hoặc đảo mạnh.' },
      { title: 'Tạo mùi chảo áp chảo', instruction: 'Dàn bánh phở, để yên 15–20 giây rồi lật, lặp lại 1–2 lần cho có mùi xào thơm. Tắt bếp khi sợi nóng mềm và cải vừa chín, dùng ngay.' }
    ]
  },
  {
    num: 24,
    slug: 'khao-pad-sapparot',
    title: 'Khao Pad Sapparot (Cơm chiên dứa)',
    category: 'Cơm & Mì',
    prep: 15,
    cook: 10,
    total: 25,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=85',
    summary: 'Cơm chiên tơi hạt thơm mùi cà ri, hòa cùng dứa chua ngọt và hạt điều bùi béo.',
    ingredients: [
      { name: 'Cơm nguội', id: 'cooked-rice', qty: 200, unit: 'g', role: 'MAIN' },
      { name: 'Tôm tươi', id: 'shrimp', qty: 100, unit: 'g', role: 'MAIN' },
      { name: 'Dứa', id: 'pineapple', qty: 75, unit: 'g', role: 'SUPPORTING' },
      { name: 'Trứng gà', id: 'egg', qty: 50, unit: 'g', role: 'SUPPORTING' },
      { name: 'Hạt điều rang', id: 'cashew-nuts', qty: 20, unit: 'g', role: 'SUPPORTING' },
      { name: 'Bột cà ri', id: 'curry-powder', qty: 3, unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Chuẩn bị cơm và nguyên liệu', instruction: 'Dùng cơm đã làm nguội nhanh và bảo quản lạnh, bóp nhẹ cho tơi. Cắt dứa hạt lựu, thấm bớt nước; băm hành tây, sơ chế tôm và rã đông đậu Hà Lan nếu cần.' },
      { title: 'Xào tôm và hành', instruction: 'Làm nóng dầu, xào hành tây khoảng 30 giây. Cho tôm vào xào 1–2 phút đến vừa chín, gạt sang bên.' },
      { title: 'Chiên cơm với bột cà ri', instruction: 'Cho trứng vào đảo tơi, tiếp đến cho cơm và bột cà ri. Dùng sạn tách các cục cơm, đảo lửa vừa lớn 2–3 phút.' },
      { title: 'Thêm dứa và gia vị', instruction: 'Thêm đậu Hà Lan, dứa, nước mắm, nước tương và đường. Đảo thêm 2 phút để đậu chín và cơm nóng đều, bốc hơi rõ.' },
      { title: 'Rắc hạt điều và dọn món', instruction: 'Cho hạt điều vào cuối, đảo 15–20 giây rồi tắt bếp. Cơm đạt khi tơi, không đọng nước dứa; ăn ngay sau khi chiên.' }
    ]
  },
  {
    num: 31,
    slug: 'som-tam-thai',
    title: 'Som Tam Thai (Gỏi đu đủ kiểu Thái)',
    category: 'Gỏi & Rau',
    prep: 15,
    cook: 5,
    total: 20,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85',
    summary: 'Gỏi đu đủ xanh giòn sần sật, hòa quyện trọn vẹn 4 vị chua cay mặn ngọt đặc trưng Thái.',
    ingredients: [
      { name: 'Đu đủ xanh bào sợi', id: 'green-papaya', qty: 150, unit: 'g', role: 'MAIN' },
      { name: 'Cà chua', id: 'tomato', qty: 40, unit: 'g', role: 'SUPPORTING' },
      { name: 'Đậu đũa', id: 'yardlong-beans', qty: 30, unit: 'g', role: 'SUPPORTING' },
      { name: 'Tôm khô', id: 'dried-shrimp', qty: 8, unit: 'g', role: 'SUPPORTING' },
      { name: 'Đậu phộng rang', id: 'peanuts', qty: 12, unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm', id: 'fish-sauce', qty: 12, unit: 'ml', role: 'SEASONING' },
      { name: 'Nước cốt chanh', id: 'lime-juice', qty: 15, unit: 'ml', role: 'SEASONING' },
      { name: 'Đường thốt nốt', id: 'palm-sugar', qty: 8, unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Bào sợi đu đủ', instruction: 'Đu đủ gọt vỏ, bỏ hạt, bào sợi; ngâm nước lạnh 5–10 phút rồi để thật ráo. Cà chua bổ múi, đậu đũa cắt khúc 3 cm; rửa nhanh tôm khô nếu quá mặn.' },
      { title: 'Giã tỏi ớt và pha sốt', instruction: 'Cho tỏi và ớt vào cối, giã dập vừa. Thêm đường, nước mắm và cốt chanh, dùng chày khuấy nhẹ cho đường tan.' },
      { title: 'Dằn đậu đũa và cà chua', instruction: 'Thêm đậu đũa, giã nhẹ vài cái để hơi dập; cho cà chua và tôm khô vào, tiếp tục dằn nhẹ cho ra một ít nước.' },
      { title: 'Trộn đều sợi đu đủ', instruction: 'Cho đu đủ vào, một tay dùng thìa đảo từ dưới lên, tay kia dùng chày dằn nhẹ khoảng 1 phút để sốt phủ đều. Không giã nát sợi.' },
      { title: 'Rắc đậu phộng', instruction: 'Nếm lại độ chua mặn ngọt, cho ra đĩa và rắc đậu phộng ngay trước khi ăn. Dùng ngay để đu đủ giữ độ giòn.' }
    ]
  },
  {
    num: 39,
    slug: 'pak-boong-fai-daeng',
    title: 'Pak Boong Fai Daeng (Rau muống xào kiểu Thái)',
    category: 'Gỏi & Rau',
    prep: 10,
    cook: 5,
    total: 15,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85',
    summary: 'Rau muống xanh mướt giòn sần sật xào trên lửa lớn cùng sốt tương đậu và tỏi ớt thơm lừng.',
    ingredients: [
      { name: 'Rau muống', id: 'water-spinach', qty: 200, unit: 'g', role: 'MAIN' },
      { name: 'Tỏi', id: 'garlic', qty: 15, unit: 'g', role: 'SEASONING' },
      { name: 'Ớt hiểm', id: 'thai-chili', qty: 5, unit: 'g', role: 'SEASONING' },
      { name: 'Dầu hào', id: 'oyster-sauce', qty: 8, unit: 'ml', role: 'SEASONING' },
      { name: 'Tương đậu vàng', id: 'yellow-bean-paste', qty: 3, unit: 'g', role: 'SEASONING' },
      { name: 'Nước tương', id: 'soy-sauce', qty: 3, unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Nhặt rau và chuẩn bị', instruction: 'Nhặt rau muống, bỏ cọng già, cắt khúc khoảng 5 cm. Rửa kỹ và để ráo; đập dập tỏi, cắt hoặc đập ớt.' },
      { title: 'Pha sốt xào', instruction: 'Hòa dầu hào, tương đậu vàng, nước tương, đường với lượng nước đã ghi. Chuẩn bị sẵn chén sốt cạnh bếp vì món xào rất nhanh.' },
      { title: 'Phi thơm tỏi ớt lửa lớn', instruction: 'Làm nóng chảo ở lửa lớn rồi cho dầu. Thêm tỏi và ớt, đảo khoảng 10–15 giây đến thơm, chưa vàng đậm.' },
      { title: 'Xào nhanh phần cọng và lá', instruction: 'Cho phần cọng rau vào đảo khoảng 20–30 giây, tiếp đến cho lá và toàn bộ chén sốt. Đảo nhanh 45–60 giây để rau chín đều.' },
      { title: 'Trút đĩa dùng ngay', instruction: 'Khi lá vừa xẹp, cọng chuyển xanh và còn giòn, tắt bếp ngay. Trút cả rau và nước sốt ra đĩa; không giữ trong chảo nóng lâu vì rau sẽ mềm và sẫm màu.' }
    ]
  },
  {
    num: 40,
    slug: 'khai-jiao',
    title: 'Khai Jiao (Trứng chiên phồng kiểu Thái)',
    category: 'Món chiên',
    prep: 5,
    cook: 5,
    total: 10,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85',
    summary: 'Trứng chiên phồng xốp giòn rụm ở viền ngoài, mềm ngọt bên trong, cực kỳ đưa cơm.',
    ingredients: [
      { name: 'Trứng gà', id: 'egg', qty: 100, unit: 'g', role: 'MAIN' },
      { name: 'Hành lá', id: 'scallion', qty: 10, unit: 'g', role: 'SEASONING' },
      { name: 'Nước mắm', id: 'fish-sauce', qty: 3, unit: 'ml', role: 'SEASONING' },
      { name: 'Dầu ăn', id: 'oil', qty: 45, unit: 'ml', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Đánh bông trứng', instruction: 'Băm nhỏ hành lá; nếu dùng thịt heo, tách thật tơi. Đập 2 trứng vào tô, thêm nước mắm, tiêu, hành và thịt băm.' },
      { title: 'Tạo bọt khí', instruction: 'Đánh mạnh 30–45 giây để lòng trắng, lòng đỏ và thịt quyện đều, có ít bọt trên mặt. Dùng chảo nhỏ sâu lòng để lượng dầu đủ tạo độ phồng.' },
      { title: 'Chiên trong dầu nóng', instruction: 'Đun dầu ở lửa vừa lớn đến khoảng 170°C. Rót trứng vào giữa chảo từ độ cao vừa phải khoảng 10 cm, cẩn thận dầu bắn.' },
      { title: 'Lật giòn hai mặt', instruction: 'Hạ lửa vừa, chiên 1,5–2 phút đến mặt dưới vàng và mép giòn. Lật nhẹ bằng sạn, chiên mặt còn lại 1–2 phút; nếu có thịt, kiểm tra phần giữa đã chín hoàn toàn.' },
      { title: 'Thấm dầu và dùng nóng', instruction: 'Vớt trứng lên vỉ hoặc giấy thấm dầu trong 30–60 giây. Dùng nóng khi trứng còn phồng và giòn cạnh, không đậy kín khi vừa chiên xong.' }
    ]
  },
  {
    num: 41,
    slug: 'khao-niao-mamuang',
    title: 'Khao Niao Mamuang (Xôi xoài)',
    category: 'Tráng miệng',
    prep: 20,
    cook: 30,
    total: 50,
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85',
    summary: 'Xôi nếp dẻo thơm ngấm nước cốt dừa béo ngọt, ăn kèm xoài cát chín vàng ngọt lịm.',
    ingredients: [
      { name: 'Gạo nếp', id: 'glutinous-rice', qty: 60, unit: 'g', role: 'MAIN' },
      { name: 'Xoài chín', id: 'ripe-mango', qty: 150, unit: 'g', role: 'MAIN' },
      { name: 'Nước cốt dừa', id: 'coconut-milk', qty: 60, unit: 'ml', role: 'MAIN' },
      { name: 'Đường cát', id: 'sugar', qty: 15, unit: 'g', role: 'SEASONING' },
      { name: 'Mè rang', id: 'sesame-seeds', qty: 2, unit: 'g', role: 'SEASONING' }
    ],
    steps: [
      { title: 'Ngâm và đồ xôi', instruction: 'Vo 60 g nếp, ngâm nước 4–6 giờ rồi để ráo. Hấp trong xửng lót vải hoặc lá sạch khoảng 25–35 phút, đảo giữa chừng; hạt phải mềm, không còn lõi trắng cứng.' },
      { title: 'Nấu nước cốt dừa ngâm xôi', instruction: 'Đun nhẹ 45 ml nước cốt dừa với 12 g đường và phần lớn muối cho tan, không để sôi trào. Giữ lại 15 ml cốt dừa, 3 g đường và chút muối để làm sốt mặt.' },
      { title: 'Trộn xôi với nước dừa', instruction: 'Cho nếp còn nóng vào tô nhỏ, rưới hỗn hợp cốt dừa ấm, trộn nhẹ rồi đậy khoảng 15–20 phút để nếp hút nước; không nấu lại trên bếp.' },
      { title: 'Nấu sốt cốt dừa rưới mặt', instruction: 'Hòa bột gạo với 1 thìa cà phê nước. Đun phần cốt dừa, đường, muối còn lại trong nồi thật nhỏ, cho bột vào khuấy 30–60 giây đến hơi sánh; thêm ít nước nếu quá đặc.' },
      { title: 'Bày đĩa cùng xoài chín', instruction: 'Gọt và thái xoài. Xếp một phần xôi cùng xoài, rưới sốt và rắc mè; dùng trong ngày, bảo quản lạnh phần có cốt dừa nếu chưa ăn ngay.' }
    ]
  }
];

async function run() {
  const db = new Database();
  console.log(`Bắt đầu nhập ${THAI_RECIPES.length} công thức món Thái tiêu biểu...`);

  try {
    for (const r of THAI_RECIPES) {
      // 1. Upsert ingredients
      for (const ing of r.ingredients) {
        await db.ingredient.upsert({
          where: { id: ing.id },
          create: {
            id: ing.id,
            name: ing.name,
            aliasesText: JSON.stringify([ing.name.toLowerCase()]),
            unit: ing.unit,
            category: 'Nguyên liệu Thái',
          },
          update: {},
        });
      }

      // 2. Check if recipe exists
      const existing = await db.recipe.findUnique({ where: { slug: r.slug } });
      if (existing) {
        console.log(`- Món ${r.title} đã có sẵn, bỏ qua.`);
        continue;
      }

      // 3. Create recipe
      await db.recipe.create({
        data: {
          slug: r.slug,
          title: r.title,
          summary: r.summary,
          cuisine: 'TH',
          category: r.category,
          image: r.image,
          imageCredit: 'Cookora · Ẩm thực Thái Lan',
          baseServings: 1,
          prepMinutes: r.prep,
          cookMinutes: r.cook,
          waitMinutes: 0,
          totalMinutes: r.total,
          timingStatus: 'VERIFIED',
          preconditions: 'Dành cho 1 người ăn; dọn nóng cùng cơm hoặc bún.',
          difficulty: r.difficulty,
          contentStatus: 'APPROVED',
          sourceUrl: 'https://www.tourismthailand.my/thaifood_recipes.php',
          sourceName: 'Tourism Authority of Thailand',
          lines: {
            create: r.ingredients.map((ing, idx) => ({
              ingredientId: ing.id,
              quantity: String(ing.qty),
              unit: ing.unit,
              role: ing.role,
              sortOrder: idx + 1,
            })),
          },
          steps: {
            create: r.steps.map((st, idx) => ({
              order: idx + 1,
              title: st.title,
              instruction: st.instruction,
            })),
          },
        },
      });
      console.log(`✓ Đã nạp thành công: ${r.title}`);
    }
    console.log('Hoàn thành nạp món Thái vào cơ sở dữ liệu!');
  } finally {
    await db.$disconnect();
  }
}

run().catch(console.error);
