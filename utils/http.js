const request = require('request');

module.exports = function http(config) {
    let httpConfig = {
        method: config.method ? config.method.toUpperCase() : 'GET',
        headers: {
            Cookie: ''
        }
    };
    httpConfig.qs = config.qs || '';
    // httpConfig.url = (config.host ? config.host : 'https://kaijiang.aicai.com') + (config.url || '');
    httpConfig.url = (config.host ? config.host : 'https://www-api.xztsfz.com') + (config.url || '');
    return new Promise((resolve, reject) => {
        request(httpConfig, function(error, response, body) {
            //请求发生异常
            if(error) {
                reject(error);
            }
            // try {
            //     body = config.dataType === 'str' ? body : JSON.parse(body);
            // } catch (e) {
            //     body = {};
            //     console.error('http.init解析body错误', e);
            // }
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                console.error('无法格式化返回，数据原封返回');
                console.error(e);
                resolve(body);
            }
        });
    });
};
