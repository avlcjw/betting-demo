let fs = require('fs');
let path = require('path');

let lottorySchema = require('../../models/lottory.schema');
const processWithDatas = require('../../functions/import-periods/processWithDatas');


exports.init = function(req, res) {
    // model
    let mongooseModel = this.db.model('periods', lottorySchema);
    mongooseModel.getCollectionLength().then((length) => {
        if(length && length > 0) {
            res.send('已经初始化过了');
            // db.close();
        } else {
            let periods = processWithDatas(path.resolve(__dirname, '../../datas/313.txt')).reverse();
            mongooseModel.collection.insert(periods, function onInsert(err, docs) {
                if(err) {
                    // TODO: handle error
                    console.error(err);
                } else {
                    console.info('%d docs were successfully stored.', docs.insertedCount);
                    res.send('初始化313.txt的数据');
                }
            });
        }
    }, (err) => {
        console.trace(err, 'getCollectionLengthError');
        // db.close();
    });


};