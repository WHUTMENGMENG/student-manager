const express = require("express");

const router = express.Router();

const { register, login, uploadAvatar, updatePassword, getMenuList } = require("../controller/usersController")

const uploads = require("../middleware/multer")
console.log(uploads)
//注册
router.post("/register", register)

//登入
router.post("/login", login)

//上传头像

router.post("/uploadAvatar", uploads, uploadAvatar)

//修改密码

router.post("/updatePassword", updatePassword)

//获取用户权限菜单
router.get("/getMenuList", getMenuList)
module.exports = router