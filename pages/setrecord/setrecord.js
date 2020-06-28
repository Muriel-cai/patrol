
const app = getApp()
var util = require('../../utils/util.js')
const WXAPI = require('../../config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navH: 0,
    id:'',
    accessToken:'',
    score:"86",
    openNum:0,
    show: false,
    isOver:false,
    minHour: 0,
    maxHour: 20,
    jzTime:'',
    minDate: new Date().getTime(),
    maxDate: new Date(2025, 10, 1).getTime(),
    currentDate: 'new Date().getTime()',
    evaluation:'',
    problemvalue:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      navH: app.globalData.navHeight,
      id:options.id,
      accessToken: wx.getStorageSync('accessToken')  
    });
    // this.setData({
    //   jzTime: util.formatTime(new Date())
    // });
  },
  // 是否需要整改
  setSel:function(e){
    let self = this;
    let type= e.currentTarget.dataset.type;
    // console.log(e.currentTarget.dataset.type,";;;;;;");
    self.setData({
      openNum:type
    })
  },
  getTime:function(e){
    let self = this;
    self.setData({
      show:true
    })
  },
  onInput(event) {
    console.log(event.detail, "event.detail")
    this.setData({
      currentDate: event.detail
    });
  },
  onChange: function (event){
    // console.log(event.detail, "event.detail");
    this.setData({
      problemvalue: event.detail
    });
  },
  onChange1: function (event) {
    // console.log(event.detail, "event.detail");
    this.setData({
      evaluation: event.detail
    });
  },
  hasSure: function () {
    let self = this;
    // console.log(self.data.currentDate, "[[[[[[");
    let dateTime = new Date(self.data.currentDate);
    // console.log(dateTime,";;;;;;;;")
    util.formatTime(dateTime);
    this.setData({
      show: false,
      jzTime: util.formatTime(dateTime)
    });
  },
  submit:function(time){
    let self = this;
    let data = {
      "problem": self.data.problemvalue,           //本次问题登记
      "adjustEndTime": time,  //调整到期时间
      "id": self.data.id,                //巡查单id
      "accessToken": self.data.accessToken,
      "evaluate": self.data.evaluation,                      //总体评价
      "isAdjust": self.data.openNum            //是否需要整改1需要0不需要
    };
    WXAPI.request('POST', '/patrol/submitPatrolEvaluate', data, (res) => {
      console.log(res);
      if (res.code == 200) {
        wx.showToast({
          title: '提交成功',
          icon: 'none',
          duration: 2000
        });
        wx.navigateTo({
          url: '../index/index'
        });
      } else if (res.code == 101) {
        wx.navigateTo({
          url: '../login/login'
        });
      }

    }), (err) => {
      console.log(err)
    }
  },
  //确认提交
  getSubmit:function(){
    let self = this;
    let adjustEndTime;
    // console.log(self.data.openNum,"[[[[[[[[")   
    if ( self.data.openNum == 1){
      if (self.data.jzTime != '' && self.data.jzTime != null){
        adjustEndTime = self.data.jzTime.replace(/\//g, "-");
        self.submit(adjustEndTime)
      } else {
        wx.showToast({
          title: '请选择截止整改时间',
          icon: 'none',
          duration: 2000
        })      
      }          
    } else{
      adjustEndTime = util.formatTime(new Date()).replace(/\//g, "-");
      self.submit(adjustEndTime)
    }    
    
  },
  // 关闭
  onClose:function(){
    let self = this;
    self.setData({
      show:false
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