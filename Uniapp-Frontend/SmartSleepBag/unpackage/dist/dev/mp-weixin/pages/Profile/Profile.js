"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "Profile",
  setup(__props) {
    const userInfo = common_vendor.ref({
      avatar: "/static/avatar.png",
      name: "糯米妈妈",
      phone: "138****8888"
    });
    const babyInfo = common_vendor.ref({
      name: "小糯米",
      birthday: "2025-09-01",
      gender: "女宝宝",
      height: 62,
      weight: 6.5
    });
    const deviceInfo = common_vendor.ref({
      name: "智能睡袋-01",
      battery: 85,
      version: "v2.1.0"
    });
    const changeAvatar = () => {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          userInfo.value.avatar = tempFilePaths[0];
          common_vendor.index.showToast({
            title: "头像更新成功",
            icon: "success"
          });
        }
      });
    };
    const editProfile = () => {
      common_vendor.index.showToast({
        title: "编辑资料",
        icon: "none"
      });
    };
    const editBabyInfo = () => {
      common_vendor.index.showToast({
        title: "编辑宝宝信息",
        icon: "none"
      });
    };
    const checkUpdate = () => {
      common_vendor.index.showToast({
        title: "已是最新版本",
        icon: "none"
      });
    };
    const goToSetting = (type) => {
      const titles = {
        notification: "通知设置",
        temperature: "温度报警阈值",
        privacy: "隐私设置",
        about: "关于我们"
      };
      common_vendor.index.showToast({
        title: titles[type],
        icon: "none"
      });
    };
    const logout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        confirmColor: "#ff69b4",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: userInfo.value.avatar,
        b: common_vendor.o(changeAvatar),
        c: common_vendor.t(userInfo.value.name),
        d: common_vendor.t(userInfo.value.phone),
        e: common_vendor.o(editProfile),
        f: common_vendor.o(editBabyInfo),
        g: common_vendor.t(babyInfo.value.name),
        h: common_vendor.t(babyInfo.value.birthday),
        i: common_vendor.t(babyInfo.value.gender),
        j: common_vendor.t(babyInfo.value.height),
        k: common_vendor.t(babyInfo.value.weight),
        l: common_vendor.t(deviceInfo.value.name),
        m: common_vendor.t(deviceInfo.value.battery),
        n: deviceInfo.value.battery + "%",
        o: deviceInfo.value.battery > 60 ? 1 : "",
        p: deviceInfo.value.battery > 20 && deviceInfo.value.battery <= 60 ? 1 : "",
        q: deviceInfo.value.battery <= 20 ? 1 : "",
        r: common_vendor.t(deviceInfo.value.version),
        s: common_vendor.o(checkUpdate),
        t: common_vendor.p({
          type: "gear",
          size: "26"
        }),
        v: common_vendor.o(($event) => goToSetting("notification")),
        w: common_vendor.p({
          type: "notification",
          size: "26"
        }),
        x: common_vendor.o(($event) => goToSetting("temperature")),
        y: common_vendor.p({
          type: "locked",
          size: "26"
        }),
        z: common_vendor.o(($event) => goToSetting("privacy")),
        A: common_vendor.p({
          type: "contact",
          size: "26"
        }),
        B: common_vendor.o(($event) => goToSetting("about")),
        C: common_vendor.o(logout)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4c73b8ec"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Profile/Profile.js.map
