//index.js
//获取应用实例
const app = getApp()
const WXAPI = require('../../config');
var util = require('../../utils/util.js')
Page({
  data: {
    accessToken:'',
    searchText: '搜索巡查机构',
    active: 0,
    tabState:0,
    activeNames: ['1'],
    orderData:[
      {

        "text":'进行中',
        'tab':0
      },
      {
        "text": '整改中',
        "tab":2
      },
      {
        "text": '已完成',
        "tab": 1
      }
    ],
    content:[],
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {  
    let self = this;  
    console.log(wx.getStorageSync('accessToken')," wx.getStorageSync('accessToken')")
    if (wx.getStorageSync('accessToken') == "" || wx.getStorageSync('accessToken' )== null){
      wx.navigateTo({
        url: '../login/login'
      });

    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        accessToken: wx.getStorageSync('accessToken')
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          accessToken: wx.getStorageSync('accessToken')
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true, 
            accessToken: wx.getStorageSync('accessToken')
          })
        }
      })
    };
    // console.log(self.data.accessToken,"[[[[[[[[[")
    self.getList(0, wx.getStorageSync('accessToken'));

  },
  // 切换Tab
  onChange:function(e){
    let self = this;
    // console.log(e.detail.index,"onChange")
    // 0进行中记录 1 已完成记录 2 整改中记录
    if (e.detail.index == 0) {
      self.getList(0, self.data.accessToken);
      self.setData({
        tabState: 0
      })
    } else if (e.detail.index == 1){
      self.getList(2, self.data.accessToken);
      self.setData({
        tabState:2
      })
    } else if (e.detail.index == 2) {
      self.getList(1, self.data.accessToken);
      self.setData({
        tabState:1
      })
    }

  },
  // 获取列表
  getList: function (option, token){
    let self = this;
    
    // console.log(token, "ppppppp", option)
    let data = {
      "tab": option,  // 0进行中记录 1 已完成记录 2 整改中记录
      "accessToken": wx.getStorageSync('accessToken')
    }
    WXAPI.request('POST', '/patrol/getPatrolList', data, (res) => {
      // console.log(res, "++++++++++", res.data);
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
  getUserInfo: function(e) {
    // console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 去到搜索页
  handerToSearch: function () {
    let self = this;
    console.log(111111);
    wx.navigateTo({
      url: '/pages/search/search'
    });

  },
  //添加公司
  addCase:function(){
    let self = this;
    wx.navigateTo({
      url: '../setInfo/setInfo'
    })
  },
  toNext:function(e){
    let self = this;
    console.log(e.detail.state);
    let id = e.target.id;
    if(e.detail.state !=3){
      wx.navigateTo({
        url: '../settings/setting?id=' + id + '&state=' + self.data.tabState
      })
     
    } else {
      wx.showToast({
        title: '已终止无法查看！',
        icon: 'none',
        duration: 2000
      })
    }
    app.globalData.state = e.detail.state;
  },
  onChange2: function (event){
    let self = this;
    console.log(event,"odkkdkds,mldfdfldgljdgfdgfdgfklj")
    self.setData({
      activeNames: event.detail
    });
  }
})
