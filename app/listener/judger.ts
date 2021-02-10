import { Listener, ListenerStruct } from 'egg-bus';
import Judger from 'hoj-judger';

class JudgerListenerData {
    judgerConfig: Judger.JudgerConfig;
    submission_id: number;
}

class JudgerListener extends Listener {
    static get watch() {
        return [ 'judge' ];
    }

    static get queue() {
        return [ 'judge' ];
    }

    static get attempts() {
        return 1;
    }

    async run(event: ListenerStruct<JudgerListenerData>, _job: any) {
        const { ctx } = this;

        console.log('[hoj-backend] Start judger');

        const judgerConfig = event.data.judgerConfig;

        Judger.judge(judgerConfig).then(async (result: Judger.JudgeResult) => {
            const submission = await ctx.repo.Submission.findOne({ where: { sid: event.data.submission_id } });
            const submissionDetail = await ctx.repo.SubmissionDetail.findOne({ where: { sid: event.data.submission_id } });
            
            submission.status = result.status;
            submission.total_time = result.time;
            submission.total_space = result.space;
            submission.score = result.score;
            await submission.save();
            
            submissionDetail.test_case = result.case.map((testCase: Judger.TestCaseResult) => ({
                time: testCase.time,
                space: testCase.space,
                status: testCase.status,
                score: testCase.score
            }));
            await submissionDetail.save();
        });
    }

    async failed(_event: ListenerStruct<object>, error: Error, _job: any) {
        console.log('[hoj-backend] Judger failed: ', error);
    }
}

export default JudgerListener;
