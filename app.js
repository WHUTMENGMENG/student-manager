//nodejs模块划分 内置模块 三方模块
var express = require('express');
var path = require('path'); //内置的path模块
var cookieParser = require('cookie-parser');
var logger = require('morgan');//日志模块
var jwt = require("jsonwebtoken")
var indexRouter = require('./routes/index'); //路由
//引入自己定义的路由
let customRouter = require("./routes/custom")
let studentsRouter = require("./routes/students")
let usersRouter = require('./routes/users');
let loginLogRouter = require('./routes/LoginLog')
let permissionRouter = require('./routes/permission')
var app = express();//通过express创建一个服务器
var session = require('express-session');
// view engine setup
app.set('views', path.join(__dirname, 'views'));//设置模板的默认文件夹为当前目录下的views文件夹
app.set('view engine', 'ejs');//设置模板引擎为ejs

app.use(logger('dev')); //app.use使用中间件 中间件的本质就是一个函数 就是一个处理过程
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //静态资源托管
//练习 利用静态服务器 部署自己二阶段的项目
app.use(express.static(path.join(__dirname, 'webServer')))
//静态资源托管上传的文件
app.use(express.static(path.join(__dirname, 'assets')))
//定义一个拦截器 用于校验用户访问的时候是否携带token 并且 校验token是否正确
const authorizition = (req, res, next) => {
    console.log(req.session.userInfo)
    //如果用户访问的是登入接口 或者是注册接口 就不去拦截
    if (req.path == "/users/login"  || req.path == "/students/uploadStuAvatar") {
        next()
    } else {
        if (!req.session.userInfo) {
            res.send({ state: 403, msg: "请登入" })
            return
        }
        //此处要进行token校验了
        //获取前端传递过来的token
        let token = req.query.token || req.body.token || req.headers["authorization"];
        let secrect = "YOU_PLAY_BASKETBALL_LIKE_CAIXUKUN"
        jwt.verify(token, secrect, (err, decode) => {
            if (err) {
                res.send({ status: 0, state: false, msg: "校验失败" })
            } else {
                if (req.path !== "/verify") {
                    //校验访问的路径是否合法(是否有权限)
                    console.log(req.session.userInfo, "222222")
                    let isAuth = req.session.userInfo.rows.some(item => item === req.path)
                    if (isAuth) {
                        next()
                    } else {
                        res.send({ status: 403, state: false, msg: "没有权限" })
                    }
                } else {
                    res.send({ status: 1, state: true, msg: "校验成功", decode })
                }

            }
        })
    }
}
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "authorization,Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
//session模块
app.use(session({
    secret: 'MY_NAME_IS_HMM', //加密的字符串，里面内容可以随便写
    resave: true,//强制保存session,即使它没变化
    saveUninitialized: false, //强制将未初始化的session存储，默认为true
    cookie: { maxAge: 1000 * 60 },//过期时间
    rolling: true
}));


app.use(authorizition); //使用路由:就是服务器在匹配到不同的path路径的时候 给前端响应不同的资源
app.use("/permission", permissionRouter)//权限路由
app.use('/custom', customRouter)
app.use("/students", studentsRouter)
app.use('/users', usersRouter);
app.use('/getloginlog', loginLogRouter)

module.exports = app;
