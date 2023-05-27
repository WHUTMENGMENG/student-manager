let isChild = (currentRoleid, targetRoleid, roleList) => {

    //从完整的角色表roleList中根据目标角色id取出目标角色的数据对象

    let targetRole = roleList.find(item => item.roleid === targetRoleid)

    //声明一个布尔值,用于储存最终的判断结果,是不是自己的孩子

    let isChildFlag = true;

    //使用while循环,一直向上查找,直到节点没有parentid

    while (targetRole && targetRole.parentid) {
        //进行对比
        if (targetRole.parentid === currentRoleid) {
            //是自己的孩子
            isChildFlag = false;
            //跳出循环
            break;
        } else {
            //不是自己的孩子,继续向上查找
            targetRole = roleList.find(item => item.roleid === targetRole.parentid)
        }

    }
    //返回判断的结果
    return isChildFlag
}

module.exports = isChild;