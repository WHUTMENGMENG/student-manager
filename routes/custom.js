//1.引入express
let express = require("express");

//2.调用express下面的方法 Router()创建一个路由

let router = express.Router()

router.get("/", (req, res) => {
    console.log(req.path)//获取前端访问的路径
    // res.send("坤坤你最棒")
    //如果要动态解析模板 需要把send变成render
    res.render("custom", { title: "你看这个碗它又大又圆,你看这根面,它又大又宽", str: "<del>$99.99</del>", arr: ["吃饭", "睡觉", "打篮球"] })//1.指定哪一个模板 2.传递的参数
})

//3.暴露当前路由

module.exports = router