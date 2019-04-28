var express = require('express');
var router = express.Router();

router.post('/', function (req, res) {

    let { user, account} = req;
    let { name } = req.body;

    if( !name ){
        return res.status(400).send({
            success:false
        })
    }

    if( account.spys.filter( s => s.name === name ).length>0 ){

        return res.status(409).send({
            success:false
        });
    }

    let spy = {
        name,
        n_follow:0,
        n_follow_back:0
    };

    account.spys.push(spy);

    user.save((err)=>{

        if( err ){
            return res.send({
                success:false
            })
        }

        res.send({
            success: true,
            data:{
                spy
            }
        });
    });
});

router.delete('/:name', function (req, res) {

    let { user, account} = req;
    let { name } = req.params;

    if( account.spys.filter( s => s.name === name ).length===0 ){

        return res.status(404).send({
            success:false
        });
    }

    account.spys = account.spys.filter( s => s.name != name );

    user.save((err)=>{

        if( err ){
            return res.send({
                success:false
            })
        }

        res.send({
            success: true
        });
    });
});

module.exports = router;