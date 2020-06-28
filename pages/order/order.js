// pages/order/order.js
const app = getApp();
var util = require('../../utils/util.js');
const WXAPI = require('../../config');
const recorderManager = wx.getRecorderManager();
let init;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    floorstatus:false,
    id: "", // 巡查单id
    zgminCateId:'',
    chozgminCateId:"",
    zgselOption:'',
    maxcateid:'',
    groupCode:'',
    accessToken:'',
    patrolState:'', // 巡查单状态
    patrolId: '', // 巡查单id
    navH: 0,
    showPop:false, // 是否展示弹框
    minutes:0,// 分
    seconds:0, // 秒
    endtime: "00 : 00 : 00 ",
    recordingTimeqwe: 0,//录音计时
    setInter: "",//录音名称
    ifFirst: false, // 首次弹窗手里是否出现保存按钮之类的
    ifrecord:false, // 是否在录音中
    navTitle:'', // 大标题
    secTitle:'',// 二类标题
    fileImg:'', 
    ifOne:true,// 是否为第一个问题
    ifLast: false, //是否为最后一个问题
    pageNum:0,
    addVideoId:'', // 录音师保存ID
    videoInd:'',
    status: 0, //录音状态 0:未开始录音 1:正在录音 2:暂停录音 3:已完成录音
    pageDatas:[], // 案件ID的合集
    videoData:'', // 录音文件
    orderData:[
     
    ],
    optionsItem:{
      // "id": "",                 
      // "accessToken":'',
      // items:[
      //   // {
      //   //   "minCateId": "",  
      //   //   "selOption": 
      //   // }
      // ]
    },
    activeNames:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    console.log(app.globalData, options);
    
    this.setData({
      navH: app.globalData.navHeight,
      accessToken:wx.getStorageSync('accessToken'),    
      pageDatas: app.globalData.groupIds,
      id: options.id,
      patrolId: options.id,
      patrolState: app.globalData.state,
      maxcateid: options.maxcateid,
      zgminCateId: options.minCateId,
      chozgminCateId: options.minCateId,
      groupCode: options.groupCode,   
      ['optionsItem.accessToken']: wx.getStorageSync('accessToken'),   
      navTitle:'巡查记录',
      secTitle:''     
    });
     
    self.getItems();

  },
  // 获取页面数据
  getItems :function(id){
    let self = this;  
    let num;
    let allsel=[];
    // console.log(self.data,"[ppppppp");
    if (self.data.patrolState != 2){
      num = self.data.pageDatas.indexOf(Number(self.data.groupCode));  
      let data = {
        "id": self.data.id,
        "accessToken": self.data.accessToken,
        "maxCateId": self.data.maxcateid,
        "groupCode": self.data.groupCode
      }
      WXAPI.request('POST', '/patrol/getPatrolGroupMinItemList', data, (res) => {
        console.log(res, "++++++++++", "查询单个页面问题的结果");
        
        if (res.code == 200) {
          if (res.data.length > 0 && res.data){
            res.data.forEach(function (i, j, arr) {
              //这一步是来转化时间的   
            
              // console.log(i.voiceList ,i) ;
              if (i.voiceList != null && i.voiceList != '' ){
                if (i.voiceList.length > 0 ) {
                  i.voiceList.forEach(function (a, b) {
                    // console.log(a)
                    a.times = self.setVideoTime(a.times);
                  })
                }  
              }                            
            })
          }          
          self.setData({
            orderData: res.data,
            patrolId: res.data[0].patrolId,
            ['optionsItem.id']: res.data[0].patrolId,
            secTitle: res.groupTitle
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
      num = self.data.pageDatas.indexOf(self.data.chozgminCateId); 
      console.log(num, "ppppppppp", self.data.pageDatas, self.data.chozgminCateId) 
      let data = {
        "minCateId": self.data.chozgminCateId,
        "patrolId": self.data.patrolId,
        "accessToken": self.data.accessToken
      }
      WXAPI.request('POST', '/patrol/getPatrolAdjustMinCateDetail', data, (res) => {
        console.log(res, "++++++++++", "查询单个页面问题的结果");
          //这一步是来转化时间的              
        if (res.code == 200) {
          let itemData = [];
          if (res.data.voiceList != null && res.data.voiceList!= undefined){
            res.data.voiceList.forEach(function (a, b) {
              console.log(a.times, "11111111111111j");
              a.times = self.setVideoTime(a.times);
            })
          }          
          itemData.push(res.data);
          self.setData({
            orderData: itemData,
            zgselOption: res.data.selOption,
            zgminCateId: itemData[0].minCateId,
            secTitle: res.groupTitle
          })
         
        } else if (res.code == 100) {
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
    console.log(num, self.data.pageDatas.length,"numnumundndfksls")
    if (num == 0) {
      this.setData({
        ifOne: true,
        ifLast:false,
        pageNum:num
      })
    } else if(num == self.data.pageDatas.length-1){
      this.setData({
        ifOne: false,
        ifLast: true,
        pageNum: num
      })
    } else {
      this.setData({
        ifOne: false,
        ifLast: false,
        pageNum: num
      })
    }   
  },
  // 选择是否
  setChios:function(e){
    let self = this;
    // const newFileList = data.map(item => ({ url:item.fileID }) )
    if (self.data.patrolState !=1){
      let index = e.currentTarget.dataset.index,
        type = e.currentTarget.dataset.type,
        mincateid = e.currentTarget.dataset.mincateid;
      if (self.data.patrolState != 2) {
        this.setData({
          ['orderData[' + index + '].selOption']: type,
          ['optionsItem.items[' + index + ']']: {},
          ['optionsItem.items[' + index + '].selOption']: type,
          ['optionsItem.items[' + index + '].minCateId']: mincateid
        });
        console.log(self.data.optionsItem, "kdkas;sfkgfldfkds")
      } else {

        this.setData({
          zgselOption: type,
          ['orderData[' + index + '].selOption']: type
        })
      }
    } else {
      console.log('已完结，不能修改拉');
    }
    
   
  },
  afterRead(event) {
    let self = this;
    const { file } = event.detail;
   

    let ind = event.currentTarget.dataset.index,
       mincateid = event.currentTarget.dataset.mincateid;
    wx.getFileSystemManager().readFile({
      filePath: file.path, //选择图片返回的相对路径
      encoding: 'base64', //编码格式
      success: res => { //成功的回调
        console.log(file, "afterRead 图片大小")
        self.uploadimg(res.data, mincateid, file.path, ind);       
      }
    })  
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
  },
  //上传图片
  uploadimg: function (path, mincateid, filePath, ind) {//这里触发图片上传的方法   
    var self = this;
    let param = { 
      "minCateId": mincateid,
      "data": path, //图片的base64数据
      "id": self.data.id,
      "accessToken": self.data.accessToken
      };
    WXAPI.request('POST', '/patrol/uploadImg', param, (res) => {
      if (res.code == 200){
        let imgData =[]
        let imgArrs = {};
        imgArrs.url = res.url,
          imgArrs.name = res.name,
          imgArrs.id = res.id;
        console.log(self.data.orderData[ind].imgList, self.data.orderData[ind].imgList == null)
        if (self.data.orderData[ind].imgList == null) {
          imgData.push(imgArrs)
          self.setData({
            ['orderData[' + ind + '].imgList']: imgData
          });
          imgData=[];
        } else {
          imgArrs = self.data.orderData[ind].imgList.concat(imgArrs);
          self.setData({
            ['orderData[' + ind + '].imgList']: imgArrs
          });
        }
      } else if (res.code == 101) {
        wx.navigateTo({
          url: '../login/login'
        });
      }
      
    }, (err) => {
      console.log(err);

      wx.showModal({
        title: '提示',
        content: '上传失败00',
        showCancel: false
      })
    }, (err) => {
      console.log(err);
      // self.setData({
      //   allImg: imgData,
      //   photos: imgData
      // });
      wx.hideToast(); //隐藏Toast
    })
  },
  //删除图片
  deleteImg:function(e){
    let self = this; 
    // console.log(e, "pppppppp", e.detail.index);
    let ind = e.currentTarget.dataset.index,
      mincateid = e.currentTarget.dataset.mincateid,
      patrolId = self.data.orderData[ind].patrolId,
      imgIndex = e.detail.index;
    console.log("pppppppp", ind, imgIndex, self.data.orderData[ind].imgList[imgIndex].id);
    let data = {
      "minCateId": mincateid,
      "imgId": self.data.orderData[ind].imgList[imgIndex].id,
      "patrolId": patrolId,
      "accessToken": self.data.accessToken
    }
    wx.showModal({
      title: '提示',
      content: '确定删除该图片么？',
      success(res) {
        if (res.confirm) {
          WXAPI.request('POST', '/patrol/delImg', data, (res) => {
            // console.log(res, "删除图片结果");
            if (res.code == 200) {
              // self.data.orderData[ind].imgList

              self.data.orderData[ind].imgList.splice(imgIndex, 1);
              // console.log(self.data.orderData[ind].imgList, "[[[[[[")
              self.setData({
                ['orderData[' + ind + '].imgList']: self.data.orderData[ind].imgList
              })
            } else if (res.code == 101) {
              wx.navigateTo({
                url: '../login/login'
              });
            }
            self.onClose();
          }, (err) => {
            console.log(err);

            wx.showModal({
              title: '提示',
              content: '上传失败00',
              showCancel: false
            })
          }, (err) => {
            console.log(err);
            wx.hideToast(); //隐藏Toast
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  
  },
  //添加录音
  addVideo:function(e){
    let self = this;
    console.log(e,"添加录音");   
    this.setData({ 
      showPop:true,
      addVideoId: e.currentTarget.dataset.mincateid,
      videoInd: e.currentTarget.dataset.index,
      ifFirst: false,
      endtime: "00 : 00 : 00 "
    })
  },
  //保存录音
  saveVideo:function(e){
    let self = this;
    //上传录音
    self.setData({
      status:3
    });
    recorderManager.stop();
    recorderManager.onStop((res) => {
      console.log('。。停止录音000。。', res)
      const { tempFilePath } = res;
      //结束录音计时  
      // console.log(tempFilePath,"录音文件")

      wx.getFileSystemManager().readFile({
        filePath: tempFilePath, //选择图片返回的相对路径
        encoding: 'base64', //编码格式
        success: res => { //成功的回调
         console.log(res.data,"ppppp++++++++++++++++++++++");
          self.setData({
            videoData: res.data,
            status: 3
          });
          let index = self.data.videoInd ;
          let videoD=[]
          let videoArrs = {};
          videoArrs.name = self.data.setInter,
          videoArrs.times = self.setVideoTime(self.data.recordingTimeqwe) ;
          if (self.data.orderData[index].voiceList == null){
            videoD.push(videoArrs);
            self.setData({
              ['orderData[' + index + '].voiceList']: videoD
            });
            videoD=[];
          } else {
            let videoArr = self.data.orderData[index].voiceList.concat(videoArrs);
            self.setData({
              
              ['orderData[' + index + '].voiceList']: videoArr
            });
          }         
          self.timer(self.data.time)
          clearInterval(init);
          self.uploadVideo(res.data,index);
        }
      })
    }) 
  },
  //录音
  uploadVideo:function(data,index){
    let self = this;
    let inds = self.data.videoInd;
    let len = self.data.orderData[inds].voiceList.length-1;
    let param = {
      "minCateId": self.data.addVideoId,  //小分类id
      "times": self.data.recordingTimeqwe,                       //录音时长，单位秒 
      "data": self.data.videoData, //录音的base64数据
      "id": self.data.id,        //巡查单id
      "accessToken": self.data.accessToken,
      "name": self.data.setInter
    }
    
    WXAPI.request('POST', '/patrol/uploadVoice', param, (res) => {
      console.log(res, "o录音上传结果");
      if (res.code == 200){
        self.onClose();
        self.setData({
          ['orderData[' + inds + '].voiceList[' + len +'].id']: res.id
        })
      } else if (res.code == 101) {
        wx.navigateTo({
          url: '../login/login'
        });
      } else {
        wx.showModal({
          title: '提示',
          content: '上传失败',
          showCancel: false
        })
      }
      self.onClose();
    }, (err) => {
      console.log(err);

      wx.showModal({
        title: '提示',
        content: '上传失败00',
        showCancel: false
      })
    }, (err) => {
      console.log(err);
      wx.hideToast(); //隐藏Toast
    })
    self.setData({
      showPop: false
    })
  },
  //开始录音
  openRecord: function () {
    var self = this;   
    let date = new Date();
    let name = util.formatTime(date).replace(/\//g,'').replace(/:/g,'').replace(/\s+/g,'');
    self.setData({
      setInter: name
    });
    wx.authorize({
      scope: 'scope.record',
      success(res) {
        console.log(res.authSetting)
        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        // wx.startRecord()
        self.setData({
          ifrecord: true
        });
        
      }
    })
    wx.getSystemInfo({
      success: function (res) {
        self.setData({
          // shutRecordingdis: "block",
          // openRecordingdis: "block"
        })
      }
    })
    const options = {
      duration: 600000, //指定录音的时长，单位 ms，最大为10分钟（600000），默认为1分钟（60000）
      sampleRate: 8000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate:16000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 50, //指定帧大小，单位 KB
    }
    //开始录音计时 
    
    console.log(self.data.ifrecord, self.data.ifFirst,"ifrecordifrecordifrecordifrecordifrecord")
    //开始录音
    
    self.timer()
    if (self.data.ifFirst == false) {
      recorderManager.start(options);
      recorderManager.onStart(() => {
        console.log('。。。开始录音。。。')
        self.setData({
          status:1
        })
      });
    } else if (self.data.ifFirst == true) {
      recorderManager.resume();
      self.setData({
        status: 1
      })
    }
    
    recorderManager.onStop((res) => {
      // console.log('recorder stop', res);
      const { tempFilePath } = res;
      //结束录音计时  
      console.log(tempFilePath, "录音文件")

      wx.getFileSystemManager().readFile({
        filePath: tempFilePath, //选择图片返回的相对路径
        encoding: 'base64', //编码格式
        success: res => { //成功的回调
          console.log(res.data, "ppppp++++++++++++++++++++++");
          self.setData({
            videoData: res.data,
            status: 3,
            showPop: false
          })
          this.timer(this.data.time)
          // self.uploadimg(res.data, mincateid, file.path, ind);
          
        }
      })
      
    })
    //错误回调
    recorderManager.onError((res) => {
      console.log(res, 'onError111');
    })
  },

  //暂停录音
  stopRecord: function () {
    let self = this;
    if (!this.data.ifFirst) {
      this.setData({
        ifFirst: true
      });
    }
    self.setData({
      ifrecord: false,
      status:2
      
    });
    self.timer(this.data.recordingTimeqwe)
    recorderManager.pause()
    // RecorderManager.onPause
  },
  //删除录音
  delVideo: function (e) {
    let self = this;
    console.log('删除录音',e);
    let indcell = e.currentTarget.dataset.indcell,
      ind = e.currentTarget.dataset.ind,
      minCateId = e.currentTarget.dataset.mincateid,
      voiceId = e.currentTarget.dataset.id;

    let data = {
      "minCateId": minCateId,
      "voiceId": voiceId,
      "patrolId": self.data.patrolId,
      "accessToken": self.data.accessToken
    }
    wx.showModal({
      title: '提示',
      content: '确定删除该录音么？',
      success(res) {
        if (res.confirm) {
          WXAPI.request('POST', '/patrol/delVoice', data, (res) => {
            console.log(res, "删除录音");
            if (res.code == 200) {
              self.data.orderData[ind].voiceList.splice(indcell, 1);
              console.log(self.data.orderData[ind].voiceList, "[[[[[[")
              self.setData({
                ['orderData[' + ind + '].voiceList']: self.data.orderData[ind].voiceList
              })
            } else if (res.code == 101) {
              wx.navigateTo({
                url: '../login/login'
              });
            }
          }, (err) => {
            console.log(err);

            wx.showModal({
              title: '提示',
              content: '上传失败00',
              showCancel: false
            })
          }, (err) => {
            console.log(err);
            wx.hideToast(); //隐藏Toast
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  
  },
  // 关闭录音弹框
  closeVideo:function(e){
    let self = this;
    console.log(e, self.data.ifrecord)
    if (e.currentTarget.dataset.sc ==0 ){
      if (self.data.ifrecord == true) {
        wx.showModal({
          title: '提示',
          content: '正在录音中，确定中断退出么',
          success(res) {
            if (res.confirm) {
              self.stopRecord();
              self.setData({
                showPop: false,
                recordingTimeqwe: 0,
                minutes: 0,// 分
                seconds: 0, // 秒
              });
              clearInterval(init);
            } else if (res.cancel) {
              console.log('用户点击取消');
            }
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '确定退出录音么？',
          success(res) {
            if (res.confirm) {
              self.stopRecord();
              self.setData({
                showPop: false,
                recordingTimeqwe: 0,
                minutes: 0,// 分
                seconds: 0, // 秒
              });
              clearInterval(init);
            } else if (res.cancel) {
              console.log('用户点击取消');

            }
          }
        })
      }
    } else if (e.currentTarget.dataset.sc == 1){
      wx.showModal({
        title: '提示',
        content: '确定删除录音么？',
        success(res) {
          if (res.confirm) {
            self.stopRecord();
            self.setData({
              ifFirst: false,
              ifrecord: false,
              recordingTimeqwe: 0,
              endtime:'00:00:00',
              minutes: 0,// 分
              seconds: 0, // 秒
            });
            clearInterval(init);
          } else if (res.cancel) {
            console.log('用户点击取消');

          }
        }
      })
    }
    
  },
  onClose:function(e){
    let self = this;
    // console.log(e,"1111")
    if(self.data.ifrecord == true){
      
    }
   
  },
  // 编辑录音时长显示
  setVideoTime:function(time){
    let self = this;
    let sec = parseInt(time / 60);
    let min = parseInt( time % 60);
    if(sec==10 ){
      sec = 10
    } else  {
      sec = "0"+ sec
    }
    if ( min >=10 ){
      min = min
    } else {
      min = "0"+min
    }
    return "00:" + sec+":" + min 
  },
  // 提交
  submit:function(option,e){
    let self = this;
    let dataArr =[];
    if (self.data.patrolState !=2){
      // console.log(self.data.optionsItem.items,"[[[[[[[[[[[[[[[[[[[[[[[[[")
      if (self.data.optionsItem.items != '' && self.data.optionsItem.items != null && self.data.optionsItem.items){
        self.data.optionsItem.items.forEach(function (i, j) {
          console.log(i,j);
          dataArr.push(i)
        })
      }
      self.setData({
        'optionsItem.items': dataArr
      })
      if (dataArr.length >0 ){
        let data = JSON.stringify(self.data.optionsItem);
        console.log(data, " JSON.stringify(params)")
        WXAPI.request('POST', '/patrol/submitPatrolMinCateList', data, (res) => {
          console.log(res, "++++++++++", "查询提交结果", res.data);

          if (res.code == 200) {
            self.setData({
              todoData: res.data
            })
            self.getItems();
            self.goTop();
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
        self.getItems();
        self.goTop();
      }
      
    } else {
      // console.log(option,"下一项的ID ")
      let data = {
        "minCateId": self.data.zgminCateId,
        "selOption": self.data.zgselOption,
        "patrolId": self.data.patrolId,
        "accessToken": self.data.accessToken
      };
      // console.log(data, " JSON.stringify(params)")
      WXAPI.request('POST', '/patrol/submitPatrolAdjustMinCateRecord', data, (res) => {
        console.log(res, "++++++++++", "查询提交结果", res.data);
        if (res.code == 200) {
          self.setData({
            todoData: res.data
          })
          self.getItems();
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
  // 上一项
  getPre:function(e){
    let self = this;
    let preNum = self.data.pageDatas[self.data.pageNum - 1];   
    self.setData({
      groupCode: preNum,
      chozgminCateId: preNum
    })
    console.log(preNum,"ooooo")
    self.submit(preNum);
  },
  //下一项
  getNext: function (e) {
    let self = this;
    let nextNum = self.data.pageDatas[self.data.pageNum + 1];
    console.log(nextNum, "nextNumnextNumnextNumnextNum")
    self.setData({
      groupCode: nextNum,
      chozgminCateId: nextNum
    })
    self.submit(nextNum);
  },
 
  // 计时器
  timer:function(videoTime){
    var self = this; 
    if (videoTime == undefined) { 
      init = setInterval(function () {
        let time = self.data.recordingTimeqwe + 1;
        console.log(typeof (time),"返回时间类型")
        self.setData({
          recordingTimeqwe: time
        });
        self.setData({
          seconds: self.data.seconds + 1
        })
        if (self.data.seconds < 10) {
          self.setData({
            endtime: "00 : 0" + self.data.minutes + " : 0" + self.data.seconds
          })
        } else if (self.data.seconds >= 60) {
          self.setData({
            seconds: 0,
            minutes: self.data.minutes + 1,
            endtime: "00 : 0" + self.data.minutes+1 + " : 00"
          })
        } else if (self.data.minutes < 10 && self.data.seconds > 10) {
          self.setData({
            endtime: "00 : 0" + self.data.minutes + " : " + self.data.seconds
          })
        } else if (self.data.minutes == 10) {
          self.setData({
            endtime: "00 : " + self.data.minutes + " : " + self.data.seconds
          });
          wx.showModal({
            title: '提示',
            content: '您已录音超时！',
            showCancel: false
          });
          self.stopRecord();
          clearInterval(init);
        } else {
          self.setData({
            endtime: "00 : 0" + self.data.minutes + " : " + self.data.seconds
          })
        } 
      }, 1000);
     } else {     
        clearInterval(init)
        console.log("暂停计时")
    }   
  },
  setTime:function(times){
    let self = this;

  },
  // 返回主页
  toSetting:function(){
    let self = this;
    self.submit();
    self.handerback();
  },
  handerback: function (e) {
    let self = this;
    wx.navigateBack({
      delta: 1,  // 返回上一级页面。
      success: function () {        
        let pages = getCurrentPages();//获取当前打开的页面栈，返回为数组，索引顺序为打开的顺序
        let prePages = pages[pages.length - 1];//获取到上一个页面对象
        // console.log(pages, prePages, "++++++++++++++++++++++++++++++++++++");       
        prePages.getList();
      }
    })
  },
  //回到顶部
  goTop: function (e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  }, 
  onChange2: function (event) {
    let self = this;
    console.log(event, "odkkdkds,mldfdfldgljdgfdgfdgfklj")
    self.setData({
      activeNames: event.detail
    });
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    this.getItems();
  },
  onPageScroll: function (e) {
    // console.log(e)
    if (e.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
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