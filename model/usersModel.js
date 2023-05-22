//创建一个新的users集合
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    roleid: { type: String, default: '3' },
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
    unionid: { type: String, default: "" },
    // 0 正常 1 禁用
    status: { type: String, default: "1" },
    create_at: { type: String, default: new Date().toLocaleString() },
    update_at: { type: String, default: "" }
}, {
    versionKey: false // You should be aware of the outcome after set to false
})

//创建模型(翻译过来的意思就是 创建一个集合)

let Collection = mongoose.model("users", schema)

//查重
let find = async (query = {}) => {
    let { page, count, order_by } = query;
    order_by = parseInt(order_by);
    page = page - 0;
    count = count - 0
    delete query.page
    delete query.count
    delete query.order_by
    let total = await Collection.countDocuments(query)//获取总数
    console.log(query)
    return Collection.find(query).skip((page - 1) * count).limit(count).sort({ _id: order_by })
        .then(res => {
            res.total = total;
            return res;
        })
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
    // console.log(query, update)
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