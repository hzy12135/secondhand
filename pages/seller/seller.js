var app = getApp()
let db = wx.cloud.database();
Page({
  data: {
    // 顶部菜单切换
    navbar: ["我发布的", "待发货", "待用户评价", "已完成"],
    // 默认选中菜单
    currentTab: 0,
    goodList: [],
    orderList: [],
  },
  onShow() {
    this.getMySellGood()
  },
  //顶部tab切换
  navbarTap: function (e) {
    let index = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: index
    })
    if (index == 0) { //我发布的
      this.getMySellGood()
    } else if (index == 1) { //待发货
      //-1订单取消,0新下单发货,1已收货待评价,2订单已完成
      this.getOrderList(0);
    } else if (index == 2) { //待用户评价
      this.getOrderList(1)
    } else if (index == 3) { //已完成
      this.getOrderList(2)
    }
  },
  //我发布的商品
  getMySellGood() {
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    wx.cloud.callFunction({
        name: "getGoodList",
        data: {
          action: 'seller'
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


  // 获取用户订单列表
  getOrderList(status) {
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    //请求自己后台获取用户openid
    wx.cloud.callFunction({
        name: 'getOrderList',
        data: {
          action: 'seller',
          status: status
        }
      })
      .then(res => {
        console.log("用户订单列表", res)
        this.setData({
          list: res.result.data
        })
      }).catch(res => {
        console.log("用户订单列表失败", res)
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
      this.getMySellGood()
    }).catch(res => {
      console.log('删除失败', res)
      wx.showToast({
        icon: 'none',
        title: '删除失败'
      })
    })

  },
  //去发布页
  goFabu() {
    wx.switchTab({
      url: '/pages/fabu/fabu',
    })
  },
  //已送货
  songda(e) {
    let id = e.currentTarget.dataset.id
    wx.cloud.callFunction({
      name: 'changeGood',
      data: {
        action: 'songda',
        id: id
      }
    }).then(res => {
      console.log('修改订单成功', res)
      wx.showToast({
        title: '修改订单成功'
      })
      //-1订单取消,0新下单发货,1已收货待评价,2订单已完成
      this.getOrderList(0)
    }).catch(res => {
      console.log('修改订单失败', res)
      wx.showToast({
        icon: 'none',
        title: '修改订单失败'
      })
    })
  },
})