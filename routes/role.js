let express = require('express')

let router = express.Router()

let controller = require('../controller/roleController')

//获取角色
router.get('/getRole', controller.getRole);
//添加角色
router.post('/addRole', controller.addRole);
//删除角色
router.get('/delRole', controller.delRole);
//修改角色
router.post('/updateRole', controller.updateRole);
//授权
router.post('/grantRole', controller.grantRole);
//获取当前角色权限
router.get('/getRolePermission', controller.getRolePermission);


module.exports = router;