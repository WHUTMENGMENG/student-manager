const multer = require("multer");
const path = require("path"); //内置模块 专门用于解析路径
const fs = require("fs");
/**
 * 
 * @param {string} params 传入的图片字段 
 * @param {string} staticPath 保存的静态资源的路径 
 */
const uploads = (params, staticPath) => (req, res, next) => {
    // console.log(777777777777777)
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            let isExists = fs.existsSync(path.resolve("public",staticPath));
            if (!isExists) {
                fs.mkdirSync(path.resolve("public",staticPath))
            }
            let pathStr = path.resolve("public/" + staticPath)
            // console.log(pathStr)
            console.log(file + "=----")
            cb(null, pathStr) //设置上传文件的存储路径
        },
        filename: function (req, file, cb) {
            //处理文件名字 由于上传的文件没有后缀名 所以需要解析后缀名给上传的文件添加
            console.log(file + "=----")
            let filenames = file.fieldname + '-' + Date.now();
            //获取文件后缀名 originalname  
            //dsfsf....gif
            let RegExp = /\.[^\.]+$/;
            let match = RegExp.exec(file.originalname)
				let extendsName = ""
           try  {
			 extendsName = match[0]
           }catch(err){
			res.send({state:false,status:10022,msg:'error please note the upload field:headimgurl'})
				return
           }
            //将avatar的文件路径存到数据库里面
            req.body[params] = "https://chst.vip/" + staticPath + "/" + filenames + extendsName
            // console.log("===========", req.body)
            cb(null, filenames + extendsName)//处理上传文件的文件名
        }
    })

    var upload = multer({ storage: storage }).single(params);

    upload(req, res, function (err) {//multer模块 错误处理
        if (err instanceof multer.MulterError) {
            console.log(err)
            res.send({ err: err.message, msg: "上传文件出错,please note the upload field:headimgurl" })
				return
        } else {
            console.log(next)
            next() //如果上传文件没有错误 那么释放控制权给下一个中间件
        }
    })
}

module.exports = uploads


// uploads()