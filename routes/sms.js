//1.引入express
let express = require("express");

//引入手机登入的sdk
const smsClient = require("../controller/smsController")

//2.调用express下面的方法 Router()创建一个路由

let router = express.Router()

router.post("/send", function (req, res) {
    let { phoneNumber } = req.body;
    if (!phoneNumber) {
        res.send({ state: false, status: 3004, message: "请输入手机号" })
        return
    }
    let num = '0123456789';
    let code = ""
    for (var i = 0; i < 5; i++) {
        let random = Math.floor(Math.random() * 10);
        code += num[random]
    }
    //短信选项
    let options = {
        signName: "千锋摸鱼欧阳锋管理系统",
        templateCode: "SMS_239326920",
        phoneNumbers: phoneNumber,
        code
    }
    // console.log(code)
    smsClient.default.send(req, res, options)
})

module.exports = router