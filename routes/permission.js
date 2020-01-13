const express = require("express");

const router = express.Router();

const { addRoleCtr, getRoleCtr } = require("../controller/permissionConstroller")

//添加权限
router.post("/addrole", addRoleCtr)
//获取角色列表
router.post("/getrole", getRoleCtr)


module.exports = router