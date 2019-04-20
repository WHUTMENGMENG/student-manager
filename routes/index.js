var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("hello word"); //表示响应结束 后面的代码不会执行
  console.log("123")
});

module.exports = router;
