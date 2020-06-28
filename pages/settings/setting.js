// pages/settings/setting.js
const app = getApp()
const WXAPI = require('../../config');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "title": '',
    "time": "",
    "state": '',
    "busiState":'',
    "id":'',
    'accessToken':'',
    "terminationTime":'',
    "openNum":'0',
    shareUrl:'',
    "todoData":[],
    ifDone:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    app.globalData.groupIds=[];
    self.setData({
      id: options.id,
      accessToken: wx.getStorageSync('accessToken'),
      state: options.state
    });
    self.getList();
  },
  getList:function(){
    let self = this;
    if (self.data.state != 2) {
      let data = {
        "id": self.data.id, //巡查单id
        "accessToken": wx.getStorageSync('accessToken')
      }
      WXAPI.request('POST', '/patrol/getPatrolItemList', data, (res) => {
        // console.log(res, "++++++++++","查询总大类的放回结果",res.data);
        if (res.code == 200) {
          self.setData({
            todoData: res.data,
            "title": res.patrol.organName,
            "time": res.patrol.startTime,
            "terminationTime": res.patrol.adjustEndTime,
            "busiState": res.patrol.busiState
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
    } else {
      let data = {
        "patrolId": self.data.id, //巡查单id
        "accessToken": wx.getStorageSync('accessToken')
      }
      WXAPI.request('POST', '/patrol/getAdjustItemList', data, (res) => {
        console.log(res, "++++++++++", "待整改结果", res.data);
        if (res.code == 200) {
          self.setData({
            todoData: res.data,
            shareUrl: res.shareUrl,
            title: res.patrol.organName,
            time: res.patrol.startTime,
            terminationTime: res.patrol.adjustEndTime,
            busiState: res.patrol.busiState
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
    }      
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
  packUp: function (e){
    let self = this;
    let tab = e.currentTarget.dataset.tab,
      ind = e.currentTarget.dataset.index;
    if (tab == 1) {
      this.setData({
        ['todoData[' + ind + '].tab']: 0
      })
    } else {
      this.setData({
        ['todoData[' + ind + '].tab']: 1
      })
    }
  },
  // 获取分享链接
  getShare:function(e){
    let self = this;
    console.log(e.currentTarget.dataset.url,"分享");
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success(res) {
        wx.getClipboardData({
          success(res) {
            return res.data
            console.log(res.data) // data
          }
        })
      }
    })
  },
  todoList: function (event){
    let self = this;
    console.log(event);
    let groupCode = event.currentTarget.dataset.id;
    let maxcateid = event.currentTarget.dataset.maxcateid, 
      ind = event.currentTarget.dataset.ind,
      minCateId = event.currentTarget.dataset.mincateid;
    if (self.data.state !=2 ){
      wx.navigateTo({
        url: '../order/order?id=' + self.data.id + "&groupCode=" + groupCode + "&maxcateid=" + maxcateid
      });
      app.globalData.groupIds=[];
      // console.log(self.data.todoData[ind].child, "++++++++++++++++++");
      self.data.todoData[ind].child.forEach(function (value, index, array) {
        // console.log(value, index, array, array[index].groupCode);
        app.globalData.groupIds.push(array[index].groupCode);
      }); 
    } else {
      if (self.data.busiState != 3 ){
        wx.navigateTo({
          url: '../order/order?id=' + self.data.id + "&minCateId=" + minCateId
        });
        // console.log(self.data.todoData[ind].child, "++++++++++++++++++");
        self.data.todoData.forEach(function (value, index, array) {
          // console.log(value, index, array, array[index].groupCode);
          app.globalData.groupIds.push(array[index].minCateId);
        }); 
      }
      
      
    }
    
  },
  
  // 非整改项提交结果

  getSubmit:function(){
    let self = this;
    if (self.data.todoData && self.data.todoData != '' ){
      self.data.todoData.forEach(function (i, j) {
        // console.log(i,j);
        if (i.child && i.child.length>0){
          i.child.forEach(function (item, index) {
            console.log(item.state);
            if (item.state == 0) {
              wx.showToast({
                title: '还有项目未完成，请确认完成后提交',
                icon: 'none',
                duration: 2000
              });
              self.setData({
                ifDone: false
              })
              return;
            } else {
              self.setData({
                ifDone: true
              })
            }
          })
        }
       
      })
    }   
    if(self.data.ifDone == true){
      wx.navigateTo({
        url: '../setrecord/setrecord?id=' + self.data.id
      });
    } 
  },
  // 部分整改
  partRect:function(){
    let self = this;
    let data ={
      "patrolId": self.data.patrolId,
      "accessToken": self.data.accessToken
    };
    wx.showModal({
      title: '提示',
      content: '只提交整改部分，未整改部分继续留存整改列表',
      success(res) {
        if (res.confirm) {
          WXAPI.request('POST', '/patrol/submitPatrolSectionAdjust', data, (res) => {
            console.log('res', "部分整改的结果");
            if (res.code == 200){
              self.getList()
            } else if(res.code == 101){
              wx.navigateTo({
                url: '../login/login'
              });
            }            
          }, (err) => {
            console.log(err)
          }, () => {
            console.log('next');
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })

    
  },
  // 全部整改
  allRect: function () {
    let self = this;
    let data = {
      "patrolId": self.data.patrolId,
      "accessToken": self.data.accessToken
    }
    wx.showModal({
      title: '提示',
      content: '只提交整改部分，未整改部分继续留存整改列表',
      success(res) {
        if (res.confirm) {
          WXAPI.request('POST', '/patrol/submitPatrolCompleteAdjust', data, (res) => {
            console.log('res', "全部整改的结果");
            if(res.code == 200){
              self.handerback();
            } else if(res.code == 101){
              wx.navigateTo({
                url: '../login/login'
              });
            }
            
          }, (err) => {
            console.log(err)
          }, () => {
            console.log('next');
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
    
  },
  // 查看提交结果
  getCheck:function(){
    let self = this;
    wx.navigateTo({
      url: '../checkRecord/checkRecord?id=' + self.data.id
    });
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    this.getList()
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
 
})