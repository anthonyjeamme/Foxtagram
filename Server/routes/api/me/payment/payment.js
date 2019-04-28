var express = require('express');
var router = express.Router();
var stripe = require("stripe")( "sk_test_AjeoYnSJDCxNY7JPmd6LBkp3" );

router.post('/', async (req, res) => {

    try{

        let { token, email } = req.body;

        const customer = await stripe.customers.create({
            email
        });

        const charge = await stripe.charges.create({
            amount: 999,
            currency: 'usd',
            description: 'Example charge',
            source: token.id,
          });

          console.log(charge)

          console.log("OKOK")

        // console.log(token)

        // const source = await stripe.sources.create({
        //     original_source: token.id,
        //     usage: "reusable"
        // });

        // let a = await stripe.customers.update( customer.id, {
        //     source: source.id
        // });

        // const subscription = await stripe.subscriptions.create({
        //     customer: customer.id,
        //     source: token.card.id,
        //     items: [{ plan: 'plan_DDqSi8NNdFEbrR' }],
        // });

        // console.log(subscription)
        
        res.send({
            success: true
        })
    } catch( e ){

        console.log(e)

        res.status(500).send({
            success: false
        })
    }
});


module.exports = router;
