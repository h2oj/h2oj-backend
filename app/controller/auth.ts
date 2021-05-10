import { Controller } from 'egg';
import CryptoJS from 'crypto-js';

class AuthController extends Controller {
    public async signup() {
        const { ctx } = this;
        const param = ctx.request.body;

        if (!ctx.state.captcha.verified || !ctx.service.user.validate(param)) {
            ctx.helper.failure(422, 'validation failed');
            return;
        }

        if (await ctx.service.user.findByEmail(param.email)) {
            ctx.helper.response(1001, 'invalid email');
            return;
        }
        if (await ctx.service.user.findByUsername(param.username)) {
            ctx.helper.response(1002, 'invalid username');
            return;
        }

        const user = await ctx.service.user.create({
            username: param.username,
            nickname: param.nickname,
            role_id: 999,
            email: param.email,
            password: param.password
        });

        if (user) {
            ctx.helper.response(200, 'processed successfully');
        }
        else {
            ctx.helper.failure(500, 'unknown server error');
        }
    }

    public async signin() {
        const { ctx, app } = this;
        const param = ctx.request.body;

        if (!ctx.service.user.validate(param)) {
            ctx.helper.failure(422, 'validation failed');
        }

        let user = await ctx.service.user.findByUsername(param.username);
        if (!user) {
            user = await ctx.service.user.findByEmail(param.email);
            if (!user) {
                ctx.helper.response(1003, 'incorrect name or password');
                return;
            }
        }

        const password = CryptoJS.MD5(param.password + user.cryptoSalt).toString();
        if (password !== user.password) {
            ctx.helper.response(1003,  'incorrect name or password');
            return;
        }
        
        const token = app.jwt.sign({
            user_id: user.userId,
            role_id: user.roleId,
            timestamp: Math.floor(Number(new Date()) / 1000)
        }, app.config.jwt.secret);

        user.lastLoginTime = ctx.helper.getTime();
        await user.save();

        ctx.helper.response(200, 'processed successfully', {
            username: user.username,
            nickname: user.nickname,
            role_id: user.roleId,
            user_id: user.userId,
            avatar: user.avatar,
            token: token
        });
    }

    public async signout() {
        const { ctx } = this;
        ctx.helper.response(200, 'processed successfully');
    }
}

export default AuthController;
