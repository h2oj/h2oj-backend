import * as TypeORM from 'typeorm';
import ContestContent from './ContestContent';
import { Model } from './definition';

@TypeORM.Entity('contest')
class Contest extends Model {
    @TypeORM.PrimaryGeneratedColumn()
    contest_id: number;

    @TypeORM.Column({ nullable: false, type: 'varchar', length: 64 })
    title: string;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    user_id: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    start_time: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    end_time: number;

    content?: ContestContent;

    async loadContent() {
        if (!this.content) {
            this.content = await ContestContent.findOne({
                where: { contest_id: this.contest_id }
            });
        }
    }
}

export default Contest;
