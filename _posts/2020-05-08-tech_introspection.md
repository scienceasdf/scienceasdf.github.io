---
title: 实习笔记七----技术上的收获
categories:
- 沉思录
tags:
- 实习笔记
updated: 2020-05-08  
---  

**实习笔记七----几个月实习以来技术上的总结反思。**

---

最近的实习，在大公司体会到了更加面向市场的技术，这与学校所学的技术是有很大区别的。我自己认为，工业上大规模商用的技术有两个特点：一是以解决问题为主，拿魔方举个例子，如果在学校里的技术是如何转魔方使得魔方还原，那么在工业中的技术有时候会采取把魔方的六个面涂成对应的颜色来还原魔方；二是需要考虑到各种各样的复杂情况，如果说拿造桥举例，那么学校的技术可能是造一座独木桥，而工作中的情况是造一座能够容纳各种交通工具的桥，可能会有栏杆、标线等等保证安全的措施，尽管二者的本质都是两点之间的一个通行路径，但是工业上需要考虑更加复杂、更加稳定的情况。

而在软件开发的过程中，我总结的有以下的一些学到的经验：

1. 重视写代码前的方案架构设计，多思考可能会出现的坑
1. 持续化集成非常重要。从版本管理、代码Lint检查、容器自动化测试、自动打包（Jenkins）、各版本符号文件保存等多方面，每一次提交代码都有机制保证代码的质量
2. 重视测试，无论是单元测试，还是其他的复杂测试，尽可能提高测试代码的覆盖率（llvm-cov工具）
3. 重视版本管理，重视git的提交记录，版本管理不仅可以保证开发任务的线索更加明晰，也可以让程序的升级流程更加顺利，还能够使问题的回溯更加易于定位
4. 重视日志，日志应分级记录有价值的内容，定期rotate，避免无关信息的干扰。此外，对于客户端的日志，需要进行脱敏处理以防用户的隐私信息泄露。如果并非运行在开发机上的程序，还应该设计好日志远程上传的接口
5. 程序应该有崩溃处理得机制，开源的方案代表为breakpad或crashpad。对于任何版本的程序，编译时同时保存好符号文件，在程序崩溃后可以定位崩溃发生的地方；此外，和日志类似的，如果并非运行在开发机上的程序，也需要设计崩溃后上传崩溃文件的功能
6. 重视程序的可读性，多写文档与注释，注重代码拆分，重视每次提交代码后的peer review
7. 技术方案通常不只有一套，我们对某个问题分析应该多思考不同的解决方案，充分认识问题的背景上下文，对每种方案的不同方面进行综合比较，择优选择方案，并形成记录文档。
10. 建立每日数据看板，每天都可以通过可视化的数据图标看到用户使用数、下载数、程序崩溃数等详细的各项数据

接下来可能是一些细枝末节的技术总结了：

1. 多线程的对象析构问题（thread和promise都可能会遇到），若反复析构程序必然会崩溃。实在不好处理就用static
2. 不要认为v8的效率高就处处用js。。。。。。最关键的还是要做好性能优化，控制内存和CPU的使用

以上是自己在实习过程中对技术的一些总结与反思，自己实习过程中所能够接触的技术有限，因此还需要继续学习，不断反思与提高。