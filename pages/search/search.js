// pages/search/search.js
const app = getApp();
var util = require('../../utils/util.js');
const WXAPI = require('../../config');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "searchValue":'',
    "content": [
      
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  handerback:function(e){
    let self = this;
    console.log(e,"handerback");
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
  onChange(e) {   
    let self = this;
    // console.log('搜索', e.detail);
    self.setData({
      searchValue: e.detail
    })
  },

  onClick(e) {
    let self = this;
    let data = {
      "accessToken": wx.getStorageSync('accessToken'),
      "organName": self.data.searchValue
    }
    WXAPI.request('POST', '/patrol/searchPatrolList', data, (res) => {
      console.log(res);
      if (res.code == 200) {
        self.setData({
          content:res.data
        })
      } else if (res.code == 101){
        wx.navigateTo({
          url: '../login/login'
        });
      }
    }, (err) => {
      console.log(err)
    }, () => {
      console.log('next')
    })
  },
  toNext:function(e,a){
    let self = this;
    console.log(e)
    let id = e.currentTarget.id;   
    wx.navigateTo({
      url: '../settings/setting?id=' + id + '&state=' + e.detail.state
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