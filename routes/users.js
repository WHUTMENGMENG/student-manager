const express = require("express");

const router = express.Router();

const { register, login, uploadAvatar, updatePassword, getAllUsers } = require("../controller/usersController")

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


//获取所有用户
router.get("/getAllUsers", getAllUsers)
module.exports = router