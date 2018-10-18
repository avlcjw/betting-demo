let mongoose = require('mongoose');

// Schema 结构
let lottorySchema = new mongoose.Schema({
    expect: {type: String, index: true},
    opencode: {type: [Number]},
    opentime: {type: String},
    opentimestamp: {type: Date}
});
// 添加 mongoose 实例方法
lottorySchema.methods.findbyusername = function(username, callback) {
    return this.model('periods').find({username: username}, callback);
};

// 添加 mongoose 静态方法，静态方法在Model层就能使用
lottorySchema.statics.getCollectionLength = function() {
    return this.model('periods').collection.count();
};

lottorySchema.statics.findLastPeriod = function() {
    return this.model('periods').find().sort({opentimestamp: -1}).limit(1);
};

lottorySchema.statics.findByMonthRange = function(startMonth, endMonth) {
    let query;
    if(!endMonth) {
        query = {"opentime": {"$gt": `${startMonth} 00:00`}};
    }
    if(startMonth && endMonth) {
        query = {"$and": [{"opentime": {"$gt": `${startMonth} 00:00`}}, {"opentime": {"$lt": `${endMonth} 23:59`}}]};
    }
    return this.model('periods').find(query).sort({opentimestamp: -1})
};

module.exports = lottorySchema;