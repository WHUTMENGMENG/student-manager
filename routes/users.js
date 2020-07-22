
module.exports = function (io) {
    const express = require("express");

    const router = express.Router();

    const { register, login, uploadAvatar, updatePassword, getAllUsers, wechatLoginCtr, wechatCallBackCtr } = require("../controller/usersController")

    const uploads = require("../middleware/multer")
    console.log(uploads)
    //注册
    router.post("/register", register)

    //登入
    router.post("/login", login)

    //上传头像

    router.post("/uploadAvatar", uploads, uploadAvatar)

    //修改密码

    router.post("/updatePassword", updatePassword)


    //获取所有用户
    router.get("/getAllUsers", getAllUsers)

    //微信扫码登入
    let socket1;
    io.on("connection", socket => {
        socket1 = socket
        socket.emit("getMsg", "你成功了")
    })
    router.get("/wechatLogin", function (req, res, next) {
        req.io = socket1
        next()
    }, wechatLoginCtr)
    //微信回调页面参数处理
    router.get("/wechatCallBack", wechatCallBackCtr)

    return router
}