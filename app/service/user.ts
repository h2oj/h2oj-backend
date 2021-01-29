import { Service } from 'egg';
import CryptoJS from 'crypto-js';
import User from '../model/User';

class UserService extends Service {
    public async create(payload: any): Promise<User> {
        const { ctx } = this;
        let user = ctx.repo.User.create();
        const salt = CryptoJS.lib.WordArray.random(8).toString();

        user.username = payload.username;
        user.nickname = payload.username;
        user.password = CryptoJS.MD5(payload.password + salt).toString();
        user.crypto_salt = salt;
        user.email = payload.email;
        user.reg_time = ctx.helper.getTime();
        user.last_login = user.reg_time;

        await user.save();

        console.log(`New account: ${user.username}(uid=${user.uid})`);
        return user;
    }

    public async findById(uid: number): Promise<User> {
        const { ctx } = this;
        let user = await ctx.repo.User.findOne({
            where: { uid: uid }
        });
        return user;
    }

    public async findByUsername(username: string): Promise<User> {
        const { ctx } = this;
        let user = await ctx.repo.User.findOne({
            where: { username: username }
        });
        return user;
    }

    public async findByEmail(email: string): Promise<User> {
        const { ctx } = this;
        let user = await ctx.repo.User.findOne({
            where: { email: email }
        });
        return user;
    }
}

export default UserService;
