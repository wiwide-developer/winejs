###
Wine 0.0.8
Daniel.Liu
###

# 数据比较
contrast = (data, memorize) ->
    if $.type(data) == 'object' && $.type(memorize) == 'object'
        for k,v of data
            if !contrast(v, memorize[k])
                return false
    else if $.type(data) == 'array' && $.type(memorize) == 'array'
        for v,i in data
            if !contrast(data[i], memorize[i])
                return false
    else
        if data != memorize
            return false
    true

# 解析wine-bind的属性 eg: 'data.a[0].b' -> ['data', 'a', '0', 'b'] 
getBindArr = (str) ->
    regAttr = /[^\.\[\]]+/g
    str.match regAttr

# 解析wine-bind的属性
getBindStr = (str) ->
    _arr = getBindArr str
    for v,i in _arr
        if /[0-9]\d*/.test v
            _arr[i] = '$'
    _arr.join '.'

# 根据type获取表单项的值
getElementVal = ($obj, $div) ->
    if $obj.attr('type') == 'checkbox'
        $obj.prop 'checked'
    else if $obj.attr('type') == 'radio'
        _name = $obj.attr('name')
        $div.find(':radio:checked[name=' + _name + ']').val()
    else
        $obj.val()

# 从添加wine-bind的表单项把数据同步到viewModel
syncViewModel = (scope, $obj, str) ->
    _arr = getBindArr str
    _data = scope.data
    if _arr.length
        for v,i in _arr
            if i < _arr.length - 1
                _data = _data[v]
            else
                _old = _data[v]
                _data[v] = getElementVal($obj, scope.parent)
                _name = getBindStr str
                # 调用validate actions
                if scope.validateActions[_name]
                    scope.validateActions[_name].call scope, _name, $obj

                # 调用bindAction绑定的函数
                if scope.actions[_name]
                    scope.actions[_name].call scope,{ $obj : $obj , old : _old , value : _data[v] , path : _arr }

# 取得指定属性viewModel数据
getBindData = ($obj, data) ->
    _arr = getBindArr $obj.attr 'wine-bind'
    if _arr.length
        _data = data
        for v,i in _arr
            _data = _data[v]
        _data

# 根据path单条验证
validateSingle = (k, v, data, context, elements) ->
    _data = data
    if (k.indexOf('$') >= 0)
        _k = k.replace(/\$/g,'\\d+').replace(/\./g,'\\.')
        _reg = new RegExp(_k)
        for key,item of elements
            if _reg.test(key) && !validateSingle(key, v, data, context, item)
                return false
        return true
    else
        _arr = k.split('.')
        for item in _arr
            _data = _data[item]
        if !v.rule.test(_data)
            v.fail.call(context, _data, elements[k])
            return false            
        v.success.call(context, _data, elements[k])
        return true

# 给绑定的表单赋值
valueBindElements = ($div, data) ->
    $div.find('[wine-bind]').each(() ->
        $this = $(@)
        _val = getBindData $this,data
        if $this[0].nodeName.toLowerCase() == 'select'
            $this.val _val
        else if $this[0].nodeName.toLowerCase() == 'input' && ($this.attr('type') == 'checkbox')
            $this.prop 'checked',_val
        else if $this[0].nodeName.toLowerCase() == 'input' && $this.attr('type') == 'radio'
            _name = $this.attr('name')
            $div.find(':radio[name=' + _name + '][value=' + _val + ']').prop 'checked',_val
        else
            $this.val(_val)
    )

# 在构造函数中监听wine-bind元素change事件
changeBind = () ->
    self = @
    @parent.off('change').on('change','[wine-bind]',() ->
        $this = $ @
        if $this.attr('type') == 'radio' && !$this.prop('checked')
            return
        else
            syncViewModel self,$this,$this.attr('wine-bind')
    )

class Wine

    # 构造函数
    constructor: (@parent, @initialize) ->
        @data = null
        @filter = null
        @template = null
        @memorize = null
        @actions = {}
        @validateActions = {}
        @events = {}
        @watches = {}
        @validateRules = {}
        @bindElements = {}
        @initialized = false
        changeBind.call @
    
    # 模版设置
    setTemplate: (text) ->
        @template = text
        @
    
    # 验证规则设置 {name:'tag name', rule:/\d/, checked:false, success:fn, fail:fn}
    setValidate: (option) ->
        _rules = @validateRules
        _validates = @validateActions
        for i,k in option
            _name = getBindArr(i.name).join('.')
            _rules[_name] = {
                rule : i.rule
                success : i.success
                fail : i.fail
            }
            if i.auto
                _validates[_name] = (name) ->
                    @validate(name)
        @

    # 验证
    validate: (option) ->
        self = @
        _rules = @validateRules
        _data = @data
        _elements = self.bindElements
        if !option
            for k,v of _rules
                if !validateSingle(k, v, _data, self, _elements)
                    return false
            return true
        else if $.type(option) == 'string'
            if !validateSingle(option, _rules[option], _data, self, _elements)
                return false
            else
                return true
        else if $.type(option) == 'array'
            for i in option
                if !validateSingle(i, _rules[i], _data, self, _elements)
                    return false
            return true

    # 给viewmodel赋值
    value: (data) ->
        @beforeValue()
        @data = data
        $.extend(true, data, @memorize)
        @afterValue()
        @

    beforeValue: (fn) ->
        try
            fn.call @
        catch e
            # ...
        @
        
    afterValue: (fn) ->
        try
            fn.call @
        catch e
            # ...
        @

    # 表单
    form: () ->
        self = @
        $parent = @parent
        _elements = self.bindElements
        if !@initialized
            @.init()
            @initialized = true
        valueBindElements $parent,self.data
        $parent.find('[wine-bind]').each( () ->
            $this = $(@)
            attrName = getBindArr($this.attr('wine-bind')).join('.')
            _elements[attrName] = $this
        )
        @

    # 渲染
    render: () ->
        self = @
        if !@initialized
            @.init()
            @initialized = true

        try
            @beforeRenderFn()
        catch e
            # ...
        # 渲染之前先给wine-bind元素赋值
        $div = $('<div></div>')
        $div.html ejs.render(@template,@data)
        valueBindElements $div,self.data
        @parent.empty().append $div.children()        
        _elements = self.bindElements = {}
        @parent.find('[wine-bind]').each( () ->
            $this = $(@)
            attrName = getBindArr($this.attr('wine-bind')).join('.')
            _elements[attrName] = $this
        )
        try
            @afterRenderFn()
        catch e
            # ...
        @

    beforeRender: (fn) ->
        @beforeRenderFn = fn
        @

    afterRender: (fn) ->
        @afterRenderFn = fn
        @

    # 绑定viewmodel的元素关联事件
    binding: (obj) ->
        self = @
        for k,v of obj
            _arr = getBindArr k
            self.actions[_arr.join '.'] = v
        @

    # 取消绑定viewmodel的元素关联事件
    unbinding: (option) ->
        self = @
        unbind = (str) ->
            _arr = getBindArr str
            self.actions[_arr.join '.'] = null

        if $.type option == 'string'
            unbind option
        else 
            for i of option
                unbind i
        @

    # init函数是执行声明wine对象时的initialize函数，最主要的作用是绑定事件委托的事件
    init: () ->
        try
            @initialize()
        catch e
            # ...
        
        @

    # 订阅
    watch: (events) ->
        self = @
        for k,v of events
            self.events[k] = v
            $.Wine.subscribe(self, k)

    # 取消订阅
    detach : (events) ->
        self = @
        for i of events
            delete self.events[i]
            $.Wine.detach(self, i)

## jQuery接口
jQuery.fn.wine = (initialize) ->
    $parent = $(@)
    new Wine $parent,initialize 

# 订阅/发布/继承
jQuery.Wine = {
    subscribers : {}

    extend : (wine, parent) ->
        _subscribers = @subscribers
        _wine = $.extend(true, {}, wine)
        _wine.parent = $(parent)
        for k,v of wine.watches
            if v = true && _subscribers[k] && _subscribers[k].length
                _wine.watches[k] = true
                _subscribers[k].push _wine
        changeBind.call _wine
        _wine

    subscribe : (obj, event) ->
        if !obj.watches[event]
            @subscribers[event] = @subscribers[event] || []
            @subscribers[event].push obj
        obj.watches[event] = true

    trigger : (event, data) ->
        _subscribers = @subscribers[event] || []        
        for i in _subscribers
            try
                i.events[event].call i,data
            catch e
                #...

        _all = @subscribers['*'] || []
        for i in _all
            try
                i.events[event].call i,data
            catch e
                # ...

    detach : (obj, event) ->
        if obj.watches[event]
            obj.watches[event] = null        
            _subscribers = @subscribers[event] || []        
            for i,k in _subscribers
                if obj == i
                    _subscribers.splice k,1
                    break
        
}