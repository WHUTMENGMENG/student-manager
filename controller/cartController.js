let derivedId = require("../utils/derivedIdFromMoment")
let { find_carts, save_carts, update_carts, del_carts } = require("../model/cart")

const getCarts = (req, res) => {

}
const deleteCarts = (req, res) => {

}
const addCarts = (req, res) => {
    let { product_id } = req.body;//获取传入的商品id
    let unid;;//获取当前用户id
    if (!req.session['userInfo']) {
        res.send({ status: 10022, msg: "未获取到unid请登入" })
        return
    }
    unid = req.session.userInfo.unid;
    //生成购物车id 时间戳 
    let cart_id = derivedId();
    console.log(cart_id)
    //定义传递购物车数据的参数模型
    let paramSchma = {
        cart_id
    }
    //通过product
    res.send("111")
}
const updateCarts = (req, res) => {

}

const checkCarts = (req, res) => {

}
module.exports = {
    getCarts,
    deleteCarts,
    addCarts,
    updateCarts,
    checkCarts
}