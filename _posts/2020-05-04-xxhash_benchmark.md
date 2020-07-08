---
title: 实习笔记三----xxhash算法与md5的benchmark比较
categories:
- 算法
tags:
- 哈希算法
- 实习笔记
updated: 2020-05-04  
---  

**实习笔记三----一种比md5更快的哈希算法。**

---

## xxhash 
MD5消息摘要算法（英语：MD5 Message-Digest Algorithm），一种被广泛使用的密码散列函数，可以产生出一个128位（16字节）的散列值（hash value），用于确保信息传输完整一致。MD5由美国密码学家罗纳德·李维斯特（Ronald Linn Rivest）设计，于1992年公开，用以取代MD4算法。这套算法的程序在 RFC 1321 中被加以规范。

xxhash是一整套的哈希算法，有xxhash的32位和64位生成算法，有xxhash3的64位和128位的生成算法。google有一套完整覆盖了有关哈希的分布、哈希碰撞、性能的测试smhasher，https://github.com/aappleby/smhasher, xxhash是完整通过了这套测试的，因此使用上不用担心碰撞的问题。

xxhash的最大优点就是速度快，在官网的benchmark如下：
<img src="{{ site.url }}/assets//blog_images/xxhash.png" width="100%"/>

xxhash的官网实现为C语言的版本，可以编译为库，也可以直接头文件inline：
  
https://github.com/Cyan4973/xxHash
  
另外也有C++17的纯模板单头文件实现：
  
https://github.com/RedSpah/xxhash_cpp

## 进行大文件的benchmark
可以找一个接近4G大小的电影：珍珠港.mp4（3283529835字节），分别用md5和xxhash算法进行benchmark.
测试的设备信息如下：
```
硬件概览：

  型号名称：        MacBook Pro
  型号标识符：        MacBookPro15,1
  处理器名称：        Intel Core i7
  处理器速度：        2.6 GHz
  处理器数目：        1
  核总数：        6
  L2 缓存（每个核）：        256 KB
  L3 缓存：        12 MB
  超线程技术：        已启用
  内存：        16 GB
```
md5使用boost的实现，xxhash使用c和c++的实现分别进行测试。为了体现其他因素的一致性，io也将计入到消耗时间中，程序每次读入1024字节的内容，哈希进行update，文件读取完之后最终digest，保证了其他因素的一致。

## 耗时
得到的测试结果如下：
```
xxhash-cpp-64: 1.62366
xxhash3-cpp-128: 1.49094
xxhash-c-64 inline: 1.47378
md5: 6.9515
md5: 7.238
```
连同文件的IO，大文件的md5计算的速度大约是447MB/s，而xxhash的计算大约是2087MB/s，虽然没有体现出官网上的速度，但也比MD5快了不少了。另外，测试中并没有发现xxhash和xxhash3之间，以及不同位数的算法之间在性能上有显著的差异。

## CPU占用与内存分配
通过mac下的instrument工具，各算法的CPU占用率几乎都接近100%.内存分配很少，因为读大文件计算哈希的过程是以1024字节的buffer进行更新的。

## 一些问题
1. xxhash的c源码对于xxhash3的实现似乎有问题（也可能是我用错了），不论是64位还是128位，不论是链接库还是直接内联，不论是用Dev的代码还是release的代码，xxhash3总会崩溃。。。
2. xxhash-cpp也实现了xxhash3算法，不会崩溃，不过对于C++的版本要求为17，与同步盘的C++版本不同

# 部分benchmark的代码
```c++
{
    PROFILE_BLOCK("xxhash-cpp-64");
    xxh::hash_state_t<64> hash_stream;
    std::ifstream ifs("珍珠港.mp4");
    char fileBuf[BUFFSIZE];
    while (ifs.good()) {
        ifs.read(fileBuf, BUFFSIZE);
        auto read_size = ifs.gcount();
        hash_stream.update(fileBuf, static_cast<size_t>(read_size));
    }
    xxh::hash64_t final_hash = hash_stream.digest();
    ifs.close();
}

{
    PROFILE_BLOCK("xxhash3-cpp-128");
    xxh::hash3_state128_t hash_stream;
    std::ifstream ifs("珍珠港.mp4");
    char fileBuf[BUFFSIZE];
    while (ifs.good()) {
        ifs.read(fileBuf, BUFFSIZE);
        auto read_size = ifs.gcount();
        hash_stream.update(fileBuf, static_cast<size_t>(read_size));
    }
    xxh::hash128_t final_hash = hash_stream.digest();
    ifs.close();
}

{
    PROFILE_BLOCK("xxhash-c-64 inline");
    XXH64_state_t* const state = XXH64_createState();
    std::ifstream ifs("珍珠港..mp4");
    char fileBuf[BUFFSIZE];
    while (ifs.good()) {
        ifs.read(fileBuf, BUFFSIZE);
        auto read_size = ifs.gcount();
        XXH64_update(state, fileBuf, read_size);
    }
    XXH64_hash_t const hash = XXH64_digest(state);
    XXH64_freeState(state);
   ifs.close();
}

{
    PROFILE_BLOCK("md5");
    utils::CalculateFileVecMD5("珍珠港.mp4");
}

{
    PROFILE_BLOCK("md5");
    utils::CalculateFileMD5("珍珠港.mp4");
}
```