# Cookora — nghiên cứu đối chiếu và homepage v2

Ngày nghiên cứu: **31/10/2026**, Asia/Bangkok. Phạm vi: homepage, tìm món từ nguyên liệu, trợ lý AI, thực đơn và danh sách đi chợ. Đầu ra: 31 sản phẩm tham chiếu, quyết định font, hệ thống motion, ảnh concept và bản xem trước tương tác.

## Phạm vi và phương pháp

Đây là khảo sát rộng có chọn lọc, **không phải danh sách đầy đủ mọi website trên Internet**. Ưu tiên website chính thức, tài liệu sản phẩm và thông báo của nhà phát hành; dùng kết quả lập chỉ mục của chính website khi trang phụ thuộc JavaScript hoặc chặn truy cập. Không đăng ký tài khoản trả phí, không chấm điểm UX định lượng, không khẳng định đã kiểm thử toàn bộ ứng dụng hoặc biết công nghệ nội bộ của đối thủ.

Các mô tả chức năng bên dưới là thông tin công khai từ nguồn dẫn kèm. Cột “Áp dụng cho Cookora” là nhận định thiết kế của dự án. Không sao chép ảnh, logo, nội dung công thức hay giao diện của đối thủ. Những mục chưa đọc trực tiếp được được ghi rõ.

## Bản đồ 31 sản phẩm

| # | Sản phẩm và nguồn chính thức | Ý tưởng/chức năng được đối chiếu | Áp dụng cho Cookora |
|---:|---|---|---|
| 1 | [SuperCook](https://www.supercook.com/?msg=1) | Chọn nguyên liệu trong pantry để mở ra công thức phù hợp. Trang hiện tại phụ thuộc JS; đối chiếu nội dung được lập chỉ mục của chính website. | Đưa thao tác chọn nguyên liệu lên hero; không bắt người dùng hiểu thuật ngữ AI. |
| 2 | [MyFridgeFood](https://myfridgefood.com/?detailed=false) | Danh sách nguyên liệu để chọn trước khi tìm món. Trang gốc mở trực tiếp bị timeout; dùng bản lập chỉ mục chính thức. | Hạn chế checkbox dày đặc; dùng nhóm nguyên liệu và chip có thể xóa. |
| 3 | [UseMyFood](https://www.usemyfood.com/) | Nhập/dán/chụp nguyên liệu, tìm công thức đã xuất bản và dẫn tới nguồn. | Tách rõ tìm trong thư viện với tạo gợi ý bằng AI; hiển thị nguyên liệu đang được giả định có sẵn. |
| 4 | [Pantry Recipe Finder](https://www.pantryrecipefinder.com/) | Xếp hạng công thức theo nguyên liệu đang có; có trạng thái match chưa xác định. | Hiển thị có/thiếu/chưa rõ lượng; không gọi một tỷ lệ là bằng chứng nấu đủ. |
| 5 | [Samsung Food](https://samsungfood.com/) | Lưu công thức, lên thực đơn và tạo danh sách đi chợ trong một sản phẩm. | Tạo một luồng liên tục từ chọn món đến đi chợ, thay vì quảng bá mỗi tính năng riêng lẻ. |
| 6 | [SideChef](https://www.sidechef.com/) | Khám phá theo nguyên liệu, bữa ăn, loại món; hướng dẫn từng bước và mua sắm. | Bộ lọc theo nhu cầu bữa ăn, cooking mode và CTA tiếp theo dễ tìm. |
| 7 | [Sorted Sidekick](https://www.sortedfood.com/sidekick) | Trợ lý đồng hành nấu ăn; tổ chức công thức và trải nghiệm bữa ăn. | Giọng sản phẩm gần gũi; lời hứa tập trung vào giảm công việc mỗi ngày. |
| 8 | [KitchenPal](https://kitchenpalapp.com/en/) | Pantry, công thức theo nguyên liệu, meal plan, shopping và theo dõi đồ cần dùng sớm. | Cho thấy trạng thái nguyên liệu; kho/expiry chỉ đưa vào sản phẩm khi backend thực sự hỗ trợ. |
| 9 | [Jow](https://jow.com/) | Kết nối lập thực đơn với mua thực phẩm. | Đặt đầu ra “bữa tối và danh sách cần mua” lên trước, CTA ngắn và cụ thể. |
| 10 | [ChefGPT](https://www.chefgpt.xyz/) | Tạo công thức bằng AI và các công cụ theo dõi ăn uống. | Nhập bằng ngôn ngữ tự nhiên và sửa gợi ý; không suy ra dữ liệu dinh dưỡng chưa có của Cookora. |
| 11 | [DishGen](https://www.dishgen.com/) | Tạo công thức và meal plan bằng AI. | Phân biệt ý tưởng AI với công thức đã qua biên tập; cho người dùng sửa yêu cầu. |
| 12 | [PantryAI](https://pantryai.io/) | Nhận biết nguyên liệu, pantry, công thức AI, hướng dẫn và lưu công thức. | Cho người dùng xem và chỉnh danh sách nguyên liệu trước khi tìm món. |
| 13 | [The Pantry](https://thepantry.app/) | Pantry kết nối công thức, kế hoạch và danh sách đi chợ; có thao tác nhập bằng ảnh. | Giữ trạng thái nguyên liệu xuyên suốt hành trình; nhập ảnh là hướng phát triển, không gắn nhãn đã có. |
| 14 | [Look Dish](https://lookdish.com/) | Website chính thức được lập chỉ mục mô tả pantry, Chef AI, planner và grocery. Lần mở trực tiếp không có nội dung đọc được. | Tham chiếu mô hình sản phẩm; chưa dùng làm bằng chứng cho UX nội bộ. |
| 15 | [Supper](https://supperapp.io/) | Nhập công thức từ nhiều nguồn, trợ lý bếp, kéo vào lịch, danh sách mua và chia sẻ nhóm. | Duy trì sự liên hệ giữa công thức, khẩu phần và thực đơn. |
| 16 | [CookSage](https://cooksage.app/) | Quản lý công thức, pantry, shopping và nhập công thức. | Giữ thông tin có cấu trúc; CTA không phá vỡ bước tiếp theo của người nấu. |
| 17 | [Paprika](https://www.paprikaapp.com/) | Recipe manager, meal plan, gộp lượng trong shopping, scale và công cụ khi nấu. | Ưu tiên độ rõ của lượng và thao tác đánh dấu bước; motion không che nguyên liệu. |
| 18 | [AnyList](https://www.anylist.com/) | Danh sách chia sẻ, nhập công thức và lịch thực đơn. | Checkbox và trạng thái đã mua cần phản hồi tức thời, có hoàn tác phù hợp. |
| 19 | [Recipe Keeper](https://recipekeeperonline.com/) | Lưu/nhập/scan công thức, planner và shopping trên nhiều thiết bị. | Bộ sưu tập cá nhân và tìm lại công thức phải dễ hơn nhập lại dữ liệu. |
| 20 | [MealBoard](https://www.mealboard.com/) | Lưu công thức, lập thực đơn và tạo danh sách mua. | Hệ thống điều hướng ngắn, liên kết ba tác vụ chính. |
| 21 | [ReciMe](https://www.recime.app/) | Nhập công thức từ mạng xã hội/ảnh, meal planning, shopping theo quầy hoặc công thức. | Hiển thị nguồn và tổ chức công thức; không nhồi quá nhiều lựa chọn lên hero. |
| 22 | [Plan to Eat](https://www.plantoeat.com/) | Meal planner, recipe organizer và automatic grocery lists. | Đặt thực đơn làm điểm nối giữa cảm hứng và hành động. |
| 23 | [Eat This Much](https://www.eatthismuch.com/) | Tạo kế hoạch theo sở thích và mục tiêu; pantry và shopping được nối với thực đơn. | Chỉ thu thập ràng buộc người dùng cần ngay; phần dinh dưỡng là phạm vi riêng. |
| 24 | [MealPrepPro](https://www.mealpreppro.com/) | Meal prep, điều chỉnh khẩu phần, kế hoạch và grocery list. | Khẩu phần là control có tác động rõ, không bị ẩn trong bước sau. |
| 25 | [Mealie](https://mealie.io/) | Tự host, nhập công thức, lịch thực đơn và tổ chức công thức. | Tính nhất quán dữ liệu quan trọng hơn hiệu ứng; thao tác tuần cần giữ ngữ cảnh. |
| 26 | [Tandoor](https://docs.tandoor.dev/) | Quản lý công thức, chỉnh sửa, meal planning và shopping từ món/plan. | Phân biệt không gian biên tập với trải nghiệm chọn món của người dùng. |
| 27 | [KitchenOwl](https://kitchenowl.org/) | Household, shopping, công thức và meal plan cùng gia đình. | Trạng thái và quyền sở hữu phải rõ; chia sẻ nhóm là phạm vi tiếp theo của Cookora. |
| 28 | [Kitchen Stories](https://www.kitchenstories.com/en/stories/about-us) | Nội dung ảnh/video hướng dẫn và công thức; nguồn chính thức về định hướng sản phẩm. Homepage bị giới hạn truy cập trong lần kiểm tra. | Học cách ảnh giải thích món và bước làm; không dùng ảnh chỉ để lấp bố cục. |
| 29 | [Cookpad Việt Nam](https://cookpad.com/vn) · [Nhập công thức](https://blog.cookpad.com/vn/recipe-import) | Cộng đồng nấu ăn tại nhà, tìm công thức và lưu/nhập công thức. | Ngôn ngữ bếp Việt, tên nguyên liệu quen thuộc, tác giả và nguồn rõ ràng. |
| 30 | [Cooky](https://cooky.vn/) | Thư viện công thức và nội dung bữa ăn Việt trên website chính thức. | Độ phủ món Việt và ảnh món phải phù hợp bối cảnh người dùng trong nước. |
| 31 | [Mealime — thông báo chính thức](https://www.mealime.com/closing) | Thông báo ngừng Mealime từ **21/10/2026**, chuyển hướng sang Meals Hub. | Chỉ dùng làm tham chiếu lịch sử; không giới thiệu là ứng dụng độc lập còn hoạt động. |

Ngoài danh mục trên, đã kiểm tra Cooklist và BigOven nhưng nội dung công khai đọc được không đủ hoặc bị chặn. Không dùng tên tuổi cũ để suy đoán chức năng và trạng thái hiện tại. Các chức năng nhập ảnh, OCR, pantry expiry và nhóm gia đình của đối thủ không tự trở thành phạm vi đã triển khai của Cookora.

## Những kết luận tác động đến homepage

1. **Định vị:** giúp người dùng quyết định bữa tiếp theo từ nguyên liệu sẵn có. Hero cần có thao tác thực, thay vì chỉ có ảnh và một câu truyền cảm hứng.
2. **Luồng chính:** chọn nguyên liệu → xem có/thiếu/chưa rõ → chọn món → thêm vào thực đơn → gộp đi chợ. Duy trì một CTA nổi bật ở mỗi giai đoạn.
3. **AI là một lựa chọn:** tìm món theo dữ liệu và gợi ý bằng AI cần được phân biệt. Không dùng animation “AI đang nghĩ” cho truy vấn thư viện thông thường.
4. **Bản sắc:** bữa cơm Việt làm tâm điểm; quốc tế là lớp khám phá tiếp theo. Phân bổ dự án vẫn là 150 đề tài Việt và 150 nước ngoài, chưa phải 300 món đã phát hành.
5. **Tính trung thực:** ảnh concept là minh họa; công thức mẫu là bản thảo. Không đưa rating, kcal, giá, người dùng, tốc độ hoặc tỷ lệ tiết kiệm giả lên thiết kế.

Đây là suy luận thiết kế từ đối chiếu chức năng và bối cảnh Cookora, chưa phải kết quả user testing hoặc bằng chứng tăng conversion.

## Hướng v2: Bếp Việt đương đại

Nền porcelain `#FAF8F1`, chữ olive gần đen `#20271E`, cam `#E6512B`, xanh chanh `#DDEF89`. Tông ấm của Cookora được giữ nhưng tăng tương phản và kích thước chữ. Hình món ăn tách nền trên mảng xanh, composer nguyên liệu nổi bật, recipe grid bất đối xứng và khối thực đơn tối màu tạo nhịp trang.

Hero: **“CÓ GÌ, NẤU NẤY.”**. Bên dưới là trường chọn nguyên liệu và khẩu phần. Không yêu cầu người dùng đọc mô tả AI trước khi thao tác. Navigation ưu tiên Khám phá / Có gì nấu nấy / Thực đơn tuần.

Ảnh concept: `homepage-concept-v2.png`. Prompt nguồn: `homepage-concept-v2-prompt.md`, tạo bằng ImageGen tích hợp. Ảnh thể hiện art direction; font trong ảnh do mô hình tái hiện, không phải bằng chứng font thật được nhúng. Bản xem trước tương tác dùng font web thật.

## Font không chân: quyết định và tối ưu

Đã kiểm tra trực tiếp `METADATA.pb` trong repository Google Fonts, bao gồm `subsets` và trục `wght`:

| Font | Tiếng Việt theo metadata | Biến thể | Vai trò đề xuất |
|---|---|---|---|
| [Plus Jakarta Sans](https://github.com/google/fonts/blob/main/ofl/plusjakartasans/METADATA.pb) | Có | Variable 200–800 | Lựa chọn chính, dùng xuyên suốt; headline 750–800, UI 500–650, body 400–500. |
| [Manrope](https://github.com/google/fonts/blob/main/ofl/manrope/METADATA.pb) | Có | Variable 200–800 | Phương án mềm và ít phô trương hơn; tốt khi có nhiều nội dung và control. |
| [Space Grotesk](https://github.com/google/fonts/blob/main/ofl/spacegrotesk/METADATA.pb) | Có | Variable 300–700 | Phương án hình học nổi bật; thiên về cá tính công nghệ hơn nét bếp nhà. |
| [Sora](https://github.com/google/fonts/blob/main/ofl/sora/METADATA.pb) | Không khai báo subset Vietnamese | Variable 100–800 | Không chọn làm mặc định tiếng Việt; nguy cơ chữ có dấu dùng fallback, cần thử glyph nếu muốn dùng. |
| [Outfit](https://github.com/google/fonts/blob/main/ofl/outfit/METADATA.pb) | Không khai báo subset Vietnamese | Variable 100–900 | Không chọn làm mặc định tiếng Việt vì lý do tương tự. |

Không khai báo subset không đồng nghĩa đã chứng minh thiếu mọi ký tự tiếng Việt; đây là cơ sở tránh rủi ro fallback trước khi có kiểm tra glyph chi tiết.

Thiết lập triển khai đề xuất:

- Bắt đầu với **một family variable Plus Jakarta Sans**; chỉ thêm family thứ hai khi có lý do đã kiểm chứng.
- Self-host WOFF2, giữ subset Latin và Vietnamese; kiểm tra cách chia `unicode-range` để tải đúng chữ. Không dùng `text=` cố định cho nội dung do người dùng nhập.
- Tải sớm font quan trọng bằng stylesheet/link trong head, tránh chuỗi `@import` font hiện tại; preload có chọn lọc đúng file/weight cần dùng đầu trang.
- `font-display: swap`, fallback `system-ui`, cân metric bằng `size-adjust`/overrides sau khi đo. Không khai báo metric giả như đã tối ưu.
- Headline desktop khoảng 88–112px tùy chiều rộng, mobile 44–60px; line-height đủ chỗ cho dấu, không cắt bằng overflow. Body 16–18px, line-height khoảng 1.6; control tối thiểu 16px trên mobile.
- Tracking headline âm nhẹ, không ép chữ nhỏ; không animate liên tục trục weight vì có thể gây thêm công việc render.
- Kiểm tra câu “Bữa cơm Việt — Đậu hũ, trứng, ớt; Nguyễn Thị Ánh” ở mọi weight và viewport.

Nguồn kỹ thuật: [font best practices](https://web.dev/articles/font-best-practices), [typography](https://web.dev/learn/design/typography). Kích thước, weight và phối màu là quyết định thiết kế của Cookora, chưa phải kết quả đo hiệu năng.

## Motion có mục đích

| Tình huống | Chuyển động | Thời lượng đề xuất | Giảm chuyển động |
|---|---|---:|---|
| Chọn/xóa nguyên liệu | Chip thay trạng thái, các chip còn lại đổi vị trí mượt | 160–220ms | Thay trạng thái ngay, giữ focus |
| Tìm món thành công | Kết quả xuất hiện theo nhóm nhỏ, dịch tối đa 12–16px | 220–320ms | Hiện kết quả ngay |
| Lưu món yêu thích | Heart đổi fill và scale nhẹ một lần | 140–180ms | Đổi fill, không scale |
| Thêm vào thực đơn | Xác nhận tại CTA, món xuất hiện trong ô ngày được chọn | 200–300ms | Cập nhật trạng thái và thông báo |
| Chuyển recipe → chi tiết | View transition khi trình duyệt hỗ trợ | 180–260ms | Điều hướng bình thường |
| Mở phần nằm dưới màn hình | Reveal một lần, nội dung vẫn có sẵn nếu JS lỗi | 240–360ms | Không reveal động |
| Gọi AI thật | Trạng thái đang xử lý gắn với request; không hiển thị % giả | Theo request thật | Nhãn tĩnh và trạng thái truy cập được |

Các thời lượng là thông số khởi đầu để tinh chỉnh, không phải số đo sản phẩm hiện tại. Không dùng scroll hijacking, không bắt người dùng chờ animation, không có cursor thay thế, không tự quay carousel hay chạy chữ vô hạn.

Stack đề xuất cho React: **Motion for React** (`motion/react`), `LazyMotion` + `domAnimation` cho nhu cầu phù hợp; `MotionConfig reducedMotion="user"` và `useReducedMotion` khi cần. Không thêm đồng thời GSAP, Lottie và một bộ scroll engine cho cùng nhu cầu. [Motion bundle](https://motion.dev/docs/react-reduce-bundle-size), [accessibility](https://motion.dev/docs/react-accessibility).

Bản xem trước dùng **Web Animations API** native để thử tương tác mà không thêm dependency vào ứng dụng. [WAAPI](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API). **View Transition API** chỉ dùng như progressive enhancement, có fallback và kiểm tra reduced motion. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API).

## Ranh giới triển khai và tiêu chí nghiệm thu

Bước này là nghiên cứu, art direction và thử tương tác. Backend, route, AI key, dữ liệu 300 đề tài và homepage React hiện tại không bị thay thế. Preview dùng dữ liệu minh họa cục bộ, không gọi AI và không giả như đang tìm trên thư viện thật.

Khi chuyển sang ứng dụng: kiểm tra mobile 320/375px, desktop 1440px; không tràn ngang; thứ bậc chữ và dấu tiếng Việt không bị cắt; thao tác được bằng bàn phím; focus rõ; loading/error/empty thật; reduce motion hoạt động. Đo LCP/INP/CLS trên bản chạy thực tế trước khi nói đã đạt hiệu năng. Hero ảnh AVIF/WebP có kích thước và srcset, ảnh đầu ưu tiên tải, ảnh dưới lazy-load; animation ưu tiên transform/opacity.

## Kiểm tra bản xem trước

Đã chạy trên Edge headless: chọn nguyên liệu và lọc gợi ý mẫu, đổi khẩu phần, thêm món vào thực đơn mẫu, kiểm tra bố cục thứ hai và `prefers-reduced-motion`. Ba family font đã tải qua `document.fonts.load`; không có lỗi JavaScript hoặc tràn ngang trong các viewport 320/375/768/1024px. Đã xem ảnh chụp desktop và mobile; kiểm tra khung preview tự tăng chiều cao sau đổi viewport. Kết quả máy đọc được ở [homepage-v2-preview-checks.json](homepage-v2-preview-checks.json). Kết quả này áp dụng cho preview, không thay thế kiểm thử homepage React khi triển khai.
