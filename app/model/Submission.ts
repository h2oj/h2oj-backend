import * as TypeORM from 'typeorm';
import { Model } from './definition';
import Problem from './Problem';
import SubmissionDetail from './SubmissionDetail';
import User from './User';
import { JudgeStatus } from '@h2oj/judge';

@TypeORM.Entity('submission')
class Submission extends Model {
    @TypeORM.PrimaryGeneratedColumn({ name: 'submission_id' })
    submissionId: number;

    @TypeORM.Column({ name: 'user_id', nullable: false, type: 'integer' })
    userId: number;

    @TypeORM.Column({ name: 'problem_id', nullable: false, type: 'integer' })
    problemId: number;

    @TypeORM.Column({ name: 'language', nullable: false, type: 'varchar', length: 16 })
    language: string;

    @TypeORM.Column({ name: 'status', nullable: true, type: 'integer' })
    status: JudgeStatus;

    @TypeORM.Column({ name: 'time', nullable: true, type: 'integer' })
    time: number;

    @TypeORM.Column({ name: 'space', nullable: true, type: 'integer' })
    space: number;

    @TypeORM.Column({ name: 'code_size', nullable: true, type: 'integer' })
    codeSize: number;

    @TypeORM.Column({ name: 'submit_time', nullable: true, type: 'integer' })
    submitTime: number;

    @TypeORM.Column({ name: 'score', nullable: false, type: 'integer', default: 0 })
    score: number;

    @TypeORM.Column({ name: 'contest_id', nullable: false, type: 'integer', default: 0 })
    contestId: number;

    user?: User;
    problem?: Problem;
    detail?: SubmissionDetail;

    async loadRelatives() {
        await this.loadUser();
        await this.loadProblem();
    }

    async loadUser() {
        if (!this.user && this.userId !== undefined) {
            this.user = await User.findOne({
                where: { userId: this.userId }
            });
        }
    }

    async loadProblem() {
        if (!this.problem && this.problemId) {
            this.problem = await Problem.fromPid(this.problemId);
        }
    }

    async loadDetail() {
        if (!this.detail && this.submissionId) {
            this.detail = await SubmissionDetail.findOne({
                where: { submissionId: this.submissionId }
            });
        }
    }
}

export default Submission;
