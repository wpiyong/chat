'use strict';

if (!process.env.MONGO_PWD) {
    console.log('MongoDB password not set! Exiting...');
    process.exit(1);
}

module.exports = {
    environment: 'test',
    apiServerPort: 4000,
    db: 'mongodb://glxUser:' + process.env.MONGO_PWD + '@localhost/glxchat',
    url: 'http://localhost:3000/',
    secretToken: 'glx@dev#712'
};
