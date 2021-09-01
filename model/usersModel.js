//创建一个新的users集合
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    roleid: { type: String, default: "200" },
    unid: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: false, default: "" },
    vipStamp: { type: Number, required: false, default: 0 },
    vipExpires: { type: String, required: false, default: "" },
    vipLevel: { type: Number, required: true, default: 0 },
    nickname: { type: String, required: false, default: "" },
    roles: { type: String, required: false, default: "" },
    headimgurl: { type: String, required: false, default: "" },
    role: { type: String, required: false, default: "" },
    roleName: { type: String, required: false, default: "" },
    openid: { type: String, required: false, default: "" },
    sex: { type: String, required: false, default: "" },
    city: { type: String, required: false, default: "" },
    province: { type: String, required: false, default: "" },
    country: { type: String, required: false, default: "" },
    unionid: { type: String, default: "" }
}, {
    versionKey: false // You should be aware of the outcome after set to false
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