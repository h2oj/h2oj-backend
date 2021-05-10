import * as TypeORM from 'typeorm';
import { Model } from './definition';
import { TestCaseStatus } from '@h2oj/judge';

interface SubmissionTestCase {
    time: number;
    space: number;
    status: TestCaseStatus;
    score: number;
}

interface SubmissionTestCaseSet extends Array<SubmissionTestCase> {}

@TypeORM.Entity('submission_detail')
class SubmissionDetail extends Model {
    @TypeORM.PrimaryColumn({ name: 'submission_id' })
    submissionId: number;

    @TypeORM.Column({ name: 'test_case', type: 'json' })
    testCase: SubmissionTestCaseSet;

    @TypeORM.Column({ name: 'file_id', type: 'char', length: 32 })
    fileId: string;
}

export default SubmissionDetail;
