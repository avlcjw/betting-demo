let express = require('express');
let router = express.Router();
let apiCtrl = require('../controllers/api/api.controller');

/* GET users listing. */
router.post('/addTrain', apiCtrl.add);

module.exports = router;
