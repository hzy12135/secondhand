let app = getApp();
//云数据库相关
const db = wx.cloud.database({});

Page({
  data: {
    
    goodList: [], //菜品 
  },
  //去商品详情页
  goDetail(e) {
    wx.navigateTo({
      url: '/pages/detail/detail?goodid=' + e.currentTarget.dataset.id
    })
  },
onShow(){
this.getList()
},
  //获取数据
  getList() {
    wx.cloud.callFunction({
      name: "getGoodList",
      data: {
        action: 'getNew',  
      }
    }).then(res => {
      let dataList = res.result.data;
      console.log("商品数据", res)
      this.setData({
        goodList: dataList,
      })
    }).catch(res => {
      console.log("菜品数据请求失败", res)
    })
  },
 




 
})