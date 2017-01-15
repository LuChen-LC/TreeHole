/**
 * Created by Administrator on 2017/1/1.
 */
var mongodb = require('./db');

function Comment(name,bname,title,content) {
    this.name = name;
    this.bname = bname;
    this.title = title;
    this.content = content;
}
module.exports = Comment;

Comment.prototype.save = function (callback) {
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
    var comment = {
        name:this.name,
        bname:this.bname,
        time:time.minute,
        title:this.title,
        content: this.content
    };
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('comments',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(comment,{safe:true},function (err) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
//获取一篇文章下所有的评论
Comment.get = function (title,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('comments',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(title){
                query.title = title;
            }
            collection.find(query).sort({time:-1}).toArray(function (err,docs) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs);
            })
        })
    })
}

Comment.delete = function (name,bname,time,title,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }

        db.collection('comments',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.remove({
                "name":name,
                "bname":bname,
                "title":title,
                "time":time
            },{w:1},function (err) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })

    })
}

// function Comment(name,time,title,comment) {
//     this.name = name;
//     this.time = time;
//     this.title = title;
//     this.comment = comment;
// }
// module.exports = Comment;
//
// Comment.prototype.save = function (callback) {
//     var name = this.name,
//         time = this.time,
//         title = this.title,
//         comment = this.comment;
//     mongodb.open(function (err,db) {
//         if(err){
//             return callback(err);
//         }
//         db.collection('reports',function (err,collection) {
//             if(err){
//                 mongodb.close();
//                 return callback(err);
//             }
//             collection.update({
//                 "name":name,"time":time,"title":title
//             },{
//                 $push:{"comments":comment}
//             },function (err) {
//                 mongodb.close();
//                 if(err){
//                     return callback(err);
//                 }
//                 callback(null);
//             })
//         })
//     })
// };