import * as TypeORM from 'typeorm';
import { Model } from './definition';
import User from './User';

interface ContestProblemDetail {
    problem_id: number;
    submission_id: number;
    score: number;
    time: number;
    space: number;
}

interface ContestPlayerDetail extends Array<ContestProblemDetail> {}

@TypeORM.Entity('contest_player')
class ContestPlayer extends Model {
    @TypeORM.PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @TypeORM.Column({ name: 'contest_id', type: 'integer' })
    contestId: number;

    @TypeORM.Column({ name: 'user_id', type: 'integer' })
    userId: number;

    @TypeORM.Column({ name: 'score', type: 'integer', default: 0 })
    score: number;

    @TypeORM.Column({ name: 'time', type: 'integer', default: 0 })
    time: number;

    @TypeORM.Column({ name: 'space', type: 'integer', default: 0 })
    space: number;
    
    @TypeORM.Column({ name: 'detail', nullable: true, type: 'json' })
    detail: ContestPlayerDetail;

    user?: User;

    public async loadUser() {
        if (this.userId && !this.user) {
            this.user = await User.findOne({ where: { userId: this.userId } });
        }
    }
}

export {
    ContestPlayer as default,
    ContestProblemDetail
};
