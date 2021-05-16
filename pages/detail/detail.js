const app = getApp()
let db = wx.cloud.database()
let goodId = ''
Page({
  data: {
    cartList: [], // 购物车
    totalPrice: 0, // 总价，初始为0
    totalNum: 0, //总数，初始为0
    // 购物车动画
    animationData: {},
    animationMask: {},
    maskVisual: "hidden",
    maskFlag: true,
    
  },
  onLoad(opt) {
    goodId = opt.goodid
    console.log('商品id', goodId)
    this.getGoodDetail()
    this.getCommentList();
  },
  //获取评论列表
  getCommentList() {
    wx.cloud.callFunction({
      name: 'getPinglun',
      data: {
        goodId: goodId
      }
    }).then(res => {
      console.log("查询评论结果", res)
      if (res && res.result && res.result.data) {
        let dataList = res.result.data;
        this.setData({
          list: dataList
        })
      } else {
        this.setData({
          list: []
        })
      }
    }).catch(res => {
      console.log("查询评论失败", res)
    })
  },
  //获取商品详情
  getGoodDetail() {
    //获取购物车商品
    let cartList = wx.getStorageSync('cart') || [];

    db.collection('goods').doc(goodId).get()
      .then(res => {
        console.log('获取商品详情成功', res)
        let good = res.data
        //遍历并把购物车购买数量填充进来
        good.quantity = 0;
        cartList.forEach(cart => {
          if (cart._id == good._id) {
            good.quantity = cart.quantity ? cart.quantity : 0;
          }
        })
        this.setData({
          cartList: cartList,
          good: good
        })
        this.getTotalPrice()
      })
      .catch(res => {
        console.log('获取商品详情失败', res)
      })
  },

  /**
   * 购物车相关
   */
  //购物车减少数量
  minusCount(e) {
    let good = e.currentTarget.dataset.item;
    let cartList = wx.getStorageSync('cart') || [];

    if (good.quantity && good.quantity > 0) {
      good.quantity -= 1;
    } else {
      good.quantity = 0;
    }
    if (cartList.length > 0) {
      cartList.forEach(cart => {
        if (cart._id == good._id) {
          cart.quantity ? cart.quantity -= 1 : 0
          if (cart.quantity <= 0) {
            //购买数里为0就从购物车里删除
            this.removeByValue(cartList, good._id)
          }
          if (cartList.length <= 0) {
            this.setData({
              cartList: [],
              totalNum: 0,
              totalPrice: 0,
            })
          }
          try {
            wx.setStorageSync('cart', cartList)
          } catch (e) {
            console.log(e)
          }
        }
      })
    }
    this.setData({
      cartList: cartList,
      good: good
    })
    this.getTotalPrice();
  },
  // 定义根据id删除数组的方法
  removeByValue(array, id) {
    for (var i = 0; i < array.length; i++) {
      if (array[i]._id == id) {
        array.splice(i, 1);
        break;
      }
    }
  },

  // 购物车增加数量
  addCount(e) {
    let good = e.currentTarget.dataset.item;
    console.log("添加good", e)
    console.log("添加good", good)
    let cartList = wx.getStorageSync('cart') || [];
    let f = false;
    //购买数量超过剩余数量
    if (good.quantity >= good.num) {
      wx.showToast({
        icon: 'none',
        title: '超过可购买数量',
      })
      return;
    }
    good.quantity += 1;

    //购物车里有值
    if (cartList.length > 0) {
      // 遍历购物车找到被点击的商品，数量加1
      cartList.forEach(cart => {
        if (cart._id == good._id) {
          cart.quantity += 1;
          f = true;
          try {
            wx.setStorageSync('cart', cartList)
          } catch (e) {
            console.log(e)
          }
        }
      })
      if (!f) {
        cartList.push(good);
      }
    } else {
      cartList.push(good);
    }
    try {
      wx.setStorageSync('cart', cartList)
    } catch (e) {
      console.log(e)
    }
    this.setData({
      cartList: cartList,
      good: good
    })
    this.getTotalPrice();
  },


  // 获取购物车总价、总数
  getTotalPrice() {
    var cartList = this.data.cartList; // 获取购物车列表
    var totalP = 0;
    var totalN = 0
    for (var i in cartList) { // 循环列表得到每个数据
      totalP += cartList[i].quantity * cartList[i].price; // 所有价格加起来     
      totalN += cartList[i].quantity
    }
    this.setData({ // 最后赋值到data中渲染到页面
      cartList: cartList,
      totalNum: totalN,
      // totalPrice: totalP.toFixed(2)
      totalPrice: totalP
    });
  },
  // 清空购物车
  cleanList() {
    let good = this.data.good
    good.quantity = 0
    try {
      wx.setStorageSync('cart', "")
    } catch (e) {
      console.log(e)
    }
    this.setData({
      good: good,
      cartList: [],
      totalNum: 0,
      totalPrice: 0,
    })
    this.cascadeDismiss()
  },

  //删除购物车单项
  deleteOne(e) {
    let good = this.data.good
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let arr = wx.getStorageSync('cart')
    if (good._id == id) {
      good.quantity = 0;
    }
    arr.splice(index, 1);
    if (arr.length <= 0) {
      this.setData({
        good: good,
        cartList: [],
        totalNum: 0,
        totalPrice: 0,
      })
      this.cascadeDismiss()
    }
    try {
      wx.setStorageSync('cart', arr)
    } catch (e) {
      console.log(e)
    }
    this.setData({
      cartList: arr,
      good: good
    })
    this.getTotalPrice()
  },
  //切换购物车开与关
  cascadeToggle() {
    var that = this;
    var arr = this.data.cartList
    if (arr.length > 0) {
      if (that.data.maskVisual == "hidden") {
        that.cascadePopup()
      } else {
        that.cascadeDismiss()
      }
    } else {
      that.cascadeDismiss()
    }
  },
  // 打开购物车方法
  cascadePopup() {
    var that = this;
    // 购物车打开动画
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
      delay: 0
    });
    that.animation = animation;
    animation.translate(0, -285).step();
    that.setData({
      animationData: that.animation.export(),
    });
    // 遮罩渐变动画
    var animationMask = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
    });
    that.animationMask = animationMask;
    animationMask.opacity(0.8).step();
    that.setData({
      animationMask: that.animationMask.export(),
      maskVisual: "show",
      maskFlag: false,
    });
  },
  // 关闭购物车方法
  cascadeDismiss() {
    var that = this
    // 购物车关闭动画
    that.animation.translate(0, 285).step();
    that.setData({
      animationData: that.animation.export()
    });
    // 遮罩渐变动画
    that.animationMask.opacity(0).step();
    that.setData({
      animationMask: that.animationMask.export(),
    });
    // 隐藏遮罩层
    that.setData({
      maskVisual: "hidden",
      maskFlag: true
    });
  },
  // 跳转确认订单页面
  gotoOrder: function () {
    var arr = wx.getStorageSync('cart') || [];
    if (!arr || arr.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择商品'
      })
      return;

    }

    let userInfo = wx.getStorageSync('user');
    if (!userInfo || !userInfo.nickName) {
      this.showLoginView()
      return;
    }
    wx.navigateTo({
      url: '/pages/pay/pay'
    })
  },

  /**
   * 授权登录相关
   */
  //弹起登录弹窗
  showLoginView() {
    this.setData({
      isShowAddressSetting: true
    })
  },
  //关闭登录弹窗
  closeLoginView() {
    this.setData({
      isShowAddressSetting: false
    })
  },
  //授权登录
  // goLogin(e) {
  //   console.log('用户信息', e)
  //   if (e.detail.userInfo) {
  //     var user = e.detail.userInfo;
  //     this.setData({
  //       isShowAddressSetting: false
  //     })
  //     user.openid = app.globalData.openid;
  //     app._saveUserInfo(user);
  //     wx.navigateTo({
  //       url: '/pages/pay/pay'
  //     })
  //   } else {
  //     app.showErrorToastUtils('登陆需要允许授权');
  //   }
  // },
  goLogin(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log("获取用户信息成功", res)
        let user = res.userInfo
        wx.setStorageSync('user', user) //保存用户信息到本地缓存       
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      }
    })
  },
  previewImg(event) {
    let index = event.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.good.img[index], // 当前显示图片的http链接
      urls: this.data.good.img // 需要预览的图片http链接列表
    })
  },
  gotomessage(e){
    wx.navigateTo({
      url: '/pages/message/message?openid=' + e.currentTarget.dataset.openid
    })
  // console.log("ge",e.currentTarget.dataset.openid);
  },
})