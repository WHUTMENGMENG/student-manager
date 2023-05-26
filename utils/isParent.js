let isParent = (currentid, targetid, fullRoleList) => {
    //如果修改的是自己的权限可以直接通过
    if (currentid == targetid) return true;
    //先通过currentid查找到自身的数据对象
    let current = fullRoleList.find(item => item.roleid == currentid);
    //查找到自身之后,判断自身的parentid是否等于targetid
    if (current) {
        //可以递归查找自己的父级id是不是等于targetid
        return isParent(current.parentid, targetid, fullRoleList)
    } else {
        return false
    }
}

module.exports = isParent;