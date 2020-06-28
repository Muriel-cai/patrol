// pages/part/comList/comList.js
Component({

  /**
   * 页面的初始数据
   */
  properties: {
    id: {
      type: String
    },
    organId: {
      type: String
    },
    title: {
      type: String
    },
    time: {
      type: String
    },
    terminationTime:{
      type: String
    },
    busiState:{
      type: String
    }
  },
  data: {     
    value: {}
    
  },
  methods:{
    // onLike(event) {
    //   let like = this.properties.like;
    //   let count = this.properties.count;
    //   count = like ? count - 1 : count + 1;
    //   this.setData({
    //     like: !like,
    //     count
    //   })
    //   let behavior = this.properties.like ? "like" : "cancel";
    //   this.triggerEvent('like', {
    //     behavior
    //   }, {})
    // },
    toNext: function (event) {
      // console.log(event, "djdjskjksldskssk", this.properties);
      // this.$emit('toNext', event.detail);
      let value={};
      value.id = this.properties.id;
      value.state = this.properties.busiState;
      this.triggerEvent('toNext', value);
    },
  }
})