// 小程序开发api接口统一配置
// 如果你的域名是： https://www.baidu.com/cn 那么这里只要填写 cn
// let subDomain = '/cn'  // 子域名,没有就等于''
// const API_BASE_URL = 'https://reco.lpcknew.com:8072'  // 主域名  记得修改app.js 中的域名
const API_BASE_URL = 'https://jk.patrol.lpcknew.com'
// 统一请求
const request = (method, url, data, callback, errFun, next) => {
  let geturl = API_BASE_URL + url;
  wx.request({
    url: geturl,
    method: method,
    data: data,
    header: {
      'content-type': method == 'POST' ? 'application/json' : 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    dataType: 'json',
    success: function (res) {
      callback(res.data);
    },
    fail: function (err) {
      errFun(err);
    },
    complete:function(){
      next()
    }
  })
};
//上传图片
const uploadImage = (url,path, data, callback, errFun, next) => {
  console.log(path)
  let geturl = API_BASE_URL + url;
  wx.uploadFile({
    url: geturl,
    filePath: path,
    name: 'file',
    header: { "Content-Type": "multipart/form-data" },
    formData: data,
    success: function (res) {
      //上传成功返回数据
      callback(res);
      
    },
    fail: function (err) {
      errFun(err);
     
    },
    complete: function () {
      next()
  
    }
  });
}
// 加载时的弹框

/**
 * 小程序的promise没有finally方法，自己扩展下
 */
// Promise.prototype.finally = function (callback) {
//   var Promise = this.constructor;
//   return this.then(
//     function (value) {
//       Promise.resolve(callback()).then(
//         function () {
//           return value;
//         }
//       );
//     },
//     function (reason) {
//       Promise.resolve(callback()).then(
//         function () {
//           throw reason;
//         }
//       );
//     }
//   );
// }

module.exports = {
  request,
  uploadImage

}

// module.exports = config;