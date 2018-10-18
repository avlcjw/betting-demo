const Rx = require('rxjs/Rx');
const http = require('../../utils/http');
const formatDate = require('../../utils/formatDate');
const getDate = require('../../utils/getServerInfo').getDate;
const lottorySchema = require('../../models/lottory.schema');
const processWithDatas = require('../../functions/import-periods/processWithDatas');


function isOdd(records, position) {
    //是否4期奇数
    let _tmp = records.filter((v, i) => {
        // console.log(v.opencode[position]);
        return v.opencode[position] % 2 !== 0;
    });
    return _tmp.length === records.length;
}

function isEven(records, position) {
    //是否4期偶数
    let _tmp = records.filter((v, i) => {
        // console.log(v.opencode[position]);
        return v.opencode[position] % 2 === 0;
    });
    return _tmp.length === records.length;
}


exports.index = function(req, res) {
    try {
        let serverDate = getDate('yyyy-MM-dd');
        let mongooseModel = this.db.model('periods', lottorySchema);
        mongooseModel.findByMonthRange(serverDate).then(docs => {
            docs = docs.map(v => {
                v._doc.opencode = v._doc.opencode.join(' |  ');
                return v;
            });
            res.render('formula', {docs});
        }, err => {
            console.log(err, '   err;');
        });
    } catch (e) {
        res.render('500', e);
    }
};

exports.api = function(req, res) {
    try {
        let serverDate = getDate('yyyy-MM-dd');
        let mongooseModel = this.db.model('periods', lottorySchema);
        mongooseModel.findByMonthRange(serverDate).then(docs => {
            let lastFourRecords = docs.map(v => {
                // v._doc.opencode = v._doc.opencode.join('|');
                return v._doc;
            }).filter((v, i) => {
                return i < 4;
            });

            console.log('万位数 是否奇数： ', isOdd(lastFourRecords, 0));
            console.log('万位数 是否偶数： ', isEven(lastFourRecords, 0));

            if(isOdd(lastFourRecords, 0)) {
                //万位数 奇数
                res.send('万位数 奇数');
                return;
            }
            if(isEven(lastFourRecords, 0)) {
                //万位数 偶数
                res.send('万位数 偶数');
                return;
            }
            // console.log(lastFourRecords);

            res.json({
                count: docs.length,
                docs: lastFourRecords
            });
        }, err => {
            console.log(err, '   err;');
        });
        // res.render('formula');
    } catch (e) {
        res.render('500', e);
    }
};


exports.run = function(req, res) {
    try {

        let winMultiple = 1.97; //赔率
        let startDate = req.query.start || '2018-07-03'; //开始日期
        let endDate = req.query.end || '2018-07-03'; //开始日期
        let pernote = 11; //每次购买金额
        let initPernote = pernote; //每次购买金额

        let accountMoney = 2200; //余额
        let accountStartMoney = 2200; //本金
        let winTimes = 0; //中奖次数
        let missTimes = 0; //失败次数
        let fusePeriod;
        let biggestMoney = 0;
        let inArow = req.query.row ? Number(req.query.row) : 4; // N 连后出手
        let errorTimes = req.query.error ? Number(req.query.error) : 4; // N 次连续失败
        let maxMoney = req.query.max ? Number(req.query.max) : 200;

        let continuousTypeTimes = {
            '万': 0,
            '千': 0,
            '百': 0,
            '十': 0,
            '个': 0
        };
        let fuseTimes = {
            '万': 1,
            '千': 1,
            '百': 1,
            '十': 1,
            '个': 1
        };
        let typePernote = {
            '万': pernote,
            '千': pernote,
            '百': pernote,
            '十': pernote,
            '个': pernote
        };


        let serverDate = getDate('yyyy-MM-dd');
        let mongooseModel = this.db.model('periods', lottorySchema);
        mongooseModel.findByMonthRange(startDate, endDate).then(docs => {
            let todayRecords = docs.map(v => {
                // v._doc.opencode = v._doc.opencode.join('|');
                v._doc.wanIsBougth = '';
                v._doc.qianIsBougth = '';
                v._doc.geIsBougth = '';
                v._doc.accountMoney = '';
                return v._doc;
            }).reverse();
            let [...returnArr] = todayRecords;

            let times = 0;
            for(let i = 0; i < todayRecords.length; i++) {
                let _fourRecords = [];
                for(let j = i; j < i + inArow; j++) {
                    // console.log(todayRecords[j])
                    // console.log(j)
                    if(todayRecords[j]) {
                        _fourRecords.push(todayRecords[j]);
                    }
                }
                // console.log(_fourRecords, '_fourRecords');
                if(_fourRecords.length === inArow) {
                    let canBuyPeriod = String(Number(_fourRecords[inArow - 1].expect) + 1);

                    function numberOfDigits(digits) {
                        let isBougthType;
                        let isWinningType;
                        let position;
                        let buyTypeMoney;

                        // continuousTypeTimes[digits] = 0;    //初始化每种类型熔断的连续统计次数
                        switch (digits) {
                            case '万':
                                position = 0;
                                isBougthType = 'wanIsBougth';
                                isWinningType = 'wanIsWinning';
                                buyTypeMoney = 'wanBuy';
                                break;
                            case '千':
                                position = 1;
                                isBougthType = 'qianIsBougth';
                                isWinningType = 'qianIsWinning';
                                buyTypeMoney = 'qianBuy';
                                break;
                            case '百':
                                position = 2;
                                isBougthType = 'baiIsBougth';
                                isWinningType = 'baiIsWinning';
                                buyTypeMoney = 'baiBuy';
                                break;
                            case '十':
                                position = 3;
                                isBougthType = 'shiIsBougth';
                                isWinningType = 'shiIsWinning';
                                buyTypeMoney = 'shiBuy';
                                break;
                            case '个':
                                position = 4;
                                isBougthType = 'geIsBougth';
                                isWinningType = 'geIsWinning';
                                buyTypeMoney = 'geBuy';
                                break;
                        }
                        //万位数
                        if(isOdd(_fourRecords, position)) {
                            returnArr.forEach((v, i) => {
                                if(v.expect === canBuyPeriod) {
                                    let currentExpect = v.expect ? Number(v.expect) : 0;    //遍历当前期数
                                    let fusePeriodExpect = fusePeriod ? Number(fusePeriod.expect) : 0;      //

                                    if(fusePeriod && currentExpect - fuseTimes[digits] > fusePeriodExpect) {
                                        continuousTypeTimes[digits] = 0;
                                        fusePeriod = null;
                                    } else if(fusePeriod && currentExpect - fuseTimes[digits] <= fusePeriodExpect) {
                                        return false;
                                    }
                                    if(continuousTypeTimes[digits] > errorTimes - 1) {
                                        fusePeriod = v;
                                        return false;
                                    }
                                    times++;
                                    // accountMoney -= pernote;
                                    accountMoney -= typePernote[digits];
                                    if(!v[isBougthType]) {
                                        v[isBougthType] += '双,';
                                        v[buyTypeMoney] = typePernote[digits];
                                        biggestMoney = typePernote[digits] > biggestMoney ? typePernote[digits] : biggestMoney;
                                        biggestMoney = parseInt(biggestMoney);
                                        if(v.opencode[position] % 2 === 0) {
                                            winTimes++;
                                            continuousTypeTimes[digits] = 0;
                                            v[isWinningType] = true;
                                            accountMoney += parseFloat(typePernote[digits] * winMultiple);
                                            v.accountMoney = accountMoney.toFixed(2);
                                            typePernote[digits] = initPernote;
                                        } else {
                                            // typePernote[digits] = typePernote[digits] * 2;
                                            switch (typePernote[digits]) {
                                                case 11:
                                                    typePernote[digits] = 26;
                                                    break;
                                                case 26:
                                                    typePernote[digits] = 60;
                                                    break;
                                                case 60:
                                                    typePernote[digits] = 200;
                                                    if(maxMoney === 60) {
                                                        typePernote[digits] = initPernote;
                                                    }
                                                    break;
                                                case 200:
                                                    typePernote[digits] = initPernote;
                                                    if(maxMoney > 200) {
                                                        typePernote[digits] = 500;
                                                    }
                                                    break;
                                                case 500:
                                                    typePernote[digits] = initPernote;
                                                    if(maxMoney > 500) {
                                                        typePernote[digits] = 1100;
                                                    }
                                                    break;
                                                // case 1100:
                                                //     typePernote[digits] = 11;
                                                //     if(maxMoney > 1100) {
                                                //         typePernote[digits] = 500;
                                                //     }
                                                //     break;
                                            }
                                            // if(typePernote[digits] > 1100) {
                                            //     typePernote[digits] = initPernote;
                                            // }
                                            missTimes++;
                                            continuousTypeTimes[digits]++;
                                            v.accountMoney = accountMoney.toFixed(2);
                                        }
                                    }
                                    // else {
                                    //     v.accountMoney = accountMoney.toFixed(2);
                                    // }
                                }
                                // else {
                                //     v.accountMoney = accountMoney.toFixed(2);
                                // }
                            });
                        }
                        /*if(isEven(_fourRecords, position)) {
                            returnArr.forEach(v => {
                                if(v.expect === canBuyPeriod) {
                                    let currentExpect = v.expect ? Number(v.expect) : 0;    //遍历当前期数
                                    let fusePeriodExpect = fusePeriod ? Number(fusePeriod.expect) : 0;      //

                                    if(fusePeriod && currentExpect - fuseTimes[digits] > fusePeriodExpect) {
                                        continuousTypeTimes[digits] = 0;
                                        fusePeriod = null;
                                    } else if(fusePeriod && currentExpect - fuseTimes[digits] <= fusePeriodExpect) {
                                        return false;
                                    }
                                    if(continuousTypeTimes[digits] > 3) {
                                        fusePeriod = v;
                                        return false;
                                    }
                                    times++;
                                    accountMoney -= pernote;
                                    if(!v[isBougthType]) {
                                        v[isBougthType] += '单,';
                                        if(v.opencode[position] % 2 !== 0) {
                                            winTimes++;
                                            v[isWinningType] = true;
                                            accountMoney += parseFloat(pernote * winMultiple);
                                            v.accountMoney = accountMoney.toFixed(2);
                                        } else {
                                            v.accountMoney = accountMoney.toFixed(2);
                                        }
                                    }
                                    // else {
                                    //     v.accountMoney = accountMoney.toFixed(2);
                                    // }
                                }
                            });
                        }*/
                    }

                    numberOfDigits('万');
                    // numberOfDigits('千');
                    // numberOfDigits('个');
                }
            }

            for(let i in continuousTypeTimes) {
                missTimes += continuousTypeTimes[i];
            }
            res.render('formula', {
                docs: returnArr.reverse(),
                times,
                accountMoney: accountMoney.toFixed(2),
                startDate,
                endDate,
                winTimes,
                missTimes,
                biggestMoney,
                initPernote,
                accountStartMoney,
            });

            /*res.json({
                count: times
            });*/
        }, err => {
            console.log(err, '   err;');
        });
        // res.render('formula');


    } catch (e) {
        res.render('500', e);
    }
};

exports.openApi = function(req, res) {
    try {
        let serverDate = getDate('yyyy-MM-dd');
        let mongooseModel = this.db.model('periods', lottorySchema);
        mongooseModel.findByMonthRange(serverDate).then(docs => {
            // console.log(docs, 'docs');
            docs = docs.map(v => {
                v._doc.opencode = v._doc.opencode.join('|');
                return v;
            });
            res.json({
                count: docs.length,
                docs: docs
            });
        }, err => {
            console.log(err, '   err;');
        });
        // res.render('formula');
    } catch (e) {
        res.render('500', e);
    }
};