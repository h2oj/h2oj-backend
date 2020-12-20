import * as TypeORM from 'typeorm';
import { Model } from './definition';
import ProblemContent from './ProblemContent';
import User from './User';

@TypeORM.Entity('problem')
class Problem extends Model {
    @TypeORM.PrimaryColumn({ nullable: false, type: 'integer' })
    pid: number;

    @TypeORM.Column({ nullable: false, type: 'tinyint' })
    type: number;

    @TypeORM.Column({ nullable: false, type: 'varchar', length: 64 })
    title: string;

    @TypeORM.Column({ nullable: false, type: 'tinyint' })
    difficulty: number;

    @TypeORM.Column({ nullable: false, type: 'integer'})
    ac_count: number;

    @TypeORM.Column({ nullable: false, type: 'integer'})
    submit_count: number;

    @TypeORM.Column({ nullable: false, type: 'boolean' })
    is_public: boolean;

    @TypeORM.Column({ nullable: false, type: 'integer'})
    uid: number;

    publisher?: User;

    content?: ProblemContent;

    async loadRelatives() {
        await this.loadPublisher();
    }

    async loadPublisher() {
        if (!this.publisher && this.uid !== undefined) {
            this.publisher = await User.fromUid(this.uid);
        }
    }

    async loadContent() {
        if (!this.content) {
            this.content = await ProblemContent.findOne({
                where: { pid: this.pid }
            });
        }
    }

    static async fromPid(pid: number) : Promise<Problem> {
        return Problem.findOne({
            where: { pid: pid }
        });
    }

    static async findPublic() : Promise<Problem[]> {
        return Problem.find({
            where: { is_public: true }
        });
    }
}

export default Problem;
