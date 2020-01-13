const { find, registerModel, loginModel, updated } = require("../model/usersModel")
const perModel = require("../model/permissionModel")
const { addLog, findLog } = require("../model/logModel")
const moment = require("moment")
const jwt = require("jsonwebtoken")
//注册
const register = async (req, res) => {
    //1.接受前端传递过来的参数
    let cTime = moment().format("YYYY/MM/DD HH:mm:ss")
    req.body.cTime = cTime;
    let params = req.body;

    // console.log(cTime)
    // console.log(params)
    //2.先去数据库查询用户名是否存在 如果存在=>提示用户用户名已注册 如果没有=>正常注册流程
    //2.1调用find方法进行查重
    let query = {
        username: req.body.username
    }
    let result = await find(query);
    //只要result的length是0  说明数据库里不存在此用户 可以注册
    if (result.length == 0) {

        //说明可以注册 生成用户id 并且调用model层里面save的方法
        //用户id: abcdef123456 六位字母+六位id
        let letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let code = "1234567890"

        //首先生成6位随机字母
        const randomId = (str, len) => {
            let randomStr = [];
            let letterLen = str.length;
            for (var i = 0; i < len; i++) {
                let random = Math.floor(Math.random() * letterLen);
                randomStr.push(str.charAt(random))
            }
            return randomStr.join("")
        }
        let uId = randomId(letter, 6) + randomId(code, 6)
        params.uId = uId
        params.roleid = req.body['roleid'] || '200' //如果没有穿roleid那么默认是普通员工
        //3.往数据库插入注册的信息
        let regRes = await registerModel(params)
        if (regRes) {
            let info = {
                roleid: params.roleid,
                uId: regRes.uId,
                username: regRes.username,
                nickname: regRes.nickname,
                phone: regRes.phone
            }
            res.send({ status: 1, state: true, msg: "注册成功", userInfo: info })
        } else {
            res.send({ status: 0, state: false, msg: "注册出错" })
        }
    } else {
        res.send({ status: 0, state: false, msg: "用户名已注册" })
    }

}

//登入
const login = async (req, res) => {
    //1.获取前端传入的用户名和密码
    //2.调用loginModel进行数据库校验 如果有返回值=>登入成功 没有=>登入失败
    let params = req.body;
    let result = await loginModel(params)
    if (result.length == 0) {
        //说明数据库没有查找到(用户名或者密码错误)
        res.send({ status: 0, state: false, msg: "用户名或者密码错误" })
    } else {
        var info = {
            uId: result[0].uId,
            username: result[0].username,
            nickname: result[0].nickname,
            phone: result[0].phone,
            avatarUrl: result[0].avatar,
            roleid: result[0].roleid,
            roleName: result[0].roleName
        }
        //保持用户登入
        //1.在用户登入成功的时候 使用jwt生成一串数字签名token 返回给前端
        //1.1调用jsonwebtoken下面的sign方法 进行签名
        let secrect = "YOU_PLAY_BASKETBALL_LIKE_CAIXUKUN" //随机字符串用于加密
        let token = jwt.sign(info, secrect, {
            expiresIn: 60 * 1000
        })//1.payload载荷 2.secrect 加密字符串 3.{expirsIn:秒} 生效时间
        //2.在用户访问服务器的时候 必须携带token 进行校验 如果有效那么正常返回数据 ,无效返回错误信息
        //3.登入成功后记录登入日志
        //查找上次登入的日志
        let lastLoginQuery = {
            username: req.body.username
        }
        //获取上次登入结果
        let findLogResult = await findLog(lastLoginQuery)
        //如果是第一次登入 让lastLogin的值设置空
        let lastLogin;
        if (findLogResult.length !== 0) {
            console.log(11111)
            findLogResult = findLogResult[0]
            lastLogin = {
                loginTime: findLogResult['nowLogin']['loginTime'],
                ip: findLogResult['nowLogin']['ip']
            }
        } else {
            lastLogin = {
                loginTime: "",
                ip: ""
            }
        }
        //获取登入ip
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip = ip.substr(7)
        //创建登入时间
        let loginTime = moment().format("YYYY/MM/DD HH:mm:ss")
        let nowLogin = {
            ip,
            loginTime,
        }
        let log = {
            username: req.body.username,
            lastLogin,
            nowLogin,
        }
        let setLogResult = await addLog(log)
        // console.log(setLogResult)
        //获取权限路径
        let result2 = await perModel.find({ roleid: info.roleid })
        console.log(result2[0])
        let rows = result2[0].rows
        info.rows = rows;
        req.session.userInfo = info;
        res.send({ status: 1, state: true, msg: "登入成功", userInfo: info, token: token })
    }
}

//上传头像
const uploadAvatar = async (req, res) => {
    //req.body里面由于mutler中间件已经添加了一个字段 avatarUrl 所以接下来要把值存到数据库
    console.log(req.body)
    //一个头像需要对应一个用户 可以使用用户id来对应头像
    //实现思路
    //1.用户调用上传头像接口,传递当前用户的id和图片
    let query = { uId: req.body.uId }
    //字段名不要要avatarUrl 不然的话mongoose无法更新
    let update = { $set: { avatar: req.body.avatarUrl } }
    //2.根据用户id作为查询数据库的query依据 ,然后使用update方法来更新当前用户的头像
    let result = await updated(query, update)
    if (result.n) {
        res.send({ status: 1, state: true, msg: "图片上传成功" })
    } else {
        res.send({ status: 0, state: false, msg: "图片上传失败" })
    }
}

//修改密码
const updatePassword = async (req, res) => {
    //1.获取前端输入的账户名和密码
    //2.验证传入的密码是否和数据库的密码一致 yes=>update no=>send error message
    let { username, oldPassword, newPassword } = req.body;

    //查询数据库是否存在此用户
    let query = {
        username: username
    }
    let findUernameResult = await find(query);
    if (findUernameResult.length !== 0) {
        //说明有此用户 继续验证密码
        query.password = oldPassword
        //根据用户传入的旧妈妈查询是否和数据库的密码相匹配
        let matchPasswordResult = await find(query)
        console.log(matchPasswordResult)
        if (matchPasswordResult.length !== 0) { //表示旧密码匹配成功 那么可以继续更改密码
            //说明用户名和密码匹配成功 调用updatePass方法 对数据库的密码进行修改
            let update = {
                password: newPassword
            }
            //调用更新方法 传入用户输入的新密码 更新数据库的密码
            let updatePasswordResult = await updated(query, update)
            if (updatePasswordResult.n) {//数据库更新成功
                res.send({ status: 1, state: true, msg: "密码修改成功" })
            } else {
                res.send({ status: 0, state: false, msg: "密码更新未知错误" })
            }
        } else {//表示旧密码匹配失败
            res.send({ status: 0, state: false, msg: "原始密码输入错误" })
        }

    } else {//查询不到用户名
        res.send({ status: 0, state: false, msg: "不存在此用户" })
    }
}
//获取权限菜单
getMenuList = (req, res) => {

}
module.exports = {
    register,
    login,
    uploadAvatar,
    updatePassword,
    getMenuList
}