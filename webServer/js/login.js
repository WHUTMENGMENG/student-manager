$(function () {
    $("#submit").click(function () {
        //获取输入框的用户名和密码
        let username = $("#username").val();
        let password = $("#password").val();

        //发送axios请求
        axios({
            url: "http://localhost:3000/users/login",
            method: "post",
            headers: {
                "Content-type": "application/json"
            },
            data: {
                username,
                password
            }
        })
            .then(res => {
                if (res.data.state) {

                    //将token 值存到本地存储
                    localStorage.setItem("token", res.data.token)
                    // window.location.href = "./show.html"
                    history.pushState(res.data.userInfo, null, "/show.html")
                    //在当前页面跳转入 0 的页面栈 解决history不刷新页面
                    history.go(0)
                } else {
                    alert("用户名或者密码错误")
                }
            })
            .catch(err => {
                alert("登入出错")
                console.log(err)
            })
    })
})