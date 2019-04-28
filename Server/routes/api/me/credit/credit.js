var express = require('express');
var router = express.Router();

router.post('/pay', function (req, res) {

    // TODO
    // stripe token

    res.send({
        success: false
    });
});

module.exports = router;