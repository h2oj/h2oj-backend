import { Service } from 'egg';
import CryptoJS from 'crypto-js';
import User from '../model/User';

class UserService extends Service {
    public validate(payload: any): boolean {
        const reEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        //const rePhone = /^(\+86)(13[0-9]|145|147|15[0-3,5-9]|18[0,2,5-9])(\d{8})$/;
        const reUsername = /^[a-zA-Z]+[a-zA-Z0-9_]*$/;

        if (payload.email && !reEmail.test(payload.email)) {
            return false;
        }
        if (payload.username && !reUsername.test(payload.username)) {
            return false;
        }
        return true;
    }

    public async create(payload: any): Promise<User> {
        const { ctx } = this;
        let user = User.create();
        const salt = CryptoJS.lib.WordArray.random(8).toString();

        user.username = payload.username;
        user.nickname = payload.username;
        user.password = CryptoJS.MD5(payload.password + salt).toString();
        user.crypto_salt = salt;
        user.email = payload.email;
        user.reg_time = ctx.helper.getTime();
        user.last_login = user.reg_time;
        await user.save();

        return user;
    }

    public async findById(user_id: number): Promise<User> {
        let user = await User.findOne({
            where: { user_id: user_id }
        });
        return user;
    }

    public async findByUsername(username: string): Promise<User> {
        let user = await User.findOne({
            where: { username: username }
        });
        return user;
    }

    public async findByEmail(email: string): Promise<User> {
        let user = await User.findOne({
            where: { email: email }
        });
        return user;
    }
}

export default UserService;
