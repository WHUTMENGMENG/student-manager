
const express = require("express");

const router = express.Router();

const { register, login, uploadAvatar, updatePassword, getScancodeCtr, getAllUsers, wechatLoginCtr, wechatCallBackCtr } = require("../controller/usersController")

const uploads = require("../middleware/multer")
console.log(uploads)
//注册
module.exports = function (io) {

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

    router.get("getScancode", function (req, res, next) {
        req.sock = sock
        next()
    }, getScancodeCtr)
    return router
}