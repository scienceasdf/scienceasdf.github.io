---
title: 实现Qt程序的滑动手势
categories:
- Programming
tags: 
- 安卓开发 
- Qt 
updated: 2018-12-16 
---
<script type="text/x-mathjax-config">
  		MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
  							TeX: { equationNumbers: {  autoNumber: "AMS"  },
     							   extensions: ["AMSmath.js"]}
  		});
		</script>
 <script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
**Copy了一份实现单指滑动手势的源码。**

---
Qt的SwipeGesture居然是要三个手指同时操作（这里是说用widget而不是用quick控件，实际上quick控件才是Qt为移动开发打造的）。把源码拿出来看了半天，看是能够看懂，可以就是改了就无法编译了。在GitHub上用搜索功能，终于找到了[直接可用的方案](https://github.com/digifant/multidisplay-app/blob/b0921e1b0f0c728c58427029374bef072d0c4382/src/mobile/SwipeGestureRecognizer.h)（神奇的GitHub）：  
头文件,这里面的宏定义MINIMUM_DISTANCE = 50是可以根据需要修改的
```c++
// customGesture.h
#ifndef CUSTOMGESTURE_H
#define CUSTOMGESTURE_H
#include <QGesture>
#include <QGestureRecognizer>
#include <QSwipeGesture>

/**

 * @brief The SwipeGestureRecognizer class

 * needed because the defalt implementation of swipe is a little bit odd: it only triggers on 3 finger swipes! (5.3)

 *

 * http://developer.android.com/design/patterns/gestures.html

 * http://qt-project.org/doc/qt-5/gestures-overview.html

 */

class SwipeGestureRecognizer : public QGestureRecognizer

{

public:

    SwipeGestureRecognizer();





private:

    #ifdef FOR_DESKTOP
   static const int MINIMUM_DISTANCE = 50;
#endif
#ifdef FOR_MOBILE
   static const int MINIMUM_DISTANCE = 50;
#endif


   typedef QGestureRecognizer parent;



   bool IsValidMove(int dx, int dy);



   qreal ComputeAngle(int dx, int dy);



   virtual QGesture* create(QObject* pTarget);



   virtual QGestureRecognizer::Result recognize(QGesture* pGesture, QObject *pWatched, QEvent *pEvent);



   void reset (QGesture *pGesture);

};





class SwipeGestureUtil {

public:

    static QSwipeGesture::SwipeDirection GetHorizontalDirection(QSwipeGesture *pSwipeGesture);

    static QSwipeGesture::SwipeDirection GetVerticalDirection(QSwipeGesture *pSwipeGesture);


};

#endif // CUSTOMGESTURE_H
```
---
源文件
```c++
// customGesture.cpp
#include <QMouseEvent>

#include <QDebug>



#include <cmath>

#include "customgesture.h"



SwipeGestureRecognizer::SwipeGestureRecognizer()

{

}



bool

SwipeGestureRecognizer::IsValidMove(int dx, int dy)

{

   // The moved distance is to small to count as not just a glitch.

   if ((qAbs(dx) < MINIMUM_DISTANCE) && (qAbs(dy) < MINIMUM_DISTANCE)) {

      return false;

   }



   return true;

}





// virtual

QGesture*

SwipeGestureRecognizer::create(QObject* pTarget)

{

   //qDebug("SwipeGestureRecognizer::create() called");

   QGesture *pGesture = new QSwipeGesture(pTarget);

   return pGesture;

}





// virtual

QGestureRecognizer::Result

SwipeGestureRecognizer::recognize(QGesture* pGesture, QObject *pWatched, QEvent *pEvent)

{

   QGestureRecognizer::Result result = QGestureRecognizer::Ignore;

   QSwipeGesture *pSwipe = static_cast<QSwipeGesture*>(pGesture);



   switch(pEvent->type()) {

      case QEvent::MouseButtonPress: {

         QMouseEvent* pMouseEvent = static_cast<QMouseEvent*>(pEvent);

#if QT_VERSION < QT_VERSION_CHECK(5, 0, 0)

         pSwipe->setProperty("startPoint", pMouseEvent->posF());

#else

         pSwipe->setProperty("startPoint", pMouseEvent->localPos());

#endif

         result = QGestureRecognizer::MayBeGesture;

         //qDebug() << "Swipe gesture started (start point=" <<  pSwipe->property("startPoint").toPointF() <<  ")";

      }

      break;

      case QEvent::MouseButtonRelease: {

         QMouseEvent* pMouseEvent = static_cast<QMouseEvent*>(pEvent);

         const QVariant& propValue = pSwipe->property("startPoint");

         QPointF startPoint = propValue.toPointF();

#if QT_VERSION < QT_VERSION_CHECK(5, 0, 0)

         QPointF endPoint = pMouseEvent->posF();

#else

         QPointF endPoint = pMouseEvent->localPos();

#endif



         // process distance and direction

         int dx = endPoint.x() - startPoint.x();

         int dy = endPoint.y() - startPoint.y();



         //bugfix: startPoint.isNull because we sometimes get false events with startpoint 0 -> wrong swipe detected!

         if ( (!IsValidMove(dx, dy)) || ( startPoint.isNull() ) ) {

            // Just a click, so no gesture.

            result = QGestureRecognizer::CancelGesture;

            //qDebug("Swipe gesture canceled");

         } else {

            // Compute the angle.

             //qDebug() << " startPoint= " << startPoint << " endPoint=" << endPoint << " dx=" << dx << " dy=" << dy;

            qreal angle = ComputeAngle(dx, dy);

            pSwipe->setSwipeAngle(angle);

            result = QGestureRecognizer::FinishGesture;

            //qDebug("Swipe gesture finished");

         }

      }

      break;

      default:

        break;

   }



   return result;

}



void

SwipeGestureRecognizer::reset(QGesture *pGesture)

{

   pGesture->setProperty("startPoint", QVariant(QVariant::Invalid));

   parent::reset(pGesture);

}



qreal

SwipeGestureRecognizer::ComputeAngle(int dx, int dy)

{

   double PI = 3.14159265;



   // Need to convert from screen coordinates direction

   // into classical coordinates direction.

   dy = -dy;



   double result = atan2((double)dy, (double)dx) ;

   result = (result * 180) / PI;



   // Always return positive angle.

   if (result < 0) {

      result += 360;

   }



   return result;

}







/*

==========================================================================

*/



QSwipeGesture::SwipeDirection

SwipeGestureUtil::GetHorizontalDirection(QSwipeGesture *pSwipeGesture)

{

   qreal angle = pSwipeGesture->swipeAngle();

   if (0 <= angle && angle <= 45) {

      return QSwipeGesture::Right;

   }



   if (135 <= angle && angle <= 225) {

      return QSwipeGesture::Left;

   }



   if (315 <= angle && angle <= 360) {

      return QSwipeGesture::Right;

   }



   return QSwipeGesture::NoDirection;

}



QSwipeGesture::SwipeDirection

SwipeGestureUtil::GetVerticalDirection(QSwipeGesture *pSwipeGesture)

{

   qreal angle = pSwipeGesture->swipeAngle();



   if (45 < angle && angle < 135) {

      return QSwipeGesture::Up;

   }



   if (225 < angle && angle < 315) {

      return QSwipeGesture::Down;

   }



   return QSwipeGesture::NoDirection;

}
```
使用代码就很简单了，比如某个窗体的头文件
```c++
class rangeReport : public QWidget
{
    Q_OBJECT
    // ...
private:
    // ...
    SwipeGestureRecognizer *fftRecognizer;
    Qt::GestureType fftType;

    void swipeTriggered(QSwipeGesture *gesture);

    bool event(QEvent *event);

    bool gestureEvent(QGestureEvent *event);

    int currentGraph;
    void registerGesture();
};
```
而源文件就是要注册这个手势识别器，并实现手势之后的响应
```c++
rangeReport::rangeReport(rangeType type):
    ui(new Ui::rangeReport)
{
    ui->setupUi(this);
    registerGesture();
    // ...
}
// ...
bool rangeReport::event(QEvent *event)
{
    if (event->type() == QEvent::Gesture){
        //qDebug()<<"grab!";
        return gestureEvent(static_cast<QGestureEvent*>(event));
    }
        return QWidget::event(event);
}

void rangeReport::swipeTriggered(QSwipeGesture *gesture)
{
    if (gesture->state() == Qt::GestureFinished) {
           if (gesture->horizontalDirection() == QSwipeGesture::Left
               || gesture->verticalDirection() == QSwipeGesture::Up) {
               if(currentGraph != chart.size() - 1){
                   currentGraph ++;
                   ui->graph1->setChart(chart[currentGraph]);
               }
           } else {
               if(currentGraph != 0){
                   currentGraph --;
                   ui->graph1->setChart(chart[currentGraph]);
               }                          //?ui->tabWidget->count():ui->tabWidget->currentIndex() + 1 );
           }
           update();
       }
}


bool rangeReport::gestureEvent(QGestureEvent *event)
{
    //qDebug() << "gestureEvent():" << event;
    if (QGesture *swipe = event->gesture(Qt::SwipeGesture))
        swipeTriggered(static_cast<QSwipeGesture *>(swipe));
    else if (QGesture *pan = event->gesture(Qt::PanGesture))
        //panTriggered(static_cast<QPanGesture *>(pan));

    return true;
}

void rangeReport::registerGesture()
{
    fftRecognizer = new SwipeGestureRecognizer();
    fftType = QGestureRecognizer::registerRecognizer(fftRecognizer);
    grabGesture(fftType);
}
```
最后还是要吐槽一下sqlite:我觉得这个数据库的性能特别好，查询速度很快，占用资源也少。不过为什么不支持全外连接语句:angry:让我用连接和并集写全外连接不是白白增加工作量吗？:facepunch: 


