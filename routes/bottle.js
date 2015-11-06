var express = require('express');
var router = express.Router();
var Bottle = require('../model/Bottle');
var util = require('util');

//扔瓶子
router.post('/throw', function(req, res, next) {
    var bottle = {};
    if(req.body.content){
        bottle.content = req.body.content;
    }else{
        return res.json({code:0,msg:"内容不能为空!"});
    }

    if(req.body.owner){//如果所有人有值表示是扔回大海的
        bottle.username = req.body.owner;
    }else{//自己扔瓶子从session中取出用户名
        bottle.username = req.session.user.username;
    }

    if(req.body.time){//如果时间有值表示是扔回大海的
        bottle.time = req.body.time;
    }else{
        bottle.time = Date.now();//如果没有值表示自己扔的要记录时间
    }
    //开始扔瓶子
    Bottle.throw(bottle,function(result){
        return res.json(result);
    });
});



//捡瓶子
router.post('/pick', function(req, res, next) {
    if(req.body.bottleId){//如果有瓶子ID表示查看瓶子内容
        MyBottle.show(req.body.bottleId,function(err,bottle){
            if(err){
                return res.json({code:0,msg:"查看瓶子出错!"});
            }else{
                return res.json({code:1,msg:bottle});
            }
        });
    }else{//如果没有ID表示是从大海里捡瓶子
        Bottle.pick(req.session.user.username,function(result){
            console.error(result);
            return res.json(result);
        });
    }
});

module.exports = router;