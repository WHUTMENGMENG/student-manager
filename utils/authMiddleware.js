const jwt = require("jsonwebtoken")
const authorizition = (req, res, next) => {
    // console.log(req.session.userInfo)
    //如果用户访问的是登入接口 或者是注册接口 就不去拦截
    if (req.path == "/users/login" || req.path == "/students/uploadStuAvatar") {
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
                res.send({ status: 0, state: false, msg: "校验失败" })
            } else {
                if (req.path !== "/verify") {
                    //校验访问的路径是否合法(是否有权限)
                    // console.log(req.session.userInfo, "222222")
                    let isAuth = req.session.userInfo.rows.some(item => item === req.path)
                    if (isAuth) {
                        next()
                    } else {
                        res.send({ status: '403', code: "10026", state: false, msg: "not permitted 没有权限" })
                    }
                } else {
                    res.send({ status: 1, state: true, msg: "校验成功", decode })
                }

            }
        })
    }
}
module.exports = authorizition