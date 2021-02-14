import { Application } from 'egg';

export default (app: Application) => {
    const { controller, router, middleware } = app;
    const jwt = middleware.jwt(app.config.jwt);

    router.get('/test', controller.test.index);

    router.post('/auth/signin', controller.auth.signin);
    router.post('/auth/signup', jwt, controller.auth.signup);
    router.get('/auth/signout', jwt, controller.auth.signout);

    router.get('/problem/list', controller.problem.list);
    router.get('/problem/detail', controller.problem.detail);
    router.post('/problem/update', jwt, controller.problem.update);
    router.post('/problem/upload_data', jwt, controller.problem.upload_data);
    router.post('/problem/download_data', jwt, controller.problem.download_data);
    // router.post('/problem/create', jwt, controller.problem.create);

    router.get('/submission/list', controller.submission.list);
    router.get('/submission/detail', controller.submission.detail);
    router.post('/submission/submit', jwt, controller.submission.submit);

    router.get('/contest/list', controller.contest.list);
    router.get('/contest/detail', controller.contest.detail);
    router.post('/contest/update', jwt, controller.contest.update);
    router.post('/contest/create', jwt, controller.contest.create);

    router.get('/user/detail', controller.user.detail);
    router.get('/user/list', jwt, controller.user.list);
    router.post('/user/update', jwt, controller.user.update);
    router.post('/user/change', jwt, controller.user.change);

    router.get('/captcha/get', controller.captcha.get);
    router.post('/captcha/verify', jwt, controller.captcha.verify);
};
