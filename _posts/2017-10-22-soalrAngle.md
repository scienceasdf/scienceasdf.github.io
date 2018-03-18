---
title: 太阳高度角与方位角的计算
categories:
- Programming
tags:
- 天文 
- 安卓开发 
- Qt 
updated: 2017-10-22 
---
<script type="text/x-mathjax-config">
  		MathJax.Hub.Config({
            tex2jax: {
                inlineMath: [['$','$'], ['\\(','\\)']]
            },
  			TeX: { 
                equationNumbers: {  
                    autoNumber: "AMS"  
                },
     		    extensions: ["AMSmath.js"]
            },
            CommonHTML: { 
                linebreaks: { 
                    automatic: true 
                } 
            },
            "HTML-CSS": { 
                linebreaks: { 
                    automatic: true 
                } 
            },
            SVG: { 
                linebreaks: { 
                    automatic: true 
                } 
            }
  		});
		</script>
 <script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
**探讨太阳高度角与方位角的计算，并写了个手机程序用于计算此时此刻此地（也可以是任意时刻，任意地点）的太阳高度角与方位角.**

---
**本文公式较多，在浏览器中将会花较长时间用于渲染公式。**  
  
--- 

## 基本算法
就是一大堆玄学（或者叫天文学）的概念了。
### 当地正午时间
给定经度$\Phi$（都假设是东经，主要研究中国国土范围内的问题），那么当地的正午时间在北京时间下的时间可以表示成：（这个感觉用代码比公式更加直观）  
```c++
timeType getNoonTime(double longitude)
{
    // assume in the eastern semi-sphere
    // expressed in UTC+8 time
    //longtitude expressed in degrees
    int dt=static_cast<int> (4*(120.0-longitude));
    timeType t1(12,0);
    t1+=dt;
    return t1;
}
```
### 太阳时角
太阳时角是指日面中心的时角，即从观测点天球子午圈沿天赤道量至太阳所在时圈的角距离。计算公式为
\begin{equation}
h=15\times (ST-12)
\end{equation}
$ST$为真太阳时。然而平常我们通常都使用北京时间，因此太阳时角的计算公式如下：（还是代码比公式直观）
```c++
double getHourAngle(double longitude, const timeType& t1)
{
    // The results return the angle expressed in degrees
    // also UTC+8
    timeType t2=getNoonTime(longitude);
    int dt=t1-t2;
    return .25*dt;
}
```
### 太阳赤纬
太阳赤纬，是地球赤道平面与太阳和地球中心的连线之间的夹角。赤纬角以年为周期，在+23 °26′与-23 °26′的范围内移动，成为季节的标志。最简单的方法是将
赤纬的变化考虑为线性变化。在一篇参考文献上，给出了更为近似的计算方式：按照三角函数变化规律计算。我在这里也按照这种方式计算。而百度百科还给出了一
个更加精确的公式:
\begin{equation} \label{preci}
\delta=0.006918-0.399912 \cos (b)+0.070257 \sin (b)-0.006758 \cos (2b)+ 0.000907\sin (2b)-0.002697\cos (3b)+0.00148\sin (3b)
\end{equation}
其中
* $\delta$的单位为度(deg)；
* $\pi$=3.1415926为圆周率；
* $b=2\pi (N-1)/365$，单位为弧度；
* $N$为日数，自每年1月1日开始计算。    
有空去把程序改成这个公式再去跑跑。

### 太阳高度角的计算
\begin{equation}
\sin \theta_\mathrm{s} = \cos h \cos \delta \cos \Phi + \sin \delta \sin \Phi \,,
\end{equation}
此处
* $\theta_\mathrm{s}$是太阳高度角，
* $h$是以地方恒星时系统下的时角，
* $\delta$是目前的太阳赤纬，
* $\Phi$是当地的纬度。

### 太阳方位角的计算
在维基百科上查到的是如下的近似公式
\begin{equation}
\cos \phi _\mathrm {s}=\frac {\sin \delta -\sin \theta _\mathrm {s}\sin \Phi }{cos\theta _\mathrm {s}\cos \Phi }
\end{equation}

## 程序相关
前面的代码也可以看出，这个问题需要自己实现时间类timeType和日期类dateType，包括一些基本的运算操作，不过也可以用Boost库的或者用Qt的。编程的时候需要特别小心角度与弧度的换算。在安卓程序中需要实现对设备的经纬度定位，还是要感谢Qt，让一切变得十分方便。
类Widget作为主窗体，定义如下：
```c++
class Widget : public QWidget
{
    Q_OBJECT

public:
    explicit Widget(QWidget *parent = 0);
    ~Widget();

private:
    Ui::Widget *ui;

    QGeoPositionInfoSource *source;

public slots:
    void realtimeUpdated(QGeoPositionInfo info);
private slots:
    void on_updateButton_clicked();
};
```
具体定位的代码如下：
```c++
Widget::Widget(QWidget *parent) :
    QWidget(parent),
    ui(new Ui::Widget)
{
    bool flag = false;
    QGeoPositionInfoSource* source2 = QGeoPositionInfoSource::createDefaultSource(this);
    if(source2){
        source2->setUpdateInterval(100);
        connect(source2, SIGNAL(positionUpdated(QGeoPositionInfo)),this, SLOT(realtimeUpdated(QGeoPositionInfo)));
        source2->startUpdates();
    }
    else{
        flag = true;
    }
	// ...
}

void Widget::realtimeUpdated(QGeoPositionInfo info)
{
    double latitude = info.coordinate().latitude();
    double longitude = info.coordinate().longitude();

    QTime time1 = QTime::currentTime();
    timeType td1(time1.hour(),time1.minute());

    QDate d1 = QDate::currentDate();

    double timeAngle=getHourAngle(longitude,td1);
    double elevAngle=getSolarElevationAngle(getSolarDeclination(d1),latitude,timeAngle);
    double azimuth=getSolarAzimuthAngle(getSolarDeclination(d1),latitude,timeAngle,elevAngle);
	// ...
}
```

## 应用
* 和Stellarium里面的太阳高度角、方位角进行了对比，虽然在这里的计算中有些是近似公式，但是误差也不会超过1°
* 这个程序，这种方法让我在外地，只要有晴天，就能找到东西南北
* 这个程序还可以应用于一些太阳能实验上，如太阳能飞机的动力试车，大概选在哪些月份，哪些时刻，或者说如何调整电池片的方向以使电池片接收到最多的太阳光强能够心里有数