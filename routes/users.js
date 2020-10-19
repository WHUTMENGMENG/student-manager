
const express = require("express");

const router = express.Router();
var svgCaptcha = require('svg-captcha');
const { register, login, uploadAvatar, updatePassword, getScancodeCtr, getAllUsers, wechatLoginCtr, wechatCallBackCtr } = require("../controller/usersController")

const uploads = require("../middleware/multer")
console.log(uploads)
//注册
module.exports = function (io) {

    function createCaptcha(req, res) {
        var codeConfig = {
            size: 5,// 验证码长度
            ignoreChars: '0o1i', // 验证码字符中排除 0o1i
            noise: 2, // 干扰线条的数量
            height: 44
        }
        var captcha = svgCaptcha.create(codeConfig);
        req.session.captcha = captcha.text.toLowerCase(); //存session用于验证接口获取文字码
        console.log(req.session.captcha);
        
        var codeData = {
            img: captcha.data
        }
        res.send(codeData);
    }

    //获取验证码
    router.get("/getCaptcha", createCaptcha)

    //刷新验证码
    router.get("/refreshCaptcha", createCaptcha)

    //校验验证码
    router.get("/verifyCaptcha", (req, res) => {
        console.log(req.query.captcha);
        console.log(req.session.captcha);


        if (req.query.captcha == req.session.captcha) {
            res.send({ state: true, status: 200, msg: "验证码正确" })
        } else {
            res.send({ state: false, status: 3004, msg: "验证码错误" })
        }
    })

    router.post("/register", register)

    //登入
    router.post("/login", login)

    //上传头像

    router.post("/uploadAvatar", uploads, uploadAvatar)

    //修改密码

    router.post("/updatePassword", updatePassword)


    //获取所有用户
    router.get("/getAllUsers", getAllUsers)

    //微信扫码登入 采用socketio
    let sock;
    io.on("connection", socket => {
        sock = socket
    })
    router.get("/wechatLogin", function (req, res, next) {
        req.sock = sock
        next()
    }, wechatLoginCtr)
    //微信回调页面参数处理
    router.get("/wechatCallBack", function (req, res, next) {
        req.sock = sock
        next()
    }, wechatCallBackCtr)

    router.get("/getScancode", function (req, res, next) {
        req.sock = sock
        next()
    }, getScancodeCtr)
    return router
}