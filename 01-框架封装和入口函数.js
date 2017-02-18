/**
 * 框架的封装和extend方法
 * 使用自执行函数 和 在window上绑定两个数据暴露框架的 接口
 */
(function (window) {
    var emptyArray = [];
    var push = emptyArray.push;
    var splice = emptyArray.splice;

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
        init: function (selector) {
            splice.call(this, 0, this.length);
            var elements = Sizzle(selector);
            push.apply(this, elements);

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


    //暴露两个接口
    window.$ = window.jQuery = jQuery;
})(window)
