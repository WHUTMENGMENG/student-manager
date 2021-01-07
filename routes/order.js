//1.引入express
let express = require("express");

//2.调用express下面的方法 Router()创建一个路由

let router = express.Router()

const { getOrder, deleteOrder } = require("../controller/order_masterController")

// router.get("/confirm_order", confirmOrder)
router.get("/get_order", getOrder)
router.get("/del_order", deleteOrder)

module.exports = router