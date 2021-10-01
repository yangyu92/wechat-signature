
wechat-signature

### 转载：[查看原版](https://github.com/Kayakyx/wechat-signature) https://github.com/Kayakyx/wechat-signature

微信小程序Canvas手写板(use canvas in weapp for user signature)


工作中公司业务需要的微信小程序用户签字功能 准备将其组件化，并加强功能性开发，优化渲染逻辑

### 更新计划
组件化.

优化setData过于频繁照成的渲染延迟.

优化频繁绘制后有点卡顿的问题(重写绘制时, 没有把原绘制的数据清空导致)

增加笔迹样式.

增加撤销功能(撤销时, 笔画过多时撤销会比较卡顿, 暂时未找到解决方案)

#### 在源代码中 添加 保存、预览、等