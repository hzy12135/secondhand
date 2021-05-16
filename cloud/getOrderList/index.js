// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const dbOrder = db.collection("order")

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (event.action == 'user') {
    return await dbOrder.orderBy('_createTime', 'desc')
      .where({
        _openid: wxContext.OPENID,
        status: event.orderStatus
      }).get()
  }
  if (event.action == 'seller') { //商品发布者查看订单
    return await dbOrder
      .where({
        status: event.status,
        good: {
          sellerId: wxContext.OPENID
        }
      }).get()
  } else {
    return await dbOrder.orderBy('_createTime', 'desc')
      .where({
        status: event.orderStatus
      }).get()
  }

}