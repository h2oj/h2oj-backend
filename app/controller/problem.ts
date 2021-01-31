import { Controller } from 'egg';
import Problem from '../model/Problem';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import User from '../model/User';


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
            content: problem.content.content,
            sample: problem.content.sample,
            user: {
                uid: problem.publisher.uid,
                username: problem.publisher.username,
                nickname: problem.publisher.nickname
            }
        });
    }

    public async update() {
        const { ctx } = this;
        const param = ctx.request.body;
        if (ctx.user.checkPermission(ctx.state.user_id, 'CHANGE_PROBLEM')){
            const problem = await ctx.repo.Problem.findOne({
                where: { pid: param.pid }
            });

            if (!problem) {
                ctx.helper.response(2002, 'no data');
                return;
            }

            await problem.loadContent();

            problem.title = param.title;
            problem.difficulty = param.difficulty;
            problem.content.content = param.content;
            //problem.content.sample = param.sample;

            await problem.content.save();
            await problem.save();

            ctx.helper.response(200, 'processed successfully');
        }
        else {
            ctx.helper.response(401, 'premission denied');
        }
    }

    public async upload_data() {
        const { ctx } = this;
        const param = ctx.request.body;
        const file = ctx.request.files[0];
        const pid = param.pid;
        if (ctx.user.checkPermission(ctx.state.user_id, 'CHANGE_PROBLEM')){
            const dataPath = path.join(ctx.app.config.path.data, pid);
            if (!fs.existsSync(dataPath)) {
                fs.mkdirSync(dataPath, { recursive: true });
            }
            fs.copyFileSync(file.filepath, path.join(dataPath, 'data.zip'));
            const extractPath = path.join(dataPath, 'temp');
            let zip = new AdmZip(file.filepath);
            zip.extractAllTo(extractPath, true);
            for (let file of fs.readdirSync(extractPath)) {
                if (file === 'config.yml' || ['.in', '.out'].includes(path.extname(file))) {
                    fs.copyFileSync(path.join(extractPath, file), path.join(dataPath, path.basename(file)));
                }
            }
            ctx.cleanupRequestFiles();
            fs.rmdirSync(extractPath, { recursive: true });
            ctx.helper.response(200, 'processed successfully');
        }
        else {
            ctx.helper.response(401, 'premission denied');
        }
    }

    public async download_data() {

    }
}

export default ProblemController;
