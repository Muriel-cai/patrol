// pages/checkRecord/checkRecord.js
const app = getApp()
var util = require('../../utils/util.js')
const WXAPI = require('../../config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navH: 0,
    id: '',
    state:'',
    score: "86",
    openNum: 0,
    isAdjust:0,
    jzTime: '',
    evaluation: '文字描述文字描述文字，描述文字描述文字描述文字描述文字描述文，字描述文字描述文字描述文文字描述。',
    problemvalue: '文字描述文字描述文字，描述文字描述文字描述文字描述文字描述文，字描述文字描述文字描述文文字描述。'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    console.log(options)
    this.setData({
      navH: app.globalData.navHeight,
      id: options.id,
      accessToken: wx.getStorageSync('accessToken')
    });
    let data ={
      "patrolId": options.id,
      "accessToken": wx.getStorageSync('accessToken')
    } 
    WXAPI.request('POST', '/patrol/getPatrolEvaluate', data, (res) => {
      if(res.code == 200){
        self.setData({
          evaluation: res.data.problem,
          problemvalue: res.data.evaluate,
          isAdjust: res.data.isAdjust, 
          jzTime: res.data.adjustEndTime
        })
      }else if (res.code == 101) {
        wx.navigateTo({
          url: '../login/login'
        });
      }
    },(err)=>{
      console.log(err)
    },()=>{
      console.log('next')
    })
  },
  handerback: function (e) {
    let self = this;
    console.log(e, "handerback");
    wx.navigateBack({
      delta: 1,  // 返回上一级页面。
      success: function () {
        console.log('成功！')
      }
    })
  },
  handerhome: function () {
    let self = this;
    wx.switchTab({
      url: '../index/index'
    })
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
