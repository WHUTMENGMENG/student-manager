const express = require("express")

const router = express.Router()
const { getList, addStudentsInfo, deleteStudent, updateStudent, getClasses, uploadStuAvatar, searchStu } = require("../controller/studentsController")

const upload = require("../middleware/multer")
//获取学员列表信息

router.get("/getstulist", getList)


//添加学员信息
router.post("/addstu", upload("headimgurl", "avatar"), addStudentsInfo)
//删除学员信息
router.get("/delstu", deleteStudent)
//更新学员信息
router.post("/updatestu", updateStudent)

//获取班级列表

router.get('/getclasses', getClasses)
//上传学员头像
router.post("/uploadStuAvatar", upload("headimgurl", "avatar"), uploadStuAvatar)

//搜索接口
router.get('/searchstu', searchStu)
module.exports = router