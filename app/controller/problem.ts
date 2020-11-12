import { Controller } from 'egg';
import Problem from '../model/problem';

class ProblemController extends Controller {
    public async list() {
        const { ctx } = this;
        const param = ctx.query;
        const page = param.page || 1;
        const each = param.each || 15;

        const problems = await ctx.repo.Problem.find({
            where: { is_public: 1 },
            skip: (page - 1) * each,
            take: each
        });
        
        ctx.helper.response(200, 'processed successfully', problems.map((problem: Problem) => ({
            pid: problem.pid,
            title: problem.title,
            difficulty: problem.difficulty,
            ac_count: problem.ac_count,
            submit_count: problem.submit_count
        })));
    }

    public async detail() {
        const { ctx } = this;
        const param = ctx.query;

        const problem = await ctx.repo.Problem.findOne({
            where: { pid: param.pid }
        });

        if (!problem || !problem.is_public) {
            ctx.helper.response(2001, 'no data');
            return;
        }

        await problem.loadPublisher();
        await problem.loadContent();

        ctx.helper.response(200, 'processed successfully', {
            pid: problem.pid,
            title: problem.title,
            difficulty: problem.difficulty,
            ac_count: problem.ac_count,
            submit_count: problem.submit_count,
            user: {
                uid: problem.publisher.uid,
                username: problem.publisher.username,
                nickname: problem.publisher.nickname
            },
            info: problem.content
        });
    }
}

export default ProblemController;
