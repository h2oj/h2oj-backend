import * as TypeORM from 'typeorm';
import { Model } from './definition';
import ProblemContent from './ProblemContent';
import User from './User';

@TypeORM.Entity('problem')
class Problem extends Model {
    @TypeORM.PrimaryColumn({ name: 'problem_id', nullable: false, type: 'integer' })
    problemId: number;

    @TypeORM.Column({ name: 'type', nullable: false, type: 'tinyint' })
    type: number;

    @TypeORM.Column({ name: 'title', nullable: false, type: 'varchar', length: 64 })
    title: string;

    @TypeORM.Column({ name: 'difficulty', nullable: false, type: 'tinyint' })
    difficulty: number;

    @TypeORM.Column({ name: 'accept_count', nullable: false, type: 'integer'})
    acceptCount: number;

    @TypeORM.Column({ name: 'submit_count', nullable: false, type: 'integer'})
    submitCount: number;

    @TypeORM.Column({ name: 'is_public', nullable: false, type: 'boolean' })
    isPublic: boolean;

    @TypeORM.Column({ name: 'user_id', nullable: false, type: 'integer'})
    userId: number;

    publisher?: User;
    content?: ProblemContent;

    async loadRelatives() {
        await this.loadPublisher();
    }

    async loadPublisher() {
        if (!this.publisher && this.userId !== undefined) {
            this.publisher = await User.findOne({
                where: { userId: this.userId }
            });
        }
    }

    async loadContent() {
        if (!this.content) {
            this.content = await ProblemContent.findOne({
                where: { problemId: this.problemId }
            });
        }
    }

    static async fromPid(pid: number) : Promise<Problem> {
        return Problem.findOne({
            where: { problemId: pid }
        });
    }

    static async findPublic() : Promise<Problem[]> {
        return Problem.find({
            where: { isPublic: true }
        });
    }
}

export default Problem;
