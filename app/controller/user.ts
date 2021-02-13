import { Controller } from 'egg';

import User from '../model/User';

class UserController extends Controller {
    public async list() {
        const { ctx } = this;

        if (!ctx.state.user_id) {
            ctx.helper.failure(422, 'validation failed');
            return;
        }
        if (!await ctx.service.permission.checkPermission(ctx.state.user_id, 'LOOKUP_USER')) {
            ctx.helper.failure(403, 'permission denied');
            return;
        }

        const param = ctx.query;
        const page = param.page || 1;
        const each = param.each || 15;
        const search = param.search;
        let users, length;
        if (search) {
            [users, length] = await ctx.repo.User.createQueryBuilder()
                .where('user.username LIKE :param')
                .setParameter('param', '%' + search + '%')
                .skip((page - 1) * each)
                .take(each)
                .getManyAndCount();
        }
        else {
            [users, length] = await ctx.repo.User.findAndCount({
                skip: (page - 1) * each,
                take: each
            });
        }
        
        ctx.helper.response(200, 'processed successfully', {
            count: length,
            page_count: Math.ceil(length / each),
            users: users.map((user: User) => ({
                uid: user.uid,
                username: user.username,
                nickname: user.nickname,
                role_id: user.role_id,
                email: user.email,
                level: user.level,
                tag: user.tag
            }))
        });
    }

    public async change() {
        const { ctx } = this;
        const param = ctx.query;

        if (!ctx.state.user_id) {
            ctx.helper.failure(422, 'validation failed');
            return;
        }
        if (!await ctx.service.permission.checkPermission(ctx.state.user_id, 'CHANGE_USER')) {
            ctx.helper.failure(403, 'permission denied');
            return;
        }

        const user = await ctx.repo.User.findOne({
            where: { uid: param.uid }
        });

        if (param.role_id) {
            if (await ctx.service.permission.checkPermission(ctx.state.user_id, 'CHANGE_USER_ROLE'))
                user.role_id = param.role_id;
            else ctx.helper.failure(403, 'permission denied');
        }
        if (param.tag) user.tag = param.tag;
        if (param.level) user.level = param.level;
        if (param.avatar) user.avatar = param.avatar;
        if (param.nickname) user.nickname = param.nickname;
        if (param.description) user.description = param.description;
        if (param.information) user.information = param.information;
        if (param.sex) user.sex = param.sex;
        await user.save();
        ctx.helper.response(200, 'processed successfully');
    }

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
            role_id: user.role_id,
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
            role_id: user.role_id,
            description: user.description,
            information: user.information,
            rating: user.rating,
            avatar: user.avatar
        });
    }
}

export default UserController;
