import { Controller } from 'egg';
import Problem from '../model/Problem';

class ProblemController extends Controller {
    public async list() {
        const { ctx } = this;
        const param = ctx.query;
        const page = param.page || 1;
        const each = param.each || 15;
        const search = param.search;
        let problems, length;
        if (search) {
            [problems, length] = await ctx.repo.Problem.createQueryBuilder()
                .where('problem.title LIKE :param')
                .where('problem.is_public == 1')
                .setParameter('param', '%' + search + '%')
                .skip((page - 1) * each)
                .take(each)
                .getManyAndCount();
        }
        else {
            [problems, length] = await ctx.repo.Problem.findAndCount({
                where: { is_public: 1 },
                skip: (page - 1) * each,
                take: each
            });
        }
        
        ctx.helper.response(200, 'processed successfully', {
            count: length,
            page_count: Math.ceil(length / each),
            problems: problems.map((problem: Problem) => ({
                pid: problem.pid,
                title: problem.title,
                difficulty: problem.difficulty,
                ac_count: problem.ac_count,
                submit_count: problem.submit_count
            }))
        });
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
            content: problem.content.content,
            sample: problem.content.sample
        });
    }

    public async update() {
        const { ctx } = this;
        const param = ctx.request.body;

        const problem = await ctx.repo.Problem.findOne({
            where: { pid: param.pid }
        });

        if (!problem) {
            ctx.helper.response(2002, 'no data');
            return;
        }

        await problem.loadContent();

        problem.difficulty = param.difficulty;
        problem.content.content = param.content;
        //problem.content.sample = param.sample;

        await problem.content.save();
        await problem.save();

        ctx.helper.response(200, 'processed successfully');
    }
}

export default ProblemController;
