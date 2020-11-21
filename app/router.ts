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
};
