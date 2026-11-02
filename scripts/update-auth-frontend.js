const fs = require('fs');

let auth = fs.readFileSync('frontend/src/pages/Auth.tsx', 'utf8');

auth = auth.replace('type="email"', 'type="text"');
auth = auth.replace('autoComplete="email"', 'autoComplete="username"');
auth = auth.replace('placeholder="ban@example.com"', 'placeholder="tien hoặc email của bạn"');
auth = auth.replace('<label>\n            Email', '<label>\n            Tài khoản hoặc Email');
auth = auth.replace('<label>\r\n            Email', '<label>\r\n            Tài khoản hoặc Email');
auth = auth.replace('minLength={12}', 'minLength={6}');
auth = auth.replace('placeholder="Ít nhất 12 ký tự"', 'placeholder="Ít nhất 6 ký tự"');

fs.writeFileSync('frontend/src/pages/Auth.tsx', auth, 'utf8');
console.log('Auth.tsx frontend updated successfully!');
