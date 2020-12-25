//1.引入express
let express = require("express");

//2.调用express下面的方法 Router()创建一个路由

let router = express.Router()

const { getProduct, addProduct, updateProduct, delProduct } = require("../controller/productController")


router.get("/get_product", getProduct)
router.post("/add_product", addProduct)
router.get("/del_product", delProduct)
router.post("/update_product", updateProduct)

module.exports = router