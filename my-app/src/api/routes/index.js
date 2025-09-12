var express = require('express');
var router = express.Router();

/* GET do index - teste da API */
router.get('/', function(req, res, next) {
 return res.status(200).json({
        success: true,
        message: 'Olá, mundo! Panetone <3'
      });
});

module.exports = router;
