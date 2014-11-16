# API


## Wine


### $.fn.wine(init);

声明Wine对象

__参数(可选):__

Wine的init函数,会在第一次渲染之前执行

```javascript
var presenter = $(dom).wine(init);
```


### setTemplate({text:text, url:url})

设置EJS模版

__参数(二选一):__

text : EJS模版内容

url : EJS模版路径

```javascript
presenter.setTemplate({ text : text , url : url})
```

### value(data)

给Wine对象赋值,可以通过 presenter.data 访问

__参数(必选):__

json数据

```javascript
presenter.value(data);
```

### beforeValue(fn)

给presenter赋值之前执行fn

__参数(必选):__

赋值之前执行的函数

```javascript
presenter.beforeValue(fn);
```

### afterValue(fn)

给presenter赋值之后执行fn

__参数(必选):__

赋值之后执行的函数

```javascript
presenter.afterValue(fn);
```

### render()

对Wine对象渲染

```javascript
presenter.render()
```

### beforeRender(fn)

在渲染presenter中的数据之前执行fn

__参数(必选):__

在渲染presenter中的数据之前执行的函数

```javascript
presenter.beforeRender(fn);
```

### afterRender(fn)

在渲染presenter中的数据之后执行fn

__参数(必选):__

在渲染presenter中的数据之后执行的函数

```javascript
presenter.afterRender(fn);
```

### binding({ attributeName:function({ $obj : element , old : old , value : value , path : path}){} })

给wine-bind表单元素绑定事件，其中this为当前wine对象

__参数(必选):__

格式:{ attributeName: callback, attributeName1: callback1 ... }

类型:json

attributeName:用wine-bind给表单元素绑定presenter中data的值

callback:在绑定wine-bind的表单元素触发change事件时调用callback函数

callback arguments:

- $obj:表单元素对应的jQuery对象
- old:表单元素触发change事件之前的值
- value:表单元素触发change事件之后的值
- path:attribute相对于presenter中data对象的路径

```javascript
presenter.binding({
	attribute : function(argu){
		console.log(argu);
		//	{ 
		//		$obj : element,
		//		old : old,
		//		value : value,
		//		path : path
		//	}
	}

});

```

### unbinding( str|array )

给Wine-bind表单元素解绑，参数为字符串或者数组

__参数(必选):__

对应binding参数中的attributeName

```javascript
presenter.unbinding('name');
```

### watch({eventName:callback})

订阅事件

__参数(必选):__

格式:{ eventName: callback, eventName1: callback1 ... }

类型:json

eventName:订阅事件名,支持通配符'*'

callback:指定事件回调函数,如果在trigger时传递了数据可以在callback函数中获取到

```javascript
presenter.watch({'eventName':callback});
```

### detach

取消订阅

__参数(必选):__

格式:[event, event1 ...]

类型:数组

已经订阅过的事件名

```javascript
presenter.detach(['eventName','eventName1']);
```

##工具函数

### $.Wine.extend(presenter, $element);

从已经建立的presenter生成新的presenter

__参数(必选)__

presenter:需要被继承的presenter

$element:生成的presenter关联的jQuery对象

### $.Wine.trigger(eventName, data)

触发订阅的事件

__参数__

eventName:需要触发的事件

data:传递给订阅函数的参数数据