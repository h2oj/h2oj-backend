import { Controller } from 'egg';
import axios from 'axios';
import OAuth, { OAuthType } from '../model/OAuth';
import User from '../model/User';

class OAuthController extends Controller {
    private async signin(oauth: OAuth): Promise<[string, User]> {
        const { ctx, app } = this;

        const user = await User.findOne({
            where: { userId: oauth.userId }
        });

        const token = app.jwt.sign({
            user_id: user.userId,
            role_id: user.roleId,
            timestamp: Math.floor(Number(new Date()) / 1000)
        }, app.config.jwt.secret);

        user.lastLoginTime = ctx.helper.getTime();
        await user.save();

        return [token, user];
    }

    public async signup() {
        const { ctx } = this;
        const {
            username, nickname, oauth_id: oauthID, email, bio, type, password
        } = ctx.request.body;

        if (!ctx.state.captcha.verified || !ctx.service.user.validate({
            email, username
        })) {
            ctx.helper.failure(422, 'validation failed');
            return;
        }

        if (await ctx.service.user.findByEmail(email)) {
            ctx.helper.response(1001, 'invalid email');
            return;
        }
        if (await ctx.service.user.findByUsername(username)) {
            ctx.helper.response(1002, 'invalid username');
            return;
        }

        const user = await ctx.service.user.create({
            username: username,
            nickname: nickname,
            role_id: 999,
            email: email,
            password: password
        });
        user.bio = bio;

        const oauth = await OAuth.create();
        oauth.oauthId = oauthID;
        oauth.userId = user.userId;
        oauth.type = type;
    }

    public async github() {
        const { ctx, app } = this;
        const { code } = ctx.request.body;
        
        const resAuth = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: app.config.h2oj.oauth.github.clientID,
            client_secret: app.config.h2oj.oauth.github.clientSecret,
            code: code
        }, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (resAuth.status !== 200) {
            ctx.helper.response(1101, 'auth failed');
        }

        const { access_token: accessToken } = resAuth.data;

        const resUser = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': 'token ' + accessToken
            }
        });
        
        if (resUser.status !== 200) {
            ctx.helper.response(1102, 'auth failed');
        }

        const oauth = await OAuth.findOne({
            where: { oauthId: resUser.data.id, type: OAuthType.GITHUB }
        });

        if (oauth) {
            const [token, user] = await this.signin(oauth);
            ctx.helper.success({
                signin: true,
                username: user.username,
                nickname: user.nickname,
                role_id: user.roleId,
                user_id: user.userId,
                avatar: user.avatar,
                token: token
            });
            return;
        }

        ctx.helper.success({
            signin: false,
            username: resUser.data.login,
            nickname: resUser.data.user,
            oauth_id: resUser.data.id,
            email: resUser.data.email,
            bio: resUser.data.bio
        });
    }
}

export default OAuthController;
