// pages/signature/signature.js
// 绘制的历史记录,用于撤销操作
var allDrawWorksPath = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvasName: 'handWriting',
    ctx: '',
    canvasWidth: 0,
    canvasHeight: 0,
    transparent: 1, // 透明度
    selectColor: 'black',
    lineColor: '#1A1A1A', // 颜色
    lineSize: 1.5,  // 笔记倍数
    lineMin: 0.2,   // 最小笔画半径
    lineMax: 3,     // 最大笔画半径
    radius: 1, //画圆的半径
    cutArea: { top: 0, right: 0, bottom: 0, left: 0 }, //裁剪区域
    pressure: 0.9,     // 默认压力
    smoothness: 30,  //顺滑度，用60的距离来计算速度
    currentPoint: {},
    currentLine: [],  // 当前线条
    firstTouch: true, // 第一次触发
    lastPoint: 0,
    chirography: [], //笔迹
    currentChirography: {}, //当前笔迹
    linePrack: [], //划线轨迹 , 生成线条的实际点
    canvas: null,
  },

  /*======所有自定义函数======*/

  // 笔迹开始
  uploadScaleStart(e) {
    this.saveCurrentDrawWorks();
    if (e.type != 'touchstart') return false;
    let ctx = this.data.ctx;
    ctx.fillStyle = this.data.lineColor;      // 初始线条设置颜色
    ctx.globalAlpha = this.data.transparent;  // 设置半透明
    let currentPoint = {
      x: e.touches[0].x,
      y: e.touches[0].y
    }
    let currentLine = this.data.currentLine;
    currentLine.unshift({
      time: new Date().getTime(),
      dis: 0,
      x: currentPoint.x,
      y: currentPoint.y
    })
    this.setData({
      currentPoint,
      currentLine
    })
    if (this.data.firstTouch) {
      this.setData({
        cutArea: { top: currentPoint.y, right: currentPoint.x, bottom: currentPoint.y, left: currentPoint.x },
        firstTouch: false
      })
    }
    this.pointToLine(currentLine);
  },
  // 笔迹移动
  uploadScaleMove(e) {
    if (e.type != 'touchmove') return false;
    if (e.cancelable) {
      // 判断默认行为是否已经被禁用
      if (!e.defaultPrevented) {
        e.preventDefault();
      }
    }
    let point = {
      x: e.touches[0].x,
      y: e.touches[0].y
    }

    //测试裁剪
    if (point.y < this.data.cutArea.top) {
      this.data.cutArea.top = point.y;
    }
    if (point.y < 0) this.data.cutArea.top = 0;

    if (point.x > this.data.cutArea.right) {
      this.data.cutArea.right = point.x;
    }
    if (this.data.canvasWidth - point.x <= 0) {
      this.data.cutArea.right = this.data.canvasWidth;
    }
    if (point.y > this.data.cutArea.bottom) {
      this.data.cutArea.bottom = point.y;
    }
    if (this.data.canvasHeight - point.y <= 0) {
      this.data.cutArea.bottom = this.data.canvasHeight;
    }
    if (point.x < this.data.cutArea.left) {
      this.data.cutArea.left = point.x;
    }
    if (point.x < 0) this.data.cutArea.left = 0;

    this.setData({
      lastPoint: this.data.currentPoint,
      currentPoint: point
    })
    let currentLine = this.data.currentLine
    currentLine.unshift({
      time: new Date().getTime(),
      dis: this.distance(this.data.currentPoint, this.data.lastPoint),
      x: point.x,
      y: point.y
    })
    // this.setData({
    //   currentLine
    // })
    // console.log(currentLine);
    this.pointToLine(currentLine);
  },
  // 笔迹结束
  uploadScaleEnd(e) {
    if (e.type != 'touchend') return 0;
    let point = {
      x: e.changedTouches[0].x,
      y: e.changedTouches[0].y
    }
    this.setData({
      lastPoint: this.data.currentPoint,
      currentPoint: point
    })
    let currentLine = this.data.currentLine
    // currentLine.unshift({
    //   time: new Date().getTime(),
    //   dis: this.distance(this.data.currentPoint, this.data.lastPoint),
    //   x: point.x,
    //   y: point.y
    // })
    // if (currentLine.length > 2) {
    //   var info = (currentLine[0].time - currentLine[currentLine.length - 1].time) / currentLine.length;
    // }
    //一笔结束，保存笔迹的坐标点，清空，当前笔迹
    //增加判断是否在手写区域；
    this.pointToLine(currentLine);
    // var currentChirography = {
    //   lineSize: this.data.lineSize,
    //   lineColor: this.data.lineColor
    // };
    // var chirography = this.data.chirography
    // chirography.unshift(currentChirography);
    // this.setData({
    //   chirography
    // })
    // var linePrack = this.data.linePrack
    // linePrack.unshift(this.data.currentLine);
    this.setData({
      // linePrack,
      currentLine: []
    });
  },

  //画两点之间的线条；参数为:line，会绘制最近的开始的两个点；
  pointToLine(line) {
    this.calcBethelLine(line);
    return;
  },
  //计算插值的方式；
  calcBethelLine(line) {
    if (line.length <= 1) {
      line[0].r = this.data.radius;
      return;
    }
    let x0, x1, x2, y0, y1, y2, r0, r1, r2, len, lastRadius, dis = 0, time = 0, curveValue = 0.5;
    if (line.length <= 2) {
      x0 = line[1].x
      y0 = line[1].y
      x2 = line[1].x + (line[0].x - line[1].x) * curveValue;
      y2 = line[1].y + (line[0].y - line[1].y) * curveValue;
      x1 = x0 + (x2 - x0) * curveValue;
      y1 = y0 + (y2 - y0) * curveValue;;

    } else {
      x0 = line[2].x + (line[1].x - line[2].x) * curveValue;
      y0 = line[2].y + (line[1].y - line[2].y) * curveValue;
      x1 = line[1].x;
      y1 = line[1].y;
      x2 = x1 + (line[0].x - x1) * curveValue;
      y2 = y1 + (line[0].y - y1) * curveValue;
    }
    //从计算公式看，三个点分别是(x0,y0),(x1,y1),(x2,y2) ；(x1,y1)这个是控制点，控制点不会落在曲线上；实际上，这个点还会手写获取的实际点，却落在曲线上
    len = this.distance({ x: x2, y: y2 }, { x: x0, y: y0 });
    lastRadius = this.data.radius;
    for (let n = 0; n < line.length - 1; n++) {
      dis += line[n].dis;
      time += line[n].time - line[n + 1].time;
      if (dis > this.data.smoothness) break;
    }
    this.setData({
      radius: Math.min(time / len * this.data.pressure + this.data.lineMin, this.data.lineMax) * this.data.lineSize
    });
    line[0].r = this.data.radius;
    //计算笔迹半径；
    if (line.length <= 2) {
      r0 = (lastRadius + this.data.radius) / 2;
      r1 = r0;
      r2 = r1;
      //return;
    } else {
      r0 = (line[2].r + line[1].r) / 2;
      r1 = line[1].r;
      r2 = (line[1].r + line[0].r) / 2;
    }
    let n = 5;
    let point = [];
    for (let i = 0; i < n; i++) {
      let t = i / (n - 1);
      let x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2;
      let y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2;
      let r = lastRadius + (this.data.radius - lastRadius) / n * i;
      point.push({ x: x, y: y, r: r });
      if (point.length == 3) {
        let a = this.ctaCalc(point[0].x, point[0].y, point[0].r, point[1].x, point[1].y, point[1].r, point[2].x, point[2].y, point[2].r);
        a[0].color = this.data.lineColor;
        this.bethelDraw(a, 1);
        point = [{ x: x, y: y, r: r }];
      }
    }
    this.setData({
      currentLine: line
    })
  },
  //求两点之间距离
  distance(a, b) {
    let x = b.x - a.x;
    let y = b.y - a.y;
    return Math.sqrt(x * x + y * y);
  },
  ctaCalc(x0, y0, r0, x1, y1, r1, x2, y2, r2) {
    let a = [], vx01, vy01, norm, n_x0, n_y0, vx21, vy21, n_x2, n_y2;
    vx01 = x1 - x0;
    vy01 = y1 - y0;
    norm = Math.sqrt(vx01 * vx01 + vy01 * vy01 + 0.0001) * 2;
    vx01 = vx01 / norm * r0;
    vy01 = vy01 / norm * r0;
    n_x0 = vy01;
    n_y0 = -vx01;
    vx21 = x1 - x2;
    vy21 = y1 - y2;
    norm = Math.sqrt(vx21 * vx21 + vy21 * vy21 + 0.0001) * 2;
    vx21 = vx21 / norm * r2;
    vy21 = vy21 / norm * r2;
    n_x2 = -vy21;
    n_y2 = vx21;
    a.push({ mx: x0 + n_x0, my: y0 + n_y0, color: "#1A1A1A" });
    a.push({ c1x: x1 + n_x0, c1y: y1 + n_y0, c2x: x1 + n_x2, c2y: y1 + n_y2, ex: x2 + n_x2, ey: y2 + n_y2 });
    a.push({ c1x: x2 + n_x2 - vx21, c1y: y2 + n_y2 - vy21, c2x: x2 - n_x2 - vx21, c2y: y2 - n_y2 - vy21, ex: x2 - n_x2, ey: y2 - n_y2 });
    a.push({ c1x: x1 - n_x2, c1y: y1 - n_y2, c2x: x1 - n_x0, c2y: y1 - n_y0, ex: x0 - n_x0, ey: y0 - n_y0 });
    a.push({ c1x: x0 - n_x0 - vx01, c1y: y0 - n_y0 - vy01, c2x: x0 + n_x0 - vx01, c2y: y0 + n_y0 - vy01, ex: x0 + n_x0, ey: y0 + n_y0 });
    a[0].mx = a[0].mx.toFixed(1);
    a[0].mx = parseFloat(a[0].mx);
    a[0].my = a[0].my.toFixed(1);
    a[0].my = parseFloat(a[0].my);
    for (let i = 1; i < a.length; i++) {
      a[i].c1x = a[i].c1x.toFixed(1);
      a[i].c1x = parseFloat(a[i].c1x);
      a[i].c1y = a[i].c1y.toFixed(1);
      a[i].c1y = parseFloat(a[i].c1y);
      a[i].c2x = a[i].c2x.toFixed(1);
      a[i].c2x = parseFloat(a[i].c2x);
      a[i].c2y = a[i].c2y.toFixed(1);
      a[i].c2y = parseFloat(a[i].c2y);
      a[i].ex = a[i].ex.toFixed(1);
      a[i].ex = parseFloat(a[i].ex);
      a[i].ey = a[i].ey.toFixed(1);
      a[i].ey = parseFloat(a[i].ey);
    }
    return a;
  },
  bethelDraw(point, is_fill, color) {
    let ctx = this.data.ctx;
    ctx.beginPath();
    ctx.moveTo(point[0].mx, point[0].my);
    if (undefined != color) {
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
    } else {
      ctx.fillStyle = point[0].color;
      ctx.strokeStyle = point[0].color;
    }
    for (let i = 1; i < point.length; i++) {
      ctx.bezierCurveTo(point[i].c1x, point[i].c1y, point[i].c2x, point[i].c2y, point[i].ex, point[i].ey);
    }
    ctx.stroke();
    if (undefined != is_fill) {
      ctx.fill(); //填充图形 ( 后绘制的图形会覆盖前面的图形, 绘制时注意先后顺序 )
    }
  },
  selectColorEvent(event) {
    console.log(event)
    var color = event.currentTarget.dataset.colorValue;
    var colorSelected = event.currentTarget.dataset.color;
    this.setData({
      selectColor: colorSelected,
      lineColor: color
    })
  },

  // 重写
  retDraw() {
    var { canvasWidth, canvasHeight } = this.data
    //清除画布
    this.data.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    allDrawWorksPath = [];
    this.setData(
      {
        currentPoint: {},
        currentLine: [],  // 当前线条
        firstTouch: true, // 第一次触发
        bethelPoint: [],  //保存所有线条 生成的贝塞尔点；
        lastPoint: 0,
        chirography: [], //笔迹
        currentChirography: {}, //当前笔迹
        linePrack: [], //划线轨迹 , 生成线条的实际点
      }
    );
    //设置canvas背景
    this.setCanvasBg("#fff");
  },

  // 老的撤销方式, 采用重新绘制的方法
  // undoCanvasLineOld() {
  //   let linePrack = this.data.linePrack;
  //   var chirography = this.data.chirography
  //   linePrack.shift();
  //   chirography.shift();
  //   var { canvasWidth, canvasHeight } = this.data
  //   this.data.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  //   linePrack.forEach((currentLines, index) => {
  //     // console.log(currentLines);
  //     let currentChirography = chirography[index];
  //     this.setData({
  //       lineSize: currentChirography.lineSize,
  //       lineColor: currentChirography.lineColor,
  //     })
  //     for (let index = 0; index < currentLines.length; index++) {
  //       let currentLine = currentLines.slice(currentLines.length - index - 1);
  //       //一笔结束，保存笔迹的坐标点，清空，当前笔迹
  //       // console.log(currentLine);
  //       //增加判断是否在手写区域；
  //       this.pointToLine(currentLine);
  //     }
  //   });
  //   this.setData({
  //     currentLine: []
  //   })
  // },

  // 使用绘制图片的方式, 每次把上一次的图片缓存起来, 这样节省了绘制时间,只需要绘制一张图片就行
  undoCanvasLine() {
    var { canvasWidth, canvasHeight } = this.data
    var drawWorksPath = allDrawWorksPath.pop();
    if (drawWorksPath) {
      let img = this.data.canvas.createImage(canvasWidth, canvasHeight);//创建img对象
      img.src = drawWorksPath;
      img.onload = () => {
        // img.complete表示图片是否加载完成，结果返回true和false;
        // console.log(img.complete);//true
        // 使用屏幕像素比, 确保图片尺寸正确
        let pixelRatio = this.data.pixelRatio;
        if (img.complete) {
          this.data.ctx.drawImage(img, 0, 0, canvasWidth / pixelRatio, canvasHeight / pixelRatio);
        }
      };
    }

    if (allDrawWorksPath.length == 0) {
      this.retDraw();
    }
  },

  //完成
  subCanvas() {
    console.log(this.data);
    console.log(allDrawWorksPath.length);
  },

  //保存到相册
  saveCanvasAsImg() {
    var that = this
    wx.canvasToTempFilePath({
      canvas: that.data.canvas,
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

  saveCurrentDrawWorks() {
    let url = this.data.canvas.toDataURL();
    allDrawWorksPath.push(url);
  },

  //预览
  previewCanvasImg() {
    wx.canvasToTempFilePath({
      canvas: this.data.canvas,
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
      }
    })
  },

  /*======所有自定义函数=END=====*/

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 通过 SelectorQuery 获取 Canvas 节点
    wx.createSelectorQuery()
      .select('#handWriting')
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
    let content = canvas.getContext('2d')
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

    let pixelRatio = wx.getSystemInfoSync().pixelRatio;

    this.setData({
      canvas: canvas,
      ctx: content,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      lineColor: '#1A1A1A',
      pixelRatio: pixelRatio,
    })
    //设置canvas背景
    this.setCanvasBg("#fff");
  },

  //设置canvas背景色  不设置  导出的canvas的背景为透明 
  //@params：字符串  color
  setCanvasBg(color) {
    // console.log('设置背景与填充色');
    /* 将canvas背景设置为 白底，不设置  导出的canvas的背景为透明 */
    //rect() 参数说明  矩形路径左上角的横坐标，左上角的纵坐标, 矩形路径的宽度, 矩形路径的高度
    //这里是 canvasHeight - 4 是因为下边盖住边框了，所以手动减了写
    this.data.ctx.rect(0, 0, this.data.canvasWidth, this.data.canvasHeight - 4);
    this.data.ctx.fillStyle = color;
    this.data.ctx.fill()  //设置填充
  },
})