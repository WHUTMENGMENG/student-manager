let { mongoose } = require('../utils/mongoose.js');


const schema = mongoose.Schema({
    "id": String,
    "path": String,
    "desc": String,
    "parentid": String,
    "method": String,
    "permissions": Array,
    "children": Array,
    "create_at": { type: String, default: new Date().toLocaleString() },
    "update_at": { type: String, default: new Date().toLocaleString() }
}, {
    versionKey: false // You should be aware of the outcome after set to false
})



let Collection = mongoose.model("paths", schema)


//查找
let find = (query = {}) => {
    return Collection.find(query)
        .lean()
        .select({ _id: 1, id: 1, path: 2, desc: 3, parentid: 4, method: 5, children: 7, permissions: 6 })
        .then(res => res)
        .catch(err => {
            console.log(err)
            return err.toString()
        })
}

// 增加
let add = (params) => {
    let coll = new Collection(params)
    return coll.save()
        .then(res => res)
        .catch(err => {
            console.log(err)
            return err.toString()
        })
}

//修改
let update = (query, update) => {
    return Collection.updateOne(query, update)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return err.toString()
        })
}

//删除权限路径

let del = (query) => {
    console.log(query)
    return Collection.deleteOne(query)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return err.toString()
        })
}

module.exports = {
    find,
    add,
    update,
    del
}