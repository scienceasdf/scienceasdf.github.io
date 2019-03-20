---
title: 一些Qt在Ubuntu下的问题
categories:
- Math
tags:
- 数值算法
updated: 2018-09-18  
---  
**In this post we will talk about some problems occured in Ubuntu OS when writing Qt program.本文讨论一些在ubuntu使用Qt的问题。**

---

## qDebug的使用
通常而言，实际上`qDebug`是不能直接输出`std::string`的，但是在Windows和Android上直接拿来用没有遇到过问题。。。在Ubuntu上使用会报错，因此需要重载<<操作符：
```c++
QDebug operator<<(QDebug out, const std::string& str)
{
    out << QString::fromStdString(str);
    return out;
}
```
  
## ssl的使用
在把paperServer服务器从Win/Android移植到Linux下遇到了问题，如果访问https连接的话，会发现ssl的函数没有实现。具体的，发现自己其实已经安装了openssl,libssl-dev的包，可是还是不对。我们输出一下相关的信息：
```c++
qDebug()<<"SSL version use for build: "<<QSslSocket::sslLibraryBuildVersionString();
qDebug()<<"SSL version use for run-time: "<<QSslSocket::sslLibraryVersionNumber();
qDebug()<<QCoreApplication::libraryPaths();
```
  
发现Qt的ssl是基于1.0版本的，而apt得到的是1.1版本的，二者并不兼容。因此需要安装`sudo apt-get install libssl1.0-dev`，会把原来的ssl库卸载掉，而且还会连带卸载petsc库。。。。。。解决方法是系统中安装openssl1.1，而自己编译一个openssl1.0.2的so，一定要动态编译（`./config shared`)，不然无法链接，因为我Qt是编译的动态库。然后很坑的是设置elf的RUNPATH居然不管用，必须要`export LD_LIBRARY_PATH=$PWD`才能让程序正确地链接到同目录下的ssl。真是天坑。。。