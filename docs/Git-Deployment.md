# Phát hành Cookora từ GitHub

Repo chung: https://github.com/Dwan123s/Cookora. Nhánh production: `main`. Project Vercel hiện có: `cookora` trong scope `dwans-projects-53613816`; domain https://cookora-rose.vercel.app. Giữ nguyên database Neon và các biến môi trường production hiện có.

## Bản hợp nhất ngày 04/11/2026

- UI lấy từ `origin/main` (`24767ba`), bao gồm header island, các trang mới và bộ ảnh sửa. Nhập thêm bản sửa type Planner/Recipe từ `710b7e5` trên `Nhanh-1`.
- Đối chiếu 740 file source của production `dpl_6q4WjsAY6Hio8SHGyxZSfperbYGk`: tất cả khớp byte-for-byte với bản local trước merge. Runtime NestJS/Vercel, Neon, OAuth và AI được giữ trong Git.
- Giữ thanh điều hướng dưới trên mobile và một popup Chat AI dùng chung. Ẩn cả header và khoảng trống của header dưới 768px. Không chồng CSS header hoặc CSS trang cũ lên UI mới.
- Tăng banner cuối trang chủ theo ảnh tham chiếu và bỏ biểu tượng lấp lánh theo yêu cầu tiếp theo.
- Có commit riêng lưu source production trước merge, thuận tiện đối chiếu hoặc khôi phục. `.env`, `.neon`, `.vercel`, `.review` và generated clients không được commit.

## Kết nối Git lần đầu

Kiểm tra Vercel ngày 04/11 cho thấy project chưa có `link`. API kết nối trả về `400 bad_request`: cần cấp quyền GitHub integration cho repo này. Dashboard đã thấy các repo khác của tài khoản `Dwan123s`, nhưng tìm `Cookora` trả về **No Results Found** và nút **Configure GitHub App**. Vì vậy, push Git hiện chưa đủ để tự deploy cho tới khi hoàn tất bước tài khoản sau:

1. Mở https://vercel.com/dwans-projects-53613816/cookora/settings/git bằng tài khoản quản lý project hiện tại.
2. Trong **Configure GitHub App**, thêm `Dwan123s/Cookora` vào danh sách repo được cấp quyền của Vercel; giữ nguyên quyền các repo đang dùng.
3. Chọn **Connect Git Repository → Dwan123s/Cookora**, production branch `main`, root directory là gốc repo.
4. Giữ cấu hình build trong `vercel.json` và các secrets production hiện có; không tạo project hoặc database mới.
5. Nếu commit đã push trước khi kết nối, tạo deployment từ Git reference `main` trong dashboard; sau đó mọi push tiếp theo tự tạo deployment.

Tài liệu Vercel: https://vercel.com/docs/git/vercel-for-github.

## Các lần thay đổi tiếp theo

Tạo nhánh, commit và mở pull request; merge về `main` sau khi kiểm tra. GitHub Actions chạy typecheck, 91 bài kiểm tra backend, build frontend/backend, bundle serverless và audit dependency. Vercel Git Integration build đúng commit trên Git; không upload thư mục local bằng CLI.

```powershell
git pull --ff-only origin main
# Chỉnh sửa trên nhánh làm việc, review rồi merge.
npm run check
node scripts/build-vercel.mjs
git push origin main
```

Vercel không tự chạy migration/seed. Thay đổi schema hoặc dữ liệu production phải được thực hiện có chủ đích riêng. Secrets tiếp tục được quản lý trong Vercel Environment Variables.

## Xác minh sau push

Trong Vercel, xác nhận deployment có source Git, đúng SHA commit trên `main`, trạng thái `READY` và gắn domain production. Kiểm tra `/`, `/cong-thuc`, `/co-gi-nau-nay`, `/thuc-don`, `/eat-fit`, `/ngan-sach`, `/dang-nhap`, API health và đủ 419 công thức public. Trên mobile kiểm tra bottom bar, menu Thêm và popup Chat AI; desktop kiểm tra header thu/mở khi cuộn.

Bằng chứng kiểm tra local được lưu trong `.review/git-merge-check.log`, `.review/git-merge-final-build.log`, `.review/git-merge-audit.json` và `.review/production-source-comparison.json`. Typecheck, 91/91 tests, build và bundle đạt; audit có 0 high/critical, còn 2 moderate đã tồn tại trong Google auth dependencies.
