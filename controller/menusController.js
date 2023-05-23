let model = require('../model/menusModel')

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
    let { page, count, order_by, menu_id } = req.query;
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
            data: buildTree(data, 'menu_id')
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


let isParent = (currentid, targetid, fullRoleList) => {
    //如果修改的是自己的权限可以直接通过
    if (currentid == targetid) return true;
    //先通过currentid查找到自身的数据对象
    let current = fullRoleList.find(item => item.menu_id == currentid);
    //查找到自身之后,判断自身的parentid是否等于targetid
    if (current) {
        //可以递归查找自己的父级id是不是等于targetid
        return isParent(current.parentid, targetid, fullRoleList)
    } else {
        return false
    }
}


module.exports = {
    getMenus,
    addMenus,
    delMenus,
    updateMenus
}

