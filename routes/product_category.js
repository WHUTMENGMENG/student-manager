const express = require("express")

const router = express.Router()
const { getProductCategorys, addProductCategorys, delProductCategorys, updateProductCategorys } = require("../controller/product_categoryController")
const uploads = require("../middleware/multer")
router.post("/addCategory", uploads("imgageUrl", "productPic"), addProductCategorys)
router.get("/delCategory", delProductCategorys)
router.post("/updateCategory", updateProductCategorys)
router.get("/getCategory", getProductCategorys)


module.exports = router;