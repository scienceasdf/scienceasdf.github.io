---
title: 最近写程序遇到的一些坑的总结
categories:
- Programming
tags:
- C++
updated: 2018-04-21 
---

**总结一些最近编程遇到的坑（C++）**
  

  
---
## 使用Eigen时的一个报错：
在使用Eigen库时，有时会报错：
>my_program: path/to/eigen/Eigen/src/Core/DenseStorage.h:44:
>Eigen::internal::matrix_array<T, Size, MatrixOptions, Align>::internal::matrix_array()
>[with T = double, int Size = 2, int MatrixOptions = 2, bool Align = true]:
>Assertion `(reinterpret_cast<size_t>(array) & (sizemask)) == 0 && "this assertion
>is explained here: http://eigen.tuxfamily.org/dox-devel/group__TopicUnalignedArrayAssert.html
>     READ THIS WEB PAGE !!! ****"' failed.
  
这里Eigen已经把解决问题的网页贴出来了。进去一看，给出了可能的原因，我这里遇到的是因为一个类里面的成员为Eigen的类，比如
```c++
class Foo
{
  //...
  Eigen::Vector2d v;
  //...
};
//...
Foo *foo = new Foo;
```
需要加上一个宏`EIGEN_MAKE_ALIGNED_OPERATOR_NEW`，如下
```c++
class Foo
{
  //...
  Eigen::Vector2d v;
  //...
public:
  EIGEN_MAKE_ALIGNED_OPERATOR_NEW
};
//...
Foo *foo = new Foo;
```
就不会报错了。这个是对于固定维数的矩阵（向量）会出现的错误，动态维数的矩阵（向量）不存在这样的问题。其它的情况包括按值传递矩阵（向量、或者带矩阵成员的类），需要改成按引用传递。这个问题的根本原因是Eigen为了提高运算速度，采取了128位内存对齐，以让编译器进行向量化优化。而如果自己的new就不会有内存对已，因此需要加上一个宏，重新实现内存对齐的new.

## 一个在析构函数中需要注意的问题
为了减少头文件包含，我们有时会这样写
```c++
class bar;
class foo{
public:
    foo();
    ~foo()
    {
        delete m_bar;
    }
private:
    bar* m_bar
}
```
这个时候编译器会给出警告，因为没有bar的析构函数。正确的还是应该把析构函数放进cpp文件里面。

## Eigen的矩阵判断相等
Eigen库有一个用于判断矩阵是否大致相等的函数，可以这样用
```c++
typedef typename Eigen::Matrix<T, Eigen::Dynamic, Eigen::Dynamic> EigenMatrix;
 
EigenMatrix a, b;
 
// True if equal
bool r = a.isApprox(b, 1e-5);
```
原理是两个矩阵相减并求Frobenius范数。