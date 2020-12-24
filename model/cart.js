const schema = mongoose.Schema({
    cart_id: { type: String, required },//购物车id
    unid: { type: String, required },//用户id
    product_id: { type: String, required: true },//商品id
    create_time: { type: String, required: true },//创建时间
    count: { type: Number, required, default: 1 },//商品数量
    isChecked: { type: Boolean, required, defalut: false }//商品是否被选中
})

/**
 * 
 * @param query.unid  接收一个unid用户id参数
 */
let find_product_categorys = (query = {}) => {
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
 * @param params.category_id 类目id
 * @param params.categoryName 类目名称
 */
let save_product_categorys = (params) => {
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
const del_product_categorys = (query) => {
    return Collection.deleteOne(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}
//改
const update_product_categorys = (query, updated) => {
    return Collection.updateOne(query, updated)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return false
        })
}

module.exports = {
    find_product_categorys,
    save_product_categorys,
    update_product_categorys,
    del_product_categorys
}