import * as TypeORM from 'typeorm';
import { Model } from './definition';

@TypeORM.Entity('permission_type')
class PermissionType extends Model {
    @TypeORM.PrimaryColumn({ name: 'permission_id', type: 'integer' })
    permissionId: number;

    @TypeORM.Column({ name: 'permission_name', type: 'varchar', length: 32 })
    permissionName: string;
}

export default PermissionType;
