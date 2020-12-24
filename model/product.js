//创建一个新的users集合
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    product_id: { type: String, required },//商品id
    productName: { type: String, required: true },//商品名称
    price: { type: String, required: true },//商品单价
    description: { type: String, required: true },//商品描述
    inventory: { type: String, required: true },//商品库存
    imageUrl: { type: String, required: true },//商品图片
    color: { type: String, required: false },//颜色
    size: { type: String, required: false },//尺寸
    categoryId: { type: String, required }//类目id
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