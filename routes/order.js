//1.引入express
let express = require("express");

//2.调用express下面的方法 Router()创建一个路由

let router = express.Router()

const { getOrder, addOrder, updateOrder, delOrder } = require("../controller/OrderController")

router.get("/confirm_order", confirmOrder)
router.post("/find_order", addOrder)
router.get("/del_order", delOrder)
router.post("/update_order", updateOrder)


module.exports = router