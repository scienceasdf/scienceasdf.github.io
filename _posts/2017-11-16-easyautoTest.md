---
title: easyAuto的单元测试 
categories:
- Programming
tags:
- 自动控制 
- 单元测试 
updated: 2018-01-05 
---
<script type="text/x-mathjax-config">
  		MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
  							TeX: { equationNumbers: {  autoNumber: "AMS"  },
     							   extensions: ["AMSmath.js"]}
  		});
		</script>
 <script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
**出于各种考虑，在easyAuto里面我第一次写了单元测试。**

---

## 单元测试
以前写代码从来不注重单元测试，不过这次在easyAuto项目里我觉得有必要进行单元测试了。因为包括计算各种穿越频率、处理输入输出这些，常常会修改算法，即使是小改，也不敢保证一切正常。程序刚写出来的时候是我自己输入并看结果是否符合预期。不过这样实在很费精力，因此自己写了单元测试，也是我第一次写单元测试:trollface:。  

>代码是为了什么，当然是为了重复运行。如何保持unit test代码的稳定？主要靠好的API设计。API切实正确切割了需求，那么在重构的时候API就基本不用变化，unit test也不用重写。以后你重构的时候，只要你的unit test覆盖的够好，基本跑一遍就知道有没有改成**。可以节省大量的时间。
>
>
>作者：vczh  
>链接：https://www.zhihu.com/question/28729261/answer/94964928  
>来源：知乎  
>著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

虽然单元测试有许多现成的框架，例如[Boost::test](https://github.com/boostorg/test),[Qt单元测试框架](http://doc.qt.io/qt-5/qtest-overview.html),[catch2](https://github.com/catchorg/Catch2)这些，但是从减少折腾成本考虑，我就直接用assert来做单元测试，毕竟在C++之父在他的书里也是用这样的方法进行单元测试的:grin:。  

## 对传递函数相关代码进行单元测试
首先，由于这个代码以及未来的大量代码都需要对数值进行检验，所以定义如下函数
```c++
template <class T>
bool fuzzyEqual(T a, T b, T relativeErr)
{
    if((a - b * (static_cast<T>(1.0) + relativeErr)) *
       (a - b * (static_cast<T>(1.0) - relativeErr)) < 0){
        return true;
    }
    else{
        return false;
    }
}
```  
传递函数相关的需要测试以下的内容：
* 多项式相乘是否正确；
* 大量的从自动控制原理的书上找来的传递函数，来测试是否能够正确输出穿越频率、各种裕度；
* 若传递函数表示的线性系统有两个180°穿越频率，给定猜测初值计算能否收敛，不给定初值是否收敛到任意一个值？  

## 对处理用户输入输出相关代码进行测试
需要测试的内容包括：
* 将用户输入的内容进行分割，并转换为正确的多项式
* 将多项式以富文本的形式输出，包括按照平时书写习惯正确处理系数是0,1以及正负号的问题

## 集成测试
最后写两个大的用例，进行整个完整功能的测试（根轨迹的输出我实在不知道如何测试）
```c++
#include "comprehensiveTest.h"
#include "util.h"
#include "../strop.h"
#include "../trans.h"

#include <cassert>
#include <fstream>

const double genericErr = 1e-3;

void compTestCase1();
void compTestCase2();

void comprehensiveTest()
{
    compTestCase1();
    compTestCase2();
}

void compTestCase1()
{
    std::string numStr = "5*12.5 1";
    std::string denStr = "1 0*1 1*0.5 1*111.111 1";

    std::vector<double> num = polyFromRawText(numStr);
    std::vector<double> den = polyFromRawText(denStr);

    trans tsfunc(num,den);
    double phaseMargin, freq1;
    tsfunc.phaseMargin(&phaseMargin,&freq1);
    double gainMargin, freq2;
    tsfunc.gainMargin(&gainMargin,&freq2);

    assert(fuzzyEqual(phaseMargin,41.6,genericErr));
    assert(fuzzyEqual(freq1,0.4955,genericErr));
}

void compTestCase2()
{
    std::string numStr = "95.238 286.6759";
    std::string denStr = "1 15.3339 110.5719 286.6759";

    std::vector<double> num = polyFromRawText(numStr);
    std::vector<double> den = polyFromRawText(denStr);

    trans tsfunc(num,den);

    auto res = tsfunc.unitStepResponse(10,100);
    std::ofstream fout("D:/out.txt");
    if(fout.is_open() == false){

    }else{
        for(int i = 0;i<100;++i){
            fout<<res[i]<<"\n";
        }
    }
}
```
第二个用例是计算系统响应的，这里还是把结果输出到了一个文件中，然后我来检查:disappointed:。应该在这里也实现自动化的测试。  
在测试项目的main.cpp里只需写如下代码：
```c++
#include "transTest.h"
#include "stroptest.h"
#include "comprehensiveTest.h"

#include <cassert>
#include <iostream>

int main()
{
    transTest();

    strOpTest();

    comprehensiveTest();

    return 0;
}
```
每次修改过源文件中的某些函数，只要接口不变，就可以立即重新编译测试项目并运行，看看在修改代码之后代码是否还能正常工作。不过绘制根轨迹这个我是实在不知道如何构造测试用例啊:dizzy_face:！

