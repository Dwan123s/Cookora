import '../src/config';
import { Database } from '../src/db';
async function main() {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Use an audited access workflow with MFA for production.');
  const email = process.argv[2]?.toLowerCase().trim();
  if (!email || !email.includes('@')) throw new Error('Usage: npm run editor:grant -w backend -- your-email');
  const db = new Database();
  try {
    await db.user.update({ where: { email }, data: { role: 'EDITOR' } });
    console.log('Local editor role granted. Log out and sign in again.');
  } finally {
    await db.$disconnect();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
