import * as TypeORM from 'typeorm';
import { Model, SubmissionStatus } from './definition';
import Problem from './problem';
import SubmissionDetail from './submission_detail';
import User from './user';

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
    status: SubmissionStatus;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    total_time: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    total_space: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    code_size: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    submit_time: number;

    user?: User;

    problem?: Problem;

    details?: SubmissionDetail[];

    async loadRelatives() {
        await this.loadUser();
        await this.loadProblem();
    }

    async loadUser() {
        if (!this.user && this.uid !== undefined) {
            this.user = await User.fromUid(this.uid);
        }
    }

    async loadProblem() {
        if (!this.problem && this.pid) {
            this.problem = await Problem.fromPid(this.pid);
        }
    }

    async loadSubmissionDetails() {
        if (!this.details) {
            this.details = await SubmissionDetail.fromSid(this.sid);
        }
    }

    /**
     * Find a record from sid.
     * @param {number} sid - Record id.
     * @return {Promise<Submission>} Record.
     */
    static async fromSid(sid: number) : Promise<Submission> {
        return Submission.findOne({
            where: { sid: sid }
        });
    }

    /**
     * Find records from uid.
     * @param {number} uid - User id.
     * @return {Promise<Record[]>} Records.
     */
    static async fromUid(uid: number) : Promise<Submission[]> {
        return Submission.find({
            where: { uid: uid }
        });
    }
}

export default Submission;
