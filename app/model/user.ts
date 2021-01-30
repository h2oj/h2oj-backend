import * as TypeORM from 'typeorm';
import { Model } from './definition';

@TypeORM.Entity('user')
class User extends Model {
    @TypeORM.PrimaryGeneratedColumn()
    uid: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: 999 })
    role_id: number;

    @TypeORM.Column({ nullable: false, type: 'varchar', length: 32 })
    username: string;

    @TypeORM.Column({ nullable: false, type: 'char', length: 16 })
    crypto_salt: string;

    @TypeORM.Column({ nullable: false, type: 'char', length: 32 })
    password: string;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    reg_time: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    last_login: number;

    @TypeORM.Column({ nullable: true, type: 'varchar', length: 32 })
    nickname: string;

    @TypeORM.Column({ nullable: true, type: 'varchar', length: 256 })
    avatar: string;

    @TypeORM.Column({ nullable: true, type: 'varchar', length: 256 })
    email: string;

    @TypeORM.Column({ nullable: true, type: 'varchar', length: 64 })
    description: string;

    @TypeORM.Column({ nullable: true, type: 'text' })
    information: string;

    @TypeORM.Column({ nullable: false, type: 'tinyint', default: 0 })
    sex: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: 0 })
    rating: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: 0 })
    ac_count: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: 0 })
    submit_count: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: 0 })
    following: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: 0 })
    follower: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: 1 })
    level: number;

    @TypeORM.Column({ nullable: false, type: 'text' })
    tag: string;

    static async listUser(page: number, limit: number): Promise<Array<User>> {
        return User.find({
            skip: page,
            take: limit
        });
    }
}

export default User;
