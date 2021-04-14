const { mongoose, db } = require("../utils/mongoose")
const schema = mongoose.Schema({
    cityid: String,
    date: String,
    week: String,
    update_tim: String,
    city: String,
    cityEn: String,
    country: String,
    countryEn: String,
    wea: String,
    wea_img: String,
    tem: String,
    tem1: String,
    tem2: String,
    win: String,
    win_speed: String,
    win_meter: String,
    humidity: String,
    visibility: String,
    pressure: String,
    air: String,
    air_pm25: String,
    air_level: String,
    air_tips: String,
    alarm: Object,
    aqi: Object
}, {
    versionKey: false // You should be aware of the outcome after set to false
})

let Collection = mongoose.model("weather", schema)
//查询天气
let find_weather = (query = {}) => {
    return Collection.find(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}

//保存天气

let save_weather = (params) => {
    // 实例化集合
    // console.log(params)
    let coll = new Collection(params)
    return coll.save()
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}
//删
const del_weather = (query) => {
    return Collection.deleteOne(query)
        .then(res => res)
        .catch(err => {
            console.log(err)
            return false
        })
}
//改
const update_weather = (query, updated) => {
    return Collection.updateOne(query, updated)
        .then(res => res)
        .catch(err => {
            console.log(err);
            return false
        })
}

module.exports = {
    find_weather,
    save_weather,
    update_weather,
    del_weather
}