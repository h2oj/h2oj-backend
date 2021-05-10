import { Service } from 'egg';

class PermissionService extends Service {
    public async checkPermission(user_id: number, permission_name: string): Promise<boolean> {
        const { ctx } = this;
        const user = await ctx.repo.User.findOne({
            where: {
                userId: user_id
            }
        });
        const permissionType = await ctx.repo.PermissionType.findOne({
            where: {
                permissionName: permission_name
            }
        });
        const permission = await ctx.repo.Permission.findOne({
            where: {
                roleId: user.roleId,
                permissionId: permissionType.permissionId
            }
        });
        return permission && permission.hasPermission;
    }
}

export default PermissionService;
