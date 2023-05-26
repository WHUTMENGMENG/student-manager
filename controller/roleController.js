let model = require('../model/roleModel')
let permissionModel = require('../model/permission_New')
let pathModel = require('../model/permissionPathModel');
let usersModel = require('../model/usersModel');
//获取角色

//page 页码

//coutn 数量

//order_by 排序方式

//roleid 角色id

//扁平转树形代码

function buildTree(flatData, childKey = 'roleid', parentKey = 'parentid') {
    let tree = [];
    flatData.forEach(item => {
        // console.log(!!item.parentid)
        if (item[parentKey]) {
            //有父级
            let parent = flatData.find(i => i[childKey] == item[parentKey]);

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
    let { page, count, order_by, roleid, type } = req.query;
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
            data: type === '1' ? data : buildTree(data)
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
    //如果没有指定父级id
    if (!parentid) {
        res.send({
            state: false,
            code: 400,
            msg: '请指定父级角色id'
        })
        return;
    }
    //通过父级的parentid查询是否存在这个父级
    if (parentid) { //如果传递了parentid
        let isExistsParent = await model.find({ queryParams: { roleid: parentid } });
        if (isExistsParent.length === 0) {
            res.send({
                state: false,
                code: 400,
                msg: '父级角色不存在'
            })
            return;
        }
    }

    //判断当前指定的父级是否是自己的子级或者是自己

    let currentRoleid = req.session.userInfo.roleid;

    //获取所有的角色
    let allRoles = await model.find({ queryParams: {} });

    if (parentid !== currentRoleid && currentRoleid !== '1') {

        //查看增加的是不是自己的上级角色

        let flag = isParent(currentRoleid, parentid, allRoles)

        if (flag) {
            //不存在
            res.send({
                state: false,
                code: 400,
                msg: '指定的添加的角色不是自己的下级角色'
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

    //查询删除的角色是不是自己的上级角色

    let currentRoleid = req.session.userInfo.roleid;

    //获取所有的角色

    let allRoles = await model.find({ queryParams: {} })

    //判断是否是自己的上级

    let isParentRole = isParent(currentRoleid, roleid, allRoles);

    if (isParentRole && currentRoleid !== "1") {
        res.send({
            state: false,
            code: 400,
            msg: '没有权限删除自己,或者的上级角色'
        })
        return
    }

    //判断是不是自己的同级,同级也不能删除

    //找到自己的parentid

    let currentRole = allRoles.find(item => item.roleid === currentRoleid);

    let currentParentid = currentRole.parentid;

    // 查找同级的兄弟

    let brotherRoles = allRoles.filter(item => item.parentid === currentParentid);

    //判断是否是同级

    let isBrother = brotherRoles.some(item => item.roleid === roleid);

    if (isBrother && currentRoleid !== "1") {
        res.send({
            state: false,
            code: 400,
            msg: '没有权限删除自己的同级角色'
        })
        return
    }


    let data = await model.del({ roleid })
    //也要删除授权的权限表数据
    await permissionModel.del({ roleid })

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

    //检查要修改的角色是不是自己的上级角色

    let fullRoleList = await model.find({ queryParams: {} })

    let isParentRole = isParent(req.session.userInfo.roleid, roleid, fullRoleList)

    // console.log(isParentRole)

    if (isParentRole && req.session.roleid !== '1') {
        res.send({
            state: false,
            code: 400,
            msg: '不能修改自己的上级角色'
        })
        return;
    }


    //检查要修改的parentid是否存在,并且是不是自己的上级角色

    let parentid = req.body.parentid;

    //如果传递了parentid并且和当前登入的角色id不一致,那么就要检查parentid是否存在
    if (parentid && parentid !== req.session.userInfo.roleid) {
        let isExistsParent = fullRoleList.find(item => item.roleid === parentid);
        //如果不存在
        if (!isExistsParent) {
            res.send({
                state: false,
                code: 403,
                msg: '修改的parentid对应角色不存在'
            })
            return
        } else {
            //如果存在 检查是不是当前的上级
            let isParentRole = isParent(req.session.userInfo.roleid, parentid, fullRoleList);
            if (isParentRole && req.session.roleid !== '1') {
                res.send({
                    state: false,
                    code: 403,
                    msg: '目标觉得不能是自己的上级角色'
                })
                return
            }
        }
    }



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
    // console.log('999999999999')
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
    // console.log(req.session.userInfo)

    let currentRoleid = req.session?.userInfo?.roleid || '3'

    roleids = [currentRoleid].concat(roleids)

    // console.log('roleid', roleids)

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
    // console.log(roleids[1])
    if (flag && currentRoleid !== '1') {
        res.send({
            state: false,
            code: 403,
            msg: '没有权限进行此操作'
        })
        return
    }

    //如果不是自己的上级角色,那么就可以授权

    //查看自己是否已经拥有了授权的权限,拥有才可以继续授权

    //获取当前角色的权限

    let currentPermissions = await permissionModel.find({ queryParams: { roleid: roleids[0] } })
    // console.log('currentPermissions---',currentPermissions)
    //映射成为一个只有permission_id的数组,和传递的permission_ids进行比较

    currentPermissions = currentPermissions.map(item => item.permission_id);
    //声明一个函数,用于判断当前角色是否拥有传递的权限
    let isAccessAuth = (currentPermissions, permission_ids) => {
        let flag = true;
        permission_ids.forEach(incommin_ids => {
            if (!currentPermissions.includes(incommin_ids)) {
                flag = false
                return;
            }
        })
        return flag
    }

    let access = isAccessAuth(currentPermissions, permission_ids);

    if (!access && permission_ids.length && currentRoleid !== '1') {
        res.send({
            state: false,
            code: 403,
            msg: '不能分配自己没有的权限'
        })
        return
    }



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

//获取当前角色权限

//通过roleid查询当前角色的权限,传递roleid

let getRolePermission = async (req, res, next) => {
    let roleid = req.query.roleid || req.session.userInfo.roleid
    //用于控制是否要返回树形数据
    let { type } = req.query
    // console.log(req.session)

    let data = await permissionModel.find({ queryParams: { roleid } })
    if (typeof (data) !== 'string') {

        // console.log(data.length)
        if (data.length > 0) {
            //根据获取数据的permission_id进行到path表中连表查询
            let pathList = await pathModel.find({ id: { $in: data.map(item => item.permission_id) } })
            // console.log(pathList)
            if (typeof pathList !== 'string') {
                //将pathList转换成树形结构
                let rolePermissTree = !type ? buildTree(pathList, 'id') : pathList
                res.send({
                    state: true,
                    code: 200,
                    msg: '查询成功',
                    data: rolePermissTree
                })
            } else {
                res.send({
                    state: false,
                    code: 400,
                    msg: '查询出错:' + data
                })
            }

        } else {
            res.send({
                state: true,
                code: 200,
                data: data
            })
        }
    } else {
        res.send({
            state: false,
            code: 400,
            msg: '查询出错:' + data
        })
    }
}

//分配角色

//通过roleid查询当前角色的权限,传递roleid

//传递roleid,要分配的角色id

//传递unid, 分配的用户id
//也可以根据用户名分配
let roleAssignment = async (req, res, next) => {
    //获取当前角色id
    let roleid = req.session.userInfo.roleid;
    //获取全部角色
    let roleList = await model.find({ queryParams: {} })
    //获取要分配的角色
    let targetRoleid = req.body.roleid;
    //如果没有传递roleid
    if (!targetRoleid) {
        res.send({
            state: false,
            code: 400,
            msg: '缺少roleid'
        })
        return;
    }
    //判断分配的角色是否是自己的上级角色
    let flag = isParent(roleid, targetRoleid, roleList);
    //如果是自己的上级角色,超级管理员允许操作,其它不允许
    if (flag && roleid !== '1') {
        res.send({
            state: false,
            code: 403,
            msg: '没有权限进行此操作,不能给自己或者给自己的上级分配角色'
        })
        return
    }
    //如果不是自己的上级角色,那么就可以分配
    //获取当前传递的用户id
    let userid = req.body.unid;
    //如果没有传递userid
    if (!userid) {
        res.send({
            state: false,
            code: 400,
            msg: '缺少unid'
        })
        return;
    }

    //如果传递了用户名
    let query; //查询条件
    if (req.body.username) {
        query = { username }
    } else if (req.body.unid) {
        query = { unid: req.body.unid }
    }
    //查询当前分配角色的用户是否存在
    let isExistsUser = await usersModel.find(query)
    //查询当前分配的角色是否存在
    let isExistsRole = await model.find({ queryParams: { roleid: targetRoleid } })
    console.log(isExistsRole)
    if (isExistsRole.length < 1) {
        res.send({
            state: false,
            code: 400,
            msg: '当前分配的角色不存在'
        })
        return
    }
    //如果不存在
    if (isExistsUser.length < 1) {
        res.send({
            state: false,
            code: 400,
            msg: '当前分配角色的用户不存在'
        })
        return;
    }
    //查看目标角色的状态是否禁用
    if (isExistsRole[0].status !== '1') {
        //禁用不允许授权
        res.send({
            state: false,
            code: 403,
            msg: '目标授权角色已经被禁用,不能进行授权'
        })
        return
    }


    //如果存在,那么进行更新操作
    let updateResult = await usersModel.updated({ unid: userid }, { $set: { roleid: targetRoleid } })
    // console.log(updateResult)
    //分配成功
    if (updateResult) {
        res.send({
            state: true,
            code: 200,
            msg: '分配角色成功'
        })
    } else {
        res.send({
            state: false,
            code: 400,
            msg: '分配角色失败'
        })
    }
}

module.exports = {
    getRole,
    addRole,
    delRole,
    updateRole,
    grantRole,
    getRolePermission,
    roleAssignment
}

