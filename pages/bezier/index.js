import SignaturePad from 'signature-pad'

Page({
  data: {
    signaturePad: null,
    penColor: 'black',
  },
  onLoad: function () {
    wx.createSelectorQuery()
      .select('#canvas')
      .fields({
        node: true,
        size: true,
      })
      .exec(this.init.bind(this))
  },
  init(res) {
    const width = res[0].width
    const height = res[0].height
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    const dpr = wx.getSystemInfoSync().pixelRatio
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    const signaturePad = new SignaturePad(canvas, {
      ratio: dpr,
      backgroundColor: 'rgb(255, 255, 255)',
      // dotSize: 0,
      // throttle: 0,
      // velocityFilterWeight: 0.5,
      minWidth: 0.5,
      maxWidth: 5,
    });
    this.setData({
      signaturePad: signaturePad
    })
  },
  handleTouchStart: function (e) {
    this.data.signaturePad._handleTouchStart(e)
  },
  handleTouchMove: function (e) {
    this.data.signaturePad._handleTouchMove(e)
  },
  handleTouchEnd: function (e) {
    this.data.signaturePad._handleTouchEnd(e)
  },
  handleClear: function () {
    this.data.signaturePad.clear()
  },
  handleChangeColor: function () {
    const r = this.randColorVal();
    const g = this.randColorVal();
    const b = this.randColorVal();
    const color = `rgb(${r}, ${g}, ${b})`;
    this.data.signaturePad.penColor = color;
    this.setData({
      penColor: color
    })
  },
  randColorVal: function () {
    return Math.round(Math.random() * 255);
  },
  handleCancel: function () {
    var data = this.data.signaturePad.toData();
    if (data) {
      data.pop();
      this.data.signaturePad.fromData(data);
      this.data.signaturePad.penColor = this.data.penColor;
    }
  },
  handleSave: function (e) {
    const type = e.currentTarget.dataset.type
    const suffix = e.currentTarget.dataset.suffix
    if (this.data.signaturePad.isEmpty()) {
      wx.showToast({
        title: 'Please provide a signature first.',
        icon: 'none'
      })
    } else {
      var dataURL = this.data.signaturePad.toDataURL(type);
      var save = wx.getFileSystemManager();
      var number = Math.random();
      save.writeFile({
        filePath: `${wx.env.USER_DATA_PATH}/pic${number}.${suffix}`,
        data: dataURL.slice(22),
        encoding: 'base64',
        success: res => {
          wx.saveImageToPhotosAlbum({
            filePath: `${wx.env.USER_DATA_PATH}/pic${number}.${suffix}`,
            success: function (res) {
              wx.showToast({
                title: '保存成功',
              })
            }
          })
        }
      })
    }
  },

  //保存到相册
  saveCanvasAsImg() {
    var that = this
    wx.canvasToTempFilePath({
      canvas: that.data.signaturePad.canvas,
      fileType: 'png',
      quality: 1, //图片质量
      success(res) {
        //打印图片路径
        console.log(res.tempFilePath, 'canvas生成图片地址');
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
    console.log(this.data);
    wx.canvasToTempFilePath({
      canvas: this.data.signaturePad.canvas,
      fileType: 'jpg',
      quality: 1, //图片质量
      success(res) {
        console.log(res.tempFilePath, 'canvas生成图片地址');
        wx.previewImage({
          urls: [res.tempFilePath], //预览图片 数组
        })
      }, fail: (err) => {
        console.log(err)
      }
    });
  },

  //上传
  uploadCanvasImg() {
    var that = this
    wx.canvasToTempFilePath({
      canvas: that.data.signaturePad.canvas,
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
      }
    })
  },

})
