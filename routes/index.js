//crypto用来生成散列值来加密密码
var crypto = require('crypto');
var multer = require('multer');
var User = require('../models/user.js');
var Report = require('../models/report.js');
var Comment = require('../models/comment.js');
var upload = require('../models/uploads.js');
module.exports = function (app) {
    //首页
    app.get('/', function(req, res) {
        //console.log(req.session.user);
        var pageCurrent = parseInt(req.query.current) || 1;
        Report.getFive(null, pageCurrent,function (err, reports,total) {
            if (err) {
                reports = [];
            }
            res.render('index', {
                title: 'treehole',
                currentUser: req.session.user,
                reports: reports,
                pageCurrent:pageCurrent,
                total:total,
                page:Math.ceil(total/10),
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                message: req.flash('message').toString()
            });
            //console.log(reports);
        })
    });
    //个人首页
    app.get('/myindex',function (req,res) {
        var pageCurrent = parseInt(req.query.current) || 1;
        Report.getFive(req.session.user.name,pageCurrent,function (err,reports,total) {
            if(err){
                reports = [];
            }
            //console.log(total)
            //console.log(req.session.user);
            res.render('myIndex', {
                title: req.session.user.name,
                currentUser:req.session.user,
                reports:reports,
                pageCurrent:pageCurrent,
                total:total,
                page:Math.ceil(total/7),
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                message:req.flash('message').toString()
            });
        });
    });
    //搜索
    app.get('/search', function (req, res) {
        Report.search(req.query.keyword, function (err, reports) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('search', {
                title: "搜索关键字:" + req.query.keyword,
                reports:reports,
                currentUser: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    //用户信息页面
    app.get('/userInfo',function (req,res) {
        var currentUser = req.session.user;
        //console.log(req.query)
        User.edit(req.query.userName,function (err,user) {
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
             res.render('userInfo',{
                title:"藏密者信息",
                user:user,
                currentUser:currentUser,
                message:req.flash('message').toString(),
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });
        })
    });
    app.post('/userInfo',upload.single('photo'),function (req,res) {
        //console.log(req.body);
        var name = req.query.userName;
        User.edit(name,function (err,user) {
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            var signature = req.body.sign;
            var introduction = req.body.intro;
            var imgUrl = req.imgUrl;
            User.update(name,signature,introduction,imgUrl,function (err,user) {
                if(err){
                    req.flash('error',err);
                    return res.redirect('back');
                }
                req.session.user = user;
                Report.updateImg(req.session.user.name, req.imgUrl, function (err) {
                    if(err){
                        res.flash('error',err);
                        return res.redirect('back');
                    }
                    return res.redirect('back');
                })
                // req.flash('success','更新成功');
                // req.flash('message','更新成功');

            })
        })
    });
    app.get('/report',checkLogin);
    app.get('/report',function (req,res) {
        res.render('report',{
            title:'发表',
            currentUser:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    });
    //发表页面
    app.post('/report',function (req,res) {
        var title = req.body.title,
            weather = req.body.weather,
            feeling = req.body.feeling,
            site = req.body.site,
            report = req.body.report;
        //console.log('title=' + title.length);
        if(title.length == 0 || /^(\s)+$/.test(title) == true){
            req.flash('error','标题为必填项且不能为空');
            return res.redirect('/report');
        }
        if(weather.length > 7){
            req.flash('error','天气最多7个字');
            return res.redirect('/report');
        }
        if(report.length == 0 || /^(\s)+$/.test(report) == true){
            req.flash('error','内容为必填项且不能为空');
            return res.redirect('/report');
        }
        var currentUser = req.session.user;
        //console.log(currentUser);
        var report = new Report(currentUser.name,title,weather,feeling,site,report,currentUser.imgUrl);
        //console.log(report);
        report.save(function (err) {
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('message','刚刚藏了一枚小秘密');
            req.flash('success','埋下成功');
            res.redirect('/');
        })
    });
    //详情页面
    app.get('/u/:name/:time/:title',function (req,res) {
        Comment.get(req.params.title,function (err,comments) {
            if (err) {
                comments = [];
            }
            //console.log(req.params);
            Report.getOne(req.params.name, req.params.title, req.params.time, function (err, report) {
                if (err) {
                    req.flash('error', err);
                    return res.render('/');
                }
                res.render('article', {
                    title: req.params.title,
                    report: report,
                    comments:comments,
                    currentUser: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString(),
                    message: req.flash('message').toString()
                })
            })
        })
    });
    //提交评论
    app.post('/comment/:name/:bname/:time/:title',function (req,res) {
        if(req.body.content.length == 0 || /^(\s)+$/.test(req.body.content) == true){
            req.flash('message','评论不能为空');
            return res.redirect('back');
        }
        //console.log(req.params)
        var newComment = new Comment(req.params.name,req.params.bname,req.params.title,req.body.content);
        newComment.save(function (err) {
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('message','评论成功');
            res.redirect('back');
        })
    });
    //删除评论
    app.get('/delCom/:name/:bname/:title/:time',function (req,res) {
        //console.log(req.params)
        Comment.delete(req.params.name,req.params.bname,req.params.time,req.params.title,function (err) {
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success','删除留言成功');
            req.flash('message','删除评论成功');
            res.redirect('back');
        })
    });
    //编辑页面
    app.get('/edit/:name/:time/:title',function (req,res) {
        var currentUser = req.session.user;
        Report.edit(currentUser.name,req.params.title,req.params.time,function (err,report) {
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            //console.log(report);
            res.render('edit',{
                title:'编辑',
                currentUser:req.session.user,
                report:report,
                //message:req.flash('message').toString(),
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            })
        })
    });
    app.post('/edit/:name/:time/:title',function (req,res) {
        Report.edit(req.params.name, req.params.title, req.params.time, function (err, report) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            var currentReport = report;
            //console.log(currentReport)
            //console.log(req.body)
            var name = req.params.name,
                title = req.params.title,
                weather = req.body.weather,
                feeling = req.body.feeling,
                site = req.body.site,
                report = req.body.report,
                time = req.params.time;
            // console.log(site);
            Report.update(name, title, weather, feeling, site, report, time, function (err) {
                var url = encodeURI('/u/' + name + '/' + time + '/' + title);
                if (err) {
                    req.flash('error', err);
                    return res.redirect(url);
                }
                if(weather == currentReport.weather && feeling == currentReport.feeling
                    && site == currentReport.site && report == currentReport.report){
                    req.flash('error','信息没有改动，编辑失败');
                    return res.redirect('back');
                }
                // console.log('编辑成功');
                req.flash('success', '编辑成功');
                req.flash('message', '成功修改了一条小秘密~');
                return res.redirect(url);
            })
        });
    })
    //秘密删除行为
    app.get('/del/:name/:time/:title',function (req,res) {
        Report.delete(req.params.name,req.params.title,req.params.time,function (err) {
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success','删除成功');
            req.flash('message','你刚刚清除了一个小秘密哦');
            res.redirect('/');
        })
    })

    //登录页面
    app.get('/login',function (req,res) {
        res.render('login',{
            title:'登录',
            currentUser:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString(),
            message:req.flash('message').toString()
        })
    });
    app.post('/login',function (req,res) {
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        User.get(req.body.name,function (err,user) {
            if(!user){
                req.flash('error','这个树洞不存在呢!');
                return res.redirect('/login');
            }
            if(user.password != password){
                req.flash('error','这把钥匙打不开这个树洞呦');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('message','您刚刚进入树洞');
            req.flash('success','成功进入树洞');
            res.redirect('/');
        })
    });



    //注册页面
    app.get('/regist',function (req,res) {
        res.render('regist',{
            title:'注册',
            currentUser:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    });
    app.post('/regist',function (req,res) {
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body.repassword,
            pattern1 = /^[\u4E00-\u9FA5a-z0-9A-Z]{2,6}$/,
            pattern2 = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
        //匹配用户名,不符合提示并返回注册页面
        if(!pattern1.test(name)){
            req.flash('error','树洞名由2-6个汉字/字母/数字组成');
            return res.redirect('/regist');
        }
        //匹配密码,不符合提示并返回注册页面
        if(!pattern2.test(password)){
            req.flash('error','钥匙由6~12个数字和字母组合而成哦');
            return res.redirect('/regist');
        }
        //比较两次密码是否一致,不一致提示,并返回注册页面
        if(password_re != password){
            req.flash('error','两次输入的密码不一致呢,请重新填写');
            return res.redirect('/regist');
        }
        var md5 = crypto.createHash('md5');
        password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name:name,
            password : password,
            signature:"nothing yet",
            introduction:"神秘的藏密者"
        });
        //检查用户名是否已经存在
        User.get(newUser.name,function (err,user) {
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            //用户存在,重新注册
            if(user){
                req.flash('error','这个树洞已经被人占领了~');
                return res.redirect('/regist');
            }
            //用户不存在,新增用户
            newUser.save(function (err,user) {
                if(err){
                    req.flash('error',err);
                    return res.redirect('/regist');
                }
                req.session.user = newUser;
                req.flash('message','挖洞成功,请进洞');
                req.flash('success','挖洞成功!');
                res.redirect('/login');
            })
        })
    });

    //退出页面
    app.get('/logout',function (req,res) {
        req.session.user = null;
        req.flash('success','退出成功');
        req.flash('message','当前处于未进洞状态,不可以藏秘密');
        res.redirect('/');
    });

    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '先进洞才可以藏小秘密哦!');
            return res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已经在洞里了呢!');
            res.redirect('back');
        }
        next();
    }
};

















