#学员项目管理系统api接口

## 使用

**补齐依赖**

```
npm install
```

**开启服务**

```
npm start
```

#基础地址:http://106.12.79.128

## 获取登入日志 

|   接口详情   | 请求方式 |     地址     |
| :----------: | :------: | :----------: |
| 获学登入日志 |   get    | /getloginlog |

| 参数  | 是否必填 |          说明           |
| :---: | :------: | :---------------------: |
| page  |    否    |          页码           |
| count |    否    | 每次返回几条 默认返回10 |

成功返回值

```
{
    "status": 200,
    "state": true,
    "msg": "success",
    "data": [
        {
            "_id": "5cd964db16bd6f346879cf77",
            "username": "cxk",
            "lastLogin": {
                "loginTime": "2019/05/13 20:36:26",
                "ip": ""
            },
            "nowLogin": {
                "ip": "",
                "loginTime": "2019/05/13 20:36:43"
            },
            "__v": 0
        },
        {
            "_id": "5cd964ca16bd6f346879cf76",
            "username": "cxk",
            "lastLogin": {
                "loginTime": "2019/05/13 20:36:00",
                "ip": ""
            },
            "nowLogin": {
                "ip": "",
                "loginTime": "2019/05/13 20:36:26"
            },
            "__v": 0
        }
    ]
}
```



## 获取班级列表

| 接口详情 | 请求方式 |         地址         |
| :------: | :------: | :------------------: |
| 班级列表 |   get    | /students/getclasses |

成功返回值

```
{
    "status": 200,
    "state": true,
    "data": [
        "H51901",
        "H51902"
    ]
}
```



## 获取学员信息

|  接口详情  | 请求方式 |         地址         |
| :--------: | :------: | :------------------: |
| 获学员信息 |   get    | /students/getstulist |

| 参数  | 是否必填 |         说明         |
| :---: | :------: | :------------------: |
| page  |    否    |         页码         |
| count |    否    |     每次返回几条     |
| class |    否    | 默认是全部班级的数据 |

成功返回值

```
{
    "status": 1,
    "state": true,
    "msg": "请求成功",
    "total": 2,
    "data": [
        {
            "_id": "5cd3c534e1e75b0ea034cf83",
            "name": "谭鹏",
            "age": "21",
            "class": "H51901",
            "city": "重庆",
            "degree": "专科",
            "productUrl": "地址",
            "description": "O(∩_∩)O哈哈~",
            "cTime": "2019/05/09 02:14:12",
            "sId": "WWLN97178546",
            "__v": 0
        }
    ]
}
```



## 增加学员信息

|   接口详情   | 请求方式 |    接口地址     |
| :----------: | :------: | :-------------: |
| 增加学员信息 |   post   | students/addstu |

|    参数     | 是否必填 |        描述        |
| :---------: | :------: | :----------------: |
|    class    |    是    |        班级        |
|    name     |    是    |     学员的名字     |
|     age     |    是    |     学员的年龄     |
|    city     |    是    |   目前居住的城市   |
|   degree    |    是    |        学历        |
| productUrl  |    否    |      项目地址      |
| description |    是    | 一句话对自己的评价 |
|   avatar    |    否    |        头像        |
|    token    |    是    |   用户认证token    |

增加成返回值

```
{
    "status": 1,
    "state": true,
    "msg": "添加成功"
}
```

## 删除学员信息

|  接口详情  | 请求方式 |       接口地址       |
| :----: | :--: | :--------------: |
| 删除学员信息 | get  | /students/delstu |

|  参数   | 是否必填 |   描述   |
| :---: | :--: | :----: |
|  sId  |  是   | 当前学员id |
| token |  是   | token值 |

```
// 删除成功
{
  "status": 1,
  "state": true,
  "msg": "删除成功"
}
```

## 修改学员信息

|  接口详情  | 请求方式 |        接口地址         |
| :----: | :--: | :-----------------: |
| 修改用户密码 | post | /students/updatestu |

|     参数      | 是否必填 |    描述     |
| :---------: | :--: | :-------: |
|     sId     |  是   |   用户Id    |
|    token    |  是   |  token值   |
|    name     |  否   |   学员的名字   |
|     age     |  否   |   学员的年龄   |
|    city     |  否   |  目前居住的城市  |
|   degree    |  否   |    学历     |
| productUrl  |  否   |   项目地址    |
| description |  否   | 一句话对自己的评价 |
|   avatar    |  否   |    头像     |

## 搜索学员
| 接口详情 | 请求方式 |        地址         |
| :------: | :------: | :-----------------: |
| 搜索学员 |   get    | /students/searchstu |

| 参数 | 是否必填 |      描述      |
| :--: | :------: | :------------: |
| key  |    否    | 传入学员的姓名 |
## 注册接口

|  接口详情  | 请求方式 |       地址        |
| :----: | :--: | :-------------: |
| 用户注册接口 | post | /users/register |

|    参数    | 是否必填 |  描述  |
| :------: | :--: | :--: |
| username |  是   | 用户名  |
| password |  是   |  密码  |
|  phone   |  否   | 手机号  |
| nickname |  是   |  昵称  |
|  roles   |  否   |  权限  |

```
注册成功返回值
{
	"status": 1,
	"state": true,
	"msg": "注册成功",
	"userInfo": {
		"username": "lbw4",
		"nickname": "开哥永不开挂",
		"phone": "1577775772"
	}
}
注册失败返回值
{
	"status": 0,
	"state": false,
	"msg": "用户名已注册"
}
```

## 登入接口

| 接口详情 | 请求方式 |      地址      |
| :--: | :--: | :----------: |
| 用户登入 | post | /users/login |

| 参数       | 是否必填 | 描述   |
| -------- | ---- | ---- |
| username | 是    | 账户   |
| password | 是    | 密码   |

```
登入成功返回值
{
	"status": 1,
	"state": true,
	"msg": "登入成功",
	"userInfo": {
		"username": "lbw4",
		"nickname": "开哥永不开挂",
		"phone": "1577775772"
	}
}
登入失败返回值
{
	"status": 0,
	"state": false,
	"msg": "用户名或者密码错误"
}
```

## 退出登入接口

| 接口详情 | 请求方式 |     接口地址      |
| :--: | :--: | :-----------: |
| 退出登入 | get  | /users/sigout |

## 上传用户头像接口

| 接口详情 | 请求方式 |        接口地址         |
| :--: | :--: | :-----------------: |
| 上传头像 | post | /users/uploadAvatar |


|   参数   | 是否必填 |   描述    |
| :----: | :--: | :-----: |
| avatar |  是   | 上传的图片文件 |
|  uId   |  是   | 当前用户的id |
| token  |  是   | token值  |

```
//成功数据
{
  "status": 1,
  "state": true,
  "msg": "图片上传成功"
}
```

## 上传学员头像接口

|   接口详情   | 请求方式 |         接口地址          |
| :----------: | :------: | :-----------------------: |
| 上传学员头像 |   post   | /students/uploadStuAvatar |

|  参数  | 是否必填 |             描述             |
| :----: | :------: | :--------------------------: |
| avatar |    是    | 上传的文件格式 jpg\|png\|gif |
```
//成功数据
{
    status: 200,
    state: true,
    msg: "上传成功",
    avatarUrl:http://106.12.79.128xxxx
 }
```

## 校验登入状态

|   接口详情   | 请求方式 |  接口地址   |
| :------: | :--: | :-----: |
| 验证用户登入状态 |  *   | /verify |

## 修改用户密码接口

|  接口详情  | 请求方式 |         接口地址          |
| :----: | :--: | :-------------------: |
| 修改用户密码 | post | /users/updatePassword |

|     参数      | 是否必填 |    描述    |
| :---------: | :--: | :------: |
|  username   |  是   |   用户名    |
| oldPassword |  是   |  原来的密码   |
| newPassword |  是   | 需要修改的新密码 |
|    token    |  是   |  token值  |

```
//修改成功值
{
  "status": 1,
  "state": true,
  "msg": "密码修改成功"
}
//用户名不存在返回值
{
  "status": 0,
  "state": false,
  "msg": "不存在此用户"
}
//修改失败
{
  "status": 0,
  "state": false,
  "msg": "密码修改错误"
}
```










