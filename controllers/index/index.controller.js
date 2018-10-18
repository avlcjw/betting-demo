const http = require('../../utils/http');
exports.index = function(req, res, next) {
    http({
        url: 'cqssc/'
    }).then(res => {
        console.log(res, 'resssss');
    }, err => {
        console.log(err, 'errerrerrerr');
    })
    res.render('index');
};