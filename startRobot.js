let synaptic = require('synaptic');
let Architect = synaptic.Architect;
let Trainer = synaptic.Trainer;
let lottorySchema = require('./models/lottory.schema');

let periodsCache;

module.exports = function(db) {
    // model
    let mongooseModel = db.model('periods', lottorySchema);
    console.log('机器人初始化中......');
    mongooseModel.find().then(list => {
        periodsCache = list;
        let trainingOptions = {
            rate: .1,
            iterations: 20000,
            error: .005,
        };
        global.robot = new Architect.Perceptron(5, 1, 1);
        let set = list.map((v, i) => {
            let one = {
                input: v.opencode
            };
            if(v.opencode[4] % 2 === 0) {
                //偶数 => 失败
                one.output = [0];
            } else {
                //奇数 => 成功
                one.output = [1];
            }
            return one;
        });
        let trainer = new Trainer(global.robot);
        trainer.train(set, trainingOptions);
        console.log('机器人初始化成功.')
    }, err => {
        console.trace(err);
    });
};