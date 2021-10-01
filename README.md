
wechat-signature

### 转载：[查看原版](https://github.com/Kayakyx/wechat-signature) https://github.com/Kayakyx/wechat-signature

微信小程序Canvas手写板(use canvas in weapp for user signature)


工作中公司业务需要的微信小程序用户签字功能 准备将其组件化，并加强功能性开发，优化渲染逻辑

### 更新计划
组件化.

优化setData过于频繁照成的渲染延迟.

~~优化频繁绘制后有点卡顿的问题(重写绘制时, 没有把原绘制的数据清空导致);~~
移除缓存笔迹(笔迹过多时会导致绘制缓慢); 共享笔迹时, 可将笔迹使用Socket进行传递, 只需要传递最后一个笔迹即可

增加笔迹样式.

~~增加撤销功能(之前使用的是重新绘制);~~
撤销功能改用缓存绘制图片(将每次绘制的图片缓存起来, 撤销时绘制上一个步骤的图片)

#### 在源代码中 添加 保存、预览、撤销等

#### 注意: 暂不支持window与mac