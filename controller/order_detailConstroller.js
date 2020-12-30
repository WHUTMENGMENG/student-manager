const { find_order_details, del_order_details } = require("../model/order_detail")
//获取订单详情
const getOrderDetails = async (order_id = 0) => {
    //通过order_id
    let findRes = await find_order_details({ order_id });
    if (Array.isArray(findRes)) {
        //通过关联order_id再找回商品详情内容
        return findRes
    } else {
        //查找出错
        return false
    }
}
//删除订单详情
const deleteOrderDetails = async (order_id = 0) => {
    let delRes = await del_order_details({ order_id });
    if (delRes.n) {
        return { state: true, msg: "删除成功" }
    } else {
        return { state: false, msg: "err 该数据不存在" }
    }
}

module.exports = {
    getOrderDetails,
    deleteOrderDetails
}