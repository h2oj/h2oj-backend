import * as TypeORM from 'typeorm';
import { Model } from './definition';

interface ProblemSampleData {
    input: string;
    output: string;
}

interface ProblemSampleDataSet extends Array<ProblemSampleData> {}

@TypeORM.Entity('problem_content')
class ProblemContent extends Model {
    @TypeORM.PrimaryColumn({ nullable: false, type: 'integer' })
    id: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    pid: number;

    @TypeORM.Column({ type: 'text' })
    content: string;

    @TypeORM.Column({ type: 'json' })
    sample: ProblemSampleDataSet;
}

export default ProblemContent;
export { ProblemSampleData, ProblemSampleDataSet };
