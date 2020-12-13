import * as TypeORM from 'typeorm';
import { Model, SubmissionDetailStatus } from './definition';

interface SubmissionTestCase {
    time: number;
    space: number;
    status: SubmissionDetailStatus;
}

interface SubmissionTestCaseSet extends Array<SubmissionTestCase> {}

@TypeORM.Entity('submission_detail')
class SubmissionDetail extends Model {
    @TypeORM.PrimaryColumn()
    sid: number;

    @TypeORM.Column({ type: 'json' })
    test_case: SubmissionTestCaseSet;

    @TypeORM.Column({ type: 'char', length: 32 })
    file_id: string;
}

export default SubmissionDetail;
