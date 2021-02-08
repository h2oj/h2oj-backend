import * as TypeORM from 'typeorm';
import { Model } from './definition';
import Problem from './Problem';
import SubmissionDetail from './SubmissionDetail';
import User from './User';
import { JudgeStatus } from 'hoj-judger';

@TypeORM.Entity('submission')
class Submission extends Model {
    @TypeORM.PrimaryGeneratedColumn()
    sid: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    uid: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    pid: number;

    @TypeORM.Column({ nullable: false, type: 'varchar', length: 16 })
    language: string;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    status: JudgeStatus;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    total_time: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    total_space: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    code_size: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    submit_time: number;

    @TypeORM.Column({ nullable: false, type: 'integer', default: 0 })
    score: number;

    user?: User;

    problem?: Problem;

    detail?: SubmissionDetail;

    async loadRelatives() {
        await this.loadUser();
        await this.loadProblem();
    }

    async loadUser() {
        if (!this.user && this.uid !== undefined) {
            this.user = await User.findOne({
                where: { uid: this.uid }
            });
        }
    }

    async loadProblem() {
        if (!this.problem && this.pid) {
            this.problem = await Problem.fromPid(this.pid);
        }
    }

    async loadDetail() {
        if (!this.detail && this.sid) {
            this.detail = await SubmissionDetail.findOne({
                where: { sid: this.sid }
            });
        }
    }
}

export default Submission;
