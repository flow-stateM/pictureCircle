var animationv ={};
var normalAttr = [
 'width',
 'height',
 'left',
 'top',
 'bottom',
 'right',
 'marginLeft',
 'marginTop',
 'marginBottom',
 'marginRight'
];

var css3Attr = [
 'rotate',
 'rotateX',
 'rotateY',
 'skewX',
 'skewY',
 'translateX',
 'translateY',
 'translateZ',
 'scale',
 'scaleX',
 'scaleY'
];

function indexOf(arr, item){
 for(var i=0,len=arr.length; i<len; i++){
	 if(arr[i] === item){
		 return i;
	 }
 }
 return -1;
};

function css(ele, attr, val){
 if(typeof attr === 'string' && typeof val === 'undefined'){
	 if(indexOf(css3Attr, attr) !== -1){
		 return transform(ele, attr);
	 }
	 var ret = getComputedStyle(ele)[attr];
	 return indexOf(normalAttr, attr) !== -1 ? parseFloat(ret) : ret * 1 === ret * 1 ? ret*1 : ret;  
 }
 
 function setAttr(attr, val){
	 if(indexOf(css3Attr, attr) !== -1){
		 return transform(ele, attr, val);
	 }
	 if(indexOf(normalAttr, attr) !== -1){
		 ele.style[attr] = val ? val + 'px' : val;
	 }else{
		 ele.style[attr] = val;
	 }
 }
 
 // 批量设置
 if(typeof attr === 'object'){
	 for(var key in attr){
		 setAttr(key, attr[key]);
	 }
	 return;
 }
 
 setAttr(attr, val);
};

css.init3d = function (el){
 css(el, {
	 rotate: 0,
	 rotateX: 0,
	 rotateY: 0,
	 translateX: 0,
	 translateY: 0,
	 translateZ: 0,
	 skewX: 0,
	 skewY: 0,
	 scale: 1,
	 scaleX: 1,
	 scaleY: 1
 });
};

function transform(el, attr, val){
 el._transform = el._transform || {};

 if(typeof val === 'undefined'){
	 return el._transform[attr];
 }
 
 el._transform[attr] = val;
 
 var str = '';
 
 for(var key in el._transform){
	 var value = el._transform[key];
	 switch (key) {
		 case 'translateX':
		 case 'translateY':
		 case 'translateZ':
		 	if(value[value.length-1]=='%'){
				str += `${key}(${value.substr(0,value.length-1)}%) `;
			}else{
			 str += `${key}(${value}px) `;
			}
			 break;
		 case 'rotate':
		 case 'rotateX':
		 case 'rotateY':
		 case 'skewX':
		 case 'skewY':
			 str += `${key}(${value}deg) `;
			 break;
		 default:
			 str += `${key}(${value}) `;
	 }
 }
 
 el.style.transform = str.trim();
};
//动画帧函数
function animation(props){
 var el= props.el;
 if(el.animation) return;

 el.stop = function (){
	 window.cancelAnimationFrame(el.animation);
	 el.animation = null;
 };


 var duration = props.duration || 400,
		 fx = props.fx || 'easeOut',
		 cb = props.cb,
		 attrs = props.attrs || {};
 
 var beginData = {}, changeData = {};
 
 for(var key in attrs){
	 beginData[key] = css(el, key);
	 changeData[key] = attrs[key] - beginData[key];
 }
 
 var startTime = Date.now();
 
 (function startMove(){
	 el.animation = window.requestAnimationFrame(startMove);
	 
	 var time = Date.now() - startTime;
	 
	 if(time > duration){
		 time = duration;
		 window.cancelAnimationFrame(el.animation);
		 el.animation = null;
	 }
	 
	 for(var key in attrs){
		 var currentPos = Tween[fx](time, beginData[key], changeData[key], duration);
		 css(el, key, currentPos);
	 }
	 
	 if(time === duration && typeof cb === 'function'){
		 window.cancelAnimationFrame(el.animation);
		 el.animation = null;
		 cb.call(el);
		 //下面是自行添加的  由于时间等于这个的时候会执行一次cb  然后时间大于还会执行一次让时间等于 所以需要直接清除
	 }
 })();
};


var Tween = {
 linear: function (t, b, c, d){  //匀速
	 return c*t/d + b;
 },
 easeIn: function(t, b, c, d){  //加速曲线
	 return c*(t/=d)*t + b;
 },
 easeOut: function(t, b, c, d){  //减速曲线
	 return -c *(t/=d)*(t-2) + b;
 },
 easeBoth: function(t, b, c, d){  //加速减速曲线
	 if ((t/=d/2) < 1) {
		 return c/2*t*t + b;
	 }
	 return -c/2 * ((--t)*(t-2) - 1) + b;
 },
 easeInStrong: function(t, b, c, d){  //加加速曲线
	 return c*(t/=d)*t*t*t + b;
 },
 easeOutStrong: function(t, b, c, d){  //减减速曲线
	 return -c * ((t=t/d-1)*t*t*t - 1) + b;
 },
 easeBothStrong: function(t, b, c, d){  //加加速减减速曲线
	 if ((t/=d/2) < 1) {
		 return c/2*t*t*t*t + b;
	 }
	 return -c/2 * ((t-=2)*t*t*t - 2) + b;
 },
 elasticIn: function(t, b, c, d, a, p){  //正弦衰减曲线（弹动渐入）
	 if (t === 0) { 
		 return b; 
	 }
	 if ( (t /= d) == 1 ) {
		 return b+c; 
	 }
	 if (!p) {
		 p=d*0.3; 
	 }
	 if (!a || a < Math.abs(c)) {
		 a = c; 
		 var s = p/4;
	 } else {
		 var s = p/(2*Math.PI) * Math.asin (c/a);
	 }
	 return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
 },
 elasticOut: function(t, b, c, d, a, p){    //*正弦增强曲线（弹动渐出）
	 if (t === 0) {
		 return b;
	 }
	 if ( (t /= d) == 1 ) {
		 return b+c;
	 }
	 if (!p) {
		 p=d*0.3;
	 }
	 if (!a || a < Math.abs(c)) {
		 a = c;
		 var s = p / 4;
	 } else {
		 var s = p/(2*Math.PI) * Math.asin (c/a);
	 }
	 return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
 },    
 elasticBoth: function(t, b, c, d, a, p){
	 if (t === 0) {
		 return b;
	 }
	 if ( (t /= d/2) == 2 ) {
		 return b+c;
	 }
	 if (!p) {
		 p = d*(0.3*1.5);
	 }
	 if ( !a || a < Math.abs(c) ) {
		 a = c; 
		 var s = p/4;
	 }
	 else {
		 var s = p/(2*Math.PI) * Math.asin (c/a);
	 }
	 if (t < 1) {
		 return - 0.5*(a*Math.pow(2,10*(t-=1)) * 
				 Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	 }
	 return a*Math.pow(2,-10*(t-=1)) * 
			 Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
 },
 backIn: function(t, b, c, d, s){     //回退加速（回退渐入）
	 if (typeof s == 'undefined') {
			s = 1.70158;
	 }
	 return c*(t/=d)*t*((s+1)*t - s) + b;
 },
 backOut: function(t, b, c, d, s){
	 if (typeof s == 'undefined') {
		 s = 3.70158;  //回缩的距离
	 }
	 return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
 }, 
 backBoth: function(t, b, c, d, s){
	 if (typeof s == 'undefined') {
		 s = 1.70158; 
	 }
	 if ((t /= d/2 ) < 1) {
		 return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
	 }
	 return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
 },
 bounceIn: function(t, b, c, d){    //弹球减振（弹球渐出）
	 return c - Tween['bounceOut'](d-t, 0, c, d) + b;
 },       
 bounceOut: function(t, b, c, d){//*
	 if ((t/=d) < (1/2.75)) {
		 return c*(7.5625*t*t) + b;
	 } else if (t < (2/2.75)) {
		 return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
	 } else if (t < (2.5/2.75)) {
		 return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
	 }
	 return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
 },      
 bounceBoth: function(t, b, c, d){
	 if (t < d/2) {
		 return Tween['bounceIn'](t*2, 0, c, d) * 0.5 + b;
	 }
	 return Tween['bounceOut'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
 }
};
//抖动函数
function shake(props){
 var el = props.el;	
 
 if(el.shake) return;
 
 var dir = props.dir || 'X',
		 times = props.times || 40,
		 cb = props.cb;
 
 if(times < 20) times = 20;
 if(times > 100) times = 100;
 
 var arr = [];
 
 for(var i=times; i>=0; i--){
	 arr[arr.length] = -i;
	 arr[arr.length] = i;
 }
 arr.length--;
 
 var index = 0;
 var start = 0;
 
 (function move(){
	 el.shake = window.requestAnimationFrame(move);
	 
	 if(index === arr.length){
		 window.cancelAnimationFrame(el.shake);
		 el.shake = null;
		 if(typeof cb === 'function'){
			 return cb.call(el);
		 }
		 return;
	 }	 
	 css(el, 'translate' + dir, start + arr[index++]);
 })();
}
//加0函数
function add0(n){
 return n < 10 ? '0' + n : '' + n;
};
//随机数函数
function rp(arr, int){
 var min = Math.min(...arr);
 var max = Math.max(...arr);
 var ret = Math.random() * (max - min) + min;
 return int ? Math.round(ret) : ret;
};
//快排
function quickSort(arr){
	if(arr.length <= 1){
	  return arr;
	}
	// 选取基点
	var base = arr.splice(~~(arr.length/2), 1)[0];
	var left = [];
	var right = [];
	
	while(arr.length){
	  if(arr[0] < base){
		left.push(arr.shift());
	  }else{
		right.push(arr.shift());
	  }
	}
	return quickSort(left).concat(base, quickSort(right));
  };

//获取用户代理信息 是否为移动端
function userinfo (){
	var ret = false;
	var device = ['iPhone','iPad','Android'];
	var now = window.navigator.userAgent;
	device.forEach(function(item){
		if(now.indexOf(item)!==-1){ret=true};
	});
	return ret;
};

//将传入的字符串转成type:num的对象
function searchChange(str){
	var data ={}
	if(str.indexOf('&') === -1){
		var temp = str.split('=');
		data[temp[0]] = temp[1];
	}else{
	var temp = str.split('&');
	// console.log(temp);
	for(var i=0; i<temp.length; i++){
		var item = temp[i].split('=');
		// console.log(item);
		data[item[0]] = item[1];
	}
	}
	return data;
  
}
//碰撞检测
function duang(ele1, ele2){
	var rect1 = ele1.getBoundingClientRect();
	var rect2 = ele2.getBoundingClientRect();
	return rect1.right > rect2.left && rect1.left < rect2.right && rect1.bottom > rect2.top && rect1.top < rect2.bottom;
  }
//获取当前对屏幕的位置
function getRect(ele){
return ele.getBoundingClientRect()
}
  
//拖拽
function dragEle(props){
	var downEle = props.downEle;  // 鼠标按下的元素
	var moveEle = props.moveEle || downEle;  // 要拖拽的元素，默认是按下的元素
	var scrope = props.scrope; // 是否限制范围，默认是
	var beforeFn = props.beforeFn;  // 按下拖拽之前执行的函数
	var moveFn = props.moveFn; // 在拖拽时执行的函数
	var endFn = props.endFn; // 拖拽结束之后执行的函数
	var called = props.called || downEle; // 设定执行函数体内的this指向
	var disableX = props.disableX || false; // 是否禁用横向拖拽 默认否
	var disableY = props.disableY || false; // 是否禁用纵向拖拽，默认否
	var outDisable = props.outDisable || false; // 鼠标超出范围是否取消拖拽操作，默认否
	
	var dx, dy, 
		offsetParent = moveEle.offsetParent,
		parentRect = getRect(offsetParent);
	
		
	var moveScrop = props.moveScrop || offsetParent;  // 鼠标移动事件触发对象，默认就是拖拽对象的定位父级
	var upScrop = props.upScrop || moveScrop;  // 鼠标抬起的事件触发对象，默认是拖拽对象的定位父级
	
	downEle.addEventListener('mousedown', function (e){
	  e.preventDefault();
	  
	  beforeFn&&beforeFn.call(called, e);
	  
	  var moveTargetRect = getRect(moveEle);
	  
	  dx = e.pageX - moveTargetRect.left;
	  dy = e.pageY - moveTargetRect.top;
	  
	  if(outDisable) document.addEventListener('mousemove', docMove);
	  moveScrop.addEventListener('mousemove', startMove);
	  upScrop.addEventListener('mouseup', cancelMove);
	});
	
	function startMove(e){
	  var x = e.pageX - dx - parentRect.left;
	  var y = e.pageY - dy - parentRect.top;
  
	  if(typeof scrope == 'undefined'){
		if(x < 0) x = 0;
		if(x > offsetParent.clientWidth - moveEle.offsetWidth){
		  x = offsetParent.clientWidth - moveEle.offsetWidth;
		}
		
		if(y < 0) y = 0;
		if(y > offsetParent.clientHeight - moveEle.offsetHeight){
		  y = offsetParent.clientHeight - moveEle.offsetHeight;
		}
	  }
	  
	  if(!disableX) moveEle.style.left = x +'px';
	  if(!disableY) moveEle.style.top = y + 'px';
	  
	  moveFn&&moveFn.call(called, e);
	}
	
	function cancelMove(e){
	  if(outDisable) document.removeEventListener('mousemove', docMove);
	  moveScrop.removeEventListener('mousemove', startMove);
	  upScrop.removeEventListener('mouseup', cancelMove);
	  endFn&&endFn.call(called, e);
	}
	
	function docMove(e){
	  var x = e.pageX, y = e.pageY;
	  if(x < parentRect.left || x > parentRect.right || y < parentRect.top || y > parentRect.bottom){
		cancelMove();
	  }
	}
  }
  
//鼠标滚轮事件  
function mouseWheel(ele,upfn,downfn,clear){
	if(window.onmousewheel===null){
		ele.addEventListener('mousewheel',fn);
	}else{
		ele.addEventListener('DOMmouseScroll',fn);
	}
	function fn(e){
		var dir;
		if(e.detail){
			dir = e.detail < 0 ? true : false;
		}
		if(e.wheelDelta){
			dir = e.wheelDelta > 0 ? true : false;
		}
		if(dir){
			upfn&&upfn.call(ele,e);
		}else{
			downfn&&downfn.call(ele,e);
		}
	}
};

//设置随机rgb颜色  55~255之间
function createColor(){
	return `rgba(${rp([55, 255], true)}, ${rp([55, 255], true)}, ${rp([55, 255], true)},${rp([0.1,1])})`;
  }
  
