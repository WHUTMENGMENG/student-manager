const moment = require('moment')//格式化时间的插件

const { find, add, del, update } = require("../model/studentsModel")
//getlist 获取学员信息
const getList = async (req, res) => {

    let page = req.query['page'] || 1;
    let count = req.query['count'] || 3;
    let classes = req.query['class']
    let query = {
        class: classes ? classes : "H51901"
    }
    let counts = {
        skip: (JSON.parse(page) - 1) * count,
        count: JSON.parse(count)
    }

    //get请求下获取query参数 req.query
    let result = await find(query, counts)//model层里面的find方法
    //只要model层返回一个数组类型的数据 说明查找是成功的

    if (Array.isArray(result)) {
        res.send({
            status: 1,
            state: true,
            msg: "请求成功",
            data: result
        })
    } else {
        res.send({
            status: 0,
            state: false,
            msg: "查找出错",
            err: result
        })
    }
}
//login

//register

//删除
const deleteStudent = async (req, res) => {
    //删除需要传递一个参数 sId
    let { sId } = req.query
    if (!sId) {
        //如果前端没有传递sId
        res.send({ status: 0, state: false, msg: "没有传递sId" })
        return
    }
    let query = {
        sId: sId
    }
    let result = await del(query)
    if (result.n) {
        res.send({ status: 1, state: true, msg: "删除成功" })
    } else {
        res.send({ status: 0, state: false, msg: "删除出错" })
    }
}
//更新
const updateStudent = async (req, res) => {
    // 获取sId 作为更新条件
    let { sId } = req.body;
    let query = {
        sId: sId
    }
    let updated = req.body;

    let result = await update(query, updated)

    res.send(result)
}
//增加
const addStudentsInfo = async (req, res) => {
    //通过 req.body获取 post请求传递过来的参数
    let cTime = moment().format("YYYY/MM/DD hh:mm:ss")
    req.body.cTime = cTime

    //给学员生成一个sID
    //说明可以注册 生成用户id 并且调用model层里面save的方法
    //用户id: abcdef123456 六位字母+六位id
    let letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let code = "1234567890"
    const randomId = (str, len) => {
        let randomStr = [];
        let letterLen = str.length;
        for (var i = 0; i < len; i++) {
            let random = Math.floor(Math.random() * letterLen);
            randomStr.push(str.charAt(random))
        }
        return randomStr.join("")
    }
    let sId = randomId(letter, 4) + randomId(code, 8)
    req.body.sId = sId
    let params = req.body;
    //判断用户没有传递参数的情况
    let flag = Object.keys(params)//object.keys可以获取一个对象里面素有的key 并返回一个数组
    if (!flag.length) {
        res.send({
            status: 0,
            state: false,
            msg: "不能传递参数为空"
        })
        return
    }

    //调用model增加的方法
    let result = await add(params)
    if (result) {//表示数据插入成功
        res.send({ status: 1, state: true, msg: "添加成功" })
    } else {
        res.send({
            status: 0,
            state: false,
            msg: "参数少传递了"
        })
    }

}

module.exports = {
    getList,
    addStudentsInfo,
    deleteStudent,
    updateStudent
}