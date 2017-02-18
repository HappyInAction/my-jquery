/**
 * prependTo方法
 */
(function (window) {
    var emptyArray = [];
    var push = emptyArray.push;
    var splice = emptyArray.splice;
    var toString = Object.prototype.toString;

    var types = 'String Number Boolean RegExp Function Math Date Object Null Undefined'.split(' ');
    var class2type = {};
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        class2type['[object ' + type + ']'] = type.toLowerCase();
    }

    //模拟Sizzle引擎
    var Sizzle = function (selector) {
        return document.querySelectorAll(selector);
    }

    //jQuery函数
    function jQuery(selector) {
        return new jQuery.fn.init(selector);
    }

    //jQuery的原型替换
    jQuery.fn = jQuery.prototype = {
        constructor: jQuery,
        varsion:"0.1",
        init: function (selector) {
            if(jQuery.isString(selector)){
                if(selector.charAt(0)==="<"&&selector.charAt(selector.length -1)
                    &&selector.length>=3){ /*创建dom元素*/
                    var div = document.createElement("div");
                    div.innerHTML = selector;
//                        for (var i = 0; i < div.childNodes.length; i++) {
//                            var child = array[i];
//                            push.call(this,child);
//                        }
                    push.apply(this,div.childNodes);
                }else{ /*是字符串--获取页面上的dom元素*/
                    splice.call(this, 0, this.length);
                    var elements = Sizzle(selector);
                    push.apply(this, elements);
                }

            }else if(selector.nodeType){ /*dom元素 包装成jQuery的对象*/
                this[0] = selector;
                this.length = 1;
            }else if(selector.version===this.version){/*jQuery的对象 -- 直接返回该jQuery的对象*/
                return selector;
            }
            return this;
        }
    }

    //将F的原型 指向 jQuery的原型
    jQuery.fn.init.prototype = jQuery.fn;

    //$.extend方法
    jQuery.fn.extend = jQuery.extend = function () {
        var argLen = arguments.length;
        if (argLen === 0) return this;

        var target;
        var sources = [];

        var arg0 = arguments[0];
        //1、 1个参数 将该对象中的方法和属性绑定到this---> jQuery上和jQuery的原型上
        if (argLen === 1) {
            target = this;
            sources.push(arg0);

        } else {
            //2、 >1个参数  将第一个参数以后的对象中的方法绑定到第一个对象中
            target = arg0;
            sources.push.apply(sources, arguments);
            sources.splice(0, 1);
        }

        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            for (var key in source) {
                target[key] = source[key];
            }
        }
        return target;

    }

    //$对象上扩展的方法
    jQuery.extend({
        //判断是什么类型 返回 string number
        type: function (data) {
            //借用Object.prototype.toString方法
            return class2type[toString.call(data)];
        },
        //抛出异常对象的方法
        error: function (msg) {
            throw new Error(msg);
        },
        //判断数据是否是 string类型的数据
        isString: function (data) {
            return this.type(data) === 'string';
        },
        //判断数据是否是 function类型的数据
        isFunction: function (data) {
            return this.type(data) === 'function';
        },
        //$对象的each方法 两个参数 1:要遍历的对象，2:回调函数
        each: function (array, callback) {
            var arrLen = array.length;
            if (typeof arrLen === 'number' && arrLen >= 0) {
                for (var i = 0; i < array.length; i++) {
                    //回调函数的调用模式是上下文调用模式 内部的this指向 array[i]
                    if (callback.call(array[i], i, array[i]) === false) {
                        break;
                    }
                }
            }
            else {
                for (var key in array) {
                    if (callback.call(array[key], key, array[key]) === false) {
                        break;
                    }
                }
            }

        },

        //trim:去除字符串两端的空格
        trim: function (str) {
            return str.replace(/^\s+|\s+$/g,"");
        }

    });

    //jQuery的css方法
    jQuery.fn.extend({
        //css方法
        /*
         * 1、没有参数 返回该实例
         * 2、1个参数
         *       a、这个参数值字符串 获取样式的值并返回 （带单位）
         *       b、这个参数是对象 批量操作dom元素添加设置该参数中的属性
         * 3、两个参数arg0 arg1
         *       批量操作dom元素的样式 并添加设置样式为arg0 值为arg1
         * */
        css: function () {
            var argLen = arguments.length;
            //1、没有传递参数时 直接返回该是实例
            if (argLen === 0) return this;
            var arg0 = arguments[0];
            //2、传递一个参数时 分两种情况
            if (argLen === 1) {
                // 2.1 该参数是字符串类型 获取值
                if (jQuery.isString(arg0)) {
                    //window.getComputedStyle()方法的第一个参数是获取的哪个对象的实例
                    return window.getComputedStyle(this[0], null)[arg0];

                } else {
                    // 2.2 该参数是对象 批量设置样式
                    this.each(function () {
                        //这个回调函数中的this 是F的实例中的每个dom元素
                        var dom = this;
                        /*需要实现的功能是 将arg0中的属性和方法 绑定到dom.style中*/
//                            $.each(arg0, function (styleName,styleValue) {
//                                //这个回调函数中的this 是agr0中每个属性的值的对应的包装数据类型
//                                dom.style[styleName] = styleValue;
//                            })
                        //第二种方法
                        $.extend(dom.style, arg0);
                    })
                }
                //3、传递 >1 个参数时 分两种情况 只处理前两个
            } else {
                var arg1 = arguments[1];
                this.each(function () {
                    this.style[arg0] = arg1;
                })
            }

            //返回this
            return this;
        },

        //each方法 遍历该伪数组
        each: function (callback) {
            jQuery.each(this,callback);
            return this;
        },

        //attr获取方法
        /*
         * 1、没有参数 返回该实例
         * 2、1个参数
         *       a、这个参数值字符串 获取属性的值 并返回
         *       b、这个参数是对象 批量操作dom元素添加设置该参数中的属性
         * 3、两个参数arg0 arg1      第二个之后的参数不处理
         *       批量操作dom元素添加设置arg0属性 的值为arg1
         * */
        attr: function (arg0,arg1) {
            var argLen = arguments.length;
            //没有参数
            if(argLen === 0) return this;
            //1个参数
            if(argLen === 1){
                //a、这个参数值字符串
                if(jQuery.isString(arg0)){
                    return this[0].getAttribute(arg0);
                }else{
                    //b、这个参数是对象
                    return this.each(function () {
                        for(var attrName in arg0){
                            this.setAttribute(attrName,arg0[attrName]);
                        }
                    })
                }
                //2个参数
            }else{
                return this.each(function () {
                    this.style[arg0] = arg1;
                })
            }

        },

        //show:方法 将dom.style["display"] = "block" 调用attr方法
        show: function () {
            return this.attr("display","block");
        },

        //hide方法：将dom.style["display"] = "block" 调用attr方法
        hide: function () {
            return this.attr("display","none");
        },

        //toggle:方法，显示的元素隐藏，隐藏的元素显示
        toggle: function () {
            return this.each(function () {
                /*dom元素不能调用 $.fn的方法*/
                var $this = $(this);
                /*if else 实现*/
//                    if($this.attr("display") === "none"){
//                        $this.show();
//                    }else{
//                        $this.hide();
//                    }
                /*三元运算符实现*/
                //不能使用 attr 因为attr获取是是属性 而不是样式的值
                $this.css("display") === "none"? $this.show():$this.hide();
            })
        },

        //hasClass(data): 判断当前F的实例中的dom元素中是否含有data类名
        hasClass: function (name) {
            var isExist = false;
            this.each(function () {
                if((" "+this.className +" ").indexOf(" "+ name+" ") != -1){
                    isExist = true;
                    return false;
                }
            })
            return isExist;
        },

        //addClass(name)：判断当前F的实例中的dom元素中没有含该类名的 dom元素添加该类名
        addClass: function (name) {
            return this.each(function () {
                if(!$(this).hasClass(name)){
                    this.className += " "+ name;
                }
            })
        },

        //removeClass(name) , 有该类名就移除该类名
        removeClass: function (name) {
            //不传参数，删除所有的类名
            if(arguments.length===0) {
                return this.each(function () {
                    this.className = "";
                })
            }else{
                //传递一个或者多个参数
                var classNames = name.split(" ");
                return this.each(function () {
                    var cName = " "+ this.className+" ";
                    for (var i = 0; i < classNames.length; i++) {
                        if($(this).hasClass(classNames[i])){
                            cName = cName.replace(" "+classNames[i]+" "," ");
                        }
                    }
                    this.className = cName;

                })
            }

        },

        //toggleClass(name):没有该类名就添加该类名，有该类名就移除该类名
        toggleClass: function (name) {
            return this.each(function () {
                var $this = $(this);
                if($this.hasClass(name)){
                    $this.removeClass(name)
                }else{
                    $this.addClass(name);
                }
//                    $this.hasClass(name)? $this.removeClass(name):$this.addClass(name);
            })

        }
    });

    /*$.fn 中的appendTo prependTo append prepend remove html text方法*/
    jQuery.fn.extend({
        //$("<input/><span>333</span><div>333</div>").appentTo("div")
        //将前面的所有dom元素添加到后面的每一个dom元素中
        appendTo: function () {
            var $parent = $(arguments[0]);
            return this.each(function () {
                var $child = this;
                $parent.each(function () {
                    this.appendChild($child.cloneNode(true));
                });

            })
        },

        //prependTo ：将前面的元素添加到后面的每个dom元素中
        prependTo: function () {
            var $parent = $(arguments[0]);
            return this.each(function () {
                var $child = this;
                $parent.each(function () {
                    this.insertBefore($child.cloneNode(true),this.firstChild);
                });
            })
        }
    })

    //暴露两个接口
    window.$ = window.jQuery = jQuery;

})(window)