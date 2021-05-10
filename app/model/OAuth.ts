import * as TypeORM from 'typeorm';
import { Model } from './definition';

enum OAuthType {
    GITHUB
};

@TypeORM.Entity('oauth')
class OAuth extends Model {
    @TypeORM.PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @TypeORM.Column({ name: 'user_id', nullable: false, type: 'integer' })
    userId: number;

    @TypeORM.Column({ name: 'oauth_id', nullable: false, type: 'varchar' })
    oauthId: string;

    @TypeORM.Column({ name: 'type', nullable: false, type: 'integer' })
    type: OAuthType;
}

export {
    OAuth as default,
    OAuthType
};
