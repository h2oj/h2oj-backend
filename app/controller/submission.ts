import { Controller } from 'egg';
import Submission from '../model/Submission';
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
            submissions: await Promise.all(submissions.map(async (submission: Submission) => {
                await submission.loadProblem();
                await submission.loadUser();
                return {
                    sid: submission.sid,
                    pid: submission.pid,
                    uid: submission.uid,
                    status: submission.status,
                    language: submission.language,
                    total_time: submission.total_time,
                    total_space: submission.total_space,
                    submit_time: submission.submit_time,
                    problem: {
                        pid: submission.problem.pid,
                        title: submission.problem.title
                    },
                    user: {
                        uid: submission.user.uid,
                        username: submission.user.username,
                        nickname: submission.user.nickname
                    }
                };
            }))
        });
    }

    public async detail() {
        const { ctx } = this;
        const param = ctx.query;

        const submission = await ctx.repo.Submission.findOne({
            where: { sid: param.sid }
        });

        if (!submission) {
            ctx.helper.response(2001, 'no data');
            return;
        }

        await submission.loadUser();
        await submission.loadProblem();
        await submission.loadDetail();

        ctx.helper.response(200, 'processed successfully', {
            sid: submission.sid,
            pid: submission.pid,
            uid: submission.uid,
            status: submission.status,
            language: submission.language,
            total_time: submission.total_time,
            total_space: submission.total_space,
            submit_time: submission.submit_time,
            detail: submission.detail,
            problem: {
                pid: submission.problem.pid,
                title: submission.problem.title
            },
            user: {
                uid: submission.user.uid,
                username: submission.user.username,
                nickname: submission.user.nickname
            }
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

        const judgerConfig: Judger.JudgerConfig = {
            code_path: path.join(workPath, 'src.' + fileExt),
            problem_path: path.join(ctx.app.config.path.data, pid),
            output_path: workPath,
            language: language
        };

        const submission = await ctx.repo.Submission.create();
        submission.uid = ctx.state.user_id;
        submission.pid = pid;
        submission.language = language;
        submission.submit_time = submit_time;
        await submission.save();

        const submissionDetail = await ctx.repo.SubmissionDetail.create();
        submissionDetail.sid = submission.sid;
        submissionDetail.file_id = codeHash;
        await submissionDetail.save();
        
        Judger.judge(judgerConfig).then(async (result: Judger.JudgeResult) => {
            submission.status = result.status;
            submission.total_time = result.time;
            submission.total_space = result.space;
            submission.code_size = fs.statSync(filePath).size;
            await submission.save();
            
            submissionDetail.test_case = result.case.map((testCase: Judger.TestCaseResult) => ({
                time: testCase.time,
                space: testCase.space,
                status: testCase.status
            }));
            await submissionDetail.save();
        });

        ctx.helper.response(200, 'processed successfully');
    }
}

export default SubmissionController;
