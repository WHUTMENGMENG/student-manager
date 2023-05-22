let model = require('../model/roleModel')

//获取角色

//page 页码

//coutn 数量

//order_by 排序方式

//roleid 角色id
let getRole = async (req, res, next) => {
    let { page, count, order_by, roleid, ...query } = req.query;
    let data = await model.find(query, page, count, roleid, order_by)
    if (typeof (data) !== 'string') {
        res.send({
            state: true,
            code: 200,
            msg: '查询成功',
            data
        })
    } else {
        res.send({
            state: false,
            code: 400,
            msg: '查询失败'
        })
    }
}

//添加角色

let addRole = async (req, res, next) => {
    let { role_name, role_desc } = req.body;
    let data = await model.add({ role_name, role_desc })
    if (typeof (data) !== 'string') {
        res.send({
            state: true,
            code: 200,
            msg: '添加成功'
        })
    } else {
        res.send({
            state: true,
            code: 400,
            msg: '添加失败'
        })
    }
}

//删除角色

let delRole = async (req, res, next) => {
    let { _id } = req.body;
    let data = await model.del({ _id })
    if (typeof (data) !== 'string') {
        res.send({
            state: true,
            code: 200,
            msg: '删除成功'
        })
    } else {
        res.send({
            state: true,
            code: 400,
            msg: '删除失败,错误:' + data
        })
    }
}

//修改角色

let updateRole = async (req, res, next) => {
    let { _id, role_name, role_desc } = req.body;
    let data = await model.update({ _id }, { role_name, role_desc })
    if (typeof (data) !== 'string') {
        res.send({
            state: true,
            code: 200,
            msg: '修改成功'
        })
    } else {
        res.send({
            state: true,
            code: 400,
            msg: '修改失败'
        })
    }
}

//角色授权

let grantRole = async (req, res, next) => {
    let { _id, auth } = req.body;
}

module.exports = {
    getRole,
    addRole,
    delRole,
    updateRole,
    grantRole
}