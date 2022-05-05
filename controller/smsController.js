"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// This file is auto-generated, don't edit it
var dysmsapi20170525_1 = require("@alicloud/dysmsapi20170525"), $Dysmsapi20170525 = dysmsapi20170525_1;
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
var $OpenApi = require("@alicloud/openapi-client");
var tea_console_1 = require("@alicloud/tea-console");
var tea_util_1 = require("@alicloud/tea-util");
var $tea = require("@alicloud/tea-typescript");
// 验证码失效队列
let codeQueue = {};
var Client = /** @class */ (function () {
    function Client() {
    }
    /**
     * 使用AK&SK初始化账号Client
     * @param accessKeyId
     * @param accessKeySecret
     * @return Client
     * @throws Exception
     */
    Client.createClient = function (accessKeyId, accessKeySecret) {
        var config = new $OpenApi.Config({
            // 您的AccessKey ID
            accessKeyId: accessKeyId,
            // 您的AccessKey Secret
            accessKeySecret: accessKeySecret
        });
        // 访问的域名
        config.endpoint = "dysmsapi.aliyuncs.com";
        return new dysmsapi20170525_1["default"](config);
    };
    Client.send = function (req, res, { signName = "千锋摸鱼欧阳锋管理系统", templateCode = "SMS_239326920", phoneNumbers = 0, code = '66666' }) {
        // console.log(signName)
        return __awaiter(this, void 0, void 0, function () {
            var client, sendSmsRequest, resp, respJSON;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:

                        client = Client.createClient("LTAI5t7YUzzyMpVDvbNm3fb2", "kO9WSY2DCouqLOfA9MnmRUou9KXdce");
                        sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
                            signName,
                            templateCode,
                            phoneNumbers,
                            templateParam: `{code:${code}}`
                        });
                        // return [4 /*yield*/, client.sendSms(sendSmsRequest)];
                        client.sendSms(sendSmsRequest).then(r => {
                            // console.log(r.body.code.toLowerCase)
                            if (r.body.code.toLowerCase() === "ok") {

                                //添加到session
                                req.session.smsCode = code;
                                //获取ression中的sessionID,使用sessionID作为验证码过期的定时器标识
                                let sid = req.sessionID
                                //如果重新发送了,重置验证码生效时间
                                if (codeQueue[sid]) {
                                    clearTimeout(codeQueue[sid])
                                }
                                //设置验证码生效时间 默认30分钟
                                codeQueue[sid] = setTimeout(() => {
                                    req.session.smsCode = null;
                                    // 时间到清除当前队列中的标识,减少内存占用
                                    delete codeQueue[sid]
                                }, 1000 * 60 * 60)
                                //code添加到队列中,目的是好调试
                                codeQueue['code'] = code;
                                //将用户输入的手机好存到session

                                console.log("手机验证码:" + codeQueue.code)
                                req.session.phone = phoneNumbers;
                                // console.log(req.session)
                                res.send({ status: 200, state: true, msg: r.body.message, ...r.body })
                            } else {
                                res.send({ status: 4003, state: false, msg: r.body.message, ...r.body })
                            }

                        })
                    case 1:
                        resp = _a.sent();
                        tea_console_1["default"].log(tea_util_1["default"].toJSONString($tea.toMap(resp)));
                        respJSON = tea_util_1["default"].toJSONString($tea.toMap(resp));
                        // console.log('----', resp);
                        return [2 /*return*/];
                }
            });
        });
    };
    return Client;
}());
exports["default"] = Client;

