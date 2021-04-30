import * as TypeORM from 'typeorm';
import { Model } from './definition';

enum OAuthType {
    GITHUB
};

@TypeORM.Entity('oauth')
class OAuth extends Model {
    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    user_id: number;

    @TypeORM.Column({ nullable: false, type: 'varchar' })
    oauth_id: string;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    type: OAuthType;
}

export {
    OAuth as default,
    OAuthType
};
