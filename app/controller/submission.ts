import { Controller } from 'egg';
import fs from 'fs';
import path from 'path';
import Judge from '@h2oj/judge';
import Submission from '../model/Submission';
import { TaskStatus } from '../model/Task';

class SubmissionController extends Controller {
    public async list() {
        const { ctx } = this;
        const param = ctx.query;
        const page = param.page || 1;
        const each = param.each || 15;
        let [submissions, length] = await ctx.repo.Submission.findAndCount({
            order: {
                submit_time: 'DESC'
            },
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
                    score: submission.score,
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

        let fileContent = 'unshown';
        if (ctx.service.submission.checkLanguageCanShow(submission.language)) {
            const fileExt = ctx.service.submission.getLanguageFileExtension(submission.language);
            const fileName = path.join(ctx.app.config.h2oj.path.code, submission.detail.file_id + '.' + fileExt);
            fileContent = fs.readFileSync(fileName, { encoding: 'utf-8' });
        }

        ctx.helper.response(200, 'processed successfully', {
            sid: submission.sid,
            pid: submission.pid,
            uid: submission.uid,
            status: submission.status,
            score: submission.score,
            language: submission.language,
            total_time: submission.total_time,
            total_space: submission.total_space,
            submit_time: submission.submit_time,
            detail: submission.detail,
            file_content: fileContent,
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
        const problem_id = param.pid;
        const user_id = ctx.state.user_id;

        const submitTime = ctx.helper.getTime();
        if (!ctx.service.submission.checkLanguage(language)) {
            ctx.helper.response(5001, 'unavailable language');
            return;
        }

        const codeHash = ctx.service.submission.generateCodeHash(code);
        const fileExt = ctx.service.submission.getLanguageFileExtension(language);
        const fileName = codeHash + '.' + fileExt;
        const filePath = path.join(ctx.app.config.h2oj.path.code, fileName);
        fs.writeFileSync(filePath, code);
        
        const workPath = path.join(ctx.app.config.h2oj.path.judge, codeHash);
        if (!fs.existsSync(workPath)) {
            fs.mkdirSync(workPath);
        }
        fs.writeFileSync(path.join(workPath, 'src.' + fileExt), code);

        const submission = await ctx.repo.Submission.create();
        submission.uid = user_id;
        submission.pid = problem_id;
        submission.language = language;
        submission.submit_time = submitTime;
        submission.status = Judge.JudgeStatus.NO_STATUS;
        submission.code_size = fs.statSync(filePath).size;
        submission.total_time = 0;
        submission.total_space = 0;
        await submission.save();

        const submissionDetail = await ctx.repo.SubmissionDetail.create();
        submissionDetail.sid = submission.sid;
        submissionDetail.file_id = codeHash;
        submissionDetail.test_case = [];
        await submissionDetail.save();

        const task = await ctx.repo.Task.create();
        task.submission_id = submission.sid;
        task.problem_id = submission.pid;
        task.added_time = ctx.helper.getTime();
        task.language = submission.language;
        task.status = TaskStatus.WAITING;
        await task.save();

        const problem = await ctx.repo.Problem.findOne({ where: { pid: problem_id } });
        problem.submit_count += 1;

        const user = await ctx.repo.User.findOne({ where: { uid: user_id } });
        user.submit_count += 1;

        ctx.helper.response(200, 'processed successfully');
    }
}

export default SubmissionController;
