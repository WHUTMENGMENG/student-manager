const express = require("express");

const router = express.Router();

const { addRoleCtr, getRoleCtr,getMenuListCtr } = require("../controller/permissionConstroller")

//添加权限
router.post("/addrole", addRoleCtr)
//获取角色列表
router.post("/getrole", getRoleCtr)

//获取菜单
router.get("/getMenuList",getMenuListCtr)

module.exports = router