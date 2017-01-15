/**
 * Created by Administrator on 2016/12/28.
 */
var mongodb = require('./db');
var markdown = require('markdown').markdown;
function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.signature = user.signature;
    this.introduction = user.introduction;
    this.imgUrl = user.imgUrl;
}
module.exports = User;

//存储用户信息
User.prototype.save = function (callback) {
    var date = new Date();
    //存储各种时间格式
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
        +':'+(date.getSeconds()< 10 ? '0' + date.getSeconds() : date.getSeconds())
    };
    //要存入数据库的用户文档
    var user = {
        name:this.name,
        password:this.password,
        signature:this.signature,
        introduction:this.introduction,
        regTime:time.minute,
        imgUrl:this.imgUrl
    };
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取users集合
        db.collection('users',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将用户数据插入users集合
            collection.insert(user,{safe:true},function (err,user) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                //成功则err为null,并返回存储后的用户文档
                callback(null,user[0]);
            })
        })
    })
};
//读取用户信息
User.get = function (name,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取users集合
        db.collection('users',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查找用户名name键值为name的文档
            collection.findOne({name:name},function (err,user) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                if(user){
                    user.signature = markdown.toHTML(user.signature);
                    user.introduction = markdown.toHTML(user.introduction);
                }
                //成功则返回查询到的用户信息
                callback(null,user);
            })
        })
    })
};
//编辑信息
User.edit = function (name,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "name":name
            },function (err,doc) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                 callback(null,doc);
            })
        })
    })
};
//将编辑后的内容更新
User.update = function (name,signature,introduction,imgUrl,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "name":name
            },{$set:{signature:signature,introduction:introduction,imgUrl:imgUrl}},{upsert:true})
            collection.findOne({name:name},function (err,user) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }

                callback(null,user);
            })
        })
    })
};

User.updateImg = function (name,imgUrl,callback) {
    mongodb.open(function (err,db) {
        if(err) {
            return  callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({name:name},{$set:{imgUrl:imgUrl}},{upsert:true});
            collection.findOne({name:name},function (err,user) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                //console.log(user);
                callback(null,user);
            })
        })
    })
};