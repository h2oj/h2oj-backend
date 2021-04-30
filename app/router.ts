import { Application } from 'egg';

export default (app: Application) => {
    const { controller, router, middleware, ws } = app;
    const authJwt = middleware.jwt(app.config.jwt);
    const judgeJwt = middleware.judge(app.config.jwt);

    router.get('/test', controller.test.index);

    router.post('/auth/signin', controller.auth.signin);
    router.post('/auth/signup', authJwt, controller.auth.signup);
    router.get('/auth/signout', authJwt, controller.auth.signout);

    router.get('/problem/list', controller.problem.list);
    router.get('/problem/detail', controller.problem.detail);
    router.post('/problem/update', authJwt, controller.problem.update);
    router.post('/problem/upload_data', authJwt, controller.problem.uploadData);
    router.post('/problem/download_data', authJwt, controller.problem.downloadData);
    // router.post('/problem/create', authJwt, controller.problem.create);

    router.get('/submission/list', controller.submission.list);
    router.get('/submission/detail', controller.submission.detail);
    router.post('/submission/submit', authJwt, controller.submission.submit);

    router.get('/contest/list', controller.contest.list);
    router.get('/contest/detail', controller.contest.detail);
    router.post('/contest/update', authJwt, controller.contest.update);
    router.post('/contest/new', authJwt, controller.contest.new);
    router.post('/contest/join', authJwt, controller.contest.join);
    router.post('/contest/has_joined', authJwt, controller.contest.hasJoined);
    router.get('/contest/ranklist', controller.contest.ranklist);

    router.get('/user/detail', controller.user.detail);
    router.get('/user/list', authJwt, controller.user.list);
    router.get('/user/list_role', authJwt, controller.user.listRole);
    router.post('/user/update', authJwt, controller.user.update);
    router.post('/user/change', authJwt, controller.user.change);

    router.get('/captcha/get', controller.captcha.get);
    router.post('/captcha/verify', authJwt, controller.captcha.verify);

    router.post('/judge/verify', controller.judge.verify);
    ws.route('/judge/connect', controller.judge.connect);
    router.get('/judge/check_data', judgeJwt, controller.judge.checkData);
    router.get('/judge/get_data', judgeJwt, controller.judge.getData);
    router.get('/judge/get_source', judgeJwt, controller.judge.getSource);

    router.post('/oauth/github', controller.oauth.github);
};
