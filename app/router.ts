import { Application } from 'egg';

export default (app: Application) => {
    const { controller, router, middleware } = app;
    const jwt = middleware.jwt(app.config.jwt);

    router.get('/test', controller.test.index);
    router.post('/auth/signin', controller.auth.signin);
    router.post('/auth/signup', controller.auth.signup);
    router.get('/auth/signout', jwt, controller.auth.signout);

    router.get('/problem/list', controller.problem.list);
    router.get('/problem/detail', controller.problem.detail);
    router.post('/problem/update', jwt, controller.problem.update);
    router.post('/problem/upload_data', jwt, controller.problem.upload_data);
    router.get('/problem/download_data', jwt, controller.problem.download_data);

    router.get('/submission/list', controller.submission.list);
    router.get('/submission/detail', controller.submission.detail);
    router.post('/submission/submit', controller.submission.submit);
};
