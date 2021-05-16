let app = getApp();
const db = wx.cloud.database()
Page({
  data: { //页面的初始数据   
    isShowMyAddress: false, //是否显示我的地址
    isShowAddressSetting: false, //授权失败再次授权的弹窗
    beizhu: "", // 备注信息
    payWayList: [ //模拟支付方式列表
      {
      "id": 1,
      "package": "微信支付"
    }, {
      "id": 2,
      "package": "银行卡支付"
    }],
    cartList: [], // 购物车数据
    totalPrice: 0, //总价
    totalNum: 0, //总数量
    maskFlag: true, // 遮罩
  },
  onLoad() {
    //获取缓存地址
    this.getAddress(wx.getStorageSync('address'))

    //购物车的数据
    var arr = wx.getStorageSync('cart') || [];
    for (var i in arr) {
      this.data.totalPrice += arr[i].quantity * arr[i].price;
      this.data.totalNum += arr[i].quantity
    }
    this.setData({
      cartList: arr,
      totalPrice: this.data.totalPrice.toFixed(2),
      totalNum: this.data.totalNum
    })
  },

  // 获取备注信息
  getRemark(e) {
    this.setData({
      beizhu: e.detail.value
    })
  },
  //打开支付方式弹窗
  choosePayWay() {
    var that = this;

    // 支付方式打开动画
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
    that.setData({
      maskFlag: false,
    });
  },
  // 支付方式关闭方法
  closePayWay() {
    var that = this
    // 支付方式关闭动画
    that.animation.translate(0, 285).step();
    that.setData({
      animationData: that.animation.export()
    });
    that.setData({
      maskFlag: true
    });
  },


  //提交订单
  submitOrder(e) {
    let arr = wx.getStorageSync('cart') || [];
    let arrNew = []
    arr.forEach(item => {
      arrNew.push({
        _id: item._id,
        sellerId: item._openid, //卖家id
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })
    });
    
    let proArr = []
    let goods = []
    arrNew.forEach(item => {
      let pro = db.collection("order").add({
        data: {
          name: this.data.address.userName,
          address: this.data.address.address,
          phone: this.data.address.phone,
          beizhu: this.data.beizhu,
          totalPrice: item.quantity * item.price, //总价钱
          good: item, //存json字符串
          status: 0, //-1订单取消,0新下单发货,1已收货待评价,2订单已完成
          
          _createTime: new Date().getTime() //创建的时间
        }
      })
      proArr.push(pro)
      goods.push({
        _id: item._id,
        quantity: -item.quantity
      })
    })

    Promise.all(proArr).then(res => {
      console.log("支付成功", res)
      // 支付方式关闭动画
      this.animation.translate(0, 285).step();
      this.setData({
        animationData: this.animation.export()
      });
      this.setData({
        maskFlag: true
      });
      wx.showToast({
        title: '下单成功！',
      })
      //支付成功后，把商品数量减少对应个数
      wx.cloud.callFunction({
        name: "addXiaoLiang",
        data: {
          goods: goods
        }
      }).then(res => {
        console.log('添加销量成功', res)
        wx.setStorageSync('cart', "")
        wx.switchTab({
          url: '../me/me',
        })
      }).catch(res => {
        console.log('添加销量失败', res)
        wx.showToast({
          icon: 'none',
          title: '支付失败',
        })
      })

    }).catch(res => {
      wx.showToast({
        icon: 'none',
        title: '支付失败',
      })
      console.log("支付失败", res)
    })
  },
  // 管理收获地址
  addAdress() {
    wx.chooseAddress({
      success: res => {
        console.log(res)
        app._saveAddress(res);
        this.getAddress(res)
      },
      
      fail: res => {
        console.log("获取地址失败", res)
        app.showErrorToastUtils('您取消了操作!，请重新获取地址');

      }
    })

  },

  getAddress(addressStro) {
    if (addressStro) {
      var address = app._getAddress(addressStro);
      var city = app._getCity(addressStro);
      console.log(city);
      if (address) {
        this.setData({
          isShowMyAddress: true,
          address: {
            userName: addressStro.userName,
            phone: addressStro.telNumber,
            city: city,
            address: address
          },
        })
      }
    }
  }



})