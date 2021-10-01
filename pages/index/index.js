//index.js
//获取应用实例
var content = null;
var touchs = [];
var canvasWidth = 0;
var canvasHeight = 0;

Page({
  data: {
    canvas: null,
    ctx: null,
    canvasWidth: 0,
    canvasHeight: 0,
    touchs: [],
    signImage: ''
  },

  onLoad(options) {
    // 通过 SelectorQuery 获取 Canvas 节点
    wx.createSelectorQuery()
      .select('#signcanyou')
      .fields({
        node: true,
        size: true,
      })
      .exec(this.init.bind(this))
  },

  init(res) {
    console.log(res);
    const width = res[0].width
    const height = res[0].height

    const canvas = res[0].node
    //获得Canvas的上下文
    content = canvas.getContext('2d')
    console.log(content);

    const dpr = wx.getSystemInfoSync().pixelRatio
    canvas.width = width * dpr
    canvas.height = height * dpr
    content.scale(dpr, dpr)

    // //设置线的颜色
    content.fillStyle = '#1aad19'
    // //设置线的宽度
    content.lineWidth = 3;
    // 设置线两端端点样式更加圆润
    content.lineCap = 'round';
    // 设置两条线连接处更加圆润
    content.lineJoin = 'round';
    // 填充颜色
    content.strokeStyle = '#1aad19'

    this.setData({
      canvas: canvas,
      ctx: content,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    })

    // content.beginPath();
    // content.moveTo(50, 20);
    // content.lineTo(200, 100);
    // content.fill()
    // content.stroke()
  },

  // 画布的触摸移动开始手势响应
  start(event) {
    console.log("触摸开始x" + event.changedTouches[0].x);
    console.log("触摸开始y" + event.changedTouches[0].y);
    //获取触摸开始的 x,y
    let point = { x: event.changedTouches[0].x, y: event.changedTouches[0].y }
    touchs.push(point);
  },
  // 画布的触摸移动手势响应
  move(e) {
    console.log("触摸移动手势x" + e.touches[0].x);
    console.log("触摸移动手势y" + e.touches[0].y);
    let point = { x: e.touches[0].x, y: e.touches[0].y }
    touchs.push(point);
    if (touchs.length >= 2) {
      this.draw(touchs);
    }
  },
  // 画布的触摸移动结束手势响应
  end(e) {
    console.log("触摸结束" + e);
    //清空轨迹数组
    for (let i = 0; i < touchs.length; i++) {
      touchs.pop();
    }
  },
  // 画布的触摸取消响应
  cancel(e) {
    console.log("触摸取消" + e);
  },
  // 画布的长按手势响应
  tap(e) {
    console.log("长按手势" + e);
  },
  error(e) {
    console.log("画布触摸错误" + e);
  },

  //绘制
  draw(touchs) {
    let point1 = touchs[0];
    let point2 = touchs[1];
    touchs.shift();
    content.beginPath();
    content.moveTo(point1.x, point1.y);
    content.lineTo(point2.x, point2.y);
    content.stroke();
  },

  //清除操作
  clearClick() {
    var {canvasWidth, canvasHeight } = this.data
    //清除画布
    content.clearRect(0, 0, canvasWidth, canvasHeight);
  },

  //保存图片
  saveClick() {
    var that = this
    wx.canvasToTempFilePath({
      canvas: that.data.canvas,
      fileType: 'png',
      quality: 1, //图片质量
      success(res) {
        // console.log(res.tempFilePath, 'canvas生成图片地址');
        //打印图片路径
        console.log(res.tempFilePath);
        //设置保存的图片
        that.setData({
          signImage: res.tempFilePath
        })
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '已保存到相册',
              duration: 2000
            });
          }, fail: (err) => {
            console.log(err)
          }
        })
      }
    })
  },

  //预览
  previewCanvasImg() {
    wx.canvasToTempFilePath({
      canvas: this.data.canvas,
      fileType: 'jpg',
      quality: 1, //图片质量
      success(res) {
        // console.log(res.tempFilePath, 'canvas生成图片地址');
        wx.previewImage({
          urls: [res.tempFilePath], //预览图片 数组
        })
      }, fail: (err) => {
        console.log(err)
      }
    });
  }
})