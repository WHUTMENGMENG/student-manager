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
    // console.log(req.body)
    //如果用户没有有传入id
    if (!category_id) {
        res.send({ status: 1005, state: false, msg: "请传入category_id" })
        return
    }
    //如果必传参数没有传递
    if (!(productName && price && description && inventory && imageUrl)) {
        res.send({ status: 1005, state: false, msg: "添加失败,检查必传参数是否少传递了" })
        return
    }

    //生成商品id
    let product_id = derivedId()
    let saveRes = await save_products({
        product_id,
        category_id,
        productName,
        description,
        price: Number(price),
        inventory: Number(inventory),
        imageUrl
    })
    if (saveRes) {
        res.send({ status: 200, state: true, msg: "添加成功" })
    } else {
        res.send({ status: 1004, state: false, msg: "添加出错,请检查" })
    }
}
const delProduct = async (req, res) => {
    let { product_id } = req.query;
    if (!product_id) {
        res.send({ status: 1004, state: false, msg: "err 请传入product_id" })
        return
    }
    let delRes = await del_products({ product_id });
    if (delRes.n) {
        res.send({ status: 200, state: true, msg: "删除成功" })
    } else {
        res.send({ status: 1004, state: false, msg: "err 该数据不存在" })
    }
}
const updateProduct = async (req, res) => {
    if (!req.session['userInfo']) {
        res.send("未登入")
        return
    }
    let { username } = req.session.userInfo;
    let { product_id } = req.body;
    if (!product_id) {
        res.send({ status: 1004, state: false, msg: "缺少product_id" })
        return
    }
    let query = {
        product_id
    }

    let updated = {
        ...req.body,
        updator: username,
        updateTime: derivedId("YYYY-MM-DD,hh:mm:ss") //此处不是用于生成id,用于生成时间
    }
    let updateRes = await update_products(query, updated)
    // console.log(updateRes)
    if (updateRes.nModified) {
        res.send({ status: 200, state: true, msg: "修改成功" })
    } else if (updateRes.n === 0) {
        res.send({ status: 1005, state: false, msg: "没有该数据" })
    } else {
        res.send({ status: 1006, state: false, msg: "没有做任何修改" })
    }
}
const getProduct = async (req, res) => {
    let param;
    let { product_id } = req.query;
    if (product_id) {
        param = { product_id }
    } else {
        param = {}
    }
    let findRes = await find_products(param);
    if (Array.isArray(findRes)) {
        res.send({ status: 200, state: true, msg: "获取成功", data: [...findRes] })
    } else {
        res.send({ status: 1004, state: false, msg: "获取数据出错" })
    }
}


module.exports = {
    addProduct,
    getProduct,
    updateProduct,
    delProduct
}