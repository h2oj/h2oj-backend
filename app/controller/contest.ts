import { Controller } from 'egg';
import Contest, { ContestMode } from '../model/Contest';
import ContestContent from '../model/ContestContent';
import ContestPlayer from '../model/ContestPlayer';

class ContestController extends Controller {
    public async new() {
        const { ctx } = this;
        const param = ctx.request.body;

        if (!await ctx.service.permission.checkPermission(ctx.state.user_id, 'CREATE_CONTEST')) {
            ctx.helper.failure(401, 'premission denied');
            return;
        }

        const contest = await Contest.create();
        contest.title = param.title;
        contest.userId = ctx.state.user_id;
        contest.startTime = param.start_time || ctx.helper.getTime();
        contest.endTime = param.end_time || ctx.helper.getTime() + 86400;
        contest.mode = param.mode || ContestMode.IOI;
        await contest.save();

        const contestContent = await ContestContent.create();
        contestContent.contestId = contest.contestId;
        if (param.content) contestContent.content = param.content;
        if (param.problem) contestContent.problem = param.problem;
        await contestContent.save();

        ctx.helper.response(200, 'processed successfully', {
            contest_id: contest.contestId
        });
    }

    public async detail() {
        const { ctx } = this;
        const param = ctx.query;

        const contest = await ctx.repo.Contest.findOne({ where: { contestId: param.contest_id } });
        await contest.loadContent();

        const problemDetail = [];
        for (const problemID of contest.content.problem) {
            const problem = await ctx.repo.Problem.findOne({ where: { problemId: problemID } });
            // TODO permission
            problemDetail.push({ problem_id: problem.problemId, title: problem.title });
        }

        ctx.helper.response(200, 'processed successfully', {
            contest_id: contest.contestId,
            title: contest.title,
            mode: contest.mode,
            user_id: contest.userId,
            start_time: contest.startTime,
            end_time: contest.endTime,
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

        const [contests, length] = await Contest.findAndCount({
            skip: (page - 1) * each,
            take: each
        });

        ctx.helper.response(200, 'processed successfully', {
            count: length,
            page_count: Math.ceil(length / each),
            contests: contests.map((contest: Contest) => ({
                contest_id: contest.contestId,
                mode: contest.mode,
                title: contest.title,
                start_time: contest.startTime,
                end_time: contest.endTime
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

        const contest = await Contest.findOne({ where: { contestId: param.contest_id } });
        if (!contest) {
            ctx.helper.failure(422, 'unprocessable entity');
            return;
        }
        await contest.loadContent();

        contest.title = param.title;
        contest.mode = param.mode;
        contest.startTime = param.start_time;
        contest.endTime = param.end_time;
        contest.content.content = param.content;
        contest.content.problem = param.problem;

        await contest.content.save();
        await contest.save();

        ctx.helper.success();
    }

    public async hasJoined() {
        const { ctx } = this;
        const { contest_id: contestId } = ctx.request.body;
        const { user_id: userId } = ctx.state;

        let contestPlayer = await ContestPlayer.findOne({
            where: {
                contestId: contestId,
                userId: userId
            }
        });

        ctx.helper.success({
            has_joined: contestPlayer ? true : false
        });
    }

    public async join() {
        const { ctx } = this;
        const { contest_id: contestId } = ctx.request.body;
        const { user_id: userId } = ctx.state;

        let contestPlayer = await ContestPlayer.findOne({
            where: {
                contestId: contestId,
                userId: userId
            }
        });

        if (contestPlayer) {
            ctx.helper.response(4001, 'already joined');
            return 0;
        }

        contestPlayer = await ContestPlayer.create();
        contestPlayer.contestId = contestId;
        contestPlayer.userId = userId;
        contestPlayer.detail = [];
        await contestPlayer.save();

        ctx.helper.success();
    }

    public async ranklist() {
        const { ctx } = this;
        const {
            contest_id: contestId,
            page: pageIndex = 1,
            each: itemCount = 30,
        } = ctx.query;

        let [ contestPlayers, count ] = await ContestPlayer.findAndCount({
            where: { contestId: contestId },
            order: { score: 'DESC' },
            skip: (pageIndex - 1) * itemCount,
            take: itemCount
        });

        ctx.helper.success({
            count: count,
            page_count: Math.ceil(count / itemCount),
            ranklist: await Promise.all(contestPlayers.map(async (player: ContestPlayer) => {
                await player.loadUser();
                return {
                    user_id: player.userId,
                    nickname: player.user.nickname,
                    score: player.score,
                    time: player.time,
                    space: player.space,
                    detail: player.detail
                };
            }))
        });
    }
}

export default ContestController;
