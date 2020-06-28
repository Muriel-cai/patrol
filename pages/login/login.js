// pages/login/login.js
const WXAPI = require('../../config');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNum:'',
    password:''

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onChangePhone: function (event){
    let self = this;
    this.setData({
      phoneNum: event.detail
    })
  },
  onChangePw: function (event) {
    let self = this;
    this.setData({
      password: event.detail
    })
  },
  tolist:function(){
    let self = this;
    console.log(self.data.phoneNum)
    console.log(/^1[34578]\d{9}$/.test(this.data.phoneNum));
    if (!(/^1[34578]\d{9}$/.test(self.data.phoneNum))) {
      wx.showToast({
        title: '手机号有误',
        icon: 'none',
        duration: 2000
      })
    } else {
      let data = {
        "userPhone": self.data.phoneNum,
        "password": self.data.password
      }
      WXAPI.request('POST', '/login', data, (res) => {
        console.log(res, "++++++++++");
        if (res.code == 200) {
          wx.setStorage({
            "key":'accessToken',
            "data": res.accessToken
          });
          wx.navigateTo({
            url: '../index/index'
          });
        } else{
          wx.showToast({
            title: res.resMsg,
            icon: 'none',
            duration: 2000
          })
        }
      }, (err) => {
        console.log(err)
      }, () => {
        console.log('next')
      })


    }
    
    
   
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})