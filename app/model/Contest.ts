import * as TypeORM from 'typeorm';
import ContestContent from './ContestContent';
import { Model } from './definition';

enum ContestMode {
    IOI, NOI, ACM
};

@TypeORM.Entity('contest')
class Contest extends Model {
    @TypeORM.PrimaryGeneratedColumn()
    contest_id: number;

    @TypeORM.Column({ nullable: false, type: 'varchar', length: 64 })
    title: string;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    user_id: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    start_time: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    end_time: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: ContestMode.IOI })
    mode: ContestMode;

    content?: ContestContent;

    async loadContent() {
        if (!this.content) {
            this.content = await ContestContent.findOne({
                where: { contest_id: this.contest_id }
            });
        }
    }
}

export {
    Contest as default,
    ContestMode
};
