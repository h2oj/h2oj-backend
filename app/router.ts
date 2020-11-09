import { Application } from 'egg';

export default (app: Application) => {
    const { controller, router } = app;

    router.get('/test', controller.test.index);
    router.post('/signin', controller.auth.signin);
    router.post('/signup', controller.auth.signup);
    router.get('/signout', controller.auth.signout);
};
