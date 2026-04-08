import { orm } from './src/shared/orm.js';
import { User } from './src/users/user.entity.js';

async function test() {
  const em = orm.em.fork(); // Create a fork for this execution
  const user = await em.findOne(User, { userName: 'rodri123' });
  console.log('USER RODRI123:', user);
  process.exit(0);
}

test().catch(console.error);
