const { findLog } = require("../model/logModel")

const getLoginLog = async (req, res) => {
    let page = req.query['page'] || 1;
    let count = req.query['count'] || 10;
    let counts = {
        skip: (page - 1) * count,
        limit: count - 0
    }
    let result = await findLog(null, counts)
    if (result) {
        res.send({ status: 200, state: true, msg: "success", data: result })
    } else {
        res.send({ status: 501, state: false, msg: "failed" })
    }

}

module.exports = {
    getLoginLog
}