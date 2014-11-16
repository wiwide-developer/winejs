# Wine.js快速入门


在页面中引入jQuery、EJS和Wine

```html
<script src="jquery-1.11.1.min.js" type="text/javascript"></script>
<script src="ejs.js" type="text/javascript"></script>
<script src="wine.js" type="text/javascript"></script>
```

在页面中建立Wine对应的DOM元素

```html
<dl class="wine-book"></dl>
```

声明一个Wine对象

```javascript
var bookPresenter = $('.wine-book').wine();
```

设置模版文件

```javascript
var html = '<dt><%= name %></dt><dd><%= author %></dd>';
bookPresenter.setTemplate({ text:html });
```

给Wine对象赋值

```javascript
bookPresenter.value({ name:'三体', author:'刘慈欣'});
```

渲染到页面中

```javascript
bookPresenter.render();
```

写在一起的代码，沿用jQuery的链式调用

```html
<script src="jquery-1.11.1.min.js" type="text/javascript"></script>
<script src="ejs.js" type="text/javascript"></script>
<script src="wine.js" type="text/javascript"></script>
<dl class="wine-book"></dl>
<script type="text/javascript">
	var html = '<dt><%= name %></dt><dd><%= author %></dd>';
	var bookPresenter = $('.wine-book').wine();
	bookPresenter
	.setTemplate({ text:html })
	.value({ name:'三体', author:'刘慈欣'})
	.render();
</script>
```