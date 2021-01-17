import { Controller } from 'egg';

class UserController extends Controller {
    public async detail() {
        const { ctx } = this;
        const param = ctx.query;

        const user = await ctx.repo.User.findOne({
            where: { uid: param.uid }
        });

        if (!user) {
            ctx.helper.response(3001, 'no data');
            return;
        }

        ctx.helper.response(200, 'processed successfully', {
            uid: user.uid,
            sex: user.sex,
            username: user.username,
            nickname: user.nickname,
            description: user.description,
            information: user.information,
            rating: user.rating,
            avatar: user.avatar
        });
    }

    public async update() {
        const { ctx } = this;
        const param = ctx.request.body;

        const user = await ctx.repo.User.findOne({
            where: { uid: ctx.state.user_id }
        });

        if (!user) {
            ctx.helper.response(3001, 'no data');
            return;
        }

        if (param.avatar) user.avatar = param.avatar;
        if (param.nickname) user.nickname = param.nickname;
        if (param.description) user.description = param.description;
        if (param.information) user.information = param.information;
        if (param.sex) user.sex = param.sex;
        await user.save();

        ctx.helper.response(200, 'processed successfully', {
            uid: user.uid,
            sex: user.sex,
            username: user.username,
            nickname: user.nickname,
            description: user.description,
            information: user.information,
            rating: user.rating,
            avatar: user.avatar
        });
    }
}

export default UserController;
