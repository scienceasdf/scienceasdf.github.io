---
title: 一个三角恒等式的证明
categories:
- Math
tags: 
updated: 2018-4-18 
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
**一道神奇的三角恒等式的证明（非原创）**  

---
**本文公式较多，在浏览器中将会花较长时间用于渲染公式。**  

  
---
在柯斯特利金的《代数学引论》里面居然看到了这样的一个恒等式：
\begin{equation}
\sum_{k=1}^n \cot^2(\frac{k\pi}{2n+1}) = \frac{n(2n-1)}{3}
\end{equation}
自己想了想，用数学归纳法没有证明出来，于是谷歌查解法（谷歌的匹配还是很强大的），查到证明如下，书上的留白太小，所以把它记录在这里：
首先是一个引理，也是一个恒等式
\begin{equation}
\tan rx=\frac{\binom r1\tan x-\binom r3\tan^3x+\cdots}{1-\binom r2\tan^2x+\cdots}
\end{equation}
证明如下：
根据复变函数欧拉公式和二项式展开定理可以得到
$$
\begin{align}
\sin rx&=\binom r1\cos^{r-1}x\sin x-\binom r3\cos^{r-3}x\sin^3x+\binom r5\cos^{r-5}x\sin^5x-\cdots\\
&=\cos^nx\left(1-\binom r2\tan^2x+\binom r4\tan^4x-\cdots\right)
\end{align}
$$  
$$
\begin{align}
\cos rx &= \cos^rx-\binom r2\cos^{r-2}x\sin^2x+\binom r4\cos^{r-4}x\sin^4x-\cdots\\
&= \cos^nx\left(1-\binom r2\tan^2x+\binom r4\tan^4x-\cdots\right)
\end{align}
$$
相除得到
\begin{equation}
\tan rx=\frac{\binom r1\tan x-\binom r3\tan^3x+\binom r5\tan^5x-\cdots}{1-\binom r2\tan^2x+\binom r4\tan^4x-\cdots}
\end{equation}
接下来，如果$\tan(2n+1)x=0$，即$(2n+1)x=n\pi,n\in N$，那么$\tan x$将满足方程
\begin{equation}
\binom{2n+1}1\tan x-\binom{2n+1}3\tan^3x+\cdots+(-1)^{n}\tan^{2n+1}x=0
\end{equation}
令$\tan^2 x = \frac{1}{y}$，那么$y$会是下面的多项式的根：
\begin{equation}
\binom{2n+1}1y^n-\binom{2n+1}3y^{n-1}+\cdots+(-1)^n=0
\end{equation}
方程的根为$\cot^2x = y$，当$x=0,\pm\dfrac{\pi}{2n+1},\pm\dfrac{2\pi}{2n+1},\pm\dfrac{k\pi}{2n+1}$  
最后，由韦达定理可以得到
\begin{equation}
\implies \sum_{k=1}^n \cot^2(\frac{k\pi}{2n+1}) = \frac{n(2n-1)}{3}
\end{equation}