let { mongoose } = require('../utils/mongoose');
//1 超级管理员 2.管理员 3.审查员 4.普通用户

let schema = mongoose.Schema({
    role_menu_id: { type: String },
    roleid: { type: String, default: '3' },
    menu_id: { type: String },
    create_at: { type: String, default: new Date().toLocaleString() },
    update_at: { type: String, default: new Date().toLocaleString() },
    updator: { type: String }
}, {
    versionKey: false // You should be aware of the outcome after set to false
})


let Collection = mongoose.model('roleMenus', schema);


//增加

let add = (params) => {
    // let coll = new Collection(params)
    // return coll.save()
    //     .then(res => res)
    //     .catch(err => {
    //         console.log(err)
    //         return err.toString()
    //     })
    return Collection.create(params)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return err.toString()
        })
}

//查找

let find = async (query = {}) => {
    let { queryParams = {}, page, count, order_by } = query;
    order_by = parseInt(order_by);
    page = page - 0;
    count = count - 0
    order_by = order_by == 1 ? 1 : -1;
    let total = await Collection.countDocuments(queryParams)//获取总数

    return Collection.find(queryParams)
        //这个方法将mongo文档转换成普通对象
        .lean()
        .select({ _id: 1, roleid: 1, permission_id: 1, create_at: 1 })
        .skip((page - 1) * count).limit(count).sort({ create_at: order_by })
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
    // console.log(params)
    return Collection.deleteMany(params)
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