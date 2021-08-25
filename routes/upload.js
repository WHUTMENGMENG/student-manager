const express = require("express")

const router = express.Router()
const upload = require("../middleware/multer")
router.post("/uploadImg", upload("img", "images"), function (req, res) {
    if(!req.body['img']){
        res.send({state:false,status:1005,msg:"没有上传图片"})
        return
    }
    res.send({ state: true, status: 200, imgUrl: req.body['img'] })
})

module.exports = router