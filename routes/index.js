let express = require('express');
let router = express.Router();
let indexCtrl = require('../controllers/index/index.controller');

/* GET home page. */
router.get('/', indexCtrl.index);

module.exports = router;
