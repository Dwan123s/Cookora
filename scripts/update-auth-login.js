const fs = require('fs');

let auth = fs.readFileSync('backend/src/auth.ts', 'utf8');

// 1. Update credentials validation to allow username and 6-char password
const oldCred = `const credentials = z
  .object({
    email: z
      .email()
      .max(254)
      .transform((v) => v.toLowerCase().trim()),
    password: z.string().min(12, 'Mật khẩu cần ít nhất 12 ký tự').max(128),
  })
  .strict();`;

const newCred = `const credentials = z
  .object({
    email: z
      .string()
      .min(1, 'Vui lòng nhập tài khoản hoặc email')
      .max(254)
      .transform((v) => v.toLowerCase().trim()),
    password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự').max(128),
  })
  .strict();`;

auth = auth.replace(/\r\n/g, '\n');
auth = auth.replace(oldCred.replace(/\r\n/g, '\n'), newCred);

// 2. In login, find user by email or username
const oldLoginFind = `    const input = parse(credentials, body),
      user = await this.db.user.findUnique({ where: { email: input.email } });`;

const newLoginFind = `    const input = parse(credentials, body),
      user = await this.db.user.findFirst({
        where: {
          OR: [
            { email: input.email },
            { email: \`\${input.email}@gmail.com\` },
          ],
        },
      });`;

auth = auth.replace(oldLoginFind.replace(/\r\n/g, '\n'), newLoginFind);

fs.writeFileSync('backend/src/auth.ts', auth, 'utf8');
console.log('auth.ts updated successfully to support username login and 6-char passwords!');
