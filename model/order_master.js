
const { mongoose } = require("../utils/mongoose");

const schema = mongoose.Schema({
    order_id: { type: String, required },//订单id
    unid: { type: String, required },//用户id
    //订单状态
    order_status: { type: Number, required: true, default: 0 },// 0未提交 1提交成功 2已经取消 3无效订单 4退货
    //配送状态
    shiping_status: { type: Number, required: true, default: 0 },//配送状态 0未发货 1已发货 2已收货 3备货中
    //支付状态
    pay_status: { type: Number, required, default: 0 },//0未支付 1已支付
    price: { type: Number, required: true },//商品单价
    user_nickname: { type: String, required: true },//买家名称
    user_phone: { type: String, required: true },//买家电话
    address: { type: String, required: true },//买家地址
    create_time: { type: String, required: true },//创建时间
    update_time: { type: String, required: true },//更新时间
    total_fee: { type: Number, required }//总价格 单位(分)
})

//创建模型(翻译过来的意思就是 创建一个集合)

let Collection = mongoose.model("order_masters", schema)

//查询订单 接收用户uid进行查询
let find = (query = {}) => {
    return Collection.find(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}