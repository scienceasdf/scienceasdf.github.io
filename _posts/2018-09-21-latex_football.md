---
title: 用LaTeX画足球场与阵型
categories:
- LaTeX
tags:

updated: 2018-09-21  
---  
**This post is showing how to draw a football field in LaTeX. The contents are all unoriginal.本文展示如何用LaTeX画足球场。（非原创）**

---
谷歌到的关于这个的结果很少，但还是得到了答案。没有专门的宏包来绘制这个东西，不过可以用tikz宏包。

## 鸭子形状的球员
<img src="{{ site.url }}/assets//blog_images/duck_soccer1.png" width="600px" height="400px"/>
```latex
\documentclass[tikz,border=2mm]{standalone} 
\usetikzlibrary{positioning, ducks}
\usepackage{tikzducks}

\newcommand{\croacia}[3]{
\begin{scope}[shift={#3}, xscale=-.4, yscale=.4]
\duck
\path[preaction={fill=red}, pattern=checkerboard, pattern color=white] \duckpathjacket;
\node[font=\sffamily\bfseries] at ([xshift=5mm]wing) {#1};
\node[font=\sffamily\bfseries] at (1.1,-.22) {#2};
\end{scope}
}

\newcommand{\france}[3]{
\begin{scope}[shift={#3}, scale=.4]
\duck[jacket=blue]
\node[font=\sffamily\bfseries] at ([xshift=5mm]wing) {#1};
\node[font=\sffamily\bfseries] at (1.1,-.22) {#2};
\end{scope}
}

\definecolor{field}{RGB}{0,156,0}

\newcommand\area[2]{
\begin{scope}[shift={(#1)}, transform shape, rotate=#2]
\node[minimum width=.55cm,minimum height=1.832cm, anchor=west] (small#2) at (0,0) {};
\node[minimum width=1.65cm,minimum height=4.032cm, anchor=west] (big#2) at (0,0) {};
\node[minimum width=.244cm, minimum height=.732cm, anchor=east] (goal#2) at (0,0) {};
\node[inner sep=.3mm, circle, fill=white] (penalty#2) at (1.1,0) {};
    \begin{scope}
    \tikzset{every path/.style={}}
    \clip (big#2.south east) rectangle ++ (1,5); 
    \draw[white, very thick] (penalty#2) circle (0.915cm);
    \end{scope}
\end{scope}
}


\begin{document}
\begin{tikzpicture}
\begin{scope}[%    
    every node/.style={draw=white, very thick, inner sep=0, outer sep=0},
   every path/.style={draw=white, very thick},
]
\fill[field] (-1,-1) rectangle (13,10);
\node[minimum width=12cm, minimum height=9cm] (contour) at (6,4.5) {};

%\draw (contour.south west) grid (contour.north east);

% Center
\draw (contour.north) -- (contour.south);
\draw (contour.center) circle (0.915cm);
\fill[white] (contour.center) circle (.5mm);

% Areas
\area{contour.west}{0}
\area{contour.east}{180}

% Corners
\foreach \corner [count=\xi starting from 0] in {south west, south east, north east, north west}{
    \begin{scope}[rotate around={90*\xi:(contour.\corner)}]
        \draw ([xshift=1mm]contour.\corner) arc (0:90:1mm);
    \end{scope}
}
\end{scope}

\croacia{23}{Subasic}{(1.25,4.25)}
\croacia{3}{Strinic}{(2.6,7.2)}
\croacia{21}{Vida}{(2.3,5.3)}
\croacia{6}{Lovren}{(2.3,2.9)}
\croacia{2}{Virsalijko}{(2.6,1)}
\croacia{11}{Brozovic}{(3.5,4.25)}
\croacia{4}{Perisic}{(4.5,7.2)}
\croacia{7}{Rakitic}{(4.5,5.25)}
\croacia{10}{Modric}{(4.5,3)}
\croacia{18}{Rebic}{(4.5,1)}
\croacia{17}{Mandzukic}{(5.6,4.25)}

\france{1}{Lloris}{(10.75,4.25)}
\france{2}{Pavard}{(9.5,7.2)}
\france{4}{Varane}{(9.5,5.3)}
\france{5}{Umtiti}{(9.5,2.9)}
\france{21}{Lucas}{(9.5,1)}
\france{13}{Kante}{(8.5,6)}
\france{6}{Pogba}{(8.5,2.3)}
\france{10}{Mbappe}{(7,7)}
\france{7}{Griezman}{(7.8,4.25)}
\france{14}{Matuidi}{(7,1.5)}
\france{9}{Giroud}{(6.4,4.25)}
\end{tikzpicture}
\end{document}
```

## 正常外形的球员
用的是`tikzpeople`.这个不太容易给克罗地亚的队服加上格子花纹了。
<img src="{{ site.url }}/assets//blog_images/soccer2.png" width="600px" height="400px"/>
```latex
\documentclass[tikz,border=2mm]{standalone} 
\usetikzlibrary{positioning}
\usepackage{tikzmarmots}

\newcommand{\croacia}[3]{ \begin{scope}[shift={#3}, scale=.5] \marmot \path[preaction={fill=red}, pattern=checkerboard, pattern color=white] (1.35,0.71) .. controls (1.35,0.41) and (1.17,0.37) .. (0.92,0.37) .. controls (0.69,0.37) and (0.48,0.41) .. (0.48,0.71) .. controls (0.48,1.01) and (0.67,1.26) .. (0.91,1.26) .. controls (1.15,1.26) and (1.3 5,1.01) .. (1.35,0.71) -- cycle; \node[font=\sffamily\bfseries] at (0.95,0.82) {#1}; \node[font=\sffamily\bfseries] at (1.1,-.22) {#2}; \end{scope} }

\newcommand{\france}[3]{ \begin{scope}[shift={#3}, scale=.5] \marmot[body=brown!80!yellow] \path[fill=blue] (1.35,0.71) .. controls (1.35,0.41) and (1.17,0.37) .. (0.92,0.37) .. controls (0.69,0.37) and (0.48,0.41) .. (0.48,0.71) .. controls (0.48,1.01) and (0.67,1.26) .. (0.91,1.26) .. controls (1.15,1.26) and (1.3 5,1.01) .. (1.35,0.71) -- cycle; \node[font=\sffamily\bfseries] at (0.95,0.82) {#1}; \node[font=\sffamily\bfseries] at (1.1,-.22) {#2}; \end{scope} }
\definecolor{field}{RGB}{0,156,0}

\newcommand\area[2]{
\begin{scope}[shift={(#1)}, transform shape, rotate=#2]
\node[minimum width=.55cm,minimum height=1.832cm, anchor=west] (small#2) at (0,0) {};
\node[minimum width=1.65cm,minimum height=4.032cm, anchor=west] (big#2) at (0,0) {};
\node[minimum width=.244cm, minimum height=.732cm, anchor=east] (goal#2) at (0,0) {};
\node[inner sep=.3mm, circle, fill=white] (penalty#2) at (1.1,0) {};
    \begin{scope}
    \tikzset{every path/.style={}}
    \clip (big#2.south east) rectangle ++ (1,5); 
    \draw[white, very thick] (penalty#2) circle (0.915cm);
    \end{scope}
\end{scope}
}


\begin{document}
\begin{tikzpicture}
\begin{scope}[%    
    every node/.style={draw=white, very thick, inner sep=0, outer sep=0},
   every path/.style={draw=white, very thick},
]
\fill[field] (-1,-1) rectangle (13,10);
\node[minimum width=12cm, minimum height=9cm] (contour) at (6,4.5) {};

%\draw (contour.south west) grid (contour.north east);

% Center
\draw (contour.north) -- (contour.south);
\draw (contour.center) circle (0.915cm);
\fill[white] (contour.center) circle (.5mm);

% Areas
\area{contour.west}{0}
\area{contour.east}{180}

% Corners
\foreach \corner [count=\xi starting from 0] in {south west, south east, north east, north west}{
    \begin{scope}[rotate around={90*\xi:(contour.\corner)}]
        \draw ([xshift=1mm]contour.\corner) arc (0:90:1mm);
    \end{scope}
}
\end{scope}

\croacia{23}{Subasic}{(0.25,4.25)}
\croacia{3}{Strinic}{(1.6,7.2)}
\croacia{21}{Vida}{(1.3,5.3)}
\croacia{6}{Lovren}{(1.3,2.9)}
\croacia{2}{Virsalijko}{(1.6,1)}
\croacia{11}{Brozovic}{(2.5,4.25)}
\croacia{4}{Perisic}{(3.5,7.2)}
\croacia{7}{Rakitic}{(3.5,5.25)}
\croacia{10}{Modric}{(3.5,3)}
\croacia{18}{Rebic}{(3.5,1)}
\croacia{17}{Mandzukic}{(4.6,4.25)}

\france{1}{Lloris}{(10.75,4.25)}
\france{2}{Pavard}{(9.5,7.2)}
\france{4}{Varane}{(9.5,5.3)}
\france{5}{Umtiti}{(9.5,2.9)}
\france{21}{Lucas}{(9.5,1)}
\france{13}{Kante}{(8.5,6)}
\france{6}{Pogba}{(8.5,2.3)}
\france{10}{Mbappe}{(7,7)}
\france{7}{Griezman}{(7.8,4.25)}
\france{14}{Matuidi}{(7,1.5)}
\france{9}{Giroud}{(6.4,4.25)}
\end{tikzpicture}
\end{document}
```

## 七人制的一个阵型
<img src="{{ site.url }}/assets//blog_images/soccer3.png" width="600px" height="400px"/>
只需要改一下一些坐标就行了。

## 绘制球场
<img src="{{ site.url }}/assets//blog_images/soccer4.png" width="600px" height="400px"/>
```latex
\documentclass[margin=10pt]{standalone}
\usepackage{tikz}
\usetikzlibrary{arrows.meta, calc}

\definecolor{field}{RGB}{0,156,0}

\tikzset{
    every node/.style={draw=white, very thick, inner sep=0, outer sep=0},
    every path/.style={draw=white, very thick},
}

\newcommand\area[2]{
\begin{scope}[shift={(#1)}, transform shape, rotate=#2]
\node[minimum width=.55cm,minimum height=1.832cm, anchor=west] (small#2) at (0,0) {};
\node[minimum width=1.65cm,minimum height=4.032cm, anchor=west] (big#2) at (0,0) {};
\node[minimum width=.244cm, minimum height=.732cm, anchor=east] (goal#2) at (0,0) {};
\node[inner sep=.3mm, circle, fill=white] (penalty#2) at (1.1,0) {};
    \begin{scope}
    \tikzset{every path/.style={}}
    \clip (big#2.south east) rectangle ++ (1,5); 
    \draw[white, very thick] (penalty#2) circle (0.915cm);
    \end{scope}
\end{scope}
}

\newcommand\showmeasures{
    \begin{scope}
    \tikzset{every node/.style={draw=none,fill=field, inner sep=2pt, sloped}}
    \draw[black, {Latex}-{Latex}] ($(contour.north west)+(0,.5)$) -- ($(contour.north east)+(0,.5)$) node[midway] {\textbf{Sideline:} min 90m - max 120m};
    \draw[black, {Latex}-{Latex}] ($(contour.south west)+(-.6,0)$) -- ($(contour.north west)+(-.6,0)$) node[midway] {\textbf{Goal line:} min 45m - max 90m};
    \draw[black, -{Latex}] (penalty0) --++ (-15:0.915cm) node[midway, above, font=\scriptsize, fill=none, yshift=2pt] {r = 9.15m};
    \draw[black, {Latex}-{Latex}] ($(small0.south east)+(-.2,0)$) -- ($(small0.north east)+(-.2,0)$) node[midway,above, fill=none,font=\scriptsize] {18.32m};
    \draw[black] ($(small0.north west)+(0,.2)$) -- ($(small0.north east)+(0,.2)$) node[midway, above, font=\scriptsize, fill=none, xshift=3pt] {5.50m};
    \draw[black] (contour.south east) --++ (135:1mm) node[anchor=south east] {r = 1m};
    \draw[black, {Latex}-{Latex}] ($(big180.south east)+(-.5,0)$) -- ($(big180.north east)+(-.5,0)$) node[midway,above, rotate=180,fill=none,font=\scriptsize] {40.32m};
    \draw[black, {Latex}-{Latex}] ($(big180.south west)+(0,.2)$) -- ($(big180.south east)+(0,.2)$) node[midway,above,fill=none,font=\scriptsize] {16.50m};
    \draw[black] (contour.east) --++ (-11mm,0) node[midway,above, fill=none,font=\scriptsize] {11m};
    \node[font=\small, rotate=-90, yshift=5mm] at (goal180) {\textbf{Goal:} 7.32m $\times$ 2.44m};
    \draw[black, -{Latex}] (contour.center) --++ (0:0.915cm) node[midway, above, fill=none,font=\scriptsize, yshift=2pt] {r = 9.15m};
    \end{scope}
}

\begin{document}
\begin{tikzpicture}
\fill[field] (-1,-1) rectangle (13,10);
\node[minimum width=12cm, minimum height=9cm] (contour) at (6,4.5) {};

% Center
\draw (contour.north) -- (contour.south);
\draw (contour.center) circle (0.915cm);
\fill[white] (contour.center) circle (.5mm);

% Areas
\area{contour.west}{0}
\area{contour.east}{180}

% Corners
\foreach \corner [count=\xi starting from 0] in {south west, south east, north east, north west}{
    \begin{scope}[rotate around={90*\xi:(contour.\corner)}]
        \draw ([xshift=1mm]contour.\corner) arc (0:90:1mm);
    \end{scope}
}

\showmeasures
\end{tikzpicture}
\end{document}
```

