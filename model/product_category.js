//创建一个新的users集合
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    category_id: { type: String, required },//类目id
    categoryName: { type: String, required: true }//类目名称
})

//创建模型(翻译过来的意思就是 创建一个集合)

let Collection = mongoose.model("product_categorys", schema)


/**
 * 
 * @param query.category_id  接收一个category_id参数
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