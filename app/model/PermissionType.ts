import * as TypeORM from 'typeorm';
import { Model } from './definition';

@TypeORM.Entity('permission_type')
class PermissionType extends Model {
    @TypeORM.PrimaryColumn({ type: 'integer' })
    permission_id: number;

    @TypeORM.Column({ type: 'varchar', length: 32 })
    permission_name: string;
}

export default PermissionType;
