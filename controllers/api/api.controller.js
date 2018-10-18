exports.add = function(req, res, next) {
    try {
        let inputOne = JSON.parse(req.body.input);
        let result = global.robot.activate(inputOne);
        res.json(result);
    } catch (e) {
        res.render('500', e)
    }
};