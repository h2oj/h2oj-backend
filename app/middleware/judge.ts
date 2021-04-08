import { Context, EggAppConfig } from 'egg';

export default (options: EggAppConfig['jwt']): any => {
    return async function judgeVerify(ctx: Context, next: () => Promise<any>) {
        const auth = ctx.request.headers['authorization'];
        
        if (!auth) {
            ctx.helper.failure(401, 'unauthorized');
        }
        else {
            const decode = ctx.app.jwt.verify(auth, options.secret);
            ctx.state = decode;
            await next();
        }
    };
};
