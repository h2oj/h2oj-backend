import * as TypeORM from 'typeorm';
import { Model } from './definition';

@TypeORM.Entity('user_role')
class UserRole extends Model {
    @TypeORM.PrimaryColumn({ name: 'role_id', type: 'integer' })
    roleId: number;

    @TypeORM.Column({ name: 'role_name', type: 'varchar', length: 32 })
    roleName: string;
}

export default UserRole;
