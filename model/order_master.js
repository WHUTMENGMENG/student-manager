
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    order_id: { type: String, required: true },//订单id
    unid: { type: String, required: true },//用户id
    //订单状态
    order_status: { type: Number, required: true, default: 0 },// 0未提交 1提交成功 2已经取消 3无效订单 4.交易关闭 5退货
    //配送状态
    shiping_status: { type: Number, required: true, default: 0 },//配送状态 0未发货 1已发货 2已收货 3备货中
    //支付状态
    pay_status: { type: Number, required: true, default: 0 },//0未支付 1已支付
    user_nickname: { type: String, required: true },//买家名称
    user_phone: { type: String, required: true },//买家电话
    address: { type: String, required: true },//买家地址
    create_time: { type: String, required: true },//创建时间
    update_time: { type: String, required: false },//更新时间
    total_fee: { type: Number, required: true }//总价格 单位(分)
}, {
    versionKey: false // You should be aware of the outcome after set to false
})

//创建模型(翻译过来的意思就是 创建一个集合)

let Collection = mongoose.model("order_masters", schema)

//查询订单 接收用户unid进行查询
/**
 * 
 * @param query.unid 接受unid字段用户查询所有订单
 * @param query.order_id 查询订单详情
 */
let find_order_masters = (query = {}) => {
    return Collection.find(query).sort({_id:-1})
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}

//保存订单
let save_order_masters = (params) => {
    // 实例化集合
    let coll = new Collection(params)
    return coll.save()
        .then(res => res)
        .catch(err => {
            // console.log(err)
            return err
        })
}
//删
const del_order_masters = (query) => {
    return Collection.deleteMany(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}
//改
const update_order_masters = (query, updated) => {
    return Collection.updateOne(query, updated)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return false
        })
}

module.exports = {
    find_order_masters,
    save_order_masters,
    update_order_masters,
    del_order_masters
}