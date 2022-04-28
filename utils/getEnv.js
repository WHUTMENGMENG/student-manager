/**
 * 
 * @param {String} params 要查询的命令参数
 */
module.exports = function (params) {
    let env;

    let args = process.argv;
    let reg = new RegExp(`(?<=${params}\\=)\\w*`)//匹配env=后面的结果
    // console.log(reg)
    args.forEach(arg => {
        // console.log(args)
        env = arg.match(reg);
        if (env) {
            console.log('当前环境:'+env)
            env = env[0]
        }
    })
    return env
}