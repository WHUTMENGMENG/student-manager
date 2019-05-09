const express = require("express")

const router = express.Router()
const { getList, addStudentsInfo, deleteStudent, updateStudent,getClasses } = require("../controller/studentsController")
//获取学员列表信息

router.get("/getstulist", getList)


//添加学员信息
router.post("/addstu", addStudentsInfo)


//删除学员信息

router.get("/delstu", deleteStudent)

//更新学员信息
router.post("/updatestu", updateStudent)

//获取班级列表

router.get('/getclasses',getClasses)
module.exports = router