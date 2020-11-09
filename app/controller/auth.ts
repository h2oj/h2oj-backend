import { Controller } from 'egg';

class AuthController extends Controller {
    public async signup() {
        const { ctx } = this;
        ctx.body = {
            status: 200,
            data: 'Welcome to Hydrogen OJ backend!'
        };
    }

    public async signin() {
        const { ctx } = this;
        ctx.body = {
            status: 200,
            data: 'Welcome to Hydrogen OJ backend!'
        };

    }

    public async signout() {
        const { ctx } = this;
        ctx.body = {
            status: 200,
            data: 'Welcome to Hydrogen OJ backend!'
        };
    }
}

export default AuthController;
