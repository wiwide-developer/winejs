
/*
Wine 0.0.3
Daniel.Liu
 */

(function() {
  var Wine, contrast, getAttrKey, getBindingData, getElementVal, resolveAttr, singleValidate, uploadElementVal, valueBind;

  contrast = function(data, memorize) {
    var i, k, v, _i, _len;
    if ($.type(data) === 'object' && $.type(memorize) === 'object') {
      for (k in data) {
        v = data[k];
        if (!contrast(v, memorize[k])) {
          return false;
        }
      }
    } else if ($.type(data) === 'array' && $.type(memorize) === 'array') {
      for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
        v = data[i];
        if (!contrast(data[i], memorize[i])) {
          return false;
        }
      }
    } else {
      if (data !== memorize) {
        return false;
      }
    }
    return true;
  };

  resolveAttr = function(str) {
    var regAttr;
    regAttr = /[^\.\[\]]+/g;
    return str.match(regAttr);
  };

  getAttrKey = function(str) {
    var i, v, _arr, _i, _len;
    _arr = resolveAttr(str);
    for (i = _i = 0, _len = _arr.length; _i < _len; i = ++_i) {
      v = _arr[i];
      if (/[0-9]\d*/.test(v)) {
        _arr[i] = '$';
      }
    }
    return _arr.join('.');
  };

  getElementVal = function($obj) {
    if ($obj[0].nodeName.toLowerCase() === 'input' && ($obj.attr('type') === 'checkbox' || $obj.attr('type') === 'radio')) {
      return $obj.prop('checked');
    } else {
      return $obj.val();
    }
  };

  uploadElementVal = function(scope, $obj, str) {
    var i, v, _arr, _data, _i, _len, _old, _results;
    _arr = resolveAttr(str);
    _data = scope.data;
    if (_arr.length) {
      _results = [];
      for (i = _i = 0, _len = _arr.length; _i < _len; i = ++_i) {
        v = _arr[i];
        if (i < _arr.length - 1) {
          _results.push(_data = _data[v]);
        } else {
          _old = _data[v];
          _data[v] = getElementVal($obj);
          if (scope.actions[getAttrKey(str)]) {
            _results.push(scope.actions[getAttrKey(str)].call(scope, {
              $obj: $obj,
              old: _old,
              value: _data[v],
              path: _arr
            }));
          } else {
            _results.push(void 0);
          }
        }
      }
      return _results;
    }
  };

  getBindingData = function($obj, data) {
    var i, v, _arr, _data, _i, _len;
    _arr = resolveAttr($obj.attr('wine-bind'));
    if (_arr.length) {
      _data = data;
      for (i = _i = 0, _len = _arr.length; _i < _len; i = ++_i) {
        v = _arr[i];
        _data = _data[v];
      }
      return _data;
    }
  };

  singleValidate = function(k, v, data, context, elements) {
    var item, key, _arr, _data, _i, _j, _k, _len, _len1, _reg;
    _data = data;
    if (k.indexOf('$') >= 0) {
      _k = k.replace(/\$/g, '\\d+').replace(/\./g, '\\.');
      _reg = new RegExp(_k);
      for (key = _i = 0, _len = elements.length; _i < _len; key = ++_i) {
        item = elements[key];
        if (_reg.test(key) && !singleValidate(key, v, data, context, item)) {
          return false;
        }
      }
      return true;
    } else {
      _arr = k.split('.');
      for (_j = 0, _len1 = _arr.length; _j < _len1; _j++) {
        item = _arr[_j];
        _data = _data[item];
      }
      if (!v.rule.test(_data)) {
        v.fail.call(context, _data, elements[k]);
        return false;
      }
      v.success.call(context, _data, elements[k]);
      return true;
    }
  };

  valueBind = function($div, data) {
    return $div.find('[wine-bind]').each(function() {
      var $this, _val;
      $this = $(this);
      _val = getBindingData($this, data);
      if ($this[0].nodeName.toLowerCase() === 'select') {
        return $this.val(_val);
      } else if ($this[0].nodeName.toLowerCase() === 'input' && ($this.attr('type') === 'checkbox' || $this.attr('type') === 'radio')) {
        return $this.prop('checked', _val);
      } else {
        return $this.val(_val);
      }
    });
  };

  Wine = (function() {
    function Wine(parent, initialize) {
      var self;
      this.parent = parent;
      this.initialize = initialize;
      this.data = null;
      this.filter = null;
      this.template = null;
      this.memorize = null;
      this.actions = {};
      this.events = {};
      this.watches = {};
      this.validateRules = {};
      this.bindElements = {};
      this.initialized = false;
      self = this;
      this.parent.on('change', '[wine-bind]', function() {
        var $this;
        $this = $(this);
        return uploadElementVal(self, $this, $this.attr('wine-bind'));
      });
    }

    Wine.prototype.setTemplate = function(option) {
      if (option.text) {
        this.template = new EJS({
          text: option.text
        });
      } else if (option.url) {
        this.template = new EJS({
          url: option.url
        });
      }
      return this;
    };

    Wine.prototype.setValidate = function(option) {
      var i, k, _i, _len, _rules;
      _rules = this.validateRules;
      for (k = _i = 0, _len = option.length; _i < _len; k = ++_i) {
        i = option[k];
        _rules[resolveAttr(i.name).join('.')] = {
          rule: i.rule,
          success: i.success,
          fail: i.fail
        };
      }
      return this;
    };

    Wine.prototype.validate = function(option) {
      var i, k, self, v, _data, _elements, _i, _len, _rules;
      self = this;
      _rules = this.validateRules;
      _data = this.data;
      _elements = self.bindElements;
      if (!option) {
        for (k in _rules) {
          v = _rules[k];
          if (!singleValidate(k, v, _data, self, _elements)) {
            return false;
          }
        }
        return true;
      } else if ($.type(option) === 'string') {
        if (!singleValidate(option, _rules[option], _data, self, _elements)) {
          return false;
        } else {
          return true;
        }
      } else if ($.type(option) === 'array') {
        for (_i = 0, _len = option.length; _i < _len; _i++) {
          i = option[_i];
          if (!singleValidate(i, _rules[i], _data, self, _elements)) {
            return false;
          }
        }
        return true;
      }
    };

    Wine.prototype.value = function(data) {
      this.beforeValue();
      this.data = data;
      $.extend(true, data, this.memorize);
      this.afterValue();
      return this;
    };

    Wine.prototype.beforeValue = function(fn) {
      var e;
      try {
        fn.call(this);
      } catch (_error) {
        e = _error;
      }
      return this;
    };

    Wine.prototype.afterValue = function(fn) {
      var e;
      try {
        fn.call(this);
      } catch (_error) {
        e = _error;
      }
      return this;
    };

    Wine.prototype.render = function() {
      var $div, e, self, _elements;
      self = this;
      if (!this.initialized) {
        this.init();
        this.initialized = true;
      }
      try {
        this.beforeRenderFn();
      } catch (_error) {
        e = _error;
      }
      $div = $('<div></div>');
      $div.html(this.template.render(this.data));
      valueBind($div, self.data);
      this.parent.empty().append($div.children());
      _elements = self.bindElements = {};
      this.parent.find('[wine-bind]').each(function() {
        var $this, attrName;
        $this = $(this);
        attrName = resolveAttr($this.attr('wine-bind')).join('.');
        return _elements[attrName] = $this;
      });
      try {
        this.afterRenderFn();
      } catch (_error) {
        e = _error;
      }
      return this;
    };

    Wine.prototype.beforeRender = function(fn) {
      this.beforeRenderFn = fn;
      return this;
    };

    Wine.prototype.afterRender = function(fn) {
      this.afterRenderFn = fn;
      return this;
    };

    Wine.prototype.binding = function(obj) {
      var k, self, v, _arr;
      self = this;
      for (k in obj) {
        v = obj[k];
        _arr = resolveAttr(k);
        self.actions[_arr.join('.')] = v;
      }
      return this;
    };

    Wine.prototype.unbinding = function(option) {
      var i, self, unbind;
      self = this;
      unbind = function(str) {
        var _arr;
        _arr = resolveAttr(str);
        return self.actions[_arr.join('.')] = null;
      };
      if ($.type(option === 'string')) {
        unbind(option);
      } else {
        for (i in option) {
          unbind(i);
        }
      }
      return this;
    };

    Wine.prototype.init = function() {
      var e;
      try {
        this.initialize();
      } catch (_error) {
        e = _error;
      }
      return this;
    };

    Wine.prototype.watch = function(events) {
      var k, self, v, _results;
      self = this;
      _results = [];
      for (k in events) {
        v = events[k];
        self.events[k] = v;
        _results.push($.Wine.subscribe(self, k));
      }
      return _results;
    };

    Wine.prototype.detach = function(events) {
      var i, self, _results;
      self = this;
      _results = [];
      for (i in events) {
        delete self.events[i];
        _results.push($.Wine.detach(self, i));
      }
      return _results;
    };

    return Wine;

  })();

  jQuery.fn.wine = function(initialize) {
    var $parent;
    $parent = $(this);
    return new Wine($parent, initialize);
  };

  jQuery.Wine = {
    subscribers: {},
    extend: function(wine, parent) {
      var k, v, _ref, _subscribers, _wine;
      _subscribers = this.subscribers;
      _wine = $.extend({}, wine);
      _wine.parent = $(parent);
      _ref = wine.watches;
      for (k in _ref) {
        v = _ref[k];
        if (v = true && _subscribers[k] && _subscribers[k].length) {
          _wine.watches[k] = true;
          _subscribers[k].push(_wine);
        }
      }
      return _wine;
    },
    subscribe: function(obj, event) {
      if (!obj.watches[event]) {
        this.subscribers[event] = this.subscribers[event] || [];
        this.subscribers[event].push(obj);
      }
      return obj.watches[event] = true;
    },
    trigger: function(event, data) {
      var e, i, _all, _i, _j, _len, _len1, _results, _subscribers;
      _subscribers = this.subscribers[event] || [];
      for (_i = 0, _len = _subscribers.length; _i < _len; _i++) {
        i = _subscribers[_i];
        try {
          i.events[event].call(i, data);
        } catch (_error) {
          e = _error;
        }
      }
      _all = this.subscribers['*'] || [];
      _results = [];
      for (_j = 0, _len1 = _all.length; _j < _len1; _j++) {
        i = _all[_j];
        try {
          _results.push(i.events[event].call(i, data));
        } catch (_error) {
          e = _error;
        }
      }
      return _results;
    },
    detach: function(obj, event) {
      var i, k, _i, _len, _results, _subscribers;
      if (obj.watches[event]) {
        obj.watches[event] = null;
        _subscribers = this.subscribers[event] || [];
        _results = [];
        for (k = _i = 0, _len = _subscribers.length; _i < _len; k = ++_i) {
          i = _subscribers[k];
          if (obj === i) {
            _subscribers.splice(k, 1);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  };

}).call(this);
