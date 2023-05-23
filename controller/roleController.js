let model = require('../model/roleModel')
let permissionModel = require('../model/permission_New')
//获取角色

//page 页码

//coutn 数量

//order_by 排序方式

//roleid 角色id

//扁平转树形代码

function buildTree(flatData) {
    let tree = [];
    flatData.forEach(item => {
        // console.log(!!item.parentid)
        if (item.parentid) {
            //有父级
            let parent = flatData.find(i => i.roleid == item.parentid);

            if (parent) {
                //有父级
                if (!parent.children) {
                    parent.children = [];
                }
                parent.children.push(item);
                // console.log('parent======',parent.children)

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

let getRole = async (req, res, next) => {
    let { page, count, order_by, roleid } = req.query;
    let queryParams = {}
    if (roleid) {
        queryParams = { roleid }
    }
    let data = await model.find({ queryParams, page, count, roleid, order_by })

    //返回树形数据

    if (typeof (data) !== 'string') {
        res.send({
            state: true,
            code: 200,
            msg: '查询成功',
            total: data.total,
            data: buildTree(data)
        })
    } else {
        res.send({
            state: false,
            code: 400,
            msg: '查询失败'
        })
    }
}


//检查字段是否合法的函数
function checkParams(keys, fields, res) {
    //控制开关
    let flag = true
    keys.forEach(key => {
        if (!fields.includes(key)) {
            flag = false
            res.send({ state: false, status: 500, msg: '字段不合法,或者少传递字段,问题字段是:' + key + ',只能传递:' + fields.join(',') + '中的字段' })
            return
        }
    })
    //字段少传递了 不能往下执行

    return flag
}

//添加角色
// roleid: { type: String, default: '4' },
// roleName: { type: String, default: '普通用户' },
// desc: { type: String, default: 'regular user' },
// parentid: { type: String, default: '2' },
// create_at: { type: String, default: new Date().toLocaleString() },
// update_at: { type: String, default: "" },
// status: { type: String, default: "1" }

let addRole = async (req, res, next) => {
    let { parentid } = req.body;
    //通过父级的parentid查询是否存在这个父级
    if (parentid) { //如果传递了parentid
        let isExistsParent = await model.find({ roleid: parentid });
        if (isExistsParent.length === 0) {
            res.send({
                state: false,
                code: 400,
                msg: '父级角色不存在'
            })
            return;
        }
    }
    //生成roileid
    let roleid = Math.random().toString(16).substring(2)
    req.body.roleid = roleid;
    req.body.create_at = new Date().toLocaleString();
    req.body.update_at = ''
    req.body.parentid = req.body.parentid ?? ''
    //客户端传递的字段
    let keys = Object.keys(req.body);
    let fields = ['roleid', 'create_at', 'update_at', 'roleName', 'desc', 'parentid', 'status']
    //判断传递的字段是否合法
    let flag = checkParams(keys, fields, res)
    //字段不合法不能继续往下执行
    if (!flag) return;

    let data = await model.add(req.body)
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
    let { roleid } = req.query;
    if (!roleid) {
        res.send({
            state: false,
            code: 400,
            msg: '缺少roleid'
        })
        return;
    }

    //查询删除的角色是否存在

    let isExistsRole = await model.find({ queryParams: { roleid } })
    //如果不存在
    if (isExistsRole.length === 0) {
        res.send({
            state: false,
            code: 400,
            msg: '删除的角色不存在'
        })
        return;
    }

    let data = await model.del({ roleid })
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
    let { roleid } = req.body;
    if (!roleid) {
        res.send({
            state: false,
            code: 400,
            msg: '缺少roleid'
        })
        return;
    }

    //查询修改的角色是否存在

    let isExistsRole = await model.find({ queryParams: { roleid } })

    //如果不存在
    if (isExistsRole.length === 0) {
        res.send({
            state: false,
            code: 400,
            msg: '修改的角色不存在'
        })
        return;
    }

    // 查询字段是否合法
    let keys = Object.keys(req.body);

    if (keys.length === 1) {
        //只传递了roleid,那么不做数据库查库操作
        res.send({
            state: false,
            code: 400,
            msg: '没有传递任何修改的字段'
        })
        return;
    }

    let fields = ['roleid', 'roleName', 'desc', 'parentid', 'status']
    //判断传递的字段是否合法
    let flag = checkParams(keys, fields, res)
    //字段不合法不能继续往下执行
    if (!flag) return;
    //添加修改时间
    req.body.update_at = new Date().toLocaleString();

    let data = await model.update({ roleid }, req.body)

    if (typeof (data) !== 'string') {
        res.send({
            state: true,
            code: 200,
            msg: '修改成功'
        })
    } else {
        res.send({
            state: false,
            code: 400,
            msg: '修改失败'
        })
    }
}

//角色授权

//工具方法,用于判断当前授权的角色是否是自己的上级角色

let isParent = (currentid, targetid, fullRoleList) => {
    //如果修改的是自己的权限可以直接通过
    if (currentid == targetid) return true;
    //先通过currentid查找到自身的数据对象
    let current = fullRoleList.find(item => item.roleid == currentid);
    //查找到自身之后,判断自身的parentid是否等于targetid
    if (current) {
        //可以递归查找自己的父级id是不是等于targetid
        return isParent(current.parentid, targetid, fullRoleList)
    } else {
        return false
    }
}

//当前角色id:string 授权角色id:string 权限id:[]string

//roleids:[当前角色id,授权角色id]string 

//permission_ids:[权限id] string

let grantRole = async (req, res, next) => {

    let { roleids = [], permission_ids = [] } = req.body;

    // console.log(roleids, permission_ids)

    //判断传递的参数是否合法
    if (!Array.isArray(roleids) || !Array.isArray(permission_ids)) {
        res.send({
            state: false,
            code: 400,
            msg: 'roleids或者permission_ids必须是数组'
        })
        return;
    }
    console.log(req.session.userInfo)

    let currentRoleid = req.session?.userInfo?.roleid || '3'

    roleids = [currentRoleid].concat(roleids)

    //判断传递的参数是否合法
    if (roleids.length < 2) {
        res.send({
            state: false,
            code: 400,
            msg: '缺少roleid或者缺少传递permission_ids'
        })
        return;
    }

    //查询修改的角色是否存在

    let isExistsRole = await model.find({ queryParams: { roleid: { $in: roleids } } })
    // console.log(isExistsRole)
    //如果不存在
    if (isExistsRole.length < 1) {
        res.send({
            state: false,
            code: 400,
            msg: '当前授权角色不存在或者目标授权的角色不存在'
        })
        return;
    }

    //获取所有的角色,查看授权的对象是不是自己的上级对象

    let fullRoleList = await model.find({ queryParams: {} })
  
    //判断当前授权的角色是否是自己的上级角色

    let flag = isParent(roleids[0], roleids[1], fullRoleList)
    // console.log(flag)
    //如果是自己的上级角色,超级管理员允许操作
    if (flag && roleids[1] != 1) {
        res.send({
            state: false,
            code: 403,
            msg: '没有权限进行此操作'
        })
        return
    }

    //如果不是自己的上级角色,那么就可以授权



    //先清掉数据库中该角色拥有的权限
    let clearResult = await permissionModel.del({ roleid: roleids[1] });
    // console.log(clearResult)
    //如果传递的permission_ids是个空数组,那么就是清空权限不必再进行添加,不是个空数组,继续添加
    //开始添加权限
    let addResult = null;
    if (permission_ids.length !== 0) {
        //再重新添加权限
        let permissModels = permission_ids.map(item => {
            return {
                roleid: roleids[1],
                permission_id: item,
                create_at: new Date().toLocaleString(),
            }
        })
        addResult = await permissionModel.add(permissModels)
    }

    if (typeof (addResult) !== 'string') {
        res.send({
            state: true,
            code: 200,
            msg: '授权成功'
        })
    } else {
        res.send({
            state: false,
            code: 400,
            msg: '授权出错'
        })
    }
}

module.exports = {
    getRole,
    addRole,
    delRole,
    updateRole,
    grantRole
}