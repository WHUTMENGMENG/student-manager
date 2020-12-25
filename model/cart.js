const { mongoose, db } = require("../utils/mongoose")
const schema = mongoose.Schema({
    cart_id: { type: String, required:true },//购物车id
    unid: { type: String, required:true },//用户id
    product_id: { type: String, required: true },//商品id
    create_time: { type: String, required: true },//创建时间
    count: { type: Number, required:true, default: 1 },//商品数量
    isChecked: { type: Boolean, required:true, defalut: false }//商品是否被选中
})

let Collection = mongoose.model("carts", schema)
/**
 * 
 * @param query.unid  接收一个unid用户id参数
 */
let find_carts = (query = {}) => {
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
 * @param {object} params.category_id 类目id
 * @param params.categoryName 类目名称
 */
let save_carts = (params) => {
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
const del_carts = (query) => {
    return Collection.deleteOne(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}
//改
const update_carts = (query, updated) => {
    return Collection.updateOne(query, updated)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return false
        })
}

module.exports = {
    find_carts,
    save_carts,
    update_carts,
    del_carts
}