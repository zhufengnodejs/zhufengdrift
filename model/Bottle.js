var redis = require('redis');
var uuid = require('uuid');
var async = require('async');
var util = require('util');
var promise = require("bluebird");
var pool = require('generic-pool').Pool({
    name: 'redisPool',
    create: function (callback) {
        callback(null, redis.createClient('6379', '123.57.143.189'));
    },
    destroy: function (client) {
        client.quit();
    },
    max: 100,
    min: 5,
    idleTimeoutMills: 30 * 1000,
    log: false
});

module.exports.getTimes = function (owner, callback) {
    pool.acquire(function (err, client) {
        async.auto({
            select1: function (cb, results) {
                client.SELECT(1, function () {
                    cb(null, 'success');
                });
            },
            select2:function (cb, results) {
                client.SELECT(2, function () {
                    cb(null, 'success');
                });
            },
            throwTimes: ['select1', function (cb, results) {
                client.GET(owner, function (err, throwTimes) {
                    cb(null, throwTimes);
                })
            }],
            pickTimes: ['select2', function (cb, results) {
                client.GET(owner, function (err, pickTimes) {
                    cb(null, pickTimes);
                })
            }]
        }, function (err, results) {
            if (err) {
                callback(err);
            } else {
                callback(null, {throwTimes: results.throwTimes || 0, pickTimes: results.pickTimes || 0});
            }
        });
    });

}

//扔瓶子
module.exports.throw = function (bottle, callback) {
    var bottleId = uuid.v4();
    var expTime = (3600*24*1000 -(Date.now()-bottle.time))/1000;//24小时减去已过去的时间就是剩余的时间
    async.waterfall([
            function (cb) {
                pool.acquire(function (err, client) {//获取连接
                    cb(null, client);
                });

            }, function (client, cb) {
                client.SELECT(1, function () {//选择1号库
                    cb(null,client);
                });
            },
            function (client, cb) {
                client.GET(bottle.username, function (err, result) {//获取此用户扔瓶子的次数
                    if (result && result >= 6) {
                        return cb({code: 0, msg: "今天扔瓶子的机会已经用完啦"});
                    } else {
                        cb(null, client);
                    }
                })
            },
            function (client, cb) {
                client.INCR(bottle.username, function () { //扔瓶子的计数器加1
                    cb(null, client);
                });
            },
            function (client, cb) {
                client.SELECT(0, function () {//切换回0号库
                    cb(null, client);
                });
            },
            function (client, cb) {
                client.HMSET(bottleId, bottle, function (err, result) {//添加新瓶子
                    if (err) {
                        cb({code: 0, msg: "请一会再试"});
                    }
                    else {
                        cb(null, client);
                    }
                });
            }, function (client,cb) {
                client.EXPIRE(bottleId, expTime, function () {
                    pool.release(client);
                    cb(null, {code: 1, msg: "瓶子已经飘向远方了"});
             });
            }],
        function (err, results) {
            if(err){
                callback(err);
            }else{
                callback(results);
            }
        });
}



module.exports.pick = function (username, callback) {
    pool.acquire(function (err, client) {
        var oldBid = null;
        client = promise.promisifyAll(client);
        client.SELECTAsync(2).then(function(){
            return  client.GETAsync(username);
        }).then(function(result){
            if (result && result >= 3) {
                throw new Error("今天捡瓶子的机会已经用完啦");
            } else {
                return client.INCRAsync(username);
            }
        }).then(function(){
            return client.SELECTAsync(0);
        }).then(function(){
            return client.RANDOMKEYAsync();
        }).then(function(bottleId){
            if (!bottleId) {
                throw new Error("大海空空如也");
            }else{
                oldBid = bottleId;
                return client.HGETALLAsync(bottleId);
            }
        }).then(function (bottle) {
            pool.release(client);
            callback({code: 1, msg: bottle});
            return bottle;
        }).then(function(bottle){
            if(oldBid)
                return client.DELAsync(oldBid);
        }).catch(SyntaxError, function(e){
            return callback({code: 0, msg: e.message});
        }).catch(function(e){
            return callback({code: 0, msg: e.message});
        })
    });
}
