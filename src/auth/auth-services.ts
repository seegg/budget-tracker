import jsonwebtoken from 'jsonwebtoken';
import { User } from '../user/user-types';
import config from '../config';
import { PasswordServices, passwordServices } from './password';
import { UserServices, userServices } from '../user';

export class AuthServices {
  private userServices;
  private passwordServices;
  private appConfig;
  private jwt;

  /**
   * construct Auth services with dependencies
   * @param userServices 
   * @param passwordServices 
   * @param appConfig app configs
   * @param jwt json web token
   */
  constructor(userServices: UserServices, passwordServices: PasswordServices, appConfig = config, jwt = jsonwebtoken) {
    this.userServices = userServices;
    this.passwordServices = passwordServices;
    this.appConfig = appConfig;
    this.jwt = jsonwebtoken;
  }

  async generateAccessToken(user: User, expiresIn: number = 86400) {
    const { jwtKey } = this.appConfig;
    return await this.jwt.sign(user, jwtKey, { expiresIn });

  };

  /**
   * parse and return the payload in a jwt as plain text.
   */
  async parseAccessToken(token: string) {

    const { jwtKey } = this.appConfig;
    return await this.jwt.verify(token, jwtKey);

  };

  /**
   * Generate and return an access token if credentials are correct.
   * return null if credentials are incorrect.
   */
  async verifyByEmail(email: string, password: string) {
    //if email and password is verified, generate access token from userinfo.
    if (await this.passwordServices.verifyPasswordByEmail(email, password)) {
      const user = await this.userServices.getUserByEmail(email);
      return this.generateAccessToken(user);
    } else {
      return null;
    }
  };

  async registerUser({ name, email, password }: { email: string, name: string, password: string }) {

    const user = await this.userServices.addUser({ name, password, email });
    return user;

  };
}

const defaulAuthServices = new AuthServices(userServices, passwordServices, config, jsonwebtoken);

export default defaulAuthServices;
