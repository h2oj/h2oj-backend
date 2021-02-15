import { Controller } from 'egg';
import Contest, { ContestMode } from '../model/Contest';

class ContestController extends Controller {
    public async create() {
        const { ctx } = this;
        const param = ctx.request.body;

        if (!await ctx.service.permission.checkPermission(ctx.state.user_id, 'CREATE_CONTEST')) {
            ctx.helper.failure(401, 'premission denied');
            return;
        }

        const contest = await ctx.repo.Contest.create();
        contest.title = param.title;
        contest.user_id = ctx.state.user_id;
        contest.start_time = param.start_time || ctx.helper.getTime();
        contest.end_time = param.end_time || ctx.helper.getTime() + 86400;
        contest.mode = param.mode || ContestMode.IOI;
        await contest.save();

        const contestContent = await ctx.repo.ContestContent.create();
        contestContent.contest_id = contest.contest_id;
        if (param.content) contestContent.content = param.content;
        if (param.problem) contestContent.problem = param.problem;
        await contestContent.save();

        ctx.helper.response(200, 'processed successfully', {
            contest_id: contest.contest_id
        });
    }

    public async detail() {
        const { ctx } = this;
        const param = ctx.query;

        const contest = await ctx.repo.Contest.findOne({ where: { contest_id: param.contest_id } });
        await contest.loadContent();

        const problemDetail = [];
        for (const problemID of contest.content.problem) {
            const problem = await ctx.repo.Problem.findOne({ where: { pid: problemID } });
            // TODO permission
            problemDetail.push({ problem_id: problem.pid, title: problem.title });
        }

        ctx.helper.response(200, 'processed successfully', {
            contest_id: contest.contest_id,
            title: contest.title,
            mode: contest.mode,
            user_id: contest.user_id,
            start_time: contest.start_time,
            end_time: contest.end_time,
            content: contest.content.content,
            problem: contest.content.problem,
            problem_detail: problemDetail
        });
    }

    public async list() {
        const { ctx } = this;
        const param = ctx.query;
        const page = param.page || 1;
        const each = param.each || 15;

        const [contests, length] = await ctx.repo.Contest.findAndCount({
            skip: (page - 1) * each,
            take: each
        });

        ctx.helper.response(200, 'processed successfully', {
            count: length,
            page_count: Math.ceil(length / each),
            contests: contests.map((contest: Contest) => ({
                contest_id: contest.contest_id,
                mode: contest.mode,
                title: contest.title,
                start_time: contest.start_time,
                end_time: contest.end_time
            }))
        });
    }

    public async update() {
        const { ctx } = this;
        const param = ctx.request.body;

        // TODO: permission
        if (!await ctx.service.permission.checkPermission(ctx.state.user_id, 'CREATE_CONTEST')) {
            ctx.helper.failure(401, 'premission denied');
            return;
        }

        const contest = await ctx.repo.Contest.findOne({ where: { contest_id: param.contest_id } });
        if (!contest) {
            ctx.helper.failure(422, 'unprocessable entity');
            return;
        }
        await contest.loadContent();

        contest.title = param.title;
        contest.mode = param.mode;
        contest.start_time = param.start_time;
        contest.end_time = param.end_time;
        contest.content.content = param.content;
        contest.content.problem = param.problem;

        await contest.content.save();
        await contest.save();

        ctx.helper.response(200, 'processed successfully');
    }
}

export default ContestController;
