import { userServices as testUserServices } from './user-services';
import { passwordServices } from '../auth/password/password-services';
import { passwordRepo } from '../auth/password/password-repo';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import knex from 'knex';
import knexConfig from '../db/knexfile';
import { userRepo } from './user-repo';

let testDB = knex(knexConfig.test);

beforeAll(async () => {
  await testDB.migrate.latest();
  await testDB.seed.run();
});

afterAll(async () => {
  await testDB.destroy();
});

describe('user services', () => {
  //set up user services
  const userDB = userRepo(testDB);
  const pwDB = passwordRepo(testDB);
  const pwServices = passwordServices(pbkdf2Sync, randomBytes, pwDB);
  const userServices = testUserServices(userDB,)
  describe('addUser', () => {
    it('should add a new user given valid input', async () => {
      const user = { name: 'test1', email: 'test1@testmail.com', password: 'testpassword123' };
      const newUser = await userServices.addUser(user);
      const dbUser = await userDB.getUserByEmail(user.email);
      expect(newUser.id).toBe(dbUser.id);
      expect(newUser.name).toBe(dbUser.name);
    });

    it('should error when given an existing email', async () => {
      try {
        const user = { name: 'test1', email: 'bob@myemail.com', password: 'testpassword123' };
        const newUser = await userServices.addUser(user);
        expect(newUser).toBeFalsy();
      } catch (err) {
        if (err instanceof Error) {
          expect(err.message).toBe('email already in use');
        }
      }
    });
  });

  describe('deleteUser', () => {
    it('should delete a user given valid input', async () => {
      const user = { id: '4omshi7-4tf4-4a5a-8264-4somerand6fff', name: 'Test User', email: 'testuser@myemail.com', verified: false };
      const userBeforeDelete = await userServices.getUserByEmail(user.email);
      await userServices.deleteUser(user);
      const userAfterDelete = await userServices.getUserByEmail(user.email);
      expect(userBeforeDelete.id).toBe(user.id);
      expect(userAfterDelete).toBeNull();
    })
  })
})