var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// require('events').EventEmitter.prototype._maxListeners = 0;
var routes = require('./routes/index');
//引入数据库配置
var settings=require('./setting');
//引入flash插件
var flash=require('connect-flash');
//引入会话插件
var session=require('express-session');
var MongoStore=require('connect-mongo')(session);

var app = express();

// view engine setup
// app.set('views', './views');
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
//使用flash插件
app.use(flash());
//使用session会话
app.use(session({
    secret:settings.cookieSecret,
    key:settings.db,
    cookies:{maxAge:1000*60*60*24*30},
    store:new MongoStore({
        url:'mongodb://localhost/treehole'
    }),
    resave:false,
    saveUninitialized:true
}))
//将app这个应用传入到routes函数里进行处理
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(3013,function () {
    console.log('project is ready');
})

module.exports = app;
