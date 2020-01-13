const { addRole, updateRole, find } = require("../model/permissionModel")

const addRoleCtr = async (req, res) => { //添加角色
    const obj = {
        "roleid": "200",
        "roleName": "员工",
        "menuList": [
            {
                "name": "管理首页"
            },
            {
                "name": "学员管理",
                "children": [
                    {
                        "name": "学员项目管理"
                    }
                ]
            },
            {
                "name": "我的中心"
            }
        ],
        "rows": [
            "/students/getstulist",
            "/getloginlog",
            "/students/getclasses",
            "/students/searchstu",
            "/permission/getRole",
            "/permission/getPermission",
            "/permission/getMenuList"
        ]
    }
    //res.send({msg:"好的我知道了"}) //功能待开发
    const result = await addRole(obj)
    if (result) {
        res.send({ msg: "succ" })
    } else {
        res.send({ msg: "err" })
    }

}

const getRoleCtr = async (req, res) => {//获取角色
    const result = await find({})
    if (result && Array.isArray) {
        console.log(result)
        let roles = result.map(item => ({
            roleid: item.roleid,
            roleName: item.roleName
        }))
        res.send({ status: 200, msg: "success", roles })
    } else {
        res.send({ status: 500, msg: "err获取出错" })
    }
}

const getMenuListCtr = async (req, res) => {
    if (!req.session.userInfo) {
        res.send({ status: 403, state: false, msg: "请先登入" })
        return
    }
}
module.exports = {
    addRoleCtr,
    getRoleCtr
}