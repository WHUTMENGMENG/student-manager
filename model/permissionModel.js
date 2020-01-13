//创建一个新的users集合
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    roleid: String,
    roleName: String,
    menuList: Array,
    rows: Array
})

//创建模型(翻译过来的意思就是 创建一个集合)

let Collection = mongoose.model("permissions", schema)

//查角色
let find = (query = {}) => {
    return Collection.find(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}

//添加角色
let addRole = (params) => {
    console.log(params)
    let coll = new Collection(params)
    return coll.save()
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}


//更新角色权限

const updateRole = (query, update) => {
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
    addRole,
    updateRole
}