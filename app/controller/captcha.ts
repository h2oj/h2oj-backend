import { Controller } from 'egg';
import path from 'path';
import fs from 'fs';

class CaptchaController extends Controller {
    public async get() {
        const { ctx, app } = this;

        const files = fs.readdirSync(ctx.app.config.h2oj.path.captcha);
        const index = Math.floor(Math.random() * files.length);
        const file = path.join(ctx.app.config.h2oj.path.captcha, files[index]);
        const data = fs.readFileSync(file, { encoding: 'utf-8' });
        ctx.response.type = 'image/svg+xml';
        ctx.body = data;
        const basename = path.basename(file);

        const token = app.jwt.sign({
            captcha: {
                code: basename.substr(0, basename.lastIndexOf('.')),
                verified: false
            }
        }, app.config.jwt.secret);
        ctx.helper.response(200, 'processed successfully', {
            token: token,
            data: data
        });
    }

    public verify() {
        const { ctx, app } = this;
        const param = ctx.request.body;

        if (param.code === ctx.state.captcha.code) {
            const token = app.jwt.sign({
                captcha: {
                    code: ctx.state.captcha.code,
                    verified: true
                }
            }, app.config.jwt.secret);
            ctx.helper.response(200, 'processed successfully', {
                token: token
            });
        }
        else {
            ctx.helper.response(9001, 'captcha error');
        }
    }
}

export default CaptchaController;
