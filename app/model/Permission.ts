import * as TypeORM from 'typeorm';
import { Model } from './definition';

@TypeORM.Entity('permission')
class Permission extends Model {
    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Column({ type: 'integer' })
    permission_id: string;

    @TypeORM.Column({ type: 'integer' })
    role_id: string;

    @TypeORM.Column({ type: 'bool' })
    has_permission: boolean;
}

export default Permission;
