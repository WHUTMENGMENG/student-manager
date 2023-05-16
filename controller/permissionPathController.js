let model = require("../model/permissionPathModel")


//扁平数据转换树形的写法
function buildTree(flatData) {
    let tree = [];
    flatData.forEach(item => {
        // console.log(!!item.parentid)
        if (item.parentid) {
            //有父级
            let parent = flatData.find(i => i.id == item.parentid);
            if (parent) {
                //有父级
                if (!parent.children) {
                    parent.children = [];
                }
                parent.children.push(item);
                // console.log('parent======',parent)

            }
        } else {
            // console.log('没进来?')
            //没有父级
            tree.push(item);
        }
    })
    // console.log(tree)
    return tree;
}

//检查字段是否合法的函数
function checkParams(keys, fields,res) {
    //控制开关
    let flag = true
    keys.forEach(key => {
        if (!fields.includes(key)) {
            flag = false
            res.send({ state: false, status: 500, msg: '字段不合法:' + key +'只能传递:'+fields.join(',')+'中的字段'})
            return
        }
    })
    //字段少传递了 不能往下执行

    return flag
}

//获取权限列表
const getPermissionPathCtr = async (req, res) => {
    let result = await model.find({})
    // console.log(result)
    if (result && Array.isArray) {
        // console.log('---result', buildTree(result).length)
        result = buildTree(result)

        res.send({ state: true, status: 200, msg: "success", permissionPaths: result })
    } else {
        res.send({ state: false, status: 500, msg: result })
    }
}

//传递的字段是permissionIds

//     "path": String,
//     "desc": String,
//     "method": String,
//     "permissions": Array,

const addPermissionPathCtr = async (req, res) => {
    //先根据传入的id数组进行查询1级 2级 3级等等操作
    let ids = Array.isArray(req.body.permissionIds) ? req.body.permissionIds : [];

    let params = {};
    //过滤掉ids作为参数存到数据库
    let keys = Object.keys(req.body)
    //要传递的字段
    let fields = ['path', 'desc', 'method', 'permissions']
    //控制开关
    let flag = true
    fields.forEach(field => {
        if (!keys.includes(field)) {
            res.send({ state: false, status: 500, msg: '缺少必要字段:' + field })
            flag = false
        }
    })
    //字段少传递了 不能往下执行
    if (!flag) return

    keys.forEach(key => {
        if (key !== 'permissionIds') {
            params[key] = req.body[key]
        }
    })


    // console.log(ids)
    let findResult = await model.find({ id: { $in: ids } })
    // console.log('findResult----', findResult)
    if (ids.length) {
        if (findResult.length !== ids.length) {
            res.send({ state: false, status: 500, msg: '传入的id有误' })
        } else {
            //如果存在这个节点,那么就走更新操作
            let updateResult = await model.add({ id: Math.random().toString(16).substring(2), parentid: ids[ids.length - 1], ...params })

            if (typeof updateResult !== 'string') {
                res.send({ state: true, status: 200, msg: "添加成功" })
            } else {
                res.send({ state: false, status: 500, msg: updateResult })
            }
        }

    } else {
        let updateResult = await model.add({ id: Math.random().toString(16).substring(2), parentid: "", ...params })

        if (typeof updateResult !== 'string') {
            res.send({ status: 200, msg: "添加成功" })
        } else {
            res.send({ status: 500, msg: updateResult })
        }
    }
}

//字段 permissionId;
//    "path": String,
//     "desc": String,
//     "method": String,
//     "permissions": Array,

const updatePermissionPathCtr = async (req, res) => {
    let id = req.body.permissionId;
    if (!id) {
        res.send({ state: false, status: 500, msg: '缺少必要字段:permissionId' })
        return
    }
    //先查看权限是否存在
    //先查看权限是否存在
    let findRes = await model.find({ id })
    //如果不存在
    if (findRes.length === 0) {
        res.send({ state: false, status: 500, msg: '未找到该权限' })
        return
    }
    //声明参数
    let params = {...req.body};
    // 去除permissionId
    delete params.permissionId;
    //查看字段是否合法
    //客户端传递的字段
    let keys = Object.keys(params)
    //要传递的字段
    let fields = ['path', 'desc', 'method', 'permissions']
    //检查是否合法
    let isCheckParams = checkParams(keys, fields,res)
    //字段不合法 阻断代码往下执行
    if (!isCheckParams) return
    //查看是否存在这条权限信息

    let isExistsPermissPath = await model.find({ id });



    //如果不存在
    if (isExistsPermissPath.length === 0) {
        res.send({ state: false, status: 500, msg: '未找到该权限' })
        return
    }
    

    let result = await model.update({ id }, { $set: params })
    if (typeof result !== 'string') {
        res.send({state:true, status: 200, msg: '修改成功' })
    } else {
        res.send({ state:false,status: 500, msg: result })
    }
}
//字段 permissionId
const deletePermissionPathCtr = async (req, res) => {
    let id = req.query.permissionId
    if (!id) {
        res.send({ state: false, status: 500, msg: '缺少必要字段:permissionId' })
        return
    }
    //先查看权限是否存在
    let findRes = await model.find({ id })
    //如果不存在
    if (findRes.length === 0) {
        res.send({ state: false, status: 500, msg: '未找到该权限' })
        return
    }
    //开始删除
    let result = await model.del({ id })
    if (typeof result !== 'string') {
        res.send({ state: true, status: 200, msg: '删除成功' })
    } else {
        res.send({ state: false, status: 500, msg: result })
    }
}


module.exports = {
    getPermissionPathCtr,
    addPermissionPathCtr,
    updatePermissionPathCtr,
    deletePermissionPathCtr
}