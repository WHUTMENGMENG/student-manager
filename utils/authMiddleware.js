const jwt = require("jsonwebtoken")
const { updated } = require("../model/usersModel")//引入用户模块
const authorizition = (req, res, next) => {
    // console.log(req.session.userInfo)
    //如果用户访问的是登入接口 或者是注册接口 就不去拦截
    let rowPath = [
        "/users/login",
        "/students/uploadStuAvatar",
        "/users/wechatLogin",
        "/users/wechatCallBack",
        "/users/getScancode",
        "/users/getQrcode",
        "/users/getCaptcha",
        "/users/verifyCaptcha",
        "/users/refreshCaptcha",
        "/weather/getWeather",
        "/weather/updateWeather",
        "/pay/wepay",
        "/upload/uploadImg",
        "/pay/payResult",
        "/sms/send",
        "/order/del_order"
    ];
    let matchRes = rowPath.some(item => item === req.path)
    // console.log(rowPath)
    //被忘记最后把条件改回来
    // matchRes || /\/avatar\/.*/.test(req.path) || /\/productPic\/.*/.test(req.path)
    if (matchRes || /\/avatar\/.*/.test(req.path) || /\/productPic\/.*/.test(req.path)) {
        next()
    } else {
        if (!req.session.userInfo) {
            res.send({ status: 403, code: "10022", msg: "请登入" })
            return
        }
        //此处要进行token校验了
        //获取前端传递过来的token
        let token = req.query.token || req.body.token || req.headers["authorization"];
        let secrect = "YOU_PLAY_BASKETBALL_LIKE_CAIXUKUN"
        jwt.verify(token, secrect, (err, decode) => {
            if (err) {
                res.send({ status: 0, code: "1004", state: false, msg: "校验失败" })
            } else {
                //校验访问的路径是否合法(是否有权限)
                //获取用户访问的路径
                let reqPath = req.path;
                //获取角色拥有的权限路径
                let rolePath = req.session.pathList
                // let newPath = 1
                let isAuth = rolePath.some(item => item.path === reqPath)

                if (isAuth || req.session.userInfo.roleid == "1") {
                    //vip对应的内容 暂时注释不要 2023/05/24 周三 11:53:00
                    // if (req.path !== "/students/getstulist") {
                    //     //检查当前的vip是否过期
                    //     // console.log(req.session.userInfo)
                    //     let { vipStamp, unid, vipLevel, roleid } = req.session.userInfo;
                    //     let currentStamp = +new Date();

                    //     if (roleid != "200" && vipStamp - currentStamp <= 0 && vipLevel > 0) {
                    //         updated({ unid }, { $set: { vipLevel: 0, roleid: "200" } })
                    //             .then(() => {
                    //                 req.session.userInfo.vipLevel = 0;//session的临时数据vip也为0
                    //                 req.session.userInfo.roleid = "200"
                    //             })
                    //     }

                    next()
                } else {
                    res.send({ state: false, status: 403, msg: "你没有权限访问,或路径不正确" })
                }

            }
        })

    }
}


module.exports = authorizition