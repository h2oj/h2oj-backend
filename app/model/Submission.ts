import * as TypeORM from 'typeorm';
import { Model } from './definition';
import Problem from './Problem';
import SubmissionDetail from './SubmissionDetail';
import User from './User';
import { JudgeStatus } from '@h2oj/judge';

@TypeORM.Entity('submission')
class Submission extends Model {
    @TypeORM.PrimaryGeneratedColumn()
    submission_id: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    user_id: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    problem_id: number;

    @TypeORM.Column({ nullable: false, type: 'varchar', length: 16 })
    language: string;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    status: JudgeStatus;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    time: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    space: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    code_size: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    submit_time: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: 0 })
    score: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: 0 })
    contest_id: number;

    user?: User;
    problem?: Problem;
    detail?: SubmissionDetail;

    async loadRelatives() {
        await this.loadUser();
        await this.loadProblem();
    }

    async loadUser() {
        if (!this.user && this.user_id !== undefined) {
            this.user = await User.findOne({
                where: { user_id: this.user_id }
            });
        }
    }

    async loadProblem() {
        if (!this.problem && this.problem_id) {
            this.problem = await Problem.fromPid(this.problem_id);
        }
    }

    async loadDetail() {
        if (!this.detail && this.submission_id) {
            this.detail = await SubmissionDetail.findOne({
                where: { submission_id: this.submission_id }
            });
        }
    }
}

export default Submission;
