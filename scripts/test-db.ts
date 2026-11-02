import '../backend/src/config';
import { Database } from '../backend/src/db';

async function test() {
  const db = new Database();
  try {
    const res = await db.recipe.count();
    console.log('Recipes in DB:', res);
  } catch (err: any) {
    console.error('Error connecting DB:', err.message);
  } finally {
    await db.$disconnect();
  }
}
test();
