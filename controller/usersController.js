const { find, registerModel, loginModel, updated } = require("../model/usersModel")
const perModel = require("../model/permissionModel")
const isParent = require("../utils/isParent")
const { addLog, findLog } = require("../model/logModel")
const moment = require("moment")
const jwt = require("jsonwebtoken")
const https = require("https")
const { Query } = require("mongoose")
/**
 * @api usrname 没雨溪 更新:2023/5/24
 */
let roleModel = require("../model/roleModel")
let pathModel = require("../model/permissionPathModel")
let permissionModel = require('../model/permission_New')
const { type } = require("os")
// ✂️✂️✂️✂️✂️✂️✂️✂️✂️✂️✂️华丽的分割线✂️✂️✂️✂️✂️✂️✂️✂️✂️✂️✂️✂️

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
        //说明可以注册 生成用户unid 并且调用model层里面save的方法
        let unid = Math.random().toString(16).substring(2) + Date.now();
        params.unid = unid
        // params.roleid = req.body['roleid'] //如果没有传roleid那么默认是普通员工
        // if (req.session.userInfo.roleid > "101") {
        //     res.send({ state: false, status: 10066, msg: "没有指定角色的权限" })
        //     return
        // }
        //3.往数据库插入注册的信息

        let newParams = {
            roleid: '4', //默认普通用户
            create_at: new Date().toLocaleString(),
            unid: Math.random().toString(16).substring(2) + Date.now(),
            update_at: "",
            status: "1",
            username: params.username,
            password: params.password,
            sex: params.sex || 1,
            phone: params.phone,
            email: params.email,
            nickname: params.nickname || '匿名用户',
            city: params.city || '未知',
            country: params.country || '中华人民共和国',
            province: params.province || '未知',
        }

        //等待注册结果
        let regRes = await registerModel(newParams)
        if (typeof regRes == "object") {
            let info = {
                unid: regRes.unid,
                username: regRes.username,
                nickname: regRes.nickname,
                phone: regRes.phone,
            }

            res.send({ status: 1, state: true, msg: "注册成功", userInfo: info })
        } else {
            res.send({ status: 0, state: false, msg: "注册出错:" + regRes })
        }
    } else {
        res.send({ status: 0, state: false, msg: "用户名已注册" })
    }

}
//更新用户信息
const updateUser = async (req, res) => {
    //当前角色的id
    let currentRoleid = req.session.userInfo.roleid;
    let { unid, roleid, vipLevel, username, vipStamp, vipExpires, password } = req.body;
    if (roleid) {
        res.send({ state: false, status: 3004, msg: "没有权限修改用户角色" });
        return
    }
    if (!unid) {
        res.send({ state: false, status: 3004, msg: "请传入用户unid" });
        return
    }
    if (username == "admin" && password) {
        res.send({ state: false, status: 10066, msg: "not permitted 你没有权限修改admin密码" })
        return
    }



    if (req.body.phone) {//如果传递了手机号进行绑定
        let findRes = await find({ phone: req.body.phone });
        if (findRes.length) {
            res.send({ state: false, status: 10066, msg: "手机号已经被绑定" })
            return
        }
    }

    //根据要修改的unid或者unsername查找角色的id
    let query
    if (unid) {
        query = { unid };
    } else if (username) {
        query = { username };
    }
    //数据库查找
    let target = await find(query);

    if (target.length) {
        let targetRoleid = target[0].roleid;
        //检查要修改的用户角色是否是自己的上级角色

        //获取完整角色表

        let roleList = await roleModel.find({ queryParams: {} });

        //检查targetRoleid是否是自己的上级角色

        let isParentRole = isParent(currentRoleid, targetRoleid, roleList);

        if (isParentRole && currentRoleid != "1") {
            res.send({ state: false, status: 10066, msg: "没有权限修改自己的上级用户" })
            return
        }

    } else {
        res.send({ state: false, status: 10066, msg: "修改用户不存在" })
    }

    //添加更新时间 2023/05/25 周四
    req.body.update_at = new Date().toLocaleString()
    req.body.roleid && delete req.body.roleid
    req.body.roleName && delete req.body.roleName
    let result = await updated(query, { $set: req.body });
    if (typeof result !== "string") {
        res.send({ state: true, status: 200, msg: '更新成功' })
    } else {
        res.send({ state: false, status: 10077, msg: '更新出错,' + result })
    }
}

//登入
const login = async (req, res) => {

    // ✂️✂️✂️✂️✂️✂️✂️✂️✂️✂️✂️新增手机登入,通过传递的type类型来判断是否手机登入✂️✂️✂️✂️✂️✂️✂️✂️✂️✂️✂️✂️
    // console.log(req.session);
    if (req.query.type === "sms") {
        let { smsCode } = req.session;
        if (!smsCode) {
            res.send({ state: false, status: 10027, msg: "先点击发送验证码" })
            return
        }
        //获取用户传入的校验验证码
        let { code } = req.body;
        if (!code || code.length < 5) {
            res.send({ state: false, status: 10025, msg: "请传入5位验证码" })
            return
        } else {
            //校验session中验证码是否正确
            if (req.session.smsCode !== code) {
                res.send({ state: false, status: 10026, msg: "验证码不正确" })
                return
            } else {
                //验证码校验通过
                //获取用户手机号,到数据库中查找
                let { phone } = req.session;

                verifyUser({ phone }, '这个手机号没有注册')
            }
        }
    } else {

        //1.获取前端传入的用户名和密码
        //2.调用loginModel进行数据库校验 如果有返回值=>登入成功 没有=>登入失败
        let params = req.body;
        if (!params.username || !params.password) {
            res.send({ status: 1004, state: false, msg: "没有传递用户名或者密码" })
            return
        }

        verifyUser(params, "用户名或者密码错误")
    }

    let username;
    //复用的逻辑

    async function verifyUser(params, msg) {
        let result = await loginModel(params)
        if (result.length == 0) {
            //说明数据库没有查找到(用户名或者密码错误)
            res.send({ status: 0, state: false, msg })
            return
        } else {
            var info = { ...result[0]._doc }
            // console.log('---info',info)

            //判断用户状态,如果status是0,说明用户被禁用了

            if (info.status === '0') {
                res.send({ state: false, status: 1007, msg: "用户被禁用,请联系管理员" })
                return
            }

            let { vipStamp, unid, roleid = "4" } = info;

            //处理vip过期的逻辑,暂时先不要 2034/05/24 星期三 11:46

            // let currentTime = +new Date()
            // if (currentTime - vipStamp >= 0 && roleid != "4") {
            //     //过期 vip等级降为0

            //     info.roleid = "4"
            //     info.vipLevel = 0;
            // }



            //保持用户登入
            //1.在用户登入成功的时候 使用jwt生成一串数字签名token 返回给前端
            //1.1调用jsonwebtoken下面的sign方法 进行签名
            let secrect = "YOU_PLAY_BASKETBALL_LIKE_CAIXUKUN" //随机字符串用于加密
            let token = jwt.sign(info, secrect, {
                expiresIn: 60 * 60 * 10
            }) //1.payload载荷 2.secrect 加密字符串 3.{expirsIn:秒} 生效时间
            //2.在用户访问服务器的时候 必须携带token 进行校验 如果有效那么正常返回数据 ,无效返回错误信息
            // console.log(setLogResult)

            //兼容老版本写法 老版本的普通用户roleid是200 2023/05/23 11:46

            if (roleid == "200") {
                roleid = "4"
                info.roleid = "4"
            } else if (roleid == "101") {
                roleid = "2"
                info.roleid = "2"
            }

            //获取角色信息
            let result2 = await roleModel.find({ queryParams: { roleid } })

            //获取角色权限表中的的权限信息
            let data = await permissionModel.find({ queryParams: { roleid } })
            //根据角色权限表中的权限id进行到path表中连表查询
            //根据获取数据的permission_id进行到path表中连表查询
            let pathList = await pathModel.find({ id: { $in: data.map(item => item.permission_id) } })

            req.session.pathList = pathList;

            //遗留代码,先兼容老版本写法
            let buttons = ['read', 'delete', 'edit', 'add']
            // info.rows = rows
            req.session.userInfo = info;
            console.log(result2)
            if (result2.length == 0) {
                //说明角色可能被删除了,默认走普通用户的角色
                info.roleid = "5"
                info.roleName = "普通用户"
                updated({ unid }, {$set:{ roleid: "5" }})
            } else {
                info.roleName = result2[0].roleName
            }

            let newInfo = { ...info }

            // delete newInfo.rows
            delete newInfo.password

            //根据角色id访问角色的路由权限
            let permissionPath = await pathModel.find({ queryParams: { roleid } })


            res.send({ status: 1, state: true, msg: "登入成功", userInfo: newInfo, permission: { buttons }, token: token })


            //3.登入成功后记录登入日志
            //查找上次登入的日志
            let lastLoginQuery = {
                username: newInfo.username
            }
            //获取上次登入结果
            let findLogResult = await findLog(lastLoginQuery)
            //如果是第一次登入 让lastLogin的值设置空
            let lastLogin;
            if (findLogResult.length !== 0) {
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
            // ip = ip.substr(7)
            let regExp = /([^0-9])*((\.|\d)*)/
            let r = regExp.exec(ip)
            ip = r[2]
            // console.log(ip)
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
            let setLogResult = addLog(log)
        }
    }



}

//上传头像
const uploadAvatar = async (req, res) => {
    //req.body里面由于mutler中间件已经添加了一个字段 avatarUrl 所以接下来要把值存到数据库
    //一个头像需要对应一个用户 可以使用用户id来对应头像
    if (!req.body.headimgurl) {
        res.send({ status: 0, state: false, msg: "图片上传失败" })
        return
    }
    //实现思路
    //1.用户调用上传头像接口,传递当前用户的id和图片
    let query = { unid: req.body.unid }
    //字段名不要要avatarUrl 不然的话mongoose无法更新
    let update = { $set: { headimgurl: req.body.headimgurl } }
    //2.根据用户id作为查询数据库的query依据 ,然后使用update方法来更新当前用户的头像
    let result = await updated(query, update)
    // console.log(result)
    if (result.n) {
        res.send({ status: 1, state: true, msg: "图片上传成功", imgurl: req.body.headimgurl })
    } else {
        res.send({ status: 0, state: false, msg: "图片上传失败" })
    }
}

//修改密码
const updatePassword = async (req, res) => {
    //1.获取前端输入的账户名和密码
    //2.验证传入的密码是否和数据库的密码一致 yes=>update no=>send error msg
    let { username, oldPassword, newPassword } = req.body;

    //查询数据库是否存在此用户
    let query = {
        username: username
    }
    let findUernameResult = await find(query);
    if (findUernameResult.length !== 0) {
        //说明有此用户 继续验证密码
        query.password = oldPassword
        //根据用户传入的旧密码查询是否和数据库的密码相匹配
        let matchPasswordResult = await find(query)
        if (matchPasswordResult.length !== 0) { //表示旧密码匹配成功 那么可以继续更改密码
            //说明用户名和密码匹配成功 调用updatePass方法 对数据库的密码进行修改
            let update = {
                password: newPassword
            }
            //调用更新方法 传入用户输入的新密码 更新数据库的密码
            let updatePasswordResult = await updated(query, update)
            if (updatePasswordResult.n) { //数据库更新成功
                res.send({ status: 1, state: true, msg: "密码修改成功" })
            } else {
                res.send({ status: 0, state: false, msg: "密码更新未知错误" })
            }
        } else { //表示旧密码匹配失败
            res.send({ status: 0, state: false, msg: "原始密码输入错误" })
        }

    } else { //查询不到用户名
        res.send({ status: 0, state: false, msg: "不存在此用户" })
    }
}
//获取用户

//参数 page count order_by

var getAllUsers = async (req, res) => {
    let params = {};
    let { unid, page = 1, count = 15, order_by = 1, username = "" } = req.query;
    //通过id进行查找
    if (unid) {
        params = {
            unid
        }
    }
    //通过用户名进行查找
    if (username) {
        params = {
            username
        }
    }

    var result = await find({ ...params, page, count, order_by });

    if (result && Array.isArray(result)) {

        //根据角色id查找角色的名称

        let roleids = result.map(item => item.roleid);

        //开始查找
        let roleNames = await roleModel.find({ queryParams: { roleid: { $in: roleids } } });

        //组织数据
        var users = result.map((item, index) => ({
            roleid: item.roleid,
            unid: item.unid,
            vipLevel: item.vipLevel || 0,
            vipStamp: item.vipStamp || 0,
            username: item.username,
            phone: item.phone,
            nickname: item.nickname,
            headimgurl: item.headimgurl,
            roleName: roleNames[index]?.roleName,
            openid: item.openid,
            sex: item.sex,
            city: item.city,
            province: item.province,
            country: item.country,
            status: item.status || '1',
            create_at: item.create_at || null,
            update_at: item.update_at || null,
        }))
        res.send({ status: 200, state: true, msg: "success", total: result.total, data: users })
    } else {
        res.send({ status: 403, state: false, msg: "获取出错" })
    }
}

//定义一个 用于生成微信扫参数对象
class CreateScanCodeParams {
    /**
     * 
     * @param {String} appid 公众号的唯一标识
     * @param {String} redirect_uri 授权后重定向的回调链接地址， 请使用 urlEncode 对链接进行处理
     * @param {String} response_type 返回类型，请填写code
     * @param {String} scope 应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且， 即使在未关注的情况下，只要用户授权，也能获取其信息 ）
     * @param {String} state 重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节
     */
    constructor(appid = "%", redirect_uri = "%", response_type = "code", scope = "snsapi_base", state = "1730255954") {
        this.appid = appid;
        this.redirect_uri = redirect_uri;
        this.response_type = response_type;
        this.scope = scope;
        this.state = state
    }
}
//创建一个方法 生成url
function createScanCodeUrl({ appid, redirect_uri, response_type, scope, state }) {
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=${response_type}&scope=${scope}&state=${state}#wechat_redirect`
}
//微信扫码登入
let appid = "wxed58e834201d0894";
let redirect_uri = "https://chst.vip/users/wechatCallBack"
let scope = "snsapi_userinfo"
let secret = '1ee83055eae5b5b7d202e4fc7d2ef95f'
let response_type = "code"
let socket;
const wechatLoginCtr = (req, response) => {
    let { wechatCode } = req.query
    if (!wechatCode) {
        response.send({ msg: "请传入wechatCode", state: false })
        return
    }
    // socket = req.sock;
    // socket.emit("getScancode", { status: 200, state: true, msg: "已切换微信登入" })
    //定义一个类 用于生成URL扫码地址
    // https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect  
    // let scanParams = new CreateScanCodeParams(appid, redirect_uri, undefined, scope)
    // let scanCodeUrl = createScanCodeUrl(scanParams)
    // res.send({ state: true, status: 200, scanCodeUrl })
    https.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${wechatCode}&grant_type=authorization_code`, function (res) {
        let datas = [];
        let size = 0;
        res.on('data', data => {
            datas.push(data)
            size += data.length;
        })
        res.on('end', async () => {
            // console.log('响应结束')
            var buff = Buffer.concat(datas, size);
            var result = buff.toString()
            result = JSON.parse(result);
            let { access_token, openid } = result;
            console.log('----openid:-----', openid)
            // console.log(result)
            //请求用户信息之前判断一下数据库是否有用户信息 用openid判断
            if (!openid) { response.send({ "msg": result.errmsg, err: result.toString() }); return }
            let isUser = await find({ openid })
            if (Array.isArray(isUser)) {
                if (isUser.length) {
                    //说明有 不需要存储 直接响应登入成功
                    //处理vip过期
                    var info = { ...isUser[0]._doc }
                    let { vipStamp, unid, roleid } = info;
                    let currentTime = +new Date()
                    if (currentTime - vipStamp >= 0 && roleid != "200") {
                        //过期 vip等级降为0
                        await updated({ unid }, { $set: { vipLevel: 0, roleid: "200" } })
                        info.roleid = "200"
                        info.vipLevel = 0;
                    }
                    delete info.password
                    //socket响应登入成功
                    //生成token
                    let secrect = "YOU_PLAY_BASKETBALL_LIKE_CAIXUKUN" //随机字符串用于加密


                    let token = jwt.sign({ ...info }, secrect, {
                        expiresIn: 60 * 30

                    })
                    let result2 = await perModel.find({ roleid: parseInt(info.roleid) })
                    //console.log("")
                    // console.log("==========278", result2)
                    let rows = result2[0].rows
                    let buttons = result2[0].buttons

                    info.rows = rows
                    req.session.userInfo = { ...info, rows }

                    // socket.emit("wechatLoginSuccess", { status: 200, state: true, msg: "微信登入成功", userInfo: info, token })
                    response.send({ status: 200, state: true, msg: "微信登入成功", userInfo: info, permission: { buttons }, token })
                    // response.render("wechatCallBack", { headimgurl: info.headimgurl, nickname: info.nickname })
                    return
                } else {
                    // response.send('success')
                    // 第四步：拉取用户信息(需scope为 snsapi_userinfo)
                    //https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
                    https.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`, function (res) {
                        let datas = [];
                        let size = 0;
                        res.on('data', data => {
                            datas.push(data)
                            size += data.length;
                        })
                        res.on('end', async () => {
                            // console.log('获取微信用户信息响应结束')
                            var buff = Buffer.concat(datas, size);
                            var result = buff.toString()
                            result = JSON.parse(result); //获得了微信用户的信息
                            //存入数据库
                            result.unid = Math.random().toString(32).substr(2)
                            result.username = Math.random().toString(32).substr(2)
                            result.password = Math.random().toString(32).substr(2)
                            result.roleid = 200
                            let registResult = await registerModel({ ...result })
                            // console.log(registResult)
                            if (registResult) {
                                delete registResult.password;
                                //socket响应
                                let secrect = "YOU_PLAY_BASKETBALL_LIKE_CAIXUKUN" //随机字符串用于加密
                                let token = jwt.sign({ ...registResult }, secrect, {
                                    expiresIn: 60 * 1
                                })
                                let info = { ...registResult }
                                console.log("++++++" + info.roleid)
                                let result2 = await perModel.find({ roleid: 200 })
                                // console.log("===========320", result2)

                                let rows = result2[0].rows
                                let buttons = result2[0].buttons
                                info.rows = rows
                                req.session.userInfo = { ...registResult._doc, rows }

                                //console.log(rows)
                                // socket.emit("wechatLoginSuccess", { status: 200, state: true, msg: "登入成功", userInfo: { ...registResult._doc }, token: token })
                                // response.render("wechatCallBack", { nickname: registResult.nickname, headimgurl: registResult.headimgurl })
                                response.send({ status: 200, state: true, msg: "微信登入成功", userInfo: { ...registResult._doc }, permission: { buttons }, token })
                            } else {

                                response.render("wechatCallBack", { state: false, status: 101, msg: "登入出错" })

                            }

                            //response.send({ url: result.headimgurl })
                        })
                    })
                }
            } else {

                response.send({ msg: "查询数据库出错" })
            }
        })
    })
}


// global.io.on("connection", sock => {
//     global.sock = socket
//     socket = sock;
//     socket.emit("connectSuccess", "111111")
// })

let randomState = {};
let qrCodeDelayObj = {};
let scanCodeCount = {};//保存通过state映射sid,相当于存储扫码的次数,1让二维码失效
//获取微信二维码
const getScancodeCtr = (req, res) => {
    //生成随机状态
    let state = Math.random().toString(32).substr(2);
    //获取客户端传来的sid就是socketid
    let { sid = "" } = req.query;
    if (!sid) {
        res.send({ state: false, code: 10022, msg: "没有传递sid" });
        return
    }
    randomState[state] = sid;//通过随机状态和socket的sid建立映射关系;
    // console.log(randomState)
    let socketid = randomState[state];
    if (!global.io) {
        res.send({ state: false, msg: "没有连接socket.io" })
        return
    }
    if (!global.io.sockets.sockets[socketid]) {
        res.send({ state: false, msg: "socket指定sid错误" })
        return
    }
    qrCodeDelayObj[state] = setTimeout(() => {
        scanCodeCount[state] = 1; //10秒 把这个属性设为1 让二维码失效
        //通知客户端
        if (!global.io.sockets.sockets[socketid]) {
            console.log('异常断开socket连接')
            delete randomState[state]//辣鸡回收F
            return
        }

        global.io.sockets.sockets[randomState[state]].emit('invalidCode', { state: false, msg: "无效的二维码", status: 10004 })
        //清除randomState中的映射
        delete randomState[state]
    }, 1000 * 10)
    let scanParams = new CreateScanCodeParams(appid, redirect_uri, undefined, scope, state)
    let scanCodeUrl = createScanCodeUrl(scanParams)
    // console.log(sockets)
    res.send({ state: true, status: 200, scanCodeUrl: scanCodeUrl })
}
//处理微信回调页面控制层
const wechatCallBackCtr = async (req, res) => {
    let { code, state } = req.query; //获取code之后去换access_token]

    if (!state) {
        res.send({ state: false, msg: '没有传递state' })
        return
    }
    if (global.io) {
        // console.log(global.io.sockets)
        //扫码之后
        let socketid = randomState[state];//保存sid的值
        if (!socketid) {
            res.send({ state: false, msg: "无效的二维码", status: 10004 })
            return
        }
        if (global.io.sockets.sockets[socketid]) {
            if (scanCodeCount[state]) {
                console.log('-----------comeing-------------')
                global.io.sockets.sockets[socketid].emit("scancodeSuccess", { status: 200, state: true, msg: "获取完整服务", wechatCode: code });
                //如果已扫码次数中已经存在这个属性,表示已经被扫码了,或者失效了,需要通知客户端,并且让二维码失效
                // global.io.sockets.sockets[socketid].emit('invalidCode', { state: false, msg: "无效的二维码", status: 10004 })//响应客户端1
                delete randomState[state];//删除state映射的socketid
                // clearTimeout(qrCodeDelayObj[state]) //同时清除qrCodeDelay中映射的过期时间计时器
                res.send({ state: false, msg: "二维码已经被扫过了", status: 10004 })//响应微信客户端
                return
            }
            clearTimeout(qrCodeDelayObj[state]) //同时清除qrCodeDelay中映射的过期时间计时器
            scanCodeCount[state] = 1; //已扫的码存到这个对象中
            global.io.sockets.sockets[socketid].emit("scancodeSuccess", { status: 200, state: true, msg: "已扫码", wechatCode: code });
            res.render("wechatCallBack", { nickname: "qf", headimgurl: "/imgs/log.png" })
        } else {
            res.send({ state: false, msg: "socket指定sid错误" })
            return
        }
    } else {
        res.send({ state: false, msg: "没有连接socket.io" })
        return
    }

    // console.log(state)
    // console.log(global.io)

}

module.exports = {
    register,
    login,
    uploadAvatar,
    updatePassword,
    getAllUsers,
    wechatCallBackCtr,
    wechatLoginCtr,
    getScancodeCtr,
    updateUser
}