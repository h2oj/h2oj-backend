import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { Controller } from 'egg';
import { EggWsClient } from 'egg-websocket-plugin/app';
import { JudgeStatus } from '@h2oj/judge';
import Task, { TaskStatus } from '../model/Task';
import Submission from '../model/Submission';
import SubmissionDetail from '../model/SubmissionDetail';
import ContestPlayer, { ContestProblemDetail } from '../model/ContestPlayer';
import ContestContent from '../model/ContestContent';

class JudgeController extends Controller {
    public verify() {
        const { ctx, app } = this;
        const param = ctx.request.body;

        if (!ctx.app.config.h2oj.availableJudgeToken.includes(param.token)) {
            ctx.helper.response(8001, 'unknown client token');
            return;
        }

        const token = app.jwt.sign({
            client_token: param.token,
            timestamp: Math.floor(Number(new Date()) / 1000)
        }, app.config.jwt.secret);

        ctx.helper.response(200, 'processed successfully', {
            token: token
        });
    }

    public async connect() {
        const { ctx } = this;
        console.log('Judge Connected: ', ctx.request.ip);

        let task: Task, detail: SubmissionDetail;
        let processing: boolean = false;

        ctx.websocket.on('message', async (msg: string) => {
            console.log(ctx.request.ip, ': ws received: ', msg);
            const { event, data } = JSON.parse(msg);
            if (event === 'status') {
                detail.test_case.push({
                    time: data.time,
                    space: data.memory,
                    status: data.status,
                    score: data.score
                });
                await detail.save();
            }
            else if (event === 'end') {
                const submission = await Submission.findOne({
                    where: { submission_id: task.submission_id }
                });
                submission.score = data.score;
                submission.time = data.time;
                submission.space = data.memory;
                submission.status = data.status;
                await submission.save();

                if (submission.contest_id) {
                    this.updateContest(submission);
                }

                task.status = TaskStatus.DONE;
                await task.save();

                processing = false;

                task = await this.doTask(ctx.websocket);
                if (task) {
                    detail = await SubmissionDetail.findOne({
                        where: { submission_id: task.submission_id }
                    });
                    detail.test_case = [];
                    processing = true;
                }
            }
        });

        ctx.websocket.on('close', async (code: number, reason: string) => {
            console.log(ctx.request.ip, ': websocket closed: ', code, reason);
            if (processing) {
                const submission = await Submission.findOne({
                    where: { submission_id: task.submission_id }
                });
                submission.status = JudgeStatus.SYSTEM_ERROR;
                await submission.save();

                task.status = TaskStatus.DONE;
                await task.save();
            }
        });

        ctx.websocket.send(JSON.stringify({
            event: 'connect',
            data: {
                server: 'hoj-backend',
                api: '1'
            }
        }));

        task = await this.doTask(ctx.websocket);
        if (task) {
            detail = await SubmissionDetail.findOne({
                where: { submission_id: task.submission_id }
            });
            detail.test_case = [];
            processing = true;
        }
    }

    public checkData() {
        const { ctx } = this;

        ctx.helper.response(200, 'processed successfully', {
            last_update: ctx.helper.getTime()
        });
    }

    public getData() {
        const { ctx } = this;
        const param = ctx.query;
        
        const dataPath = path.join(ctx.app.config.h2oj.path.data, param.problem_id);
        console.log(dataPath);
        var zip = new AdmZip();
        for (let file of fs.readdirSync(dataPath)) {
            if (file === 'config.yml' || ['.in', '.out'].includes(path.extname(file))) {
                zip.addFile(file, fs.readFileSync(path.join(dataPath, file)));
            }
        }

        ctx.attachment('data.zip');
        ctx.set('Content-Type', 'application/octet-stream');
        ctx.body = zip.toBuffer();
    }

    public async getSource() {
        const { ctx } = this;
        const param = ctx.query;

        const submission = await Submission.findOne({
            where: { submission_id: param.submission_id } 
        });
        await submission.loadDetail();

        const fileExt = ctx.service.submission.getLanguageFileExtension(submission.language);
        const srcPath = path.join(ctx.app.config.h2oj.path.judge, submission.detail.file_id, 'src.' + fileExt);

        ctx.attachment('src.' + fileExt);
        ctx.set('Content-Type', 'application/octet-stream');
        ctx.body = fs.readFileSync(srcPath);
    }
    
    private static async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async doTask(ws: EggWsClient): Promise<Task> {
        let task: Task = await Task.getFirstWaiting(true);
        while (!task) {
            await JudgeController.sleep(1000);
            task = await Task.getFirstWaiting(true);
        }

        console.log('::NEW JUDGE TASK TO DAEMON::', [
            task.task_id
        ]);
        
        ws.send(JSON.stringify({
            event: 'judge',
            data: {
                task_id: task.task_id,
                problem_id: task.problem_id,
                submission_id: task.submission_id,
                language: task.language
            }
        }));

        return task;
    }

    private isBetterScore(problem: ContestProblemDetail, submission: Submission) {
        if (submission.score > problem.score) {
            return true;
        }
        else if (submission.score === problem.score) {
            if (submission.time < problem.time) {
                return true;
            }
            else if (submission.time === problem.time) {
                return submission.space < problem.space;
            }
        }
    }

    private async updateContest(submission: Submission) {
        const player = await ContestPlayer.findOne({
            where: {
                contest_id: submission.contest_id,
                user_id: submission.user_id
            }
        });
        if (!player) {
            return;
        }
        
        const contestContent = await ContestContent.findOne({
            where: { contest_id: submission.contest_id }
        });

        let flag = true;
        player.score = player.time = player.space = 0;
        for (const problem of player.detail) {
            if (contestContent.problem.includes(submission.problem_id)) {
                if (problem.problem_id === submission.problem_id) {
                    flag = false;
                    if (this.isBetterScore(problem, submission)) {
                        problem.score = submission.score;
                        problem.space = submission.space;
                        problem.time = submission.time;
                        problem.submission_id = submission.submission_id;
                    }
                }

                player.score += problem.score;
                player.time += problem.time;
                player.space += problem.space;
            }
        }
        if (flag) {
            if (!contestContent.problem.includes(submission.problem_id)) {
                return;
            }

            player.detail.push({
                problem_id: submission.problem_id,
                submission_id: submission.submission_id,
                score: submission.score,
                time: submission.time,
                space: submission.space,
            });

            player.score += submission.score;
            player.time += submission.time;
            player.space += submission.space;
        }
        
        await player.save();
    }
}

export default JudgeController;
