import * as TypeORM from 'typeorm';
import { Model } from './definition';

@TypeORM.Entity('user_role')
class UserRole extends Model {
    @TypeORM.PrimaryColumn({ type: 'integer' })
    role_id: number;

    @TypeORM.Column({ type: 'varchar', length: 32 })
    role_name: string;
}

export default UserRole;
