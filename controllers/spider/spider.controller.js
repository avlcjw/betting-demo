const Rx = require('rxjs/Rx');
const http = require('../../utils/http');
const formatDate = require('../../utils/formatDate');
const getDate = require('../../utils/getServerInfo').getDate;
const cheerio = require('cheerio');
const lottorySchema = require('../../models/lottory.schema');
const processWithDatas = require('../../functions/import-periods/processWithDatas');

let dbNewestNo, spiderNewestNo;
let distanceDate = 0;   //数据库与网站的日期差距

exports.index = function(req, response, next) {
    let mongooseModel = this.db.model('periods', lottorySchema);

    // 0延迟 60s间隔发射信号
    let observable = Rx.Observable.timer(0, 60000);
    let subscription = observable.subscribe(x => {
        mongooseModel.findLastPeriod().then(pre => {
            // console.log(pre, '   pre;');
            pre = pre.length > 0 ? pre[0] : {};
            dbNewestNo = Number(pre.expect);    //获取mongo最新期数
            let dbNewestDate = Number(pre.expect.substring(0, 8));  //数据库最新的日期
            let currentDateFormated = Number(getDate());
            if(currentDateFormated > dbNewestDate) {
                distanceDate = currentDateFormated - dbNewestDate;
            }
            let qs = {
                gameIndex: '301',
                searchDate: distanceDate > 0 ? formatDate.NumberToString(++dbNewestDate) : formatDate.NumberToString(currentDateFormated)
            };
            // http({url: '/cqssc/'})
            http({
                method: 'POST',
                url: '/open/kcResultByDate.do',
                qs
            })
                .then(res => {
                    let periods = processWithDatas(res);
                    spiderNewestNo = Number(periods[0].expect);
                    distanceDate--;

                    console.log('服务器时间:  ', getDate('yyyy-MM-dd hh:mm:ss'));

                    let newMap = Array.from(periods).filter((v, i) => {
                        return Number(v.expect) > dbNewestNo;
                    }).reverse();

                    if(newMap.length > 0) {
                        // console.log(newMap, '=======>newMap');
                        console.log('数据库最新期数:  ', dbNewestNo);
                        console.log('爬虫获取最新期数:  ', spiderNewestNo);

                        mongooseModel.collection.insert(newMap, function onInsert(err, docs) {
                            if(err) {
                                // TODO: handle error
                                console.error(err);
                            } else {
                                console.info('%d docs were successfully stored.', docs.insertedCount);
                                // response.send(`spider start. catch ${docs.insertedCount} periods.`);
                            }
                        });
                    }else{
                        console.log('没有发现新期数');
                    }
                }, err => {
                    console.log(err, 'errerrerrerr');
                });

        }, err => {
            console.log(err, '   err;');
        });


    });
    // 稍后：
    // 这会取消正在进行中的 Observable 执行
    // Observable 执行是通过使用观察者调用 subscribe 方法启动的
    // subscription.unsubscribe();

    response.send('spider start.');
};