import '../backend/src/config';
import { Database } from '../backend/src/db';
import argon2 from 'argon2';

async function main() {
  const db = new Database();
  try {
    const hash = await argon2.hash('123456', { type: argon2.argon2id });
    
    // Check if user tien exists
    const existing = await db.user.findFirst({
      where: {
        OR: [
          { email: 'tien' },
          { email: 'trongtien6570@gmail.com' }
        ]
      }
    });

    if (existing) {
      await db.user.update({
        where: { id: existing.id },
        data: {
          passwordHash: hash
        }
      });
      console.log('Updated user in SQL Server:', existing.email, 'with password 123456');
    }

    // Also ensure a user with email "tien" exists if allowed
    const userTien = await db.user.findFirst({ where: { email: 'tien' } });
    if (!userTien) {
      await db.user.create({
        data: {
          email: 'tien',
          displayName: 'Tiến',
          passwordHash: hash,
          role: 'USER'
        }
      });
      console.log('Created direct user "tien" in SQL Server!');
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await db.$disconnect();
  }
}

main();
