let { mongoose } = require('../utils/mongoose');
//1 超级管理员 2.管理员 3.审查员 4.普通用户

let schema = mongoose.Schema({
    roleid: { type: String, default: '4' },
    roleName: { type: String, default: '普通用户' },
    desc: { type: String, default: 'regular user' },
    parentid: { type: String, default: '2' },
    create_at: { type: String, default: new Date().toLocaleString() },
    update_at: { type: String, default: "" },
    status: { type: String, default: "1" }
})


let Collection = mongoose.model('role', schema);


//增加

let add = (params) => {
    let coll = new Collection(params)
    return coll.save()
        .then(res => res)
        .catch(err => {
            console.log(err)
            return err.toString()
        })
}

//查找

let find = async (query = {}) => {
    let { page = 1, count = 5, order_by = 1, roleid } = query;
    order_by = parseInt(order_by);
    page = page - 0;
    count = count - 0
    delete query.page
    delete query.count
    delete query.order_by
    let total = await Collection.countDocuments(query)//获取总数
    // console.log(query)
    if (roleid) {
        query = { roleid }
    }
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

//删除

let del = (params) => {
    return Collection.deleteOne(params)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return err.toString()
        })
}

//更新

const update = (query, update) => {
    // console.log(query, update)
    return Collection.updateOne(query, update)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return err.toString()
        })
}

module.exports = {
    add,
    find,
    del,
    update
}