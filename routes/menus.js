let express = require('express')

let router = express.Router()

let controller = require('../controller/menusController')

//获取菜单

router.get('/getMenus', controller.getMenus);

//添加菜单

router.post('/addMenus', controller.addMenus);

//删除菜单

router.get('/delMenus', controller.delMenus);

//修改菜单

router.post('/updateMenus', controller.updateMenus);

//给角色分配菜单

router.post('/assignmentMenu', controller.assignmentMenu);

//获取角色的菜单

router.get('/getRoleMenus', controller.getRoleMenus);

//删除角色菜单
router.post('/delRoleMenus', controller.delRoleMenus);    

module.exports = router