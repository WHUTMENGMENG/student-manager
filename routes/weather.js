const express = require("express");
const router = express.Router();
const ctrl = require("../controller/weatherController")
//获取天气
router.get("/getWeather", ctrl.getWeather)
//修改天气账户
router.get("/updateWeatherCount", ctrl.updateWeatherCount)
module.exports = router