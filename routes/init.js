let fs = require('fs');
let path = require('path');
let express = require('express');
let router = express.Router();
let initCtrl = require('../controllers/init/init.controller');



/* GET users listing. */
router.get('/', initCtrl.init);

module.exports = router;
