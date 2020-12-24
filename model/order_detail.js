//创建一个新的users集合
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    order_id: { type: String, required },//关联的订单id
    product_id: { type: String, required },//商品id
    productName: { type: String, required: true },//商品名称
    price: { type: String, required: true },//商品单价
    count: { type: String, required },//商品数量
    imageUrl: { type: String, required: true },//商品图片
})

//创建模型(翻译过来的意思就是 创建一个集合)

let Collection = mongoose.model("product", schema)

//查重
let find = (query = {}) => {
    return Collection.find(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}