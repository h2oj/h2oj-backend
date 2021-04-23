import { Controller } from 'egg';

import User from '../model/User';
import UserRole from '../model/UserRole';

class UserController extends Controller {
    public async list() {
        const { ctx } = this;
        const {
            page = 1, each: pageSize = 15, search: searchText
        } = ctx.query;
        const { user_id: userId } = ctx.state;

        if (!userId) {
            ctx.helper.failure(422, 'validation failed');
            return;
        }
        if (!await ctx.service.permission.checkPermission(userId, 'LOOKUP_USER')) {
            ctx.helper.failure(403, 'permission denied');
            return;
        }

        let users, length;
        if (searchText) {
            [users, length] = await User.createQueryBuilder()
                .where('user.username LIKE :param')
                .setParameter('param', '%' + searchText + '%')
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getManyAndCount();
        }
        else {
            [users, length] = await User.findAndCount({
                skip: (page - 1) * pageSize,
                take: pageSize
            });
        }
        
        ctx.helper.response(200, 'processed successfully', {
            count: length,
            page_count: Math.ceil(length / pageSize),
            users: users.map((user: User) => ({
                user_id: user.user_id,
                username: user.username,
                nickname: user.nickname,
                role_id: user.role_id,
                email: user.email,
                level: user.level,
                tag: user.tag,
                reg_time: user.reg_time
            }))
        });
    }

    public async listRole() {
        const { ctx } = this;
        const { user_id: userId } = ctx.state;

        if (!userId) {
            ctx.helper.failure(422, 'validation failed');
            return;
        }
        if (!await ctx.service.permission.checkPermission(userId, 'LOOKUP_ROLE')) {
            ctx.helper.failure(403, 'permission denied');
            return;
        }

        const roles = await UserRole.find();
        
        ctx.helper.success({
            // count: length,
            // page_count: Math.ceil(length / each),
            roles: roles.map((role: UserRole) => ({
                role_id: role.role_id,
                name: role.role_name
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
            where: { user_id: param.user_id }
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
            where: { user_id: param.user_id }
        });

        if (!user) {
            ctx.helper.response(3001, 'no data');
            return;
        }

        ctx.helper.response(200, 'processed successfully', {
            user_id: user.user_id,
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
            where: { user_id: ctx.state.user_id }
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
            user_id: user.user_id,
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
