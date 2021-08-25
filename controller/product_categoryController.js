const { find_product_categorys, update_product_categorys, save_product_categorys, del_product_categorys } = require("../model//product_category")
const derivedId = require("../utils/derivedIdFromMoment")
// category_id: { type: String, required },//类目id
// categoryName: { type: String, required: true },//类目名称
// createTime: { type: String, required: true },//创建时间
// creator: { type: String, required: true },//创建者
// updateTime: { type: String, required: false, default: null }//更新时间

const getProductCategorys = async (req, res) => {
    let findRes = await find_product_categorys();
    if (Array.isArray(findRes)) {
        res.send({ status: 200, state: true, msg: "获取成功", data: [...findRes] })
    } else {
        res.send({ status: 1004, state: false, msg: "获取数据出错" })
    }
}
const addProductCategorys = async (req, res) => {
    if (!req.session['userInfo']) {
        res.send("未登入")
        return
    }
    let { username } = req.session.userInfo;
    let { categoryName,categoryImgurl } = req.body;

    //查询是否已经有该类目
    let findRes = await find_product_categorys({ categoryName })
    if (Array.isArray(findRes) && findRes.length > 0) {
        res.send({ status: 1004, state: false, msg: "已经存在该类目,请不要重复添加" })
        return
    }

    if (!categoryName) {
        res.send({ status: 1004, state: false, msg: "err 请传入categoryName" })
        return
    }
    let category_id = derivedId()
    let createTime = derivedId("YYYY-MM-DD,hh:mm:ss")
    let creator = username;
    let saveRes = await save_product_categorys({
        category_id,
        categoryName,
        categoryImgurl,
        creator,
        createTime
    })
    // console.log(saveRes)
    if (saveRes) {
        res.send({ status: 200, state: true, msg: "添加成功" })
        return
    } else {
        res.send({ status: 1004, state: false, msg: "添加出错,请检查" })
        return
    }
}
const delProductCategorys = async (req, res) => {
    let { category_id } = req.query;
    if (!category_id) {
        res.send({ status: 1004, state: false, msg: "err 请传入category_id" })
        return
    }
    let delRes = await del_product_categorys({ category_id });
    if (delRes.n) {
        res.send({ status: 200, state: true, msg: "删除成功" })
        return
    } else {
        res.send({ status: 1004, state: false, msg: "err 该数据不存在" })
        return
    }
}
const updateProductCategorys = async (req, res) => {
    if (!req.session['userInfo']) {
        res.send("未登入")
        return
    }
    let { username } = req.session.userInfo;
    let { category_id, categoryName } = req.body;
    if (!categoryName || !category_id) {
        res.send({ status: 1004, state: false, msg: "缺少categoryName或者category_id" })
        return
    }
    let query = {
        category_id
    }
    let updated = {
        categoryName,
        updator: username,
        updateTime: derivedId("YYYY-MM-DD,hh:mm:ss") //此处不是用于生成id,用于生成时间
    }
    let updateRes = await update_product_categorys(query, updated)
    console.log(updateRes)
    if (updateRes.nModified) {
        res.send({ status: 200, state: true, msg: "修改成功" })
    } else if (updateRes.n === 0) {
        res.send({ status: 1005, state: false, msg: "没有该数据" })
    } else {
        res.send({ status: 1006, state: false, msg: "没有做任何修改" })
    }
}

module.exports = {
    getProductCategorys,
    addProductCategorys,
    delProductCategorys,
    updateProductCategorys
}