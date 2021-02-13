import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
    static: true,
    cors: {
        enable: true,
        package: 'egg-cors'
    },
    jwt: {
        enable: true,
        package: 'egg-jwt'
    },
    typeorm: {
        enable: true,
        package: 'egg-ts-typeorm'
    },
    multipart: {
        enable: true,
        package: 'egg-multipart'
    },
    bus: {
        enable: true,
        package: 'egg-bus'
    }
};

export default plugin;
