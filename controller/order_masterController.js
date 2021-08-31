let derived = require("../utils/derivedIdFromMoment");

let { find_order_masters, save_order_masters, del_order_masters, update_order_masters } = require("../model/order_master");

let { find_order_details, del_order_details, save_order_details, update_order_details } = require("../model/order_detail");

let { find_products, update_products } = require("../model/product")

let { getOrderDetails, deleteOrderDetails } = require("../controller/order_detailConstroller")

let { del_carts } = require("../model/cart")
/**
 * 
 * @param {Object} req 客户端请求对象
 * @param {*} res 响应对象
 * @param {function} next 释放控制权
 * @param {Array} checkedCarts 被选中的商品
 */

let tarskQueue = [];//将定时回滚的定时器都存到这个数组

const createOrder = async function (req, res, next, checkedCarts) {
    let { phone, address, product_id, quantity = 1 } = req.body;

    if (checkedCarts && (!phone || !address)) {
        res.send({ status: 10010, state: false, msg: "err 请传入收货地址或者收货电话" })
        return
    }

    if (!product_id && !checkedCarts) {
        res.send({ status: 10010, state: false, msg: "err 请传入商品id" })
        return
    }
    if (quantity && isNaN(quantity)) {
        res.send({ status: 10010, state: false, msg: "err 传递的quantity必须是数字" })
        return
    }
    //创建订单
    //1.通过购物车中商品id查询商品库存
    //1.1获取被选中购物车中的商品的数量和id,数组形式
    let checkedCartsProductIds = checkedCarts ? checkedCarts.map(checkedCart => {
        return checkedCart.product_id
    }) : [product_id]
    //1.2然后通过product_id将产品先查找出来,用quantity对比库存是否充足,虽然添加的时候做了判断,但是有时添加到购物车的时候库存充足,购买的时候库存不足
    console.log(checkedCartsProductIds)
    let productTargets = await find_products({ product_id: { $in: checkedCartsProductIds } })
    if (!productTargets.length) {
        res.send({ state: false, status: 10021, msg: "没有该商品" })
        return
    }
    //再获取订单商品详情取得商品名字
    let vipLevel = productTargets[0].productName.slice(3, 1);
    console.log("-------===", vipLevel)
    vipLevel = !isNaN(vipLevel) ? parseInt(vipLevel) : 0;
    console.log("vip==lv", vipLevel)
    if (req.session.userInfo) {
        let { vipLevel: userLevel } = req.session.userInfo;

        if (parseInt(vipLevel) < parseInt(userLevel)) {
            res.send({ state: false, status: 10004, msg: "不能充值低等级的vip" })
            return
        }
    } else {
        res.send({ state: false, status: 10022, msg: "请登入" })
        return
    }
    // console.log("=================", productTargets);

    //1.3 通过购物车中的数量和查找出来的数据库存做对比,看库存是否充足
    //首先要保证查找结果是正确的
    let isInventoryEnoughProducts = [];//库存充足的购物车商品将储存在这个数组
    if (Array.isArray(productTargets)) {
        if (productTargets.length > 0) {//数据库存在该商品
            if (product_id) {//如果传的是product_id 直接下单的 没有通过购物车
                checkedCarts = [...productTargets];
                checkedCarts[0].quantity = quantity;
            }
            for (var i = 0; i < checkedCarts.length; i++) {//循环购物车,查找出产品进行对比
                let cartItem = checkedCarts[i];
                let target = productTargets.find(item => cartItem.product_id == item.product_id)
                if (cartItem.quantity > target.inventory) {
                    res.send({ status: 10010, state: false, msg: `${cartItem.title}库存不足` })
                    break //跳出循环
                } else {
                    //让库存减少 锁定商品
                    //让商品库存减去相应的数量
                    let lockProducts = checkedCarts.map(async item => {
                        let query = {
                            product_id: item.product_id
                        }
                        let updated = {
                            $inc: {
                                inventory: -item.quantity
                            }

                        }
                        let decrementInventory = await update_products(query, updated)
                        return decrementInventory
                    })
                    let lockProResultAsync = await Promise.all(lockProducts);
                    let lockRet = lockProResultAsync.every(item => item.nModified !== 0);
                    // console.log(lockRet);
                    if (lockRet) {//商品锁定成功
                        isInventoryEnoughProducts.push(cartItem);
                        //删除购物车数据
                        checkedCarts.forEach(item => {
                            del_carts({ cart_id: item.cart_id })
                        })
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
                            order_status: 1,// 0未提交 1提交成功 2已经取消 3无效订单 4.交易关闭 5退货
                            //配送状态
                            shiping_status: 0,//配送状态 0未发货 1已发货 2已收货 3备货中
                            //支付状态
                            pay_status: 0,//0未支付 1已支付
                            user_nickname: nickname,//买家名称
                            user_phone: phone || 520,//买家电话
                            address: address || 520,//买家地址
                            create_time: derived("YYYY-MM-DD,hh:mm:ss"),//创建时间
                            total_fee//总价格 单位(分)
                        }
                        // console.log(orderMasterParam)
                        let saveOrderRet = await save_order_masters(orderMasterParam)//保存订单到主表
                        // console.log(saveOrderRet)
                        if (!saveOrderRet) {
                            res.send({ status: 1004, msg: "保存order主表到数据库出错" })
                            return
                        }
                        // console.log(isInventoryEnoughProducts)
                        let orderDetails = isInventoryEnoughProducts.map(item => (
                            {
                                order_id,//关联的订单id
                                product_id: item.product_id,//商品id
                                productName: item.title || item.productName,//商品名称
                                description: item.description || "",
                                price: item.price,//商品单价
                                quantity: item.quantity,//商品数量
                                imageUrl: item.imageUrl,//商品图片
                            }
                        ))
                        // console.log("--------------", orderDetails);
                        let saveOrderDetail = await save_order_details(orderDetails)
                        if (!saveOrderDetail) {
                            res.send({ status: 1004, msg: "保存order详情到数据库出错" })
                            return
                        }
                        // console.log(saveOrderRet);
                        // console.log(orderDetails);
                        res.send({ status: 200, state: true, order_id, msg: "订单提交成功" })
                        //5.订单锁定30分钟
                        //声明一个llt的类
                        class lltqueue {
                            constructor(order_id) {
                                //默认30秒
                                this.order_id = order_id;

                            }
                            rollBack(delay = 1000 * 30) {
                                this.timer = setTimeout(async () => {
                                    //数据回滚
                                    //通过订单号查找到商品详情
                                    let proDetail = await find_order_details({ order_id: this.order_id })

                                    if (Array.isArray(proDetail)) {
                                        if (proDetail.length > 0) {
                                            let detailInfo = proDetail.map(item => {//映射得到产品id和数量
                                                return {
                                                    product_id: item.product_id,
                                                    quantity: item.quantity
                                                }
                                            })
                                            //通过detailInfo中的product_id进行查询修改
                                            let rollbackInventoryAsync = detailInfo.map(item => {
                                                let query = {
                                                    product_id: item.product_id
                                                }
                                                let updated = {
                                                    $inc: {
                                                        inventory: item.quantity
                                                    }

                                                }
                                                return update_products(query, updated)
                                            })
                                            await Promise.all(rollbackInventoryAsync.map(item => item.then(res => res).catch(err => { console.log(err); return err })))
                                            //回滚完成之后清掉数组中的任务,释放内存
                                            tarskQueue =
                                                tarskQueue.filter(item => item.order_id !== this.order_id);
                                            console.log("数据已回滚,剩下的llt队列数量", tarskQueue.length);
                                            //将订单状态变成已取消
                                            let query = {
                                                order_id: this.order_id
                                            }
                                            let updated = {
                                                $set: { order_status: 4 }
                                            }
                                            update_order_masters(query, updated)
                                        } else {
                                            //不做任何操作
                                            console.log(this.order_id + "商品详情已经被删除");
                                        }
                                    }
                                }, delay)
                            }
                        }
                        let queue = new lltqueue(order_id) //默认30秒回滚
                        queue.rollBack(1000 * 60 * 5)
                        tarskQueue.push(queue)
                        global.LLTqueue = tarskQueue;
                    } else {
                        res.send({ status: 10010, state: false, msg: "商品锁定失败,可能商品已经下架或者不存在" })
                        return
                    }

                }
                // let isInventoryEnough
            }
        } else {//如果查找不到该商品
            res.send(res.send({ status: 10020, state: false, msg: "err" + "商品已下架或者不存在" }))
            return
        }
    } else {//查找出错
        res.send({ status: 500, state: false, msg: "数据库查找出错" })
        return
    }


}

//获取订单
const getOrder = async (req, res) => {
    if (!req.session.userInfo) {
        res.send({ state: false, msg: "请登入" })
        return
    }
    let { unid } = req.session.userInfo;
    let queryParam;
    let { order_id } = req.body;
    if (!order_id) { //获取用户全部订单
        queryParam = {
            unid
        }
        let findRes = await find_order_masters(queryParam)
        if (Array.isArray(findRes) && findRes.length > 0) {
            let order_ids = findRes.map(item => item.order_id);
            let detail = await find_order_details({ order_id: { $in: order_ids } });
            var data = findRes.map(item => {
                return {
                    ...item._doc,
                    orderDetail: detail.filter(d => d.order_id == item.order_id)
                }
            })
            res.send({ status: 200, state: true, msg: "订单获取成功", data })
            return
        } else {
            res.send({ state: false, data: [], msg: "没有数据或者查询出错" })
        }
    } else { //通过订单号查询单个订单
        queryParam = {
            order_id
        }
        let findRes = await find_order_masters(queryParam);
        if (Array.isArray(findRes) && findRes.length > 0) {
            let detail = await find_order_details({ order_id });
            res.send({ status: 200, state: true, msg: "订单获取成功", data: { ...findRes[0]._doc, orderDetail: [...detail] } })
        } else {
            res.send({ state: false, msg: "查询出错或数据不存在" })
        }
    }
}
//删除订单
const deleteOrder = async (req, res) => {
    let { order_id } = req.query;
    if (!order_id) {
        res.send({ state: false, status: 1004, msg: "没有传入order_id" })
        return
    }
    let delRes = await del_order_masters({ order_id });
    //连同订单详情一并删除
    console.log(delRes);
    if (delRes.n) {
        console.log('jinlaile');
        let a = await del_order_details({ order_id })
        console.log(a);
        res.send({ status: 200, state: true, msg: "删除成功" })
    } else {
        res.send({ status: 1004, state: false, msg: "err 该数据不存在" })
    }
}
//查询订单支付状态
const queryOrderStatus = async (req, res) => {
    let { order_id } = req.query;
    if (!order_id) {
        res.send({ status: 1004, state: false, msg: "err 没有传入order_id" })
        return
    }
    let result = await find_order_masters({ order_id })
    if (Array.isArray(result) && result.length > 0) {
        if (result[0].pay_status == 1) {
            res.send({ status: 200, state: true, msg: "支付成功" })
            return
        } else if (result[0].order_status == 2) {
            res.send({ status: 3002, state: false, msg: "订单已取消" })
            return
        } else if (result[0].order_status == 3) {
            res.send({ status: 3003, state: false, msg: "无效订单" })
            return
        } else if (result[0].order_status == 4) {
            res.send({ status: 3004, state: false, msg: "交易关闭" })
            return
        }else {
            res.send({ status: 3005, state: false, msg: "尚未支付" })
        }
    } else {
        res.send({ status: 1004, state: false, msg: "err 该数据不存在" })
        return
    }
}

module.exports = {
    createOrder,
    getOrder,
    deleteOrder,
    queryOrderStatus
}
