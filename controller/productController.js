const { find_products, del_products, save_products, update_products } = require("../model/product")
const derivedId = require("../utils/derivedIdFromMoment")
//  product_id: { type: String, required: true },//商品id
//  category_id: { type: String, required: true },//类目id
//  productName: { type: String, required: true },//商品名称
//  price: { type: String, required: true },//商品单价
//  description: { type: String, required: true },//商品描述
//  inventory: { type: String, required: true },//商品库存
//  imageUrl: { type: String, required: true },//商品图片
//  color: { type: String, required: false },//颜色
//  size: { type: String, required: false }//尺寸
const addProduct = async (req, res) => {
    let { category_id, productName, price, description, inventory, imageUrl, color, size } = req.body;

    //如果用户没有有传入id
    if (!category_id) {
        res.send({ status: 1005, state: false, msg: "请传入category_id" })
        return
    }
    //如果必传参数没有传递
    if (!(productName && price && description && inventory && imageUrl)) {
        res.send({ status: 1005, state: false, msg: "添加失败,参数少传了" })
        return
    }

    //生成商品id
    let product_id = derivedId()


    let saveRes = await save_products({
        product_id,
        category_id,
        productName,
        description,
        price,
        inventory,
        imageUrl
    })
    console.log(saveRes)
}
const delProduct = (req, res) => {

}
const updateProduct = (req, res) => { }
const getProduct = (req, res) => { }


module.exports = {
    addProduct,
    getProduct,
    updateProduct,
    delProduct
}