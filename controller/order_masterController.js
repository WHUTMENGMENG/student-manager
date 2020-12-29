let derived = require("../utils/derivedIdFromMoment");

let { find_order_masters, save_order_masters, del_order_masters, update_order_masters } = require("../model/order_master");

let { find_order_details, del_order_details, save_order_details, update_order_details } = require("../model/order_detail");

let { find_products } = require("../model/product")

/**
 * 
 * @param {Object} req 客户端请求对象
 * @param {*} res 响应对象
 * @param {function} next 释放控制权
 * @param {Array} checkedCarts 被选中的商品
 */
const createOrder = async function (req, res, next, checkedCarts) {
    let { phone, address } = req.body;
    if (!phone || !address) {
        res.send({ status: 10010, state: false, msg: "err 请传入收货地址或者收货电话" })
        return
    }
    //创建订单
    //1.通过购物车中商品id查询商品库存
    //1.1获取被选中购物车中的商品的数量和id,数组形式
    let checkedCartsProductIds = checkedCarts.map(checkedCart => {
        return checkedCart.product_id
    })
    //1.2然后通过product_id将产品先查找出来,用quantity对比库存是否充足,虽然添加的时候做了判断,但是有时添加到购物车的时候库存充足,购买的时候库存不足

    let productTargets = await find_products({ product_id: { $in: checkedCartsProductIds } })
    console.log("=================", productTargets);
    //1.3 通过购物车中的数量和查找出来的数据库存做对比,看库存是否充足
    //首先要保证查找结果是正确的
    let isInventoryEnoughProducts = [];//库存充足的购物车商品将储存在这个数组
    if (Array.isArray(productTargets)) {
        if (productTargets.length > 0) {//数据库存在该商品
            for (var i = 0; i < checkedCarts.length; i++) {//循环购物车,查找出产品进行对比
                let cartItem = checkedCarts[i];
                let target = productTargets.find(item => cartItem.product_id == item.product_id)
                if (cartItem.quantity > target.inventory) {
                    res.send({ status: 10010, state: false, msg: `${cat.productNme}库存不足` })
                    break //跳出循环
                } else {
                    isInventoryEnoughProducts.push(cartItem)
                }
                // let isInventoryEnough
            }
        } else {//如果查找不到该商品
            res.send(res.send({ status: 10020, state: false, msg: "err" + cat.productNme + "商品已下架或者不存在" }))
            return
        }
    } else {//查找出错
        res.send({ status: 500, state: false, msg: "数据库查找出错" })
        return
    }

    //1.4创建订单号 
    let { unid, nickname } = req.session.userInfo;
    let order_id = derived() + unid;
    //4.通过商品价格计算出订单总价
    let total_fee = isInventoryEnoughProducts.reduce((total, current) => {
        return total += current.price * current.quantity
    }, 0)


    let orderMasterParam = {//储存到数据库的模型
        order_id,//订单id
        unid,//用户id
        //订单状态
        order_status: 1,// 0未提交 1提交成功 2已经取消 3无效订单 4退货
        //配送状态
        shiping_status: 0,//配送状态 0未发货 1已发货 2已收货 3备货中
        //支付状态
        pay_status: 0,//0未支付 1已支付
        user_nickname: nickname,//买家名称
        user_phone: phone,//买家电话
        address: address,//买家地址
        create_time: derived("YYYY-MM-DD,hh:mm:ss"),//创建时间
        total_fee//总价格 单位(分)
    }

    let saveOrderRet = await save_order_masters(orderMasterParam)//保存订单到主表
    let orderDetails = isInventoryEnoughProducts.map(item => (
        {
            order_id,//关联的订单id
            product_id: item.product_id,//商品id
            productName: item.productName,//商品名称
            price: item.price,//商品单价
            quantity: item.quantity,//商品数量
            imageUrl: item.imageUrl,//商品图片
        }
    ))

    let saveOrderDetail = await save_order_details(orderDetails)
    console.log(saveOrderRet);
    console.log(orderDetails);
    res.send({ status: 200, state: true, order_id, msg: "订单提交成功" })
    //5.将商品id存到order_detail中,并且关联order_master主表id
}

module.exports = {
    createOrder
}
