$(function () {
    //获取用户信息
    let userInfo = history.state //获取浏览器history api传递过来的参数
    //将用户信息存储在sessionStorage
    console.log(userInfo)
    sessionStorage.setItem("userInfo", JSON.stringify(userInfo))

    //从sessionStorage里面获取信息 对用户信息进行渲染
    let info = sessionStorage.getItem("userInfo")
    info = JSON.parse(info)
    console.log(info)
    $("#avatar").attr("src", info.avatarUrl)
    $("#nickname").text(info.nickname)
})