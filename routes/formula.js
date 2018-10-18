let express = require('express');
let router = express.Router();
let formulaController = require('../controllers/formula/formula.controller');

/* GET users listing. */
router.get('/', formulaController.index);
router.get('/api', formulaController.api);
router.get('/run', formulaController.run);

module.exports = router;
