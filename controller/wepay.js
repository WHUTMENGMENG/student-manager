const crypto = require('crypto') //md5算法
const https = require('https');
const url = require("url")
//引入创建订单的方法
const { createOrder } = require("../controller/order_masterController");
const { find_order_masters, update_order_masters } = require("../model/order_master")
const { find_order_details } = require("../model/order_detail")
//引入xml转换的方法
const xml2json = require("../utils/xml2json")
//获取登入ip
function getIp(req) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // ip = ip.substr(7)
    let regExp = /([^0-9])*((\.|\d)*)/
    let r = regExp.exec(ip)
    ip = r[2]
    ip =
        ip == 1 ? "127.0.0.1" : ip

    return ip
}
//生成随机字符串
/**
 * 
 * @param {number} len 生成的字符串长度
 */
function randomStr(len) {
    let str = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let strArr = [];

    for (var i = 0; i < len; i++) {
        strArr.push(str[Math.floor(Math.random() * str.length)])
    }
    return strArr.join("")
}

//将json转换成xml
function json2xml(data) {
    let tempObj = { ...data };//浅拷贝一份
    let jsonXML = "";
    jsonXML += `<xml>`
    Object.keys(tempObj).forEach(key => {
        if (tempObj[key]) {
            jsonXML += `
        <${key}>${tempObj[key]}</${key}>
    `
        }
    })
    jsonXML += '</xml>'
    return jsonXML
}

//封装node请求方法 request模块

function request(urlStr, method = "POST", data, callback = function () { }) {
    let urlData = url.parse(urlStr)
    let options = {
        hostname: urlData.host,
        // port: urlData['port'] || 80,
        path: urlData.path,
        method
    }
    // console.log(options)

    const req = https.request(options, function (res) {
        let body = "";
        res.setEncoding('utf-8');
        res.on('data', function (chunk) {
            body += chunk
        })
        res.on('end', function () {
            callback(body)
        })
    })
    req.on('error', function (e) {
        console.log(e)
    })
    req.write(data)
    req.end()
}
let last_order_id;
const payment = async function (req, res) {
    //发起支付请求
    //传递参数
    //1.公众账号ID	appid	是
    //2.商户号	mch_id	是	String(32)	1230000109	微信支付分配的商户号
    //3.随机字符串	nonce_str	是	String(32)	5K8264ILTKCH16CQ2502SI8ZNMTM67VS
    //4.签名	sign	是 String(32)
    //5.商品描述	body	是	String(128)	腾讯充值中心-QQ会员充值
    //6.商户订单号	out_trade_no	是	String(32)	20150806125346
    //7.标价金额	total_fee	是	Int	88
    //8.终端IP	spbill_create_ip	是	String(64)	123.12.12.123
    //9.通知地址	notify_url	是	String(256)	http://www.weixin.qq.com/wxpay/pay.php	异步接收微信支付结果通知的回调地址，通知url必须为外网可访问的url，不能携带参数。
    //10.交易类型	trade_type	是	String(16)	JSAPI
    let { key = 'QF1234567890qwertyuiopasdfghjklz', mch_id = '1568650321', appid = 'wxed58e834201d0894', trade_type = "NATIVE", order_id } = req.body;

    if (!order_id) {
        res.send({ state: false, status: 10010, msg: "err 请传入order_id" })
        return
    }
    //通过订单号查询获取订单价格
    let orderInfo = await find_order_masters({ order_id });
    //判断订单是否能够支付
    if (orderInfo.length == 0) {
        res.send({ state: false, status: 1003, msg: "err 订单不存在" })
        return
    } else if (orderInfo[0].order_status === 4) {
        res.send({ state: false, status: 1004, msg: "err 订单已经关闭" })
        return
    } else if (orderInfo[0].order_status === 2) {
        res.send({ state: false, status: 1002, msg: "err 订单已取消" })
        return
    } else if (orderInfo[0].order_status === 3) {
        res.send({ state: false, status: 1004, msg: "err 无效订单" })
        return
    } else if (orderInfo[0].pay_status === 1) {
        res.send({ state: false, status: 1001, msg: "err 订单已经支付" })
        return
    }
    if (last_order_id && last_order_id == order_id) {//避免重复提交订单
        res.send({ state: false, status: 1004, msg: "err 请不要重复提交相同订单" })
        return
    }
    try {
        //发起支付的时候避免支付延迟 先将订单时间延长 避免再最后一秒支付的时候订单关闭了
        let targetOrder = global.LLTqueue.find(item => item.order_id == order_id);
        console.log(targetOrder.timer);
        clearTimeout(targetOrder.timer)//清除上一个定时器,重新设置定时器倒计时;
        targetOrder.rollBack(1000 * 60 * 2)
        // console.log(orderInfo);
    } catch (e) { }
    let total_fee = (orderInfo[0].total_fee) * 100;//微信规定用分,前端用元,所以此处乘以100
    console.log(total_fee);
    //再获取订单商品详情取得商品名字
    let orderDetail = await find_order_details({ order_id });
    let productNames = orderDetail.map(item => item.productName)
    let body = productNames.join(",")//生成支付商品描述
    // console.log(total_fee, body);
    if (trade_type === "NATIVE") {//如果是PC NATIVE扫码方式
        let data = {
            appid,
            mch_id,
            nonce_str: "test",
            body,
            out_trade_no: order_id,
            total_fee,
            spbill_create_ip: getIp(req),
            notify_url: "http://chst.vip/pay/payResult",
            trade_type,
        }
        //5.生成长度为32的随机字符串
        let nonce_str = randomStr(32)
        // console.log(nonce_str.length)
        //赋值给data
        data['nonce_str'] = nonce_str
        //1.将对象中的key进行字典排序
        let keys = Object.keys(data).sort()
        //2.转成query-string的形式
        let string = '';
        for (var i = 0; i < keys.length; i++) {
            if (data[keys[i]]) {//对非空的属性进行拼接
                string += keys[i] + "=" + data[keys[i]] + "&"
            }
        }
        //3.和key(微信商户提供的key)进行拼接
        stringTemp = string + 'key=' + key;
        console.log(stringTemp)
        //4.对字符串进行MD5运算
        let md5 = crypto.createHash('md5')
        //生成签名
        let sign;//签名
        sign = md5.update(stringTemp).digest('hex').toUpperCase();


        //赋值给data
        data['sign'] = sign;


        //2.调用统一下单接口 
        let urlStr = 'https://api.mch.weixin.qq.com/pay/unifiedorder'

        //将参数转换成xml格式
        let xmlData = json2xml(data)
        console.log(xmlData)
        //发送请求
        request(urlStr, 'POST', xmlData, function (result) {
            ret = xml2json(result)
            console.log("====", ret)
            if (ret.result_code === 'SUCCESS') {
                last_order_id = order_id;
                res.send({ status: 200, state: true, msg: "OK", prepay_id: ret.prepay_id, trade_type: ret.trade_type, code_url: ret.code_url })
            } else {
                res.send({ ...ret })
            }
        })

    }

}


const preOrder = async (req, res, next) => {
    if (!req.session.userInfo) {
        res.send({ state: false, msg: "err请登入" })
        return
    }
    let { checkedCarts } = req.session;//获取被选中的商品
    //获取被选中的商品
    if (Array.isArray(checkedCarts) && checkedCarts.length > 0) {
        // let { unid, product_id } = target
        console.log(checkedCarts)
        //创建订单
        createOrder(req, res, next, checkedCarts)
    } else {
        res.send({ status: 10010, state: false, msg: "未选中商品" })
        return
    }
}

const payResult = function (req, res) {
    let xmlRes = "";
    let wepayResult;
    req.on('data', function (chunk) {//接收xml
        xmlRes += chunk
    })
    req.on('end', async function () {
        //         { appid: 'wxed58e834201d0894',
        //   bank_type: 'OTHERS',
        //   cash_fee: '1',
        //   fee_type: 'CNY',
        //   is_subscribe: 'Y',
        //   mch_id: '1568650321',商户号
        //   nonce_str: 't9uz5howdy7xal2an1sog7wim3jcrair',
        //   openid: 'oMSdy5ho1ZdjOycWHAPmYU8cdGho',
        //   out_trade_no: '20201231103338122jnvk4na61h',订单号
        //   result_code: 'SUCCESS',
        //   return_code: 'SUCCESS',
        //   sign: '02186A9458A3C9F06FCFF64B2B0A8731',
        //   time_end: '20201231103454',
        //   total_fee: '1',
        //   trade_type: 'NATIVE',
        //   transaction_id: '4200000835202012310782173102' }
        if (xmlRes) {//接收了xml
            wepayResult = xml2json(xmlRes);//将xml转换为json
        }
        console.log(wepayResult);
        if (wepayResult.result_code == 'SUCCESS') {
            //支付成功 使用socket.io通知客户端
            let { total_fee, trade_type, out_trade_no, cash_fee, bank_type, fee_type } = wepayResult;
            let finalPayRes = { state: true, result: "支付成功", total_fee: total_fee / 100, trade_type, out_trade_no, cash_fee, bank_type, fee_type }
            global.finalPayRes = finalPayRes;
            try {
                let query = {
                    order_id: out_trade_no
                }
                let updated = {
                    $set: {
                        pay_status: 1
                    }
                }
                //更新订单支付状态 将订单状态修改为已支付
                await update_order_masters(query, updated)
                //从llt订单倒计时队列中移除该队列
                let targetQue = global.LLTqueue.find(item => item.order_id == out_trade_no);
                //清除定时器
                clearTimeout(targetQue.timer)
                //移除该队列
                global.LLTqueue = global.LLTqueue.filter(item => item.order_id !== out_trade_no);
            } catch (e) { }
            if (global.sock) {
                //socket通知客户端支付成功
                global.sock.emit("wepaySuccess", finalPayRes)
            }
        } else {//支付失败
            if (global.sock) {
                global.sock.emit("wepayFail", { ...wepayResult })
            }
        }
    })
    res.send({ code: "SUCCESS", message: "支付成功" })
}

module.exports = {
    payment,
    preOrder,
    payResult
}