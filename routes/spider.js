let express = require('express');
let router = express.Router();
let spiderController = require('../controllers/spider/spider.controller');

/* GET users listing. */
router.get('/', spiderController.index);

module.exports = router;
