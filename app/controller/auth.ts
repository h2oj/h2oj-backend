import { Controller } from 'egg';
import CryptoJS from 'crypto-js';

class AuthController extends Controller {
    private validate(payload: any): boolean {
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

    public async signup() {
        const { ctx } = this;
        const param = ctx.request.body;

        if (!ctx.state.captcha.verified || !this.validate(param)) {
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

        if (!this.validate(param)) {
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

        const password = CryptoJS.MD5(param.password + user.crypto_salt).toString();
        if (password !== user.password) {
            ctx.helper.response(1003,  'incorrect name or password');
            return;
        }
        
        const token = app.jwt.sign({
            user_id: user.uid,
            role_id: user.role_id,
        }, app.config.jwt.secret);

        user.last_login = ctx.helper.getTime();
        await user.save();

        ctx.helper.response(200, 'processed successfully', {
            username: user.username,
            nickname: user.nickname,
            uid: user.uid,
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
