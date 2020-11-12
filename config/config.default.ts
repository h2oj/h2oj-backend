import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
    const config = {} as PowerPartial<EggAppConfig>;

    config.keys = appInfo.name + '_222120_08111801';
    config.middleware = [];

    config.jwt = {
        secret: '76798669'
    };
    
    config.security = {
        csrf: {
          enable: false,
        }
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

    return config;
};
