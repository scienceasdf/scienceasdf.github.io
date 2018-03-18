---
title: 浅谈螺旋桨航模（无人机）的动力系统选配（二）
categories:
- Programming
tags:
- 无人机 
- 安卓开发 
- Qt 
updated: 2018-03-14 
---
<script type="text/x-mathjax-config">
  		MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
  							TeX: { equationNumbers: {  autoNumber: "AMS"  },
     							   extensions: ["AMSmath.js"]}
  		});
		</script>
 <script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
**探讨了螺旋桨无人机动力系统的相关理论，并开发手机与电脑版程序解决相关问题。下载地址在文末。**

---
上一篇文章我们讲了螺旋桨无人机动力系统相关的理论，这篇文章说说程序的设计。

## 数据来源
所有的数据都来自于APC官网的数据。由于APC螺旋桨高效率的优点，以及APC在其官网公布了所有型号的理论性能数据文件，故下载所有其官网上的五百个左右性能数据文件，其文件已经存储为固定的格式。先在官网上下载索引文件PER2_TITLEDAT.txt，再用wget批量将所有的螺旋桨性能数据文件下载下来。一共五百来个文件，中间下载是否有连接错误导致文件没有下载完整我也不知道(捂脸）。APC的桨型号很齐全，基本覆盖了航模级别常用的尺寸，从几英寸到26英寸的都有，如果在这些型号以外的型号那就没办法了。。。数据全部都是dat格式的，用std::ifstream读文件非常耗时。对于开发的安卓版本，肯定不会用External folder里面包含所有的数据，只能用Qt资源文件+QDataStream来读写（不支持std::ifstream)，这样速度更快，不过缺点在于如果数据变动、扩展会不太方便。在写完所有程序之后，我还把所有数据迁移到了一个sqlite数据库文件中，并加上索引，访问速度大大提升，不过目前是不想重构sqlite的版本了。

## 功能介绍
程序分为PC版和移动（安卓）版，主要以介绍PC版为主。PC版共有两个程序：DemoProp，用于计算无刷电机动力系统的工作状况并给出一定的建议；PropChart，用于计算电动和油动动力系统的工作状况并绘制图表。
### 筛选功能
程序可以对给定的工作状况下的符合要求（如拉力、效率等条件）的螺旋桨进行筛选。DemoProp的筛选界面如下图所示，可以输入电机、电源、减速组等相关信息。
<img src="{{ site.url }}/assets//blog_images/fig2.png" width="350px" height="200px"/>
PropChart的筛选界面如下图所示，这里运用的模型是给定转速或者给定输入功率，这样就既能够用于求解电动系统的工作状况，也适用于求解油动系统的工作状况。
<img src="{{ site.url }}/assets//blog_images/fig4.png" width="350px" height="200px"/>

### 分析功能
DemoProp能够对具体的电动系统选配提出指导意见，可以判断当前电机、电源、螺旋桨、减速组的组合究竟是轻载、超载还是正常载荷，如下图所示。
<img src="{{ site.url }}/assets//blog_images/fig3.png" width="350px" height="200px"/>

### 图表功能
PropChart能够绘制螺旋桨的拉力曲线、效率曲线等等，这里我用的是QCustomPlot进行绘制，如下图所示。
<img src="{{ site.url }}/assets//blog_images/fig5.png" width="350px" height="200px"/>

### 移动版
一直苦于在室外进行动力试验的时候，不方便将测量的数据与仿真数据进行校对、不知道动力系统应该怎么调整。感谢伟大的Qt的跨平台特性，让我能够将程序移植到安卓系统上（实际上移植到iOS上也可以，不过就是我没有苹果电脑与手机），极大地方便了在外场的实验。针对手机的一些特点，在功能上进行了一些改进，例如取消筛选功能，并增加绘制能量分析饼图的功能。手机版的交互体验应该比电脑版的好太多了。截图如下：
<img src="{{ site.url }}/assets//blog_images/scr1.png" width="350px" height="200px"/>
<img src="{{ site.url }}/assets//blog_images/scr3.png" width="350px" height="200px"/>
<img src="{{ site.url }}/assets//blog_images/scr2.png" width="350px" height="200px"/>

## 存在的问题
* 筛选功能卡在IO上比较耗时间。当然，MSVC编译的程序能够明显快于MINGW编译的程序。解决方法有很多，只是我不想去重构了  
* 电脑版的交互体验非常差
* 电脑版没有对UI进行多分辨率的调整
--- 
安卓版程序下载地址：https://pan.baidu.com/s/1QaN9CxFEfJz0RHewitcCgg  
Windows版程序下载地址（32位）：https://pan.baidu.com/s/1W5DtxZFxC6SmjRxvO9F_tA  