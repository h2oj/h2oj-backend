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
    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Column({ type: 'integer' })
    contest_id: number;

    @TypeORM.Column({ type: 'integer' })
    user_id: number;

    @TypeORM.Column({ type: 'integer', default: 0 })
    score: number;

    @TypeORM.Column({ type: 'integer', default: 0 })
    time: number;

    @TypeORM.Column({ type: 'integer', default: 0 })
    space: number;
    
    @TypeORM.Column({ nullable: true, type: 'json' })
    detail: ContestPlayerDetail;

    user?: User;

    public async loadUser() {
        if (this.user_id && !this.user) {
            this.user = await User.findOne({ where: { user_id: this.user_id } });
        }
    }
}

export {
    ContestPlayer as default,
    ContestProblemDetail
};
