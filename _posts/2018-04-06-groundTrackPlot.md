---
title: 在线绘制星下点轨迹 
categories:
- Programming
tags:
- JavaScript
- 天文
updated: 2018-04-04
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