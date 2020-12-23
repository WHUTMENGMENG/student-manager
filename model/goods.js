//创建一个新的users集合
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    id: { type: String, required },
    goodsName: { type: String, required: true },
    price: { type: String, required: true },
    description: { type: String, required: true },
    inventory: { type: String, required: true },
    imageUrl: { type: String, required: true },
    color: { type: String, required: false },
    size: { type: String, required: false }
})

//创建模型(翻译过来的意思就是 创建一个集合)

let Collection = mongoose.model("users", schema)

//查重
let find = (query = {}) => {
    return Collection.find(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}