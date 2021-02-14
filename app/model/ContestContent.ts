import * as TypeORM from 'typeorm';
import { Model } from './definition';

interface ContestProblemSet extends Array<number> {}

@TypeORM.Entity('contest_content')
class ContestContent extends Model {
    @TypeORM.PrimaryColumn({ type: 'integer' })
    contest_id: number;

    @TypeORM.Column({ nullable: true, type: 'text' })
    content: string;

    @TypeORM.Column({ nullable: true, type: 'json' })
    problem: ContestProblemSet;
}

export default ContestContent;
