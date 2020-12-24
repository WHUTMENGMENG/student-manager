//创建一个新的users集合
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    category_id: { type: String, required },//类目id
    categoryName: { type: String, required: true }//类目名称
})

//创建模型(翻译过来的意思就是 创建一个集合)

let Collection = mongoose.model("product_category", schema)

//查重
let find = (query = {}) => {
    return Collection.find(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}