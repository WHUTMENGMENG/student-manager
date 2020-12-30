//nodejs模块划分 内置模块 三方模块
var express = require('express');
var path = require('path'); //内置的path模块
var cookieParser = require('cookie-parser');
var logger = require('morgan');//日志模块
var jwt = require("jsonwebtoken")
const io = require('socket.io')()
global.io = io;
io.on("connection", socket => {
    global.sock = socket

})
var indexRouter = require('./routes/index'); //路由
//引入自己定义的路由
let customRouter = require("./routes/custom")
let studentsRouter = require("./routes/students")
let usersRouter = require('./routes/users');
let loginLogRouter = require('./routes/LoginLog')
let permissionRouter = require('./routes/permission')
let wepayRouter = require("./routes/wepay")
let cartRouter = require("./routes/cart")
let productRouter = require("./routes/product")
let productCategoryRouter = require("./routes/product_category")
let orderRouter = require("./routes/order")
var app = express();//通过express创建一个服务器
var session = require('express-session');
//引入验证用户信息拦截器(权限拦截)
var authorization = require("./utils/authMiddleware.js")
// view engine setup
app.set('views', path.join(__dirname, 'views'));//设置模板的默认文件夹为当前目录下的views文件夹
app.set('view engine', 'ejs');//设置模板引擎为ejs

app.use(logger('dev')); //app.use使用中间件 中间件的本质就是一个函数 就是一个处理过程
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //静态资源托管
app.use(express.static(path.join(__dirname, 'webServer')))
//静态资源托管上传的文件
app.use(express.static(path.join(__dirname, 'assets')))
//定义一个拦截器 用于校验用户访问的时候是否携带token 并且 校验token是否正确

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "authorization,Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
//session模块
app.use(session({
    secret: 'MY_NAME_IS_HMM', //加密的字符串，里面内容可以随便写
    resave: true,//强制保存session,即使它没变化
    saveUninitialized: false, //强制将未初始化的session存储，默认为true
    cookie: { maxAge: 1000 * 60 * 3 },//过期时间
    rolling: true //每次滚动更新
}));


app.use(authorization); //使用路由:就是服务器在匹配到不同的path路径的时候 给前端响应不同的资源
app.use("/permission", permissionRouter)//权限路由
app.use('/custom', customRouter)
app.use("/students", studentsRouter)
app.use('/users', usersRouter);
app.use('/getloginlog', loginLogRouter)
app.use("/pay", wepayRouter)
app.use("/cart", cartRouter)
app.use("/product", productRouter)
app.use("/category", productCategoryRouter)
app.use("/order", orderRouter)
module.exports = app;
