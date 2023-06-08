let model = require('../model/menusModel')
let roleModel = require("../model/roleModel")
let isParent = require("../utils/isParent")
let roleMenuModel = require('../model/roleMenuModel')
//获取角色

//page 页码

//coutn 数量

//order_by 排序方式

//menu_id角色id

//扁平转树形代码

function buildTree(flatData, childKey = 'menu_id', parentKey = 'parentid') {
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

let getMenus = async (req, res, next) => {
    let { page, count, order_by, menu_id, type } = req.query;
    let queryParams = {}
    if (menu_id) {
        queryParams = { menu_id }
    }
    let data = await model.find({ queryParams, page, count, order_by })

    //返回树形数据

    if (typeof (data) !== 'string') {
        res.send({
            state: true,
            code: 200,
            msg: '查询成功',
            total: data.total,
            data: type == 1 ? data : buildTree(data, 'menu_id')
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

//添加菜单

// menuid: { type: String ,required:true},
// name: { type: String, default: 'regular user', required: true },
// title: { type: String, required: true },
// parentid: { type: String, default: '', required: true },
// create_at: { type: String, required: true },
// update_at: { type: String, default: "" },
// status: { type: String, default: "1" },

let addMenus = async (req, res, next) => {
    let { title, status, name } = req.body;
    //简单粗暴的判定方式
    if (!title || !status || !name) {
        res.send({
            state: false,
            code: 400,
            msg: '缺少字段'
        })
        return;
    }
    //菜单id
    req.body.menu_id = Date.now().toString(16);
    //父级id
    req.body.parentid = req.body.parentid || "";
    //创建时间
    req.body.create_at = new Date().toLocaleString();
    //更新时间
    req.body.update_at = "";
    //子节点
    req.body.children = [];
    //添加
    let data = await model.add(req.body);
    if (typeof (data) !== 'string') {
        res.send({
            state: true,
            code: 200,
            msg: '添加成功'
        })
    } else {
        res.send({
            state: false,
            code: 400,
            msg: '添加失败,错误:' + data
        })
    }
}

//删除菜单

let delMenus = async (req, res, next) => {
    let { menu_id } = req.query;
    if (!menu_id) {
        res.send({
            state: false,
            code: 400,
            msg: '缺少menu_id'
        })
        return;
    }

    //查询删除的菜单是否存在

    let isExistsRole = await model.find({ queryParams: { menu_id } })
    //如果不存在
    if (isExistsRole.length === 0) {
        res.send({
            state: false,
            code: 400,
            msg: '删除的菜单不存在'
        })
        return;
    }

    let data = await model.del({ menu_id })
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

//修改菜单

let updateMenus = async (req, res, next) => {
    let { menu_id } = req.body;
    if (!menu_id) {
        res.send({
            state: false,
            code: 400,
            msg: '缺少menu_id'
        })
        return;
    }

    //查询修改的菜单是否存在

    let isExistsRole = await model.find({ queryParams: { menu_id } })

    //如果不存在
    if (isExistsRole.length === 0) {
        res.send({
            state: false,
            code: 400,
            msg: '修改的菜单不存在'
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

    let fields = ['menu_id', 'title', 'name', 'status', 'parentid']
    //判断传递的字段是否合法
    let flag = checkParams(keys, fields, res)
    //字段不合法不能继续往下执行
    if (!flag) return;
    //添加修改时间
    req.body.update_at = new Date().toLocaleString();

    let data = await model.update({ menu_id }, req.body)

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

// roleid:string
// menu_id:string[]

const assignmentMenu = async (req, res) => {

    //当前角色的id

    let currentRoleid = req.session.userInfo.roleid

    let { roleid, menu_id } = req.body;

    if (!roleid || !menu_id) {
        res.send({
            state: false,
            code: 400,
            msg: '缺少roleid或者menu_id'
        })
        return;
    }

    //获取完整角色表
    let roleList = await roleModel.find({ queryParams: {} })

    //查询角色是否存在
    let isExistsRole = roleList.filter(item => item.roleid === roleid)

    //如果不存在
    if (isExistsRole.length === 0) {
        res.send({
            state: false,
            code: 400,
            msg: '角色不存在'
        })
        return;
    }

    //查询是否是自己的上级角色
    // console.log(roleList)

    let isParentRes = isParent(currentRoleid, roleid, roleList)

    //如果是上级角色,并且操作者不是超级管理员

    if (isParentRes && currentRoleid !== '1') {
        res.send({
            state: false,
            code: 403,
            msg: '不能给自己的上级角色分配菜单'
        })
        return;
    }

    //判断传入的menu_id是否是一个数组

    if (!Array.isArray(menu_id)) {
        res.send({
            state: false,
            code: 403,
            msg: 'menu_id必须是一个数组'
        })
        return;
    }

    //查询菜单是否存在

    let query = { menu_id: { $in: menu_id } };

    let menuList = await model.find({ queryParams: query });

    if (menuList.length !== menu_id.length || menuList.length === 0) {
        //查询出来的结果如果和传入的id的长度不一致,说明有不存在的菜单
        res.send({
            state: false,
            code: 403,
            msg: '传入的菜单id有不存在的'
        })
        return
    }

    //查找角色是否拥有对应权限

    let roleMenuList = await roleMenuModel.find({ queryParams: { roleid, ...query } })

    if (roleMenuList.length !== 0) {
        res.send({
            state: false,
            code: 403,
            msg: '角色已经拥有你传递的某个菜单了'
        })
        return
    }

    //开始分配菜单给角色
    let params = menu_id.map(menu_id => {
        return {
            rome_menu_id: Math.random().toString(16).slice(2) + new Date().getTime(),
            roleid,
            menu_id,
            create_at: new Date().toLocaleString(),
            update_date: new Date().toLocaleString(),
            updator: req.session.userInfo.username
        }
    })
    let addRes = await roleMenuModel.add(params)

    if (typeof addRes === 'string') {
        res.send({
            state: false,
            code: 400,
            msg: '菜单分配失败,错误:' + addRes
        })
        return
    } else {
        res.send({
            state: true,
            code: 200,
            msg: '菜单分配成功'
        })
    }
}

//获取角色菜单

//page:分页

//count:每页显示的条数

//roleid:角色id

//order_by:排序方式

//type:是否树形 1是 0否

const getRoleMenus = async (req, res) => {
    let { page, count, roleid, order_by, type } = req.query;
    //如果没有传入角色id默认使用登入角色的角色id
    if (!roleid) {
        roleid = req.session.userInfo.roleid
    }
    //根据角色id获取角色菜单
    let roleMenus = await roleMenuModel.find({ queryParams: { roleid } });
    if (typeof roleMenus === 'string') {
        res.send({
            state: false,
            code: 400,
            msg: '获取角色菜单失败,错误:' + roleMenus
        })
        return
    } else {
        //获取角色菜单的id
        // console.log(roleMenus)
        let menu_id = roleMenus.map(item => item.menu_id);
        // console.log(menu_id)
        //根据角色菜单的id获取菜单
        let menus = await model.find({ queryParams: { menu_id: { $in: menu_id } }, order_by });
        if (typeof menus === 'string') {
            res.send({
                state: false,
                code: 400,
                msg: '获取角色菜单失败,错误:' + menus
            })
            return
        } else {
            //如果是树形
            if (type == '1') {
                //获取树形菜单
                let treeMenus = buildTree(menus);
                res.send({
                    state: true,
                    code: 200,
                    msg: '获取角色菜单成功',
                    data: treeMenus
                })
            } else {
                //如果不是树形
                res.send({
                    state: true,
                    code: 200,
                    msg: '获取角色菜单成功',
                    total: menus.total,
                    data: menus
                })
            }
        }
    }
}

//删除角色菜单

//角色菜单id

//role_menu_id:string | string[]

let delRoleMenus = async (req, res) => {
    let { menu_id, roleid } = req.body;
    if (!menu_id || !roleid) {
        res.send({
            state: false,
            code: 400,
            msg: '缺少roleid或者menu_id'
        })
        return
    }

    //查看删除的是不是自己的上级角色

    //获取完整的角色表
    let roleList = await roleModel.find({ queryParams: {} })
    let currentRoleid = req.session.userInfo.roleid
    let isParentRes = isParent(currentRoleid, roleid,roleList)
    if (isParentRes && currentRoleid !== '1') {
        res.send({
            state: false,
            code: 403,
            msg: '没有权限删除自己上级角色的菜单'
        })
        return
    }
    let queryParams = { roleid, menu_id }
    //如果是数组 要批量删除
    if (Array.isArray(menu_id)) {
        queryParams = { roleid, menu_id: { $in: menu_id } }
    }
    let delRes = await roleMenuModel.del({ queryParams })

    if (typeof delRes === 'string') {
        res.send({
            state: false,
            code: 400,
            msg: '删除角色菜单失败,错误:' + delRes
        })
    } else {
        res.send({
            state: true,
            code: 200,
            msg: '删除角色菜单成功'
        })
    }

}
module.exports = {
    getMenus,
    addMenus,
    delMenus,
    updateMenus,
    assignmentMenu,
    getRoleMenus,
    delRoleMenus
}

