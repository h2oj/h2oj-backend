import * as TypeORM from 'typeorm';
import { Model } from './definition';

enum TaskStatus {
    WAITING,
    PROCESSING,
    DONE
};

@TypeORM.Entity('task')
class Task extends Model {
    @TypeORM.PrimaryGeneratedColumn({ name: 'task_id' })
    taskId: number;

    @TypeORM.Column({ name: 'time',nullable: false, type: 'integer' })
    time: number;

    @TypeORM.Column({ name: 'status', nullable: false, type: 'integer' })
    status: TaskStatus;

    @TypeORM.Column({ name: 'submission_id', nullable: false, type: 'integer' })
    submissionId: number;

    @TypeORM.Column({ name: 'problem_id', nullable: false, type: 'integer' })
    problemId: number;

    @TypeORM.Column({ name: 'language', nullable: false, type: 'varchar', length: 16 })
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
                order: { time: 'ASC' }
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
                order: { time: 'ASC' }
            });
        }
    }
}

export {
    Task as default, TaskStatus
};
