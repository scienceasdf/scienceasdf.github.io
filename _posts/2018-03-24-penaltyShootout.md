---
title: 一个点球大战游戏的开发
categories:
- Programming
tags:
- 蒙特卡洛方法
- 安卓开发 
- Qt 
updated: 2018-03-24 
---
<script type="text/x-mathjax-config">
  		MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
  							TeX: { equationNumbers: {  autoNumber: "AMS"  },
     							   extensions: ["AMSmath.js"]}
  		});
		</script>
 <script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
**开发了一个点球大战的手机小游戏。**

---

开发了一个点球大战的小游戏，实现了游戏引擎与GUI的分离。

## 球员类
### 射手类
类的定义如下：
```c++
class striker{
public:
    striker(){}
    striker(bool AI);

    double pShootLeft;
    double pShootRight;
    double pShootCenter;

    QString name;

    direction shoot();

    bool isAI;

};
```
这里需要考虑的一个问题是：为了追求尽可能模拟现实，因此罚点球射向左边、右边的概率会远大于射向中间的概率，因此对于一个非用户操控的球员（即AI操控的球员），概率如下：
```c++
unsigned seed1 = std::chrono::system_clock::now().time_since_epoch().count();
std::mt19937 generator(seed1);
std::uniform_real_distribution<double> dis(0,1.0);
auto dice= std::bind(dis,generator);
isAI = true;
double l = dice();
double c = dice();
double r = dice();
pSaveLeft = (.95 * l) / (.95 * l + .95 * r + .1 * c);
pSaveRight = (.95 * r) / (.95 * l + .95 * r + .1 * c);
pSaveCenter = (.1 * c) / (.95 * l + .95 * r + .1 * c);
```
MinGW都没有实现std::default_random_device，因此用了种子的方法生成随机数。
    
守门员和这个类似，就不再赘述了。

## 游戏引擎

这是第一次对这个东西进行了架构，与GUI分离后，实现松耦合后能够很容易地编码。不过由于也是第一次架构，因此也存在一些或许不合理的地方。实际上用设计模式应该会收到更好的效果。

### 回合类
```c++
class rounds{
private:
    direction direc;

public:
    rounds(striker *st1, goalKeeper *gk1, game* eng);
    rounds(striker *st1, goalKeeper *gk1, direction direct, game* eng);

    QString string1;
    QString string2;
    QString string3;

    striker* st;
    goalKeeper* gk;

    game* m_game;

    bool goal();
};
```

### 引擎类
```c++
class game{
public:
    game(bool youAreKnown, bool youCanKonwAll, int userTurn);

    // The round number represents the already finished rounds counter
    int redRound;
    int redScore;
    int blueRound;
    int blueScore;
    int usrTurn;
    goalKeeper redGK;
    goalKeeper blueGK;
    std::vector<striker> stsRed;
    std::vector<striker> stsBlue;
    bool youKnowAll;
    bool redFirst;

    bool usrNeedInput();
    void nextRound();
    void nextRound(direction dir);
    gameState getGameState();
    roundState getRoundState();

    QString string1;
    QString string2;
    QString string3;

//private:
    allStr stringEngine;

};
```
game类里面主要就是nextRound成员函数构造round类并进行模拟。这里也是有一些设计的有一些欠妥当，导致round类的构造函数需要一个game的指针，以让关于游戏信息的字符串传回去。  
  

在点球大战中还需要专门判断点球大战是否提前结束了，这样才更符合真实的点球大战，因为如果某一方劣势已经确定就不会踢满5轮点球大战了。
```c++
gameState game::getGameState()
{
    if (redRound > 5 && blueRound == redRound){
        if(redScore == blueScore) return notFinished;
        if(redScore > blueScore) return redWin;
        if(redScore < blueScore) return blueWin;
    }
    if(redRound > 5 || blueRound > 5){
        return notFinished;
    }
    if(redScore > (5 - blueRound + blueScore)){
        return redWin;
    }
    if(blueScore > (5 - redRound + redScore)){
        return blueWin;
    }
    return notFinished;
}
```


### 字符串引擎
为了实现松耦合，需要专门设计一个字符串处理的类，类的定义如下：
```c++
class allStr
{
public:
    allStr();

    QString getPrologue();
    QString getStIntro();
    QString getRedWinStr();
    QString getBlueWinStr();
    QString getPenaltyStr(direction shootDirection, direction saveDirection, bool outside, bool goal);

//private:
    std::vector<QString> redGkName;
    std::vector<QString> redStName;
    std::vector<QString> blueGkName;
    std::vector<QString> blueStName;

    std::vector<QString> prologue1;
    std::vector<QString> prologue2;
    std::vector<QString> prologue3;

    std::vector<QString> stIntro1;
    std::vector<QString> stIntro2;

    std::vector<QString> redWinStr1;
    std::vector<QString> redWinStr2;
    std::vector<QString> blueWinStr1;
    std::vector<QString> blueWinStr2;

    std::vector<QString> sameNoGoal1;
    std::vector<QString> sameNoGoal2;
    std::vector<QString> sameAndGoal1;
    std::vector<QString> sameAndGoal2;
    std::vector<QString> lrOutside1;
    std::vector<QString> lrOutside2;

    std::vector<QString> lr_c_goal1;
    std::vector<QString> lr_c_goal2;
    std::vector<QString> lr_c_noGoal1;
    std::vector<QString> lr_c_noGoal2;

    std::vector<QString> lr_wrongSave1;
    std::vector<QString> lr_wrongSave2;

    std::vector<QString> c_outside;
    std::vector<QString> c_lr_goal1;
    std::vector<QString> c_lr_goal2;

    std::vector<QString> c_c1;
    std::vector<QString> c_c2;

    std::vector<QString> c_lr_noGoal1;
    std::vector<QString> c_lr_noGoal2;

};
```
这些字符串在构造函数里面将所有的字符串插入并使用std::shuffle打乱，通过获取字符串的成员函数可以返回一些随机的但是能够组合在一起的句子，成为游戏中的解说信息。

## 总结
这里写得很少，但是完成这个小游戏还是费挺大劲，遇到了各种各样奇奇怪怪的坑。什么定时器的使用，各种结果的处理，还是挺麻烦的。另外这里我还是没有考虑到点球大战踢满11轮的情况，一旦踢满11轮程序按理说会崩溃，但是现在晚了这么久我还没有遇到哪一次踢满了11轮:satisfied:。
