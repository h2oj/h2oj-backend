import * as TypeORM from 'typeorm';
import ContestContent from './ContestContent';
import { Model } from './definition';

enum ContestMode {
    IOI, NOI, ACM
};

@TypeORM.Entity('contest')
class Contest extends Model {
    @TypeORM.PrimaryGeneratedColumn({ name: 'contest_id' })
    contestId: number;

    @TypeORM.Column({ name: 'title', nullable: false, type: 'varchar', length: 64 })
    title: string;

    @TypeORM.Column({ name: 'user_id', nullable: false, type: 'integer' })
    userId: number;

    @TypeORM.Column({ name: 'start_time', nullable: false, type: 'integer' })
    startTime: number;

    @TypeORM.Column({ name: 'end_time', nullable: false, type: 'integer' })
    endTime: number;

    @TypeORM.Column({ name: 'mode', nullable: false, type: 'integer', default: ContestMode.IOI })
    mode: ContestMode;

    content?: ContestContent;

    async loadContent() {
        if (!this.content) {
            this.content = await ContestContent.findOne({
                where: { contestId: this.contestId }
            });
        }
    }
}

export {
    Contest as default,
    ContestMode
};
