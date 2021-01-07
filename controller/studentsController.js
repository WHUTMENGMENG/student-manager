const moment = require('moment')//格式化时间的插件
const { find, add, del, update, getTotal } = require("../model/studentsModel")

//getlist 获取学员信息
const getList = async (req, res) => {

    let page = req.query['page'] || 1;
    let count = req.query['count'] || 0;
    let classes = req.query['class']
    let key = req.query['key'] || ""
    let query = {
        class: classes ? classes : new RegExp(".+"),
        name: new RegExp(key)
    }
    let counts = {
        skip: (JSON.parse(page) - 1) * count,
        count: JSON.parse(count)
    }

    //get请求下获取query参数 req.query
    let total = await getTotal(query)
    let result = await find(query, counts)//model层里面的find方法
    //只要model层返回一个数组类型的数据 说明查找是成功的

    if (Array.isArray(result)) {
        res.send({
            status: 1,
            state: true,
            msg: "请求成功",
            total,
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
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.substr(7)
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
        res.send({ status: 1, state: true, msg: "删除成功,操作者为:" + ip })
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

    if (result.nModified !== 0) {
        res.send({ status: 200, state: true, msg: "更新成功" })
    } else {
        res.send({ status: 304, state: false, msg: "没有做任何修改" })
    }

}
//增加
const addStudentsInfo = async (req, res) => {
    //通过 req.body获取 post请求传递过来的参数
    let cTime = moment().format("YYYY/MM/DD HH:mm:ss a")
    req.body.cTime = cTime
    //给学员生成一个sID
    let sId = Math.random().toString(32).substr(2)
    req.body.sId = sId
		if(!req.body['headimgurl']) req.body.headimgurl=""
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
    if (!result['errors']) {//表示数据插入成功
        res.send({ status: 1, state: true, msg: "添加成功" })
    } else {
        res.send({
            status: 0,
            state: false,
            msg: result['message']
        })
    }

}
//获取班级信息
const getClasses = async (req, res) => {
    let page = req.query['page'] || 1;
    let count = req.query['count'] || 0;
    let counts = {
        skip: (JSON.parse(page) - 1) * count,
        count: JSON.parse(count)
    }
    //get请求下获取query参数 req.query
    let result = await find(null, counts)//model层里面的find方法

    //如果返回不是数组说明数据库出错 要阻止代码运行
    if (!Array.isArray(result)) {
        res.send({ status: 500, state: false, msg: "获取出错" })
    }

    let classes = result.map(item => item.class)
    //数组去重
    let uniq = (array) => {
        if (!Array.isArray(array)) {
            res.send(new Error("需要传入一个数组"))
        }
        let obj = {}, newArr = []
        array.forEach(item => {
            if (!obj[item]) {
                console.log(obj[item])
                newArr.push(item)
                obj[item] = 1;
            }
        })
        return newArr
    }
    let uniqClasses = uniq(classes);
    res.send({ status: 200, state: true, data: uniqClasses })
}
//上传头像
const uploadStuAvatar = (req, res) => {
    if (req.body["headimgurl"]) {
        res.send({
            status: 200,
            state: true,
            msg: "上传成功",
            headimgurl: req.body["headimgurl"]
        })

    } else {
        res.send({ status: 500, state: false, msg: "上传失败" })
    }

}

//搜索

const searchStu = async (req, res) => {
    let key = req.query.key;
    let page = req.query['page'] || 1;
    let count = req.query['count'] || 0;
    let counts = {
        skip: (JSON.parse(page) - 1) * count,
        count: JSON.parse(count)
    }
    let query = {
        name: new RegExp(key) || ""
    }
    let total = await getTotal(query)
    let result = await find(query, counts)
    // console.log(total)

    if(result){
		 res.send({ status: 200, state: true, total: total, data: result })
    }else {
		 res.send({ status: 400, state: false, msg:"搜索出错" })
    }
       
   
}

module.exports = {
    getList,
    addStudentsInfo,
    deleteStudent,
    updateStudent,
    getClasses,
    uploadStuAvatar,
    searchStu
}