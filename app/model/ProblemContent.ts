import * as TypeORM from 'typeorm';
import { Model } from './definition';

interface ProblemSampleData {
    input: string;
    output: string;
}

interface ProblemContentData {
    description: string;
    input: string;
    output: string;
    constraint: string;
}

interface ProblemSampleDataSet extends Array<ProblemSampleData> {}

@TypeORM.Entity('problem_content')
class ProblemContent extends Model {
    @TypeORM.PrimaryColumn({ name: 'id', nullable: false, type: 'integer' })
    id: number;

    @TypeORM.Column({ name: 'problem_id', nullable: false, type: 'integer' })
    problemId: number;

    @TypeORM.Column({ name: 'content', type: 'json' })
    content: ProblemContentData;

    @TypeORM.Column({ name: 'sample', type: 'json' })
    sample: ProblemSampleDataSet;
}

export default ProblemContent;
export { ProblemSampleData, ProblemSampleDataSet };
