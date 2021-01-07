let moment = require('moment') //moment库
/**
 * 
 * @param {string} fromater 格式化的格式字符串
 * @param {string} temp 自定义其它变量拼接
 */
module.exports = function (fromater = "YYYYMMDDHHmmssSSS", temp = "") {
    let id = moment().format(fromater) + temp
    return id
}