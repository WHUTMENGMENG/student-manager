const crypto = require('crypto') //md5算法
const https = require('https');
const url = require("url")
//引入创建订单的方法
const { carateOrder, createOrder } = require("../controller/order_masterController")
//获取登入ip
function getIp(req) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // ip = ip.substr(7)
    let regExp = /([^0-9])*((\.|\d)*)/
    let r = regExp.exec(ip)
    ip = r[2]
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
const wepay = function (req, res) {
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
    let { key = 'QF1234567890qwertyuiopasdfghjklz', mch_id = '1568650321', appid = 'wxed58e834201d0894', trade_type = "NATIVE" } = req.body;

    let data = {
        appid,
        mch_id,
        nonce_str: "123123",
        body: "千锋-千锋vip充值,千锋vip充可以获得价值1000000元的数码大礼包和威少24小时全天候答疑",
        out_trade_no: 45394489,
        total_fee: 9999999,
        spbill_create_ip: '192.168.0.1',
        notify_url: "http://chst.vip/pay/wepayResult",
        trade_type: "NATIVE",
        name: ''
    }
    //5.生成长度为32的随机字符串
    let nonce_str = randomStr(32)
    console.log(nonce_str.length)
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
        console.log("====", result)
    })
    res.send(data)
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

module.exports = {
    wepay,
    preOrder
}