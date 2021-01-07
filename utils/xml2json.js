const parseString = require("xml2js").parseString;

const parseXML = xml => {
    let res;
    parseString(xml, function (err, result) {
        if (err) {
            console.log(err);
            return false
        }
        res = result

    });
    res = { ...res.xml }
    for (let k in res) {
        console.log(k);
        res[k] = res[k] + ""
        res[k] = res[k].replace(/[\[\]]./g, "")
    }
    return res
}
//1
module.exports = parseXML