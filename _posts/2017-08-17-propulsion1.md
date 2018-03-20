---
title: 浅谈螺旋桨航模（无人机）的动力系统选配（一）
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
**本文公式较多，在浏览器中将会花较长时间用于渲染公式。**  
  
--- 

## 动力系统的数学模型
### 无刷电机的数学模型
有  
$$
\begin{equation} \label{eqs:1} \tag{a}
\left \{
\begin{array}{l}
U=r_a I+\frac{n}{K_v}\\
I=\frac{M_{em}}{K_m}
\end{array}
\right.
\end{equation}  
$$
其中，$r_a$为电机内阻，$U$为电机两端电压，$I$为通过电机的电流，$K_v$为电机Kv值，$K_m$为电机转矩常数，$n$为电机转速(RPM)，$M_{em}$是电机的电磁转矩。  
电机的输出转矩为
\begin{equation}
M_{mot}=M_{em}-M_{R}=k_m(I-I_0)
\end{equation}
$K_v$的量纲为RPM/V，$K_m$的量纲是N$\cdot$m/A，在国际单位制下电机的$K_v$与$K_m$满足关系
\begin{equation}
K_m=\frac{60}{2\pi K_v }
\end{equation}
电机的输入功率为
\begin{equation}
P_{in}=UI
\end{equation}
输出功率为
\begin{equation}
P_{out}=\frac{2\pi nM_{mot}}{60}
\end{equation}
电机的效率为
\begin{equation}
%\eta=\frac{P_{out}}{P_{in}}=\frac{2\pi nM_{mot}}{60UI}
\eta =\frac{P_{out}}{P_{in}}=\frac{2\pi nM_{mot}}{60UI}
\end{equation}

### 螺旋桨的数学模型
对于螺旋桨，转矩$M$、拉力$T$、功率$P$、效率$\eta$都是空速$v$、螺旋桨转速$n$的函数
$$
\begin{equation} \label{basics} \tag{b}
\left\{
\begin{array}{l}
M=M(v,n)\\
T=T(v,n)=C_T(v,n)\cdot\rho n^2 D^4\\
P=P(v,n)=C_P(v,n)\cdot\rho n^3 D^5\\
\eta=\eta(v,n)
\end{array}
\right.
\end{equation}
$$  
$C_T$是拉力系数、$C_P$是功率系数，且有$P=M\cdot\frac{2\pi n}{60}$，$\eta=\frac{Tv}{P}$。  
定义一个无量纲参数进动比(advance ratio)
\begin{equation} J=\frac{v}{nD}\end{equation}
$D$为螺旋桨直径。  
通常，$\eta$与$J$的变化关系如下图所示。在进行初步分析的手工计算中，可以认为$J$是一个相似性判定的参数，如果同一螺旋桨，工作在1状况$(v_1,n_1)$与2状况$(v_2,n_2)$，满足进动比相同，即$\frac{v_1}{n_1}=\frac{v_2}{n_2}$，则可以认为工作状况下的效率$\eta$、拉力系数$C_T$、功率系数$C_P$均相同。如果要估算某一工作状况$(v,n)$的工作参数，仅需先计算进动比$J=\frac{v}{nD}$，然后查找对应进动比的相关$\eta,C_T\text{和}C_P$，然后按照式(\ref{basics})计算拉力、转矩、效率与功率。
<img src="{{ site.url }}/assets//blog_images/fig1.png" width="350px" height="200px"/>
实际上，由于低雷诺数的影响，对于进动比相同的两种工作状况，$\eta,C_T\text{和}C_P$并不一定对应相等。通常高雷诺数的工作状况下螺旋桨的工作效率更高。
### 电源模型
通常，无人机上使用的电源为蓄电池。蓄电池电源的伏安特性关系为：
\begin{equation} \label{eqs:src1}
U=U_0-Ir_0 \\
\end{equation}
其中$r_0$为蓄电池内阻。
 对于太阳能无人机，通常是太阳能电池直接为蓄电池充电，由蓄电池驱动直流电机，那么电机两端的电压电流关系满足式(\ref{eqs:src1}).而若太阳能无人机有特殊的要求(如某些太阳能飞机竞赛),那么设计的飞机会是太阳能电池片组直接为动力系统供电。太阳能电池片组的伏安特性关系为
\begin{equation}\label{solar_array} 
I=I_{sc}[1-A(e^{U/BU_{oc}})-1]
\end{equation}
其中，$$A=(1-\frac{I_m}{I_{sc}})e^{-U_m/(BU_{oc})}$$  
$$B=(\frac{U_m}{U_{oc}}-1)[\ln(1-\frac{I_m}{I_{sc}})]$$  
$I_{sc}$为电池组的短路电流;  
$U_{oc}$为电池组的开路电压;  
$U_m,I_m$为最大功率点处的太阳能电池的输出电压与电流.

### 综合模型及其求解
已知飞机的飞行速度$v$，无刷电机的$K_v$值，内阻$r_a$与10V下空载电流$i_0$，以及螺旋桨对应的性能数据，则利用电机转矩等于螺旋桨转矩的关系，求解在电压与电流下的转速$n$，其它参数则可对应求解。电源的电压和电流可以符合某种伏安特性曲线,如式(\ref{eqs:src1})、(\ref{solar_array})，求解过程则为弦截法对转速迭代求解。电源也可能是具有限流或限压值，也可以给出电源电压与电流的上限，求解时取转速上限恰好同时满足不超过电源电压与电流的上限。
### 非平凡模型
#### 引入减速组
设减速组减速比为$K$，机械效率为$\eta_g$，则有  
$$
\begin{equation} \tag{c}
\left\{
\begin{array}{l}
n_{prop}=\frac{n_{mot}}{K}\\
T_{prop}=K\cdot T_{mot}\cdot\eta_g
\end{array}
\right.
\end{equation} 
$$
考虑$\eta_g=1$的理想减速器，与电机形成的系统可以等效为一个$K_v$值折合为原电机$K_v$值$\frac{1}{K}$的新电机。通常高效率螺旋桨的特征都是低负载、大直径、大桨距（相对于直径）、低速运行，所以为了动力系统的效率最大化应该用大直径螺旋桨。由于带动大直径螺旋桨所需的转矩大，如果需要使电机工作在最大电流以下，可以使用减速组或使用低$K_v$值的电机。然而低$K_v$值得电机内阻会比高$K_v$值得电机内阻大，使用减速组会有机械能损失。而且大直径螺旋桨的重量大，且能驱动大直径螺旋桨的电机或减速器通常重量也较大。故具体应选用的方案，应考虑效率、重量、成本、加工装配难度等多方面考虑。

#### 单电机驱动两个螺旋桨
在这种情况下，有  
$$
\begin{equation} \label{eqs:12} \tag{d}
\left\{
\begin{array}{l}
n_{prop}=n_{mot}\\
M_{prop}=\frac{M_{mot}}{2}
\end{array}
\right.
\end{equation} 
$$
求解上式则可以求出电机的转速。双电机驱动单螺旋桨及其它类似情况可以按照类似的方法列出公式求解。
### 内燃机的特性
无人机上使用的内燃机通常可分为两行程发动机和四行程发动机。两行程发动机与四行程发动机相比，优点是功率大，可动零件少，维护简便，价格便宜；缺点是油料燃烧不充分，燃料消耗大。两行程发动机还有两个显著特点：
* 使用这类发动机的无人机，爬升时经常可以听到转速明显下降的声音，俯冲时可以明显听到转速明显升高的声音，原因是这种发动机的扭矩小，对负载的变化较敏感。为了减小这种影响，两行程发动机一般使用大直径小桨距螺旋桨。
* 两行程发动机转速普遍较高，也只有在高速下才能发挥出全部功率，所以厂家提供的功率数据也是要达到一定转速。二行程发动机最大的缺点是油门非线性。  


 四行程发动机的优点是油门线性好，扭矩大，转速稳定，声音柔和，可以使用大桨距的螺旋桨，提高效率。四行程发动机工作室燃料燃烧充分。无人机爬升时，转速稳定、爬升有力、声音无变化。而四行程的缺点是价格昂贵，重量较大，维护不便。同样的工作容积，普通的四行程发动机输出功率理论上只有两行程发动机的一半，但是实际上不同于二行程发动机，四行程发动机的最大输出功率是在一般使用中可以达到要求的转速范围内的。  
由参考文献,对于高亚音速的飞机，内燃机的功率会随着速度的增加而增大；而对于大多数慢速飞机，内燃机的功率可以认为不变。大多数无人机的巡航速度下发动机的功率可以认为近似不变，那么对应其最大输出功率、最大输出转矩，通常需要一个合适的转速，否则发动机性能无法得到最大发挥。

---
[安卓版程序下载地址](https://pan.baidu.com/s/1QaN9CxFEfJz0RHewitcCgg)  
[Windows版程序下载地址（32位）](https://pan.baidu.com/s/1W5DtxZFxC6SmjRxvO9F_tA)  
由于博文过长会导致浏览器加载、渲染速度降低，故后续讨论请看下一篇文章。  