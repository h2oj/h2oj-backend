import * as TypeORM from 'typeorm';
import { Model, SubmissionDetailStatus } from './definition';

@TypeORM.Entity('submission_detail')
class SubmissionDetail extends Model {
    @TypeORM.PrimaryGeneratedColumn()
    sdid: number;

    @TypeORM.Column({ nullable: false, type: 'integer'})
    index: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    sid: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    time: number;

    @TypeORM.Column({ nullable: true, type: 'integer' })
    space: number;

    @TypeORM.Column({ nullable: false, type: 'integer' })
    status: SubmissionDetailStatus;
    
    /**
     * Find a record point from id.
     * @param {number} sdid - Record point id.
     * @return {Promise<SubmissionDetail>} Record.
     */
    static async fromSdid(sdid: number) : Promise<SubmissionDetail> {
        return SubmissionDetail.findOne({
            where: { sdid: sdid }
        });
    }

    /**
     * Find record points from record id.
     * @param {number} sid - Record id.
     * @return {Promise<SubmissionDetail[]>} Record points.
     */
    static async fromSid(sid: number) : Promise<SubmissionDetail[]> {
        let queryBuilder = SubmissionDetail.createQueryBuilder();
        queryBuilder.where({ sid : sid });
        queryBuilder.orderBy('index');
        return queryBuilder.getMany();
    }
}

export default SubmissionDetail;
