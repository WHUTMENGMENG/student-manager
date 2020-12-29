
let { find_carts, save_carts, update_carts, del_carts } = require("../model/cart")
let { find_products } = require("../model/product")
let derivedUtil = require("../utils/derivedIdFromMoment")
// cart_id: { type: String, required: true },//购物车id
// unid: { type: String, required: true },//用户id
// product_id: { type: String, required: true },//商品id
// create_time: { type: String, required: true },//创建时间
// quantity: { type: Number, required: true, default: 1 },//商品数量
// isChecked: { type: Boolean, required: false, defalut: false }//商品是否被选中
//获取购物车数据
const getCarts = async (req, res) => {
    //通过当前用户id
    if (!req.session['userInfo']) {
        res.send("未登入")
        return
    }
    let { unid, carts } = req.session.userInfo;

    let findRes = await find_carts({ unid });

    //判断在session中有没有,如果有的话直接从session中拿,不然的话从数据库拿
    // if (carts) {
    //     res.send({ status: 200, state: true, msg: "获取成功", data: [...carts] })
    //     return
    // }
    if (Array.isArray(findRes)) {
        //通过id再找回商品内容
        req.session.userInfo.carts = findRes;
        // console.log(req.session.userInfo)
        res.send({ status: 200, state: true, msg: "获取成功", data: [...findRes] })
    } else {
        res.send({ status: 1004, state: false, msg: "获取数据出错" })
    }
}
//删除购物车
const deleteCarts = async (req, res) => {
    let { cart_id } = req.query;
    if (!cart_id) {
        res.send({ status: 1004, state: false, msg: "err 请传入cart_id" })
        return
    }
    let delRes = await del_carts({ cart_id });
    if (delRes.n) {
        res.send({ status: 200, state: true, msg: "删除成功" })
    } else {
        res.send({ status: 1004, state: false, msg: "err 该数据不存在" })
    }
}
//添加购物车
const addCarts = async (req, res) => {
    let { product_id, quantity } = req.body;//获取传入的商品id;
    if (!product_id || !quantity) {
        res.send({ status: 1004, state: false, msg: "缺少product_id或者缺少quantity" })
        return
    }


    let unid;//获取当前用户id
    if (!req.session['userInfo']) {
        res.send({ status: 10022, msg: "未获取到unid请登入" })
        return
    }
    unid = req.session.userInfo.unid;
    //查找当前用户购物车中是否存在该商品
    let isCartExsist = await find_carts({ product_id, unid })
    // console.log(isCartExsist)
    if (Array.isArray(isCartExsist) && isCartExsist.length > 0) {
        res.send({ status: 10010, msg: "购物车已存在该商品" })
        return
    } else if (!isCartExsist) {
        res.send({ status: 1004, msg: "查询购物车出错" })
        return
    }
    //生成购物车id 时间戳 
    let cart_id = derivedUtil();
    //创建时间
    let create_time = derivedUtil("YYYY-MM-DD,hh:mm:ss")

    let prouctDetail = await find_products({ product_id })
    if (Array.isArray(prouctDetail) && prouctDetail.length) {
        prouctDetail = prouctDetail[0]
    } else {
        res.send({ status: 10020, state: false, msg: "err 添加购物车失败 商品已下架或者不存在" })
        return
    }
    //添加的数量大于库存
    if (quantity - 0 > prouctDetail.inventory) {
        res.send({ status: 10010, state: false, msg: "err 商品库存不足" })
        return
    }

    //定义传递购物车数据的参数模型
    let { price, imageUrl, productName: title } = prouctDetail
    let paramSchma = {
        unid,
        cart_id,
        product_id,
        quantity,
        create_time,
        title,
        price,
        imageUrl
    }

    let saveRes = await save_carts(paramSchma)
    if (saveRes) {
        res.send({ status: 200, state: true, msg: "添加成功" })
    } else {
        res.send({ status: 1004, state: false, msg: "添加出错,请检查" })
    }
}
//更新购物车
const updateCarts = async (req, res) => {
    if (!req.session['userInfo']) {
        res.send("未登入")
        return
    }
    let { username } = req.session.userInfo;
    let { cart_id, quantity } = req.body;
    if (!cart_id || !quantity) {
        res.send({ status: 1004, state: false, msg: "缺少cart_id或者缺少quantity" })
        return
    }
    let query = {
        cart_id
    }

    let updated = {
        ...req.body,
        updator: username,
        updateTime: derivedUtil("YYYY-MM-DD,hh:mm:ss") //此处不是用于生成id,用于生成时间
    }
    let updateRes = await update_carts(query, updated)
    // console.log(updateRes)
    if (updateRes.nModified) {
        res.send({ status: 200, state: true, msg: "修改成功" })
    } else if (updateRes.n === 0) {
        res.send({ status: 1005, state: false, msg: "没有该数据" })
    } else {
        res.send({ status: 1006, state: false, msg: "没有做任何修改" })
    }
}

const checkCarts = async (req, res) => {
    if (!req.session.userInfo.carts) {
        res.send({ status: 1004, state: false, msg: "请检查是否登入或者调用获取过购物车数据接口" })
        return
    }
    let carts = req.session.userInfo.carts;
    let { cart_id } = req.body;
    if (!cart_id) {
        res.send({ status: 1004, state: false, msg: "请检查是否传递了cart_id" })
        return
    }
    let cartIdArr = cart_id.indexOf(",") ? cart_id.split(",") : cart_id//接收的是20201229143646085,20201229143646085切割成一个数组
    if (Array.isArray(cartIdArr) && cartIdArr.length > 0) {
        let checkedCart = [];
        cartIdArr.forEach(cartId => {
            let target = carts.find(cart => {
                return cart.cart_id == cartId
            })
            if (target) {
                target.isChecked = true;
                checkedCart.push(target)
            }
        })
        if (checkCarts.length > 0) {
            req.session.checkedCarts = checkedCart;//将选中的购物车数据挂载到session方便后续查询
            res.send({ state: true, status: 200, msg: "选中成功", cart_id })
            return
            // console.log(carts)
        } else {
            res.send({ state: false, status: 10010, msg: "没有选中任何商品,请检查cart_id是否传递错误" })
            return
        }
    } else {
        let target = carts.find(cart => {
            return cart.cart_id == cart_id
        })
        if (target) {
            req.session.checkedCarts = [target]
            res.send({ state: true, status: 200, msg: "选中成功", cart_id })
            return
        } else {
            res.send({ state: false, status: 10010, msg: "没有选中任何商品,请检查cart_id是否传递错误" })
        }
    }

}
module.exports = {
    getCarts,
    deleteCarts,
    addCarts,
    updateCarts,
    checkCarts
}