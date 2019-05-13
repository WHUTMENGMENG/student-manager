// 定义一个学员模型
const { mongoose, db } = require("../utils/mongoose") //es6 解构赋值

let Schema = mongoose.Schema({ //定义模型的作用就是规范字段名称 规范传递字段的数量
    username: { type: String, required: true },
    lastLogin: { type: Object, require: true },
    nowLogin: { type: Object, required: true }
})

//创建集合 
let Collection = mongoose.model("logs", Schema);//创建集合 最好自己在集合名后加S
//增加内容到数据库
let addLog = (params) => {
    // 实例化集合
    let coll = new Collection(params)
    return coll.save()
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}

let findLog = (query = {}, counts = { skip: 0, counts: 10 }) => {
    return Collection.find(query).sort({ _id: -1 }).skip(counts.skip).limit(counts.limit)
        .then(res => res)
        .catch(err => { console.log(err); return false })
}
module.exports = {
    addLog,
    findLog
}