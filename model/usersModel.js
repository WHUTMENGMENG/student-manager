//创建一个新的users集合
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    roleid: String,
    unid: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: false },
    nickname: { type: String, required: false },
    roles: { type: String, required: false },
    headimgurl: { type: String, required: false },
    role: String,
    roleName: String,
    openid:String,
    sex:String,
    city:String,
    province:String,
    country:String
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

//注册
let registerModel = (params) => {
    let coll = new Collection(params)
    return coll.save()
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}

//登入 
let loginModel = (params) => {
    return Collection.find(params)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}

//更新数据库 

const updated = (query, update) => {
    console.log(query, update)
    return Collection.updateOne(query, update)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return false
        })
}

module.exports = {
    find,
    registerModel,
    loginModel,
    updated
}