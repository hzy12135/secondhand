
const app = getApp()
let searchKey = '' //搜索词
Page({
  data: {
    banner: [{
        picUrl: '/image/top1.png'
      },
      {
        picUrl: '/image/top2.png'
      }
    ],
  },
  //页面可见
  onShow() {
    this.getTopBanner(); //请求顶部轮播图
    this.getHotGood();
    
  },
  onLoad(){
this.panduan();
  },
  //轮播图点击事件

  //去二手商城页
  goToMall() {
    wx.navigateTo({
      url: '/pages/mall/mall'
    })
  },
  //去新发布商品列表页
  goToNew() {
    wx.navigateTo({
      url: '/pages/newGood/newGood'
    })
  },
  //去客服页
  goToPhone() {
    wx.navigateTo({
      url: '/pages/kefu/kefu'
    })
  },
  //去上门回收页
  goHuiShou() {
    wx.navigateTo({
      url: '/pages/huishou/huishou',
    })
  },
  //获取用户输入的搜索词
  getSearchKey(e) {
    searchKey = e.detail.value
  },
  //搜索点击事件
  goSearch() {
    wx.navigateTo({
      url: '/pages/search/search?searchKey=' + searchKey,
    })
  },
  //获取首页顶部轮播图
  getTopBanner() {
    wx.cloud.database().collection("lunbotu")
      .get()
      .then(res => {
        console.log("首页banner成功", res.data)
        if (res.data && res.data.length > 0) {
          //如果后台配置轮播图就用后台的，没有的话就用默认的
          this.setData({
            banner: res.data
          })
        }
      }).catch(res => {
        console.log("首页banner失败", res)
      })
  },
  //获取首页推荐位的商品
  getHotGood() {
    wx.cloud.callFunction({
      name: "getGoodList",
      data: {
        action: 'getHot'
      }
    }).then(res => {
      console.log("首页推荐商品数据", res.result)
      this.setData({
        goodList: res.result.data,
      })
    }).catch(res => {
      console.log("菜品数据请求失败", res)
    })
  },
  //去商品详情页
  goDetail(e) {
    wx.navigateTo({
      url: '/pages/detail/detail?goodid=' + e.currentTarget.dataset.id
    })
  },
  // 判断用户是否禁用
  panduan(){
    
    wx.cloud.database().collection("user")
    .where({
      _openid: 'openid',
      zt: true
    }).get()
    .then(res=>{
      this.setData({
        user: res.data
      })      
      let user = this.data.user;
      console.log("禁用用户信息",user);
      if(user.length == 1){
        wx.redirectTo({
          url: '/pages/no/no'//禁用页面
        })
      }
    })
    .catch(res=>{
      console.log("错误信息",res);
    })
  },
})