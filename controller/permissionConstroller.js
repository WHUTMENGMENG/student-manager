const { addRole, updateRole, find } = require("../model/permissionModel")

const addRoleCtr = async (req, res) => { //添加角色
    const obj = {
        "roleid": "103",
        "roleName": "主管",
        "menuList": [
            {
                "name": "管理首页"
            },
            {
                "name": "学员管理",
                "children": [
                    {
                        "name": "学员项目管理"
                    },
                    {
                        "name": "学员资料"
                    }
                ]
            },
            {
                "name": "数据统计"
            },
            {
                "name": "我的中心"
            }
        ],
        "rows": [
            "/students/getstulist",
            "/getloginlog",
            "/students/getclasses",
            "students/addstu",
            "/students/delstu",
            "/students/updatestu",
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
        // console.log(result)
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
   // if (!req.session.userInfo) {
      //  res.send({ status: 403, state: false, msg: "请先登入" })
      //  return
   // }
    let result = await find({ roleid: req.session.userInfo.roleid })
    if (result && Array.isArray) {
        // console.log(result)
        let menuList = result[0].menuList
        res.send({ status: 200, state: true, msg: "success", code: "10086", roleName: result[0].roleName, menuList })
    } else {
        res.send({ status: 500, msg: "err获取出错" })
    }
}
module.exports = {
    addRoleCtr,
    getRoleCtr,
    getMenuListCtr
}