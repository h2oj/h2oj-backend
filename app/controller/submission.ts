import { Controller } from 'egg';
import Submission from '../model/Submission';
import { getSubmissionStatus, getSubmissionDetailStatus } from '../model/definition';
import path from 'path';
import fs from 'fs';
import Judger from 'hoj-judger';

class SubmissionController extends Controller {
    public async list() {
        const { ctx } = this;
        const param = ctx.query;
        const page = param.page || 1;
        const each = param.each || 15;
        let [submissions, length] = await ctx.repo.Submission.findAndCount({
            skip: (page - 1) * each,
            take: each
        });
        
        ctx.helper.response(200, 'processed successfully', {
            count: length,
            page_count: Math.ceil(length / each),
            submissions: submissions.map((submission: Submission) => ({
                sid: submission.sid,
                pid: submission.pid,
                uid: submission.uid,
                status: submission.status,
                language: submission.language,
                total_time: submission.total_time,
                total_space: submission.total_space,
                submit_time: submission.submit_time
            }))
        });
    }

    public async submit() {
        const { ctx } = this;
        const param = ctx.request.body;
        const language = param.language;
        const code = param.code;
        const pid = param.pid;

        const submit_time = Math.floor(Number(new Date()) / 1000);

        if (!ctx.service.submission.checkLanguage(language)) {
            ctx.helper.response(5001, 'unavailable language');
            return;
        }

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

        const judgerConfig = {
            work_path: workPath,
            judger_config: './hoj-judger.conf',
            data_path: path.join(ctx.app.config.path.data, pid)
        };
        
        Judger.judge(judgerConfig).then(async (result: Judger.JudgeResult) => {
            const submission = await ctx.repo.Submission.create();
            submission.uid = 1;
            submission.pid = pid;
            submission.language = language;
            submission.status = getSubmissionStatus(result.status);
            submission.submit_time = submit_time;
            submission.total_time = result.total_time;
            submission.total_space = result.total_memory;
            submission.code_size = fs.statSync(filePath).size;
            console.log(submission);
            await submission.save();

            const submissionDetail = await ctx.repo.SubmissionDetail.create();
            submissionDetail.sid = submission.sid;
            submissionDetail.file_id = codeHash;
            submissionDetail.test_case = result.test_point.map((testCase: Judger.TestPointResult) => ({
                time: testCase.time,
                space: testCase.memory,
                status: getSubmissionDetailStatus(testCase.status)
            }));
            await submissionDetail.save();
        });

        ctx.helper.response(200, 'processed successfully');
    }
}

export default SubmissionController;
