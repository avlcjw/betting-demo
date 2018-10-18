let fs = require('fs');
let path = require('path');
let synaptic = require('synaptic');
let Architect = synaptic.Architect;
let Trainer = synaptic.Trainer;
let periodsCache;

let trainingOptions = {
    rate: .1,
    iterations: 20000,
    error: .005,
};
global.robot = new Architect.Perceptron(5, 1, 1);

module.exports = function() {
    // model
    console.log('机器人初始化中......');
    fs.readFile(path.resolve(__dirname, './datas/313.txt'), 'utf-8', function(err, data) {
        if(err) {
            console.error(err);
        }
        else {
            let result = data.split('\r\n').map((v, i) => {
                let arr = v.split('                         ');
                return {
                    expect: arr[0],
                    opencode: arr[1].split('|'),
                    opentime: arr[2].trim(),
                    opentimestamp: new Date(arr[2]).getTime(),
                };
            });

            let set = result.map((v, i) => {
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
        }
    });
};