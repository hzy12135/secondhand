// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.action == 'remove') { //  删除商品
    return await cloud.database().collection('goods').doc(event.id).remove()
  } else if (event.action == 'songda') { //商品送达，待用户评价
    return await cloud.database().collection('order').doc(event.id).update({
      data: {
        //-1订单取消,0新下单发货,1已收货待评价,2订单已完成
        status: 1
      }
    })
  }


}