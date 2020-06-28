// pages/setInfo/setInfo.js
const app = getApp()
const WXAPI = require('../../config')
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navH: 0,
    comName:'请选择巡查机构',
    xcTime:'请选择巡查时间',
    show:false,
    minHour: 0,
    maxHour: 20,
    minDate: new Date().getTime(),
    maxDate: new Date(2025, 10, 1).getTime(),
    currentDate: new Date().getTime(),
    organData:[],
    organId: '',
    isTime:false,
    searchData:[],
    organArr:[],
    id:"",
    height:'40%'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    let self = this;
    self.setData({
      navH: app.globalData.navHeight     
    });
    this.setData({
      xcTime: util.formatTime(new Date())
    });
    let data = {
      "accessToken": wx.getStorageSync('accessToken')
    }
    WXAPI.request('POST', '/patrol/getOrganList', data, (res) => {
      // console.log(res, "++++++++++","查询机构名称",res.data);
      if (res.code == 200) {
        self.setData({
          organData: res.data,
          organArr:res.data
        })
      } else if (res.code == 101) {
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
  getName:function(e){
    let self = this;
    self.setData({
      show: true,
      isTime:false,
      height:'60%'
    })
  },
  //获取巡查时间
  getTime:function(e){
    let self = this;
    console.log(e,"时间")
    wx.hideKeyboard({
      complete: res => {
        console.log('hideKeyboard res', res)
      }
    })
    self.setData({
      show:true,
      isTime: true,
      height: '40%'
    })
  },
  onInput(event) {
    // console.log(event.detail,"event.detail")
    this.setData({
      currentDate: event.detail
    });
  },
  //获取时间
  hasSure:function(){
    let self = this;
    // console.log(self.data.currentDate, "[[[[[[");
    let dateTime = new Date(self.data.currentDate);
    // console.log(dateTime,";;;;;;;;")
    util.formatTime(dateTime);
    this.setData({
      show: false,
      xcTime: util.formatTime(dateTime)
    });
  },
  onChange(event) {
    // const { picker, value, index } = event.detail;
    // console.log(event.deltail.value,"000000000000")
    this.setData({
      organArr: event.detail.value
    });
    
  },
  getNameSure:function(e){
    let self = this;
    console.log(e.detail.value,"lllllllllll")
    this.setData({
      show: false,
      organId: e.detail.value.id, 
      comName: e.detail.value.organName
    });
  },
  onClose:function(){
    let self = this;
    // console.log('取消');
    self.setData({
      show: false
    });
  },
  hasDone:function(){
    let self = this;
    // console.log(self.data.xcTime.replace(/([^\/]*)\.(-*)/));
    let data = {
      "accessToken": wx.getStorageSync('accessToken'),
      "startTime": self.data.xcTime.replace(/\//g, "-"),
      "organId": self.data.organId
    };
    // if(self.data.){

    // }else {

    // }
    WXAPI.request('POST', '/patrol/createPatrol', data, (res) => {
      // console.log(res, "++++++++++", "新增巡查机构", res.data);
      if (res.code == 200) {
        wx.navigateTo({
          url: '../settings/setting?id=' + res.id + '&state=0'
        });
      } else if (res.code == 400){
        wx.showModal({
          title: '提示',
          content: res.resMsg,
          showCancel: false
        });
      }else if (res.code == 101) {
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
  // 
  getValue:function(e){
    let self = this;
    console.log(e.detail);
    let keyWord = e.detail;
    let arr = [];
    // console.log(self.data.organArr, "kkkkkkk", self.data.organArr.length)
    for (let i = 0; i < self.data.organArr.length; i++) {
      if (self.data.organArr[i].organName.indexOf(keyWord) >= 0) { 
        arr.push(self.data.organArr[i]);             
      }
    }
    self.setData({
      organData: arr
    });
    
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