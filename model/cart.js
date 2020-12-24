const schema = mongoose.Schema({
    cartId: { type: String, required },//购物车id
    unid: { type: String, required },//用户id
    product_id: { type: String, required: true },//商品id
    create_time: { type: String, required: true },//创建时间
    count: { type: Number, required, default: 1 },//商品数量
    isChecked: { type: Boolean, required, defalut: false }//商品是否被选中
})