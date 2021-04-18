import { Service } from 'egg';

class PermissionService extends Service {
    public async checkPermission(user_id: number, permission_name: string): Promise<boolean> {
        const { ctx } = this;
        const user = await ctx.repo.User.findOne({
            where: {
                user_id: user_id
            }
        });
        const permissionType = await ctx.repo.PermissionType.findOne({
            where: {
                permission_name: permission_name
            }
        });
        const permission = await ctx.repo.Permission.findOne({
            where: {
                role_id: user.role_id,
                permission_id: permissionType.permission_id
            }
        });
        return permission && permission.has_permission;
    }
}

export default PermissionService;
