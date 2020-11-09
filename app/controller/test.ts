import { Controller } from 'egg';

class TestController extends Controller {
    public async index() {
        const { ctx } = this;
        ctx.body = {
            status: 200,
            data: 'Welcome to Hydrogen OJ backend!'
        };
    }
}

export default TestController;
