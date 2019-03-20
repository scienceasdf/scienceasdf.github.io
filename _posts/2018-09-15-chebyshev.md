---
title: 切比雪夫多项式、节点与插值
categories:
- Math
tags:
- 数值算法
updated: 2018-09-15  
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
<script type="text/javascript" src="https://cdn.bootcss.com/mathjax/2.7.3/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
**In this post we discuss on Chebyshev polynomials, nodes and interpolation.讨论关于切比雪夫多项式、节点与插值**

---
## 切比雪夫节点
对于拉格朗日插值公式，如何选取节点是一个重要的问题。通常而言，等距选取节点并不是一个最优的选择。我们考虑如下的问题描述：
取插值节点：$a\leq x_0\leq x_1\leq ......\leq x_n\leq b$
满足$L_n(x_k)=f(x_k)$的多项式插值余项
  
$$R_n(x)=f(x)-L_n(x)=\frac{f^{(n+1)}(\zeta_n)}{(n+1)!}\omega_{n+1}(x)$$
  
其中，
  
$$\omega_{n+1}(x)=(x-x_0)(x-x_1)...(x-x_n)$$
  
选取$x_0,x_1,......,x_n$使
  
$$\text{max}|\omega_{n+1}(x)|=\text{min}$$
  
因此需要选取切比雪夫多项式$T_{n+1}(x)$的全部零点。
  
如果$a=-1,b=1$,那么
  
$$x_k=\cos(\frac{(2k+1)\pi}{2(n+1)})$$
  
如果$[a,b]\neq [-1,1]$,那么
  
$$x_k=\frac{b+a}{2}+\frac{b-a}{2}\cos(\frac{(2k+1)\pi}{2(n+1)})$$
  
当然选取了节点之后既可以用拉格朗日插值，也可以用牛顿插值。
  
## 切比雪夫多项式
在微分方程的研究中，切比雪夫提出切比雪夫微分方程
  
$$(1-x^2)y^{\prime\prime}-xy^\prime+n^2y=0$$
  
和
  
$$(1-x^2)y^{\prime\prime}-3xy^\prime+n(n+2)y=0$$
  
相应地，第一类和第二类切比雪夫多项式分别为这两个方程的解。 这些方程是斯图姆-刘维尔微分方程的特殊情形。本文只研究第一类切比雪夫多项式。
  
第一类切比雪夫多项式由以下递推关系确定 
  
$$T_0(x)=1$$
  
$$T_1(x)=x$$
  
$$T_{n+1}(x)=2xT_n(x)-T_{n-1}(x)$$
  
也可以用母函数表示
$$\sum_{n=0}^\infty T_n(x)t^n=\frac{1-tx}{1-2tx+t^2}$$

切比雪夫多项式也具有正交性，即
  
$$\int_{-1}^1 T_n(x)T_m(x)\frac{dx}{\sqrt{1-x^2}}=\left\{
    \begin{array}{c}
    0：n\neq m\\
    \pi:n=m=0\\
    \pi/2:n=m\neq 0
    \end{array}
    \right.$$

离散形式的正交性可以表示为
  
$$\sum_{k=1}^{n+1} T_i(x_k)T_j(x_k)=\left\{
    \begin{array}{c}
    0：i\neq j\\
    n+1:i=j=0\\
    \frac{1}{2}(n+1):0<i=j\neq n
    \end{array}
    \right.$$
  
根据正交性，可以得到另外一种方法来进行拉格朗日插值。设$$p_n(x)=\sum_{i=0}^nc_iT_i(x)$$
，易得
  
$$c_i=\frac{2}{n+1}\sum_{k=1}^{n+1}f(x_k)T_i(x_k)$$