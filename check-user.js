import { orm } from './dist/src/shared/orm.js';
import { User } from './dist/src/users/user.entity.js';

async function test() {
  const em = orm.em.fork();
  const user = await em.findOne(User, { userName: 'rodri123' });
  console.log('USER RODRI123:', user);
  process.exit(0);
}

test().catch(console.error);
