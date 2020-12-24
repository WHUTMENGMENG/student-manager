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

let Collection = mongoose.model("order_details", schema)

//查看订单详情 接收一个order_id参数
/**
 * 
 * @param query.order_id  接收一个order_id参数
 */
let find_order_details = (query = {}) => {
    return Collection.find(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}

//保存订单
let save_order_details = (params) => {
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
const del_order_details = (query) => {
    return Collection.deleteOne(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}
//改
const update_order_details = (query, updated) => {
    return Collection.updateOne(query, updated)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return false
        })
}

module.exports = {
    find_order_details,
    save_order_details,
    update_order_details,
    del_order_details
}