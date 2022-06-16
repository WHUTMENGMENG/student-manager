//1.引入express
let express = require("express");
const { random } = require("mongoose/lib/utils");

//引入手机登入的sdk
const smsClient = require("../controller/smsController")

//2.调用express下面的方法 Router()创建一个路由

let router = express.Router()

function randomCode(){
    let num = '0123456789';
    let code = ""
    for (var i = 0; i < 5; i++) {
        let random = Math.floor(Math.random() * 10);
        code += num[random]
    }
    return code
}

router.post("/send", function (req, res) {
    let { phoneNumber } = req.body;
    if (!phoneNumber) {
        res.send({ state: false, status: 3004, msg: "请输入手机号" })
        return
    }
   
    //短信选项
    let options = {
        signName: "千锋摸鱼欧阳锋管理系统",
        templateCode: "SMS_239326920",
        phoneNumbers: phoneNumber,
        code:randomCode()
    }
    req.options = options;
    // console.log(code)
    smsClient.default.send(req, res, req.options)
})

module.exports = router