//1.引入express
let express = require("express");

//2.调用express下面的方法 Router()创建一个路由

let router = express.Router()

let cartCtr = require("../controller/cartController")


//获取购物车数据
router.get("/get_cart", cartCtr.getCarts)
//选中购物车数据
router.post("/check", cartCtr.checkCarts)
//删除购物车数据
router.get("/del_product", cartCtr.deleteCarts)
//更新购物车数据
router.post("/update_cart", cartCtr.updateCarts)
//添加数据进入购物车
router.post("/add_to_cart", cartCtr.addCarts)

module.exports = router