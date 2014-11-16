###Wine###

- var todo = $('.todo').wine(function() {  }) // wine函数内为init函数,请注意函数内this为Wine对象,jQuery对象可以通过this.parent获得

- setTemplate({ text : 'ejs模版内容' , url : 'ejs模版路径'}) // 设置EJS模版路径或者模版内容，优先选择text

- value(data) // 给Wine对象赋值

- beforeValue(fn) // 赋值前执行fn

- afterValue(fn) // 渲染后执行fn

- render() // 对Wine对象渲染

- beforeRender(fn) // 渲染前执行fn

- afterRender(fn) // 渲染后执行fn

- binding({ attribute_name : binding_function({ $obj : 'wine-bind表单对象' , old : 'change之前的值' , value : '当前值' , path : 'Wine对象访问该属性的路径array'}  ) }) // 给Wine-bind表单元素绑定事件，其中this为当前wine对象

- unbinding( str|array ) // 给Wine-bind表单元素解绑，参数为字符串或者数组

- watch({ event_name:event_function }) // 订阅事件 可以watch'*'，目前只支持该通配符

- detach([event , event]) // 取消订阅

###工具函数###

- $.Wine.extend(obj, jquery_selector) // 继承

- $.Wine.trigger(event, data) // 触发订阅的事件