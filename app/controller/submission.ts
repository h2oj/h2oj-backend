import { Controller } from 'egg';
import fs from 'fs';
import path from 'path';
import Submission from '../model/Submission';

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
            const fileName = path.join(ctx.app.config.path.code, submission.detail.file_id + '.' + fileExt);
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
        const { ctx, app } = this;
        const param = ctx.request.body;
        const language = param.language;
        const code = param.code;
        const pid = param.pid;

        const submitTime = ctx.helper.getTime();
        if (!ctx.service.submission.checkLanguage(language)) {
            ctx.helper.response(5001, 'unavailable language');
            return;
        }

        app.bus.emit('judge', {
            uid: ctx.state.user_id,
            language: language,
            code: code,
            pid: pid,
            submitTime: submitTime
        });

        ctx.helper.response(200, 'processed successfully');
    }
}

export default SubmissionController;
