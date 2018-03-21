---
title: 轨道动力学中常用的计算机算法（二）
categories:
- Programming
tags:
- 天文 
- 数值算法 
updated: 2017-4-7 
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
**这里是一些轨道动力学中常见物理量的计算机算法的总结。**

---
**本文公式较多，在浏览器中将会花较长时间用于渲染公式。**  
  
--- 

## 偏近点角
* 已知：$\nu,e$
* 求：$EA$  

如果$e>(1-1e-11)$，那么$EA=0$，否则
\begin{equation}\sin(EA)=\frac{\sqrt{1-e^2}\sin\nu}{1+e\cos\nu}\end{equation}
\begin{equation}\cos(EA)=\frac{e+\cos\nu}{1+e\cos\nu}\end{equation}
\begin{equation} \label{EA}
EA=atan2(\sin EA,\cos EA)\end{equation}

在资料里还查到了双曲线的Hyperbolic Anomaly(HA)，因为是双曲线轨道，先不写在这里了。

## 平近点角
* 已知：$\nu,e$
* 求：$MA$  

对于椭圆轨道($e\leq 1e-11$)，首先按照式(\ref{EA})算出偏近点角，然后
\begin{equation} MA=EA-e\sin EA\end{equation}
这个公式是和平均角速度的公式混合食用的：
\begin{equation}
n=\sqrt{\frac{\mu}{\pm a^3}}\end{equation}
正负号是因为双曲线的半长轴是负的。

## 偏近点角到真近点角
* 已知：$EA,e$
* 求：$\mu$ 

\begin{equation}\sin\nu=\frac{\sqrt{1-e^2}\sin EA}{1-e\cos EA} \end{equation}
\begin{equation}\cos\nu=\frac{\cos EA -e}{1-e\cos EA} \end{equation}
\begin{equation}\mu=atan2(\sin\nu,\cos\nu)\end{equation}

## 平近点角到偏近点角
* 已知：$MA,e$
* 求：$EA$ 

就是一个牛顿迭代法，这里直接给出实现的代码
```c++
double MA2EA(double MA, double ecc)
{

    if(ecc<1.0){
        //elliptic orbit case
        double E;
        if((MA<.0 && MA>-pi)||(MA>pi))
            E=MA-ecc;
        else
            E=MA+ecc;

        double E_=MA;
        while(fabs(E-E_)>1e-8){
            E_=E;
            E=E+(MA-E+ecc*sin(E))/(1-ecc*cos(E));
        }

        return E;
    }
}
```

## 轨道外推的算法
根据上面各个角之间的转换关系，就可以实现轨道外推。写一个类，封装轨道六根数：
```c++
class KeplerianState
{
public:
    double SMA;     //semimajor axis, a
    double ECC;     //eccentricity, e
    double INC;     //inclination, i
    double AOP;     //argument of periapsis, \omega
    double RAAN;    //right ascension of the ascending node, \Omega
    double TA;      //true anomaly, \phi

    KeplerianState(){}
    KeplerianState(double a, double e, double i, double omega, double Omega, double phi, double mu=3.986004415e14)
        : SMA(a), ECC(e), INC(i), AOP(omega), RAAN(Omega), TA(phi), gravityConst(mu) {}
    ~KeplerianState(){}

    void toCartesian(vec3* r, vec3* vel);
    void step(double t);

    static KeplerianState fromR_V(const vec3& r, const vec3& v, double mu=3.98600445e14);

public:
    double gravityConst;
};
```
轨道外推就是用平均角速度乘时间得到平近点角，然后再转化至真近点角：
```c++
void KeplerianState::step(double t)
{
    double MA=TA2MA(TA,ECC);
    double n=pow(gravityConst/SMA/SMA/SMA,.5);
    MA+=n*t;    // t seconds later
    TA=MA2TA(MA,ECC);
}
```


## 近地点、远地点速度
* 已知：$a,e,\mu$
* 求：$v_a,v_p$  

如果$e > ( 1 - 1e−12 )$，那么$v_a=0$，否则
\begin{equation}v_a=\sqrt{\frac{\mu}{a}(\frac{1-e}{1+e})}
\end{equation}
\begin{equation}v_p=\sqrt{\frac{\mu}{a}(\frac{1+e}{1-e})}
\end{equation}

---
**注意这些公式带入运算时都是要化成弧度的！！！**





