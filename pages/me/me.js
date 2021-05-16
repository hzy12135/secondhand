const app = getApp();
let db = wx.cloud.database();

Page({
  // 页面的初始数据
  data: {

    isShowUserName: false,
    userInfo: null,


  },

 
  onLoad() {
    
    db.collection("user").where({
        _openid: 'openid'
      })
      .get()
      .then(res => {
        console.log("res", res);
        this.setData({
          userlist: res.data
        })
        let userlist = this.data.userlist;
        if (userlist.length == 0) {
          this.setuser()
          console.log("用户信息上传成功");
        } else {
          console.log("已有用户");
        }
      })
      .catch(err => {
        console.log("请求失败", err);
      })
  },
  setuser() {
    var user = wx.getStorageSync('user');
    db.collection("user").add({
        data: {
          user_name: user.nickName,
          user_img: user.avatarUrl,
          _createTime: new Date().getTime()
        }
      }).then(res => {
        console.log("用户信息上传成功", res);
      })
      .catch(res => {
        console.log("用户信息上传失败", res);
      })

  },

  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log("获取用户信息成功", res)
        let user = res.userInfo
        wx.setStorageSync('user', user) //保存用户信息到本地缓存
        this.setData({
          isShowUserName: true,
          userInfo: user,
        })
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      }
    })
  },

  //退出登录
  tuichu() {
    this.setData({
      isShowUserName: false,
      userInfo: null,
    })
    app._saveUserInfo(null);
  },
  onShow(options) {
    
    this.getUserProfile()
    var user = wx.getStorageSync('user'); //从本地缓存去用户信息
    if (user && user.nickName) { //如果本地缓存有信息就显示本地缓存
      this.setData({
        isShowUserName: true,
        userInfo: user,
      })

    }

  },


  // 去我的订单页
  goToMyOrder: function () {
    wx.navigateTo({
      url: '/pages/myOrder/myOrder',
    })
  },
  // 去我的评论页
  goToMyComment: function () {
    wx.navigateTo({
      url: '/pages/myComment/myComment',
    })
  },
  //去我的发布页
  goToSeller() {
    wx.navigateTo({
      url: '/pages/seller/seller',
    })
  },
  goToshenhe() {
    wx.navigateTo({
      url: '/pages/shenhe/shenhe',
    })
  },


  // onShow() {
  //   var user = app.globalData.userInfo;
  //   if (user && user.nickName) {
  //     this.setData({
  //       isShowUserName: true,
  //       userInfo: user,
  //     })
  //   }
  // },
  
   // button获取用户信息
  // onGotUserInfo: function (e) {
  //   console.log('用户信息', e)
  //   if (e.detail.userInfo) {
  //     var user = e.detail.userInfo;
  //     this.setData({
  //       isShowUserName: true,
  //       userInfo: e.detail.userInfo,
  //     })
  //     user.openid = app.globalData.openid;
  //     app._saveUserInfo(user);
  //   } else {
  //     app.showErrorToastUtils('登陆需要允许授权');
  //   }
  // },
  // 添加用户信息
})