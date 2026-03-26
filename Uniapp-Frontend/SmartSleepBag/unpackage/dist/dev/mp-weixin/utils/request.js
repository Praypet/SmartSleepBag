"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://localhost:8086";
function request(config = {}) {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: BASE_URL + config.url,
      data: config.data || {},
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data);
        } else if (res.data.code === 400) {
          common_vendor.index.__f__("log", "at utils/request.js:12", res.data.errMsg);
          common_vendor.index.showModal({
            showCancel: false,
            title: "错误提示",
            content: res.data.errMsg
          });
          reject(res.data);
        } else {
          common_vendor.index.showToast({
            title: res.data.errMsg,
            icon: "none"
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
