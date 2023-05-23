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

module.exports = router