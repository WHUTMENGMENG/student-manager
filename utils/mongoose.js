//mongoose连接数据库的核心逻辑写在此处

let mongoose = require("mongoose");

let url = "mongodb://127.0.0.1:27017/H51901";

mongoose.connect(url, { useNewUrlParser: true })//加上{ useNewUrlParser: true } 可以去除控制台mongo的警告

let db = mongoose.connection

db.on("error", () => {
    console.log("连接错误")
})

db.once("open", () => {
    console.log("数据库连接成功")
})

module.exports = {
    mongoose,
    db
}