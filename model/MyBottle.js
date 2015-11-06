var mongoose = require('mongoose');
mongoose.connect("mongodb://123.57.143.189/drift");
var util = require('util');
var bottleSchema = new mongoose.Schema({
    user:Array,
    message:Array
},{collection:'bottle'});

var bottleModel = mongoose.model('Bottle',bottleSchema);

module.exports.response = function(bottle,callback){
    var newBottle = new bottleModel(bottle);
    newBottle.save(function(err,bottle){
        if(err)
            return callback(err);
        else
            callback(null,bottle);
    });
}

