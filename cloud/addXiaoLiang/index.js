//添加销量
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 云函数入口函数
exports.main = async (event, context) => {

  let arr = []
  const db = cloud.database()
  const _ = db.command
  event.goods.forEach(item => {
    let pro = db.collection('goods').doc(item._id)
      .update({
        data: {
          num: _.inc(item.quantity)
        }
      })
    arr.push(pro)
  })

  return await Promise.all(arr).then(res => {
    return res
  }).catch(res => {
    return res
  })

}