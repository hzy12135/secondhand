//JS
var app = getApp()
let orderStatus = 0; //-1订单取消,0新下单发货,1已收货待评价,2订单已完成
let db = wx.cloud.database();
Page({
  data: {
    navbar: ["待收货", "待评价", "已完成", "已取消"],
    // 默认选中菜单
    currentTab: 0,
    isShowComment: false, //是否显示评论框
    list: []
  },
  //顶部tab切换
  navbarTap: function (e) {
    let index = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: index
    })
    if (index == 0) {
      orderStatus = 0;
    } else if (index == 1) {
      orderStatus = 1;
    } else if (index == 2) {
      orderStatus = 2;
    } else if (index == 3) {
      orderStatus = -1;
    } else {
      orderStatus = 0;
    }
    this.getMyOrderList();
  },

  onShow: function () {
    this.getMyOrderList();
  },

  getMyOrderList() {
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    wx.cloud.callFunction({
        name: 'getOrderList',
        data: {
          action: 'user',
          orderStatus: orderStatus
        }
      })
      .then(res => {
        console.log("我的订单列表", res)
        this.setData({
          list: res.result.data
        })
      }).catch(res => {
        console.log("我的订单列表失败", res)
      })
  },
  //去评论页面
  goCommentPage() {
    wx.navigateTo({
      url: '../myComment/myComment',
    })
  },
  //弹起评论框
  showComment(event) {
    this.setData({
      isShowComment: true,
      item: event.currentTarget.dataset.item
    })
  },
  //隐藏评论框
  cancelComment() {
    this.setData({
      isShowComment: false
    })
  },
  //获取评论内容
  setValue(input) {
    this.setData({
      content: input.detail.value
    })
  },
  //提交评论
  submitComment() {
    let item = this.data.item;
    console.log('item', item)
    this.cancelComment(); //隐藏评论框
    let content = this.data.content;
    if (!content) {
      wx.showToast({
        title: '评论内容为空',
      })
      return;
    }
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    db.collection("order").where({
        _id: item._id
      })
      .update({
        data: {
          status: 2
        },
      }).then(res => {
        console.log("修改状态成功", res)
        var user = wx.getStorageSync('user');
        db.collection("pinglun")
          .add({
            data: {
              orderId: item._id, //订单号
              goodId: item.good._id, //评价的商品id
              goodName: item.good.name, //评价的商品name
              name: user.nickName,
              avatarUrl: user.avatarUrl,
              content: content,
              // _createTime: db.serverDate() //创建的时间
              _createTime: new Date().getTime() //创建的时间
            }
          }).then(res => {
            console.log("评论成功", res)
            wx.showToast({
              title: '评论成功',
            })
            this.getMyOrderList()
          }).catch(res => {
            console.log("评论失败", res)
            wx.showToast({
              icon: "none",
              title: '评论失败',
            })
          })
      }).catch(res => {
        console.log("修改状态失败", res)
      })


  },
  //确认收货
  shouhuo(event) {
    let orderId = event.currentTarget.dataset.item._id;
    db.collection('order').doc(orderId).update({
      data: {
        status: 1
      }
    }).then(res => {
      console.log('确认收货成功', res)
      this.getMyOrderList()
      wx.showToast({
        title: '收货成功'
      })
    }).catch(res => {
      console.log('确认收货失败', res)
      wx.showToast({
        icon: 'none',
        title: '收货失败'
      })
    })
  },
  //取消订单
  cancleOrder(event) {
    let item = event.currentTarget.dataset.item
    let goods = [{
      _id: item.good._id,
      quantity: item.good.quantity
    }]
    db.collection('order').doc(item._id).update({
      data: {
        status: -1
      }
    }).then(res => {
      console.log('取消订单成功', res)
      //取消订单后把商品数量加回去
      wx.cloud.callFunction({
        name: "addXiaoLiang",
        data: {
          goods: goods
        }
      }).then(res => {
        console.log('添加商品数量成功', res)
        wx.showToast({
          title: '取消订单成功',
        })
        this.getMyOrderList()
      }).catch(res => {
        console.log('添加商品数量失败', res)
        wx.showToast({
          icon: 'none',
          title: '取消订单失败',
        })
      })

    }).catch(res => {
      console.log('取消订单失败', res)
      wx.showToast({
        icon: 'none',
        title: '取消订单失败',
      })
    })
  }
})