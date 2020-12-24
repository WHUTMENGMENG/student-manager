//创建一个新的users集合
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    product_id: { type: String, required },//商品id
    category_id: { type: String, required },//类目id
    productName: { type: String, required: true },//商品名称
    price: { type: String, required: true },//商品单价
    description: { type: String, required: true },//商品描述
    inventory: { type: String, required: true },//商品库存
    imageUrl: { type: String, required: true },//商品图片
    color: { type: String, required: false },//颜色
    size: { type: String, required: false }//尺寸
})

//创建模型(翻译过来的意思就是 创建一个集合)

let Collection = mongoose.model("products", schema)

/**
 * 
 * @param query.product_id  接收一个product_id参数
 */
let find_products = (query = {}) => {
    return Collection.find(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}

//保存订单
/**
 * 
 * @param params.product_id 商品id
 * @param params.category_id 类目id
 * @param params.productName 商品名称
 * @param params.price 商品单价
 * @param params.description 商品描述
 * @param params.inventory 商品库存
 * @param params.imageUrl 商品图片
 */
let save_products = (params) => {
    // 实例化集合
    let coll = new Collection(params)
    return coll.save()
        .then(res => res)
        .catch(err => {
            // console.log(err)
            return err
        })
}
//删
const del_products = (query) => {
    return Collection.deleteOne(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}
//改
const update_products = (query, updated) => {
    return Collection.updateOne(query, updated)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return false
        })
}

module.exports = {
    find_products,
    save_products,
    update_products,
    del_products
}