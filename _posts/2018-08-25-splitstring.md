---
title: 再谈C++的字符串分割
categories:
- Programming
tags:
- C++
updated: 2018-08-25  
---  
**再次讨论如何分割C++的std::string.**

---

一些别的方法我们之前已经讨论过了，例如Boost::tokenizer或者Boost::splitter或者QString来进行分割。不过这里我们讨论一下运用C++标准库的方法。
  
思路很简单，就是用istream流的迭代器处理。
## 思路1
首先一个比较简单的用法是
```c++
std::string text = "Let me split this into words";

std::istringstream iss(text);
std::vector<std::string> results((std::istream_iterator<std::string>(iss)),std::istream_iterator<std::string>());
```
如果使用C++11语法可以写成这样：
```c++
std::string text = "Let me split this into words";

std::istringstream iss(text);
std::vector<std::string> results((std::istream_iterator<std::string>{iss}),std::istream_iterator<std::string>());
```
这种思路的优点是可以处理任何流而不仅仅是字符串，但是缺点是不能自定义分隔符。

## 思路2
```c++
std::istream& operator>>(std::istream& is, std::string& output)
{
   // ...does lots of things...
}
```
这段代码肯定是不能改的，因为这是标准库里的东西。不过我们可以变通一下：
```c++
class WordDelimitedByComma : public std::string
{};
```
这样做实际上是有争议的，因为std::string没有一个虚的析构函数，因此最好不要从std::string继承。当然，只要不去删除一个指向`WordDelimitedByComma`的指针，就不会出现问题。在这里我们只用来分割字符串。重载<<操作符：
```c++
std::istream& operator>>(std::istream& is, WordDelimitedByComma& output)
{
    std::getline(is, output, ',');
    return is;
}
```
因此代码可以写成
```c++
std::string text = "Let,me,split,this,into,words";

std::istringstream iss(text);
std::vector<std::string> results((std::istream_iterator<WordDelimitedByComma>(iss)), std::istream_iterator<WordDelimitedByComma>());
```
更为通用的代码可以写成
```c++
template<char delimiter>
class WordDelimitedBy : public std::string
{};

std::string text = "Let,me,split,this,into,words";

std::istringstream iss(text);
std::vector<std::string> results((std::istream_iterator<WordDelimitedBy<','>>(iss)), std::istream_iterator<WordDelimitedBy<','>>());
```
这个的优点是
* 允许在编译器定义任意的分隔符
* 可以使用任何流而不仅仅是字符串
* 比方法1快20%至30%
  
而缺点是分隔符只能在编译器定义，且代码量较大。

## 思路3
```c++
std::vector<std::string> split(const std::string& s, char delimiter)
{
    std::vector<std::string> tokens;
    std::string token;
    std::istringstream tokenStream(s);
    while(std::getline(tokenStream, token, delimiter)){
        tokens.push_back(token);
    }
    return tokens;
}
```
这个思路的有点在于
* 接口清晰
* 能够在运行期使用任何分隔符