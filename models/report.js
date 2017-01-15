/**
 * Created by Administrator on 2016/12/30.
 */
var mongodb = require('./db');
var markdown = require('markdown').markdown;
function Report(name,title,weather,feeling,site,report,imgUrl) {
    this.name = name;
    this.title = title;
    this.weather = weather;
    this.feeling = feeling;
    this.site = site;
    this.report = report;
    this.imgUrl = imgUrl;
}

module.exports = Report;

//存储一个秘密及其相关信息
Report.prototype.save = function (callback) {
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
    //存入数据库的整个秘密
    var report = {
        name:this.name,
        title:this.title,
        weather:this.weather,
        feeling:this.feeling,
        site:this.site,
        report:this.report,
        imgUrl:this.imgUrl,
        time:time.minute,
        //comments:[],
        pv:0
    };
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取reports集合
        db.collection('reports',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将秘密插入reports集合
            collection.insert(report,{safe:true},function (err) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
};

//读取秘密及其相关信息
Report.get = function (name,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取reports集合
        db.collection('reports',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            //console.log(query.name);
            //根据query对象查询秘密
            collection.find(query).sort({time:-1}).toArray(function (err,docs) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                docs.forEach(function (doc) {
                    doc.report = markdown.toHTML(doc.report);
                });
                callback(null,docs);
            })
        })
    })
};
//根据用户名发布的时间，标题来获取具体的秘密
Report.getOne = function (name,title,time,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('reports',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "name":name,
                "title":title,
                "time":time
            },function (err,doc) {
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                if(doc){
                    collection.update({
                        "name":name,
                        "time":time,
                        "title":title
                    },{$inc:{"pv":1}},function (err) {
                        mongodb.close();
                        if(err){
                            return callback(err);
                        }
                    });
                    doc.report = markdown.toHTML(doc.report);
                    // doc.comments.forEach(function (comment) {
                    //    comment.content = markdown.toHTML(comment.content);
                    // })
                    callback(null,doc);
                    //console.log(doc);
                }
            })
        })
    })
};
//编辑功能,返回markdown格式的原始内容
Report.edit = function (name,title,time,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('reports',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "name":name,
                "title":title,
                "time":time
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
Report.update = function (name,title,weather,feeling,site,report,time,callback) {
    //console.log(site);
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('reports',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "name":name,
                "title":title,
                "time":time
            },{$set:{weather:weather, feeling:feeling, site:site,report:report}},function (err) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
};
//删除指定秘密
Report.delete = function (name,title,time,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('reports',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                "name":name,
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
};

Report.search = function(keyword, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('reports', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var pattern = new RegExp(keyword, "i");
            collection.find({
                "$or":[{"title":pattern},{"name":pattern}]
            }, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

//1次获取7篇文章
Report.getFive = function (name,page,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('reports',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            //使用 count 返回特定查询的文档数 total
            collection.count(query,function (err,total) {
                //根据 query 对象查询，并跳过前 (page-1)*7个结果，返回之后的 7个结果
                collection.find(query,{
                    skip:(page - 1) * 10,
                    limit:10
                }).sort({time:-1}).toArray(function (err,docs) {
                    mongodb.close();
                    if(err){
                        return callback(err);
                    }
                    docs.forEach(function (doc) {
                        doc.report = markdown.toHTML(doc.report);
                    });
                    callback(null,docs,total);
                })
            })
        })
    })
};
//更新文章里的头像
Report.updateImg = function (name, imgUrl, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('reports', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "name": name
            }, {$set: {imgUrl: imgUrl}}, {multi: true}, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            })
        })
    })
};