// 定义一个学员模型
const { mongoose, db } = require("../utils/mongoose") //es6 解构赋值

let Schema = mongoose.Schema({ //定义模型的作用就是规范字段名称 规范传递字段的数量
    sId: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: String, required: true },
    city: { type: String, required: true },
    degree: { type: String, required: true },
    productUrl: { type: String, required: false },
    description: { type: String, required: true },
    cTime: { type: String, required: true },
    avatar: { type: String, required: false }
})

//创建集合 
let Collection = mongoose.model("students", Schema);//创建集合 最好自己在集合名后加S
//增加内容到数据库

let add = (params) => {
    // 实例化集合
    let coll = new Collection(params)
    return coll.save()
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}
//删
const del = (query) => {
    return Collection.deleteOne(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}
//改
const update = (query, updated) => {
    return Collection.updateOne(query, updated)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return false
        })
}
//查
const find = (query = {}) => {
    //调用mongoose查找数据库的方法 
    return Collection.find(query)
        .then(res => res)
        .catch(err => err)
}

module.exports = {
    find,
    add,
    del,
    update
}
