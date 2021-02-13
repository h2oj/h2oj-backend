import { Listener, ListenerStruct } from 'egg-bus';
import Judger from 'hoj-judger';
import path from 'path';
import fs from 'fs';

class JudgerListenerData {
    language: string;
    code: string;
    pid: number;
    uid: number;
    submitTime: number;
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
        const code = event.data.code;
        const language = event.data.language;
        const pid = event.data.pid;
        const uid = event.data.uid;
        const submitTime = event.data.submitTime;

        // Save code to file
        const codeHash = ctx.service.submission.generateCodeHash(code);
        const fileExt = ctx.service.submission.getLanguageFileExtension(language);
        const fileName = codeHash + '.' + fileExt;
        const filePath = path.join(ctx.app.config.path.code, fileName);
        fs.writeFileSync(filePath, code);
        
        // Init workspace
        const workPath = path.join(ctx.app.config.path.judge, codeHash);
        if (!fs.existsSync(workPath)) {
            fs.mkdirSync(workPath);
        }
        fs.writeFileSync(path.join(workPath, 'src.' + fileExt), code);

        const judgerConfig: Judger.JudgerConfig = {
            code_path: path.join(workPath, 'src.' + fileExt),
            problem_path: path.join(ctx.app.config.path.data, pid.toString()),
            output_path: workPath,
            language: language
        };

        const submission = await ctx.repo.Submission.create();
        submission.uid = uid;
        submission.pid = pid;
        submission.language = language;
        submission.submit_time = submitTime;
        submission.status = Judger.JudgeStatus.NO_STATUS;
        submission.code_size = fs.statSync(filePath).size;
        submission.total_time = 0;
        submission.total_space = 0;
        await submission.save();

        const submissionDetail = await ctx.repo.SubmissionDetail.create();
        submissionDetail.sid = submission.sid;
        submissionDetail.file_id = codeHash;
        submissionDetail.test_case = [];
        await submissionDetail.save();

        const problem = await ctx.repo.Problem.findOne({ where: { pid: pid } });
        problem.submit_count += 1;        

        try {
            const result = await Judger.judge(judgerConfig);

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

            if (result.status == Judger.JudgeStatus.ACCEPTED) {
                problem.ac_count += 1;
            }
            await problem.save();
        }
        catch (error) {
            submission.status = Judger.JudgeStatus.SYSTEM_ERROR;
            await submission.save();
            await problem.save();
        }
    }

    async failed(_event: ListenerStruct<object>, error: Error, _job: any) {
        console.log('[hoj-backend] Judger failed: ', error);
    }
}

export default JudgerListener;
