const multer = require("multer");
const path = require("path") //内置模块 专门用于解析路径
const uploads = (req, res, next) => {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            let pathStr = path.resolve("assets/avatar")
            console.log(pathStr)
            console.log(file)
            cb(null, pathStr) //设置上传文件的存储路径
        },
        filename: function (req, file, cb) {
            //处理文件名字 由于上传的文件没有后缀名 所以需要解析后缀名给上传的文件添加

            let filenames = file.fieldname + '-' + Date.now();
            //获取文件后缀名 originalname  
            //dsfsf....gif
            let RegExp = /\.[^\.]+$/;
            let match = RegExp.exec(file.originalname)
            let extendsName = match[0]

            //将avatar的文件路径存到数据库里面
            req.body.avatarUrl = "/avatar/" + filenames + extendsName

            cb(null, filenames + extendsName)//处理上传文件的文件名
        }
    })

    var upload = multer({ storage: storage }).single("avatar");

    upload(req, res, function (err) {//multer模块 错误处理
        if (err instanceof multer.MulterError) {
            console.log(err)
            res.send("上传文件出错")
        } else {
            next() //如果上传文件没有错误 那么释放控制权给下一个中间件
        }
    })
}

module.exports = uploads


// uploads()