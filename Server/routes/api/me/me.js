var express = require('express');
var router = express.Router();

var accounts_route = require('./accounts/accounts');
var credit_route = require('./credit/credit');
var payment_route = require('./payment/payment');

router.get('/', (req,res)=>{

    let me = req.user.toObject({ versionKey: false });

    me.accounts.forEach( account=>{
        account.password = undefined
    });

    res.send({
        success:true,
        data:{
            me
        }
    })
});

router.use('/accounts', accounts_route);
router.use('/payment', payment_route);
router.use('/credit', credit_route);

module.exports = router;
