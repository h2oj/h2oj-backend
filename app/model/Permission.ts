import * as TypeORM from 'typeorm';
import { Model } from './definition';

@TypeORM.Entity('permission')
class Permission extends Model {
    @TypeORM.PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @TypeORM.Column({ name: 'permission_id', type: 'integer' })
    permissionId: string;

    @TypeORM.Column({ name: 'role_id', type: 'integer' })
    roleId: string;

    @TypeORM.Column({ name: 'has_permission', type: 'bool' })
    hasPermission: boolean;
}

export default Permission;
