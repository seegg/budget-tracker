import { User } from "./user-types";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../error";
import { getUserByEmail, getUserByID, userDB } from './user-repo';

/**
 * create user services with dependencies as parameters
 */
export const userServices = (userDAL = userDB, idGenerator = uuidv4) => {

  return {
    /**
     * Add a new user
     * @returns return user if successful.
     */
    async addUser(newUser: Partial<User>) {
      try {
        const id = idGenerator();
        newUser.id = id;
        await userDAL.insertUser(<User>newUser);
        return newUser;
      } catch (err) {
        throw new AppError('user services', 500, 'error adding new user', true);
      }
    },

    async deleteUser(user: User) {
      try {
        if (user.id) {
          await userDAL.deleteUserByID(user.id);
        } else if (user.email) {
          await userDAL.deleteUserByEmail(user.email);
        } else {
          throw new Error();
        }
      } catch (err) {
        throw new AppError('user services', 500, 'error deleting new user', true);
      }
    },

    async getUser({ id, email }: { id: string, email: string }) {
      try {
        let user: User;
        if (email) {
          user = await getUserByEmail(email);
        } else if (id) {
          user = await getUserByID(id);
        } else {
          throw new AppError('user services', 500, 'error finding user', true);
        }
        return user;
      } catch (err) {
        if (err.isOperational) throw err;
        throw new AppError('user services', 500, 'error finding user', true);
      }
    },

    async getUserByEmail(email: string) {
      try {
        const user = await userDAL.getUserByEmail(email);
        if (!user) throw new AppError('user services', 404, 'that user does not exist', true);
        return user;
      } catch (err) {
        if (err.isOperational) throw err;
        throw new AppError('user services', 500, 'error finding user', true);
      }
    },

    async getUserByID(id: string) {
      try {
        const user = await userDAL.getUserByID(id);
        if (!user) throw new AppError('user services', 404, 'that user does not exist', true);
        return id;
      } catch (err) {
        if (err.isOperational) throw err;
        throw new AppError('user services', 500, 'error finding user', true);
      }
    },

    async updateUser(userDetails: User) {
      try {
        await userDAL.updateUser(userDetails.id, userDetails);
      } catch (err) {
        throw new AppError('user services', 500, 'error updating user', true);
      }
    }
  }

}


export default userServices();