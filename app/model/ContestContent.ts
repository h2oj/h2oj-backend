import * as TypeORM from 'typeorm';
import { Model } from './definition';

interface ContestProblemSet extends Array<number> {}

@TypeORM.Entity('contest_content')
class ContestContent extends Model {
    @TypeORM.PrimaryColumn({ name: 'contest_id', type: 'integer' })
    contestId: number;

    @TypeORM.Column({ name: 'content', nullable: true, type: 'text' })
    content: string;

    @TypeORM.Column({ name: 'problem', nullable: true, type: 'json' })
    problem: ContestProblemSet;
}

export default ContestContent;
