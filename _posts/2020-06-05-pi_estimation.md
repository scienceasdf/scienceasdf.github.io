---
title: 蒲丰投针对π进行区间估计
categories:
- 数学
tags:
- 统计学
- 数值算法
- C++
updated: 2020-06-05  
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
<div style="display:none">
			\( \def\
			<#1>{\left
				<#1\right>} \newcommand{\CC}{\bm{C}} \newcommand{\dydx}[2]{\frac{\mathrm{d}#1}{\mathrm{d}#2}} \newcommand{\pypx}[2]{\frac{\partial
					#1}{\partial #2}} \newcommand{\pyypxx}[2]{\frac{\partial^2 #1}{\partial #2^2}} \newcommand{\dyydxx}[2]{\frac{\mathrm{d}^2
					#1}{\mathrm{d} #2^2}} \)
                    \(
\newcommand{\bm}[1]{\boldsymbol{\mathbf{#1}}}
\)
</div>
**利用蒲丰投针，对π进行区间估计。**

---
## 背景

这几天看到科学界利用引力波对$\pi$进行区间估计的新闻，联想到概率论当中所学的蒲丰投针实验也是利用蒙特卡洛方法对$\pi$进行估计，不过是点估计，因此想试试能否进行区间估计。

## 公式

蒲丰投针实验中，针与线相交的概率为

$$P=\frac{2l}{\pi a}$$
其中$l$为针的长度，$a$为平行线的间距。

反复进行投针的实验，每一次的结果均为独立的，且取值为两个离散的值：相交或者不相交。因此，多次投针的结果分布为二项分布，二项分布的总体率$P$的$1-\alpha$的置信区间为：

$$(p-u_{\alpha/2}\sqrt{\frac{p(1-p)}{n}}, p+u_{\alpha/2}\sqrt{\frac{p(1-p)}{n}})$$

其中,$p$为样本率，$u_{\alpha/2}$为正态分布的$\alpha/2$分位数。根据此即可计算$\pi$的置信区间。

## 编程的实现

### 蒲丰投针的实验

这个比较简单，不过一个点在于生成高质量的随机数，C++11的标准库提供了非常好的方法：

```C++
unsigned seed1 = std::chrono::system_clock::now().time_since_epoch().count();
std::uniform_real_distribution<double> dis(-1.0, 1.0);
std::default_random_engine rd;
std::mt19937 gen(seed1);
```

在C++ random库中可自定义分布类型、随机数引擎、随机数算法（mt19937）以及初始种子等，配置灵活，功能强大。

### C++中正态分布分位数的计算

在C++标准库中能够生成各种分布的随机数，但是没有内置的函数用于计算各种分布的概率密度函数(PDF)、分布函数(CDF)、分位数(quantile)等。不过还好也不用自己去实现，因为boost的math库提供了各种常用分布的这些函数计算。其中，对于正态分布的分布函数计算使用`erfc`函数计算,而分位数则使用`erfc_inv`函数计算，具体可以参阅特殊函数的相关教材书籍。

```C++
const double confidenceInterval = 0.95;

boost::math::normal_distribution<double> my_dist;
double probability = static_cast<double>(in) / static_cast<double>(N) ;
double u = boost::math::quantile(my_dist, 1.0 - (1.0 - confidenceInterval) / 2.0);
double delta = u * std::sqrt(probability * (1.0 - probability) / N);
double p_min = probability - delta;
double p_max = probability + delta;
```

### 实验结果

取95%的置信区间，投针多次得到$\pi$的估计值如下：

投针次数 | $\hat\pi_{min}$ | $\hat\pi$ |  $\hat\pi_{max}$ | 
-|-|- | - 
1000 | 2.96319 | 3.068 | 3.17281 
10000 | 3.11144 | 3.1436 | 3.17576 
100000 | 3.13279 | 3.14296 | 3.15313 
1000000 | 3.1381 | 3.14132 | 3.14454