---
title: 泊松方程的有限元求解（理论）
categories:
- Math
tags:
- 有限元 
- 数值算法
updated: 2018-4-27 
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
**从泊松方程入手，谈论有限元的一些基本知识。**

---
**本文公式较多，在浏览器中将会花较长时间用于渲染公式。**  
  
--- 
## 泊松方程
泊松方程为
\begin{equation}
\Delta u = f
\end{equation}
在这里$ \Delta $代表的是拉普拉斯算子，而 $ f$和$\varphi $可以是在流形上的实数或复数值的方程。当流形属于欧几里得空间，而拉普拉斯算子通常表示为 ${\nabla}^2$，因此泊松方程通常写成
\begin{equation}
\left( \frac{\partial^2}{\partial x^2} + \frac{\partial^2}{\partial y^2} + \frac{\partial^2}{\partial z^2} \right)\varphi(x,y,z) = f(x,y,z)
\end{equation}

## 具体的问题及求解
我们提出如下的带有边界条件的问题  
$$
\begin{align*} -\Delta u &= f \qquad\qquad & \text{in}\ \Omega, \\ u &= 0 \qquad\qquad & \text{on}\ \partial\Omega. \end{align*}
$$  
求解的区域为平面单位正方形，$\Omega=[0,1]^2$。我们假设一个测试函数$\varphi$，并在上式的左边乘上这个函数，对整个区域$\Omega$积分，可以得到
\begin{equation}
-\int_\Omega \varphi \Delta u = \int_\Omega \varphi f
\end{equation}
由[高斯散度定理（奥斯特罗格拉斯基公式）](https://en.wikipedia.org/wiki/Divergence_theorem)可以得到：
\begin{equation}
\int_\Omega \nabla\varphi \cdot \nabla u - \int_{\partial\Omega} \varphi \mathbf{n}\cdot \nabla u = \int_\Omega \varphi f
\end{equation}
我们需要让$\varphi$也同样满足边界条件（用数学属于描述就是需要让测试函数$\varphi$来自方程解的切空间），因此上式可以写成
\begin{equation}
(\nabla\varphi, \nabla u) = (\varphi, f)
\end{equation}
这里我们使用通用的内积符号$(a,b)=\int_\Omega a\; b$.我们现在的思路就是找到一个解的近似$u_h(\mathbf x)=\sum_j U_j \varphi_j(\mathbf x)$，而$U_j$是我们需要求的系数，$\varphi_i$是我们用的形函数。因此可以得到
\begin{equation}
(\nabla\varphi_i, \nabla u_h) = (\varphi_i, f), \qquad\qquad i=0\ldots N-1.
\end{equation}
现在需要求解一个矩阵代数方程
\begin{equation}
\mathbf{AU}=\mathbf{F}
\end{equation}
矩阵$\mathbf{A},\mathbf{F}$定义为  
$$
\begin{align*} A_{ij} &= (\nabla\varphi_i, \nabla \varphi_j), \\ F_i &= (\varphi_i, f). \end{align*}
$$  
显然，这样就有$\sum_j \mathbf{A}_{ij}\mathbf{U}_j=\mathbf{F}_i$。前面看到我们是左乘$\varphi$，对于对称矩阵（自伴随的），问题是以一样的，不过对于非对称的$\mathbf{A}$，那么经验表明这样会在计算中产生更大的误差。现在整理一下：
* $\mathbf{A,U,F}$都是稀疏矩阵
* 积分的计算采用高斯积分算法  

这样就是全部思路。

