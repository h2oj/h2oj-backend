import * as TypeORM from 'typeorm';
import { Model } from './definition';

@TypeORM.Entity('user')
class User extends Model {
    @TypeORM.PrimaryGeneratedColumn({ name: 'user_id' })
    userId: number;

    @TypeORM.Column({ name: 'role_id', nullable: false, type: 'integer', default: 999 })
    roleId: number;

    @TypeORM.Column({ name: 'username', nullable: false, type: 'varchar', length: 32 })
    username: string;

    @TypeORM.Column({ name: 'crypto_salt', nullable: false, type: 'char', length: 16 })
    cryptoSalt: string;

    @TypeORM.Column({ name: 'password', nullable: false, type: 'char', length: 32 })
    password: string;

    @TypeORM.Column({ name: 'register_time', nullable: true, type: 'integer' })
    registerTime: number;

    @TypeORM.Column({ name: 'last_login', nullable: true, type: 'integer' })
    lastLoginTime: number;

    @TypeORM.Column({ name: 'nickname', nullable: true, type: 'varchar', length: 32 })
    nickname: string;

    @TypeORM.Column({ name: 'avatar', nullable: true, type: 'varchar', length: 256 })
    avatar: string;

    @TypeORM.Column({ name: 'email', nullable: true, type: 'varchar', length: 256 })
    email: string;

    @TypeORM.Column({ name: 'bio', nullable: true, type: 'varchar', length: 64 })
    bio: string;

    @TypeORM.Column({ name: 'about_me', nullable: true, type: 'text' })
    aboutMe: string;

    @TypeORM.Column({ name: 'sex', nullable: false, type: 'tinyint', default: 0 })
    sex: number;

    @TypeORM.Column({ name: 'rating', nullable: false, type: 'integer', default: 0 })
    rating: number;

    @TypeORM.Column({ name: 'accept_count', nullable: false, type: 'integer', default: 0 })
    acceptCount: number;

    @TypeORM.Column({ name: 'submit_count', nullable: false, type: 'integer', default: 0 })
    submitCount: number;

    @TypeORM.Column({ name: 'following', nullable: false, type: 'integer', default: 0 })
    following: number;

    @TypeORM.Column({ name: 'follower', nullable: false, type: 'integer', default: 0 })
    follower: number;

    @TypeORM.Column({ name: 'level', nullable: false, type: 'integer', default: 1 })
    level: number;

    @TypeORM.Column({ name: 'tag', nullable: true, type: 'text' })
    tag: string;

    static async listUser(page: number, limit: number): Promise<Array<User>> {
        return User.find({
            skip: page,
            take: limit
        });
    }
}

export default User;
