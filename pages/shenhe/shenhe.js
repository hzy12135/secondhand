var app = getApp()
let db = wx.cloud.database();
Page({
  data: {
    // 顶部菜单切换
    navbar: ["待审核", "审核通过", "审核未通过"],
    // 默认选中菜单
    currentTab: 0,
    goodList: [],
   
  },
  onShow() {
    this.getdaishenhe()
  },
  //顶部tab切换
  navbarTap: function (e) {
    let index = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: index
    })
    if (index == 0) { 
      this.getdaishenhe()
    } else if (index == 1) {
   
      this.getshenhetong();
    } else if (index == 2) {
      this.getnoshenhe()
    } 
  },
  //我发布的商品
  getdaishenhe() {
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    wx.cloud.callFunction({
        name: "getGoodList",
        data: {
          action: 'shenhe',
          status: '待审核'
        }
      })
      .then(res => {
        console.log('获取我发布的商品成功', res)
        this.setData({
          goodList: res.result.data
        })
      })
      .catch(res => {
        console.log('获取我发布的商品失败', res)
      })
  },
  getshenhetong() {
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    wx.cloud.callFunction({
        name: "getGoodList",
        data: {
          action: 'shenhe',
          status: '通过'
        }
      })
      .then(res => {
        console.log('获取我发布的商品成功', res)
        this.setData({
          goodList: res.result.data
        })
      })
      .catch(res => {
        console.log('获取我发布的商品失败', res)
      })
  },
  getnoshenhe() {
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    wx.cloud.callFunction({
        name: "getGoodList",
        data: {
          action: 'shenhe',
          status: '未通过'
        }
      })
      .then(res => {
        console.log('获取我发布的商品成功', res)
        this.setData({
          goodList: res.result.data
        })
      })
      .catch(res => {
        console.log('获取我发布的商品失败', res)
      })
  },
  
  
  //去商品详情页
  goDetail(e) {
    wx.navigateTo({
      url: '/pages/detail/detail?goodid=' + e.currentTarget.dataset.id
    })
  },
  //删除商品
  delete(e) {
    let id = e.currentTarget.dataset.id
    wx.cloud.callFunction({
      name: 'changeGood',
      data: {
        action: 'remove',
        id: id
      }
    }).then(res => {
      console.log('删除成功', res)
      wx.showToast({
        title: '删除成功'
      })
      this.getdaishenhe();
      this.getshenhetong();
      this.getnoshenhe();
    }).catch(res => {
      console.log('删除失败', res)
      wx.showToast({
        icon: 'none',
        title: '删除失败'
      })
    })

  },


})