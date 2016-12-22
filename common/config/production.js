'use strict';

if (!process.env.MONGO_PWD) {
    console.log('MongoDB password not set! Please set the MONGO_PWD environment variable. Exiting...');
    process.exit(1);
}

module.exports = {
    environment: 'production',
    apiServerPort: 4000,
    db: 'mongodb://glxUser:' + process.env.MONGO_PWD + '@10.100.10.4/glxchat',
    url: 'http://localhost:3000/',
    secretToken: 'glx@dev#712'
};
