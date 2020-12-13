import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
    const config = {} as PowerPartial<EggAppConfig>;

    config.keys = appInfo.name + '_222120_08111801';
    config.middleware = [];

    config.jwt = {
        secret: 'HOJJWT'
    };
    
    config.security = {
        csrf: {
          enable: false,
        },
        domainWhiteList: ['http://localhost:8080']
    };

    config.cors = {
        origin: '*',
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    };

    config.typeorm = {
        client: {
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'hoj',
            password: 'hoj2020',
            database: 'hoj',
            synchronize: true,
            logging: false
        }
    };

    config.path = {
        code: './data/code',
        judge: './data/temp',
        data: './data/problem'
    };

    return config;
};
