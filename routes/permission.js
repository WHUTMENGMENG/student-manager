const express = require("express");

const router = express.Router();

const { addRoleCtr, getRoleCtr, getMenuListCtr } = require("../controller/permissionConstroller")

const permissionPathController = require("../controller/permissionPathController");
//添加权限
router.post("/addrole", addRoleCtr)
//获取角色列表
router.post("/getrole", getRoleCtr)

//获取菜单
router.get("/getMenuList", getMenuListCtr)

//获取权限路径
router.get('/getPermissionPath', permissionPathController.getPermissionPathCtr)

//增加权限路径
router.post('/addPermissionPath', permissionPathController.addPermissionPathCtr)

//修改权限路径
router.post('/updatePermissionPath', permissionPathController.updatePermissionPathCtr)

//删除权限路径

router.get('/deletePermissionPath', permissionPathController.deletePermissionPathCtr)

module.exports = router