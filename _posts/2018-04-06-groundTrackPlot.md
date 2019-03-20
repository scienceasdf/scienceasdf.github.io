---
title: 在线绘制星下点轨迹 
categories:
- Programming
tags:
- JavaScript
- 天文
updated: 2018-04-14
---
<script type="text/x-mathjax-config">
  		MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
  							TeX: { equationNumbers: {  autoNumber: "AMS"  },
     							   extensions: ["AMSmath.js"]}
  		});
		</script>
 <script type="text/javascript" src="https://cdn.bootcss.com/mathjax/2.7.3/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
**自己写了写网页绘制星下点轨迹的代码。**

---
## 算法
这个算是原创算法了吧，身边没有轨道动力学和弹道导弹学的教材，都是自己瞎琢磨的算法。之前我们分析了[轨道动力学中常用的计算机算法](https://scienceasdf.github.io/programming/2017/04/07/astrodynamics1/),[轨道动力学中常用的计算机算法（二）](https://scienceasdf.github.io/programming/2017/04/14/astrodynamics2/)，这些很有用，可以让我们把轨道六根数转化为笛卡尔坐标系的坐标，以及进行轨道外推。  
  
星下点轨迹的具体计算过程如下：每隔时间$dt$后，外推此时的轨道六根数，并得到相应的笛卡尔坐标系坐标。然后经度
\begin{equation}
\lambda = \mathrm{atan2}(y,x)
\end{equation}
纬度
\begin{equation}
\phi = \mathrm{asin}(\frac{z}{r})
\end{equation}
其中
\begin{equation}
r=\sqrt{x^2+y^2+z^2}
\end{equation}
这里就基本完成了。不过还要考虑地球自转的影响，这个很让人头疼，因为atan2函数本身值域没问题,$[-\pi,\pi]$,但是考虑地球自转后需要
\begin{equation}
\lambda = \lambda - t * \omega
\end{equation}
这样$\lambda$的值域就会变化。想了挺长时间，得到这样的一种解决方法
```javascript
geo.prototype.adjust = function (){
    if(this.long > 180 || this.long < 180){
        var theta = this.long * radPerDeg;
        var s = Math.sin(theta);
        var c = Math.cos(theta);
        var res = Math.atan2(s,c);
        this.long = res * degPerRad;
    }
};
```

## 具体实现
我是javascript的门外汉，把我以前写的C++代码全部移植到javascript很是费劲。不过运算速度比我想象中快多了。这里直接用的是开普勒运动的轨道外推，如果考虑摄动项那就需要用龙格库塔算法了。整个javascript的代码在[orbitState.js](https://scienceasdf.github.io/site/js/orbitState.js)，代码是可读的。 
   
UI还是以前的东西，用jQuery Mobile+ECharts做的。最后，绘图的连接在[这里](https://scienceasdf.github.io/site/groundTrackPlot.html)。
  
---
## 更新（2018-4-8）
另外自己还做了一个[在线解析TLE数据绘制星下点轨迹的网页](https://scienceasdf.github.io/site/TLE/index.html)，这个的算法就不是我写的了，而是用的开源的[satellite.js](https://github.com/shashwatak/satellite-js)的SGP4算法，他的代码也写得非常好。网页里面还有试一试功能，就是在NORAD的网站里面按编号随机抓取一个TLE数据，不过再度遇到了跨域访问的问题，这一次的解决方法则是protocol:
```javascript
$.ajax({ 
  type: 'GET', 
  url: 'https://crossorigin.me/https://celestrak.com/cgi-bin/TLE.pl?CATNR=' + rndSat + '&callback=?' , 
  cache:false, 
  dataType: "text", 
  crossDomain: true, 
  headers : {'Origin':'http://foo.example'}, 
  success : function(data){ 
    var el = document.createElement( 'html' );
    el.innerHTML = data;
    var p = el.getElementsByTagName( 'BODY' )[0].getElementsByTagName('PRE')[0].textContent;
    var eachLine = p.split(/[\n]/);
    if(eachLine[0] == 'No TLE found'){
      $( "#myPopup3" ).popup( "open" );   
    }else{
      var titleStr = eachLine[0].replace(/[\s]deb/ig, "的碎片");
      window.alert("随机得到的卫星名字是" + titleStr);
      $('#areaTLE').val(eachLine[1] + '\n' + eachLine[2]);
      boolNotGet = false;
    }
  }
});
```
没错，通过一个crossorigin.me的网站来抓数据，这样就可以实现跨域访问了。但是需要注意的是一定要加上Origin的访问头，否则得不到数据。
### 2018-4-14更新
https://crossorigin.me访问不了了，只能登陆http://crossorigin，又是费了很大劲找解决方案。最终找到了一个替代的网站：https://cors-anywhere.herokuapp.com，和crossorigin的使用没什么区别。还有一些不支持https的站点，以及一些用不了的站点，我就不列举在这里了。
  
## 航天类开源代码一览
* [GMAT](https://sourceforge.net/projects/gmat/)：这个是对我帮助最大的一个软件，C++的代码，软件设计非常好，无论是数学类算法还是从软件工程上说大量设计模式的运用，能够在一定程度上取代STK，不过遗憾的是GUI是用wxWidgets写的，如果是Qt就好了；
* [satellite.js](https://github.com/shashwatak/satellite-js)：就是我网页里用到的开源代码，写得也很好，可以实现在网页中的计算（如果结合three.js这些3D渲染框架，在网页上还能进行动画演示）；
* [Vallado的代码](http://www.celestrak.com/publications/AIAA/2006-6753/)：这个Vallodo是天体动力学的祖师级大神，他的代码我虽然没有看过，但是他的代码和学术出版都是对我有很大帮助的，satellite.js的代码就是参考了Vallado的代码的；
  
下面的这些我不太了解了，仅供参考：
* [PreviSat](http://previsat.sourceforge.net/)：还在更新，C++写的，Qt做GUI；
* [JSatTrak](http://www.gano.name/shawn/JSatTrak/)：Java写的，更新很慢；
* [JAT](http://jat.sourceforge.net/)：Java写的，没更新了；
* [ODTBX](http://odtbx.sourceforge.net/)：Java写的，更新很慢；
* [Orekit](https://www.orekit.org/)：Java写的，更新很慢；
* [PyEphem](rhodesmill.org/pyephem/)：Python库，很久没更新了；
* [SGP4](https://pypi.python.org/pypi/sgp4/)：Python库，很久没更新了
  
这些开源的不知道为什么有不少托管在SourceForge上面，按理说GitHub生态更好啊。不更新也可以理解，毕竟航天这个东西生态圈太小了。  
另外再给两个在网页上渲染轨道运行的网页的例子，托管在GitHub上的：[SOT](https://github.com/koansys/isat)    [spacemission](https://github.com/daoneil/spacemission)