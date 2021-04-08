import * as TypeORM from 'typeorm';
import { Model } from './definition';

enum TaskStatus {
    WAITING,
    PROCESSING,
    DONE
};

@TypeORM.Entity('task')
class Task extends Model {
    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    added_time: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    status: TaskStatus;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    submission_id: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    problem_id: number;

    @TypeORM.Column({ nullable: false, type: 'varchar', length: 16 })
    language: string;

    private static lock: boolean = false;

    public static async getFirstWaiting(next: boolean = false): Promise<Task> {
        if (next) {
            if (this.lock) {
                return new Promise<Task>(() => undefined);
            }
            this.lock = true;
            const result = await this.findOne({
                where: { status: TaskStatus.WAITING },
                order: { added_time: 'ASC' }
            });
            if (result) {
                result.status = TaskStatus.PROCESSING;
                await result.save();
            }
            this.lock = false;
            return result;
        }
        else {
            return await this.findOne({
                where: { status: TaskStatus.WAITING },
                order: { added_time: 'ASC' }
            });
        }
    }
}

export {
    Task as default, TaskStatus
};
