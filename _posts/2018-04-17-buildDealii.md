---
title: 在Windows下编译deal.ii
categories:
- Programming
tags:
- 有限元 
- 数值算法
- boost
updated: 2018-4-17 
---
**在Windows下用MSVC2017编译deal.ii**

---
最近由于一些原因需要学习开源有限元的程序。在Github上找了一下，C++的还算有三位数stars的有deal.ii,libMesh和mFem（按照stars数目由多到少排列）。libMesh的代码下载下来居然不支持cmake，编译只能用msys来make，似乎也不能用MSVC编译。而deal.ii只能支持MSVC而不支持mingw.权衡了一下，选择deal.ii来学习，一个是它stars数多，知名度更高，另一个是mingw的编译器编译出来的程序通常比MSVC编译出来的更慢，这个在科学计算中比较头疼。  

CMake里面configure的过程要设置一大堆flag，我都没有管，毕竟windows什么都特别不方便。像LAPACK库，GSL库我觉得还是有必要去链接的。希望这个东西的矩阵运算效率至少能够达到Eigen的水平。Configure第一次不对劲，原因竟然是我设置的build目录里面有'-'减号。重新设置了build目录以后，生成了sln文件，感觉似乎有点希望了。不过不敢乐观，以前cmake成功但是sln最后还是编译不了的例子也有。

打开MSVC后，开始编译。很神奇的是，编译到一半出错了，说cmd停止运行，然后打开目录里面却发现已经deal_II.g.lib和deal_II.lib生成了。这个时候我相信它是编译成功了，但是打开别的test目录里却发现没有编译，examples也没有。有些失落，直接试试这个库到底能不能用。

直接把官网的第一个例子复制过来，用QMake编译：
```c++
/* ---------------------------------------------------------------------
 *
 * Copyright (C) 1999 - 2016 by the deal.II authors
 *
 * This file is part of the deal.II library.
 *
 * The deal.II library is free software; you can use it, redistribute
 * it, and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * The full text of the license can be found in the file LICENSE at
 * the top level of the deal.II distribution.
 *
 * ---------------------------------------------------------------------

 */


#include <deal.II/grid/tria.h>
#include <deal.II/grid/tria_accessor.h>
#include <deal.II/grid/tria_iterator.h>
#include <deal.II/grid/grid_generator.h>
#include <deal.II/grid/manifold_lib.h>
#include <deal.II/grid/grid_out.h>

#include <iostream>
#include <fstream>
#include <cmath>

using namespace dealii;


void first_grid ()
{
  Triangulation<2> triangulation;

  GridGenerator::hyper_cube (triangulation);
  triangulation.refine_global (4);

  std::ofstream out ("grid-1.eps");
  GridOut grid_out;
  grid_out.write_eps (triangulation, out);
  std::cout << "Grid written to grid-1.eps" << std::endl;
}




void second_grid ()
{
  Triangulation<2> triangulation;

  const Point<2> center (1,0);
  const double inner_radius = 0.5,
               outer_radius = 1.0;
  GridGenerator::hyper_shell (triangulation,
                              center, inner_radius, outer_radius,
                              10);
  const SphericalManifold<2> manifold_description(center);
  triangulation.set_manifold (0, manifold_description);
  triangulation.set_all_manifold_ids(0);

  for (unsigned int step=0; step<5; ++step)
    {
      Triangulation<2>::active_cell_iterator cell = triangulation.begin_active();
      Triangulation<2>::active_cell_iterator endc = triangulation.end();
      for (; cell!=endc; ++cell)
        {
          for (unsigned int v=0;
               v < GeometryInfo<2>::vertices_per_cell;
               ++v)
            {
              const double distance_from_center
                = center.distance (cell->vertex(v));

              if (std::fabs(distance_from_center - inner_radius) < 1e-10)
                {
                  cell->set_refine_flag ();
                  break;
                }
            }
        }

      triangulation.execute_coarsening_and_refinement ();
    }


  std::ofstream out ("grid-2.eps");
  GridOut grid_out;
  grid_out.write_eps (triangulation, out);

  std::cout << "Grid written to grid-2.eps" << std::endl;

  triangulation.set_manifold (0);
}




int main ()
{
  first_grid ();
  second_grid ();
}
```
编译的时候也是坑，又提示需要include boost，我在QMAKE加了boost目录，还是没有包含，干脆把所有的boost文件全部复制到deal.ii的include路径下。而且deal.iibuild目录下的include和deal.ii源代码下的include还要合并。然后又说不对，还需要链接boost::serialization库，接着又是链接这个库。还是不对，说`triangulation.set_manifold (0);`没有这个方法。把这一行注释掉，运行又有问题，不过倒是输出了eps图片。到底编译成功没有还是个未知数。  

接着是第二个例子，用刚才的QMAKE配置一次成功。第三个例子的一句话是`Functions::ZeroFunction<2>`，又不对了，需要自己包含`#include <deal.II/base/function.h>`，然后还不对，进头文件一看，ZeroFunction继承于Functions类，这个官网的例子实在有点扯。最后编译成功了。但是出的gpl图居然又不能在GNU PLOT里面打开，说有语法错误。  

用release又编译了第四个例子，一次成功了，但是又费劲地用three.js渲染vtk文件，没有显示出来，不知道是什么毛病。只能说姑且认为这个编译成功了，但是坑还很大。  
  
--- 
第二个例子生成了svg图片，不小心发现了我的win10电脑上居然还有IE,版本是11，果断试试[我的网站](https://scienceasdf.github.io)在IE11上的兼容性，好像很差（主要是sql.js和echarts）。非常无奈，中国还有许多人用IE，现在移动端对html5的支持居然都比IE好。不过edge长得太像IE了，微软改名部啊:Grin: