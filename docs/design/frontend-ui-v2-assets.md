# Ảnh món ăn Cookora UI v2

Tạo bằng built-in `image_gen`, không dùng CLI fallback. Các file dự án cuối cùng nằm trong `C:/Cookara/frontend/public/images/`; không phụ thuộc thư mục cache của Codex. Đây là ảnh AI minh họa, không phải ảnh một mẻ nấu thử.

## File được dùng

| Món | File trong frontend/public/images |
| --- | --- |
| Đậu hũ sốt cà chua / hero | `cookora-tofu-640.webp`, `cookora-tofu-1200.webp` |
| Cơm kimchi | `kimchi.webp` |
| Oyakodon | `oyakodon.webp` |
| Trứng xào cà chua | `eggs-tomato.webp` |
| Gà gai yang áp chảo | `gai-yang.webp` |
| Spaghetti aglio e olio | `aglio-olio.webp` |
| Ratatouille | `ratatouille.webp` |

## Prompt set tái tạo

Các brief sau mô tả phiên bản cuối để tái tạo asset; kết quả AI không xác định nên không đảm bảo giống pixel với ảnh hiện tại.

Style chung: photorealistic-natural editorial food photography for Cookora, warm natural window light, handmade ceramics, warm ivory background, appetizing realistic cooked food, high detail and natural texture, restrained props, no text, logo, watermark, hands or UI. Square composition with the full dish visible, usable for rounded recipe cards. Avoid extravagant garnish or ingredients not described.

Hero / đậu hũ: Vietnamese home-style tofu in tomato sauce. Golden rectangular pieces of tofu in a rich chunky red tomato sauce, finely chopped scallions, shallow warm ivory ceramic bowl. Natural three-quarter top-down angle, bowl fills the frame without cropping away the dish. Warm cream table, minimal background. No meat, eggs, labels, UI or text. Use a landscape crop for the website hero while keeping the dish legible in a square card.

Cơm kimchi: Korean kimchi fried rice, red-orange grains mixed with chopped kimchi and scallions in a charcoal ceramic bowl. NO fried egg, no lemon, no cilantro, no cutlery stuck into food.

Oyakodon: Japanese oyakodon rice bowl, clearly visible pieces of fully cooked chicken thigh and fully set yellow egg with tender onion, scallion garnish over steamed white rice. No raw egg, no salmon.

Trứng xào cà chua: Chinese home-style tomato scrambled eggs, chunky ripe red tomatoes and softly scrambled fully set yellow eggs with scallions, in a pale ceramic plate. No toast, no fried sunny-side egg.

Gà gai yang: Thai inspired home pan-cooked chicken thigh with lemongrass and caramelized golden-brown surface, sliced chicken cooked through on a warm ivory plate, subtle cilantro and a little sliced chili. No whole roast chicken, no raw meat.

Aglio e olio: Italian spaghetti aglio e olio, thin spaghetti coated in olive oil with sliced golden garlic, a little parsley and chili flakes, served as a simple elegant swirl in a shallow handmade bowl. No cream, no mushrooms, no cheese, no meat.

Ratatouille: Rustic French home-style ratatouille, CHUNKY stewed eggplant, zucchini, tomato and bell peppers with basil leaves, in a shallow rustic ceramic bowl. No raw salad, no avocado, no decorative thin concentric vegetable slices.

Kiểm tra đầu ra: đúng món, không chữ/watermark, hình thức nấu chín, không thêm trứng vào ảnh cơm kimchi; sau đó đổi sang WebP và tạo kích thước responsive. Chuyển định dạng/kích thước bằng sharp, không dùng sharp để dựng hoặc chỉnh nội dung ảnh.
