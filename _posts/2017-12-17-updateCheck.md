---
title: 实现Qt程序的新版本检查
categories:
- Programming
tags:
- 网络 
- 安卓开发 
- Qt 
updated: 2018-12-17 
---
<script type="text/x-mathjax-config">
  		MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
  							TeX: { equationNumbers: {  autoNumber: "AMS"  },
     							   extensions: ["AMSmath.js"]}
  		});
		</script>
 <script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
**利用GitHub提供的API,实现程序的新版本检查功能。**

---

## GitHub的开发者API
对于GitHub上的仓库，我们可以发布Release，每个Release除了源代码以外还可以附加编译后的二进制文件。发布Release之后便可以通过API获取一些有用的信息。不过需要注意的是，如下图所示，发布的Release是不能勾选“This is a pre-release”选项的。
<img src="{{ site.url }}/assets//blog_images/release.png" width="450px" height="200px"/>
例如对于我的easyAuto仓库，那么API是[https://api.github.com/repos/scienceasdf/accoutAssist/releases/latest](https://api.github.com/repos/scienceasdf/accoutAssist/releases/latest)。在浏览器中打开，可以看出这里提供json格式的许多信息。当然，如果是pre-release版本的话，就会得到下面的结果：
```
{
  "message": "Not Found",
  "documentation_url": "https://developer.github.com/v3/repos/releases/#get-the-latest-release"
}
```
## Qt的HTTPS请求与处理
首先需要在.pro文件中加上这两句，分别是加上网络模块和版本号的宏定义：
```c++
QT      += ... network
DEFINES += "VERSION=2.2"
```
接下来就是具体实现的代码：
```c++
#include <QtNetwork>
// ...
void accountAssit::on_checkUpdate_clicked()
{
    QNetworkAccessManager networkManager;


    QUrl url("https://api.github.com/repos/scienceasdf/accoutAssist/releases/latest");
    QNetworkRequest request;
    request.setUrl(url);

    m_currentReply = networkManager.get(request);  // GET
    connect(&networkManager, SIGNAL(finished(QNetworkReply*)), this, SLOT(onResultUpdate(QNetworkReply*)));
    QEventLoop eventLoop;
    QObject::connect(&networkManager, &QNetworkAccessManager::finished, &eventLoop, &QEventLoop::quit);
    eventLoop.exec();
}

void accountAssit::onResultUpdate(QNetworkReply * reply)
{
    if (m_currentReply->error() != QNetworkReply::NoError){
        //qDebug()<<"ERROR!";
        return;  // ...only in a blog post
    }

    QString data = (QString) reply->readAll();
    qDebug()<<data;
    QJsonDocument d = QJsonDocument::fromJson(data.toUtf8());
    QJsonObject sett2 = d.object();
    QJsonValue value = sett2.value(QString("tag_name"));
    qDebug() << value;
    if(value.toDouble() > VERSION){
        QMessageBox::StandardButton button;
        button = QMessageBox::question(this, tr("有新的版本"),
                QString(tr("是否下载新的版本？")),
                QMessageBox::Yes | QMessageBox::No);

            if (button == QMessageBox::Yes){

        }
    }
    else{
        QMessageBox::information(0, "更新检查","此版本已经是最新发布版本", QMessageBox::Yes);
    }
}
```
在代码中，accountAssist是一个窗体，里面有一个类型为QNetworkReply*的重要成员：m_currentReply，用来保存网络是否正常的状态。当在获取HTTPS内容时，使用QEventLoop不阻塞GUI线程。当全文获取之后，转到槽函数onResultUpdate，对收到的所有内容进行处理。Qt自带了QJson的处理，非常的方便。如果发现最新版的release版本号大于宏定义的版本号，那么就提示有新的版本。不过这个也太简单粗暴了，如果版本号是从2.1更新到了2.10，这种方法就不奏效。解决方法也很简单，定义大版本号和小版本号，分别比较。比如“2.10”，QString自带了split函数，其实之前做easyAuto还可以用这个方法
```c++
QStringList list = QString("2.10").split("\n");
foreach(QString str, list){
	//...
}
```
最后值得注意的是，在安卓程序里，必须要SSL连接，所以需要在网上下载libcrypto.so和libssl.so，并在.pro文件里加上
```
android {
  ANDROID_EXTRA_LIBS += $$PWD/libcrypto.so
  ANDROID_EXTRA_LIBS += $$PWD/libssl.so
}
```
