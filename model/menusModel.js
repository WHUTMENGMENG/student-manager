let { mongoose } = require('../utils/mongoose');
//1 超级管理员 2.管理员 3.审查员 4.普通用户

let schema = mongoose.Schema({
    menu_id: { type: String ,required:true},
    parentid: { type: String, default: ''},
    name: { type: String, default: 'regular user', required: true },
    title: { type: String, required: true },
    create_at: { type: String, required: true },
    update_at: { type: String, default: "" },
    status: { type: String, default: "1" },
    children: { type: Array}
}, {
    versionKey: false // You should be aware of the outcome after set to false
})


let Collection = mongoose.model('menus', schema);


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
    let { queryParams = {}, page, count, order_by } = query;
    order_by = parseInt(order_by);
    page = page - 0;
    count = count - 0
    order_by = order_by === 1 ? 1 : -1;
    let total = await Collection.countDocuments(queryParams)//获取总数

    return Collection.find(queryParams)
        //这个方法将mongo文档转换成普通对象
        .lean()
        .select({ _id: 1, menu_id: 1, parentid: 1, title: 1, desc: 1, name: 1,create_at:1, update_at: 1, status: 1, children: 1 })
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