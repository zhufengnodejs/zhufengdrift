var express = require('express');
var router = express.Router();
var uuid = require('uuid'),
    path = require('path'),
    formidable = require('formidable'),
    fs = require('fs');
/**
 * 用户注册
 */
router.post('/add', function(req, res, next) {
  new formidable.IncomingForm().parse(req,function(err,fields,files){
    var username = fields.username,
        avatar = files.avatar;
    if(!username)
      return res.json({code:0,msg:"用户名不能为空"});
    var avatarName = uuid.v4()+path.extname(files.avatar.name);
    fs.createReadStream(files.avatar.path).pipe(fs.createWriteStream('../public/upload/'+avatarName));
    req.session.user = {
      username:username,
      avatar:'/upload/'+avatarName,
      throwTimes:0,pickTimes:0
    }
    return res.json({code:1,msg:req.session.user});
  })
});

/**
 * 退出登陆
 */
router.get('/logout',function(req,res,next){
  req.session.user = {};
  return res.json({code:1,msg:"退出成功"});
})
module.exports = router;
