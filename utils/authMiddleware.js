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
        "/upload/uploadImg"
    ];
    let matchRes = rowPath.some(item => item === req.path)
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
                if (req.path !== "/verify") {
                    //首先校验路径是否合法 不合法返回404
                    let allRoutes = [
                        "/users/wechatCallBack",
                        "/users/wechatLogin",
                        "/getloginlog",
                        "/students/getclasses",
                        "/students/getstulist",
                        "/students/addstu",
                        "/students/delstu",
                        "/students/updatestu",
                        "/students/searchstu",
                        "/students/uploadStuAvatar",
                        "/users/getAllUsers",
                        "/users/register",
                        "/users/login",
                        "/users/sigout",
                        "/users/uploadAvatar",
                        "/verify",
                        "/users/updatePassword",
                        "/permission/addrole",
                        "/permission/getrole",
                        "/permission/getMenuList"
                    ]
                    //校验访问的路径是否合法(是否有权限)
                    let newPath = ["/category/addCategory", "/category/getCategory", "/order/get_order", "/order/pre_order", "/product/add_product","/order/query_order_status", "/product/get_product", "/pay/payment"]
                    let isAccessRoutes = allRoutes.concat(newPath).some(routes => req.path === routes)
                    if (isAccessRoutes) {
                        // console.log(req.session.userInfo, "222222")

                        req.session.userInfo.rows = [...req.session.userInfo.rows, ...newPath]

                        let isAuth = req.session.userInfo.rows.some(item => item === req.path)
                        if (isAuth) {
                            //检查当前的vip是否过期
                            // console.log(req.session.userInfo)
                            let { vipStamp, unid, vipLevel } = req.session.userInfo;
                            let currentStamp = +new Date();

                            if (vipStamp - currentStamp <= 0 && vipLevel > 0) {
                                updated({ unid }, { $set: { vipLevel: 0 } })
                                    .then(() => {
                                        req.session.userInfo.vipLevel = 0;//session的临时数据vip也为0
                                    })
                            }
                            next()
                        } else {
                            res.send({ status: '403', code: "10026", state: false, msg: "not permitted 没有权限" })
                        }
                    } else {
                        res.status(404)
                        res.send({ status: 404, msg: "接口地址错误" })
                    }

                } else {
                    res.send({ status: 1, state: true, msg: "校验成功", decode })
                }

            }
        })
    }
}


module.exports = authorizition