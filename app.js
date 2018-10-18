let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
// let startRobot = require('./startRobot');
// let startRobot = require('./startRobotByTxt');

// mongoose 链接
let mongoose = require('mongoose');
/*
* mongodb connection
* */
/*

let db = mongoose.createConnection('mongodb://127.0.0.1:27017/MachineLearning');
// 链接错误
db.on('error', function(error) {
    console.trace('数据库连接失败: ', error);
});
// 链接关闭
db.on('close', function(msg) {
    console.log('数据库连接关闭: ', msg);
});
// 链接打开
db.on('open', function() {
    console.log('数据库连接打开.');
});

*/

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// startRobot(db);
// startRobot();

app.use(function(req, res, next) {
    // this.db = db;
    next();
});




let index = require('./routes/index');
let init = require('./routes/init');
let api = require('./routes/api');
let spider = require('./routes/spider');
let formula = require('./routes/formula');

/*
* 分分彩
* */
let ffcai = require('./ffcai/ffcai.app');
ffcai();

app.use('/', index);
// app.use('/init', init);
// app.use('/api', api);
// app.use('/spider', spider);
// app.use('/formula', formula);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
