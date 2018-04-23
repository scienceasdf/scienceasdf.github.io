---
title: Qt for Android实现与webview的交互
categories:
- Programming
tags:
- C++
- Qt
- 安卓开发
- 网络
- javascript
updated: 2018-4-23 
---

**在Qt的程序里搭建一个localhost，实现前端webview+html+js和后端C++的交互，该解决方案能够跨平台。**
  

  
---
Qt要在移动端写浏览器只能用一些比较牵强的方案（如果不自己造轮子的话），就是QtWebView.然而QtWebView提供的接口太少，不方便C++与html交互，如果是写web应用就比较劣势，毕竟cordova，react native等的方案非常流行，如果无法前后端交互，纯一个静态页面实在不好玩，还不如把网页挂在互联网上用浏览器直接访问网页。在安卓上有一种可行的方案：C++通过jni与java交互，再与js对象交互。这个也有弊端，一个是不是跨平台的方案，第二个是我不会java，只会c++和js.在网上查到的另一种解决方法是搭建一个local server，通过http请求进行交互。  

在GitHub上找到了一些用Qt搭建http server的代码（当然用boost也可以），例如[QtWEbApp](http://stefanfrings.de/qtwebapp/index-en.html)，[QtWebApp](https://github.com/fffaraz/QtWebApp)。我最终用的是[https://github.com/nikhilm/qhttpserver]，star数目很多，比较可惜的是有一阵没有更新了，但是还是很好的一个东西。  

这个程序按照GitHub直接下载下来的项目把代码编译，例子可以直接运行在安卓机上。例如运行例子Helloworld，那么在手机浏览器上打开http://localhost:8080，可以看到helloworld字样。按照release模式编译得到libqhttpserver.so，然后按照文档在自己的项目里面添加头文件包含和需要链接的库就可以了。  

在Qt构建移动web应用有两种方案：网页资源放在qrc文件里面，运行时把qrc里面的内容全部复制到存储中，或者直接放在assets目录下（安卓的url格式为：file:///android_asset/site/groundTrackPlot.html，不能直接用assets目录访问，这个需要注意）。由于QtWebView只是一个原生浏览器的wrapper，因此不能直接访问qrc里面的文件。现在一种可行的解决方案是后端直接用QFile读取qrc文件，作为http请求的响应返回给前端：
```c++
class HelloWorld : public QObject
{
    Q_OBJECT

public:
    HelloWorld();

private slots:
    void handleRequest(QHttpRequest *req, QHttpResponse *resp);
};

HelloWorld::HelloWorld()
{
    QHttpServer *server = new QHttpServer(this);
    connect(server, SIGNAL(newRequest(QHttpRequest*, QHttpResponse*)),
            this, SLOT(handleRequest(QHttpRequest*, QHttpResponse*)));

    server->listen(QHostAddress::Any, 8080);
}

void HelloWorld::handleRequest(QHttpRequest *req, QHttpResponse *resp)
{
    Q_UNUSED(req);

    QByteArray body = req->path().toLocal8Bit();
    qDebug() << req->path();
    QFile file(":" + req->path());
    if (!file.open(QIODevice::ReadOnly)) {
        //return;
    }
    QByteArray data = QByteArray(file.readAll());
    qDebug() << data;
    resp->setHeader("Content-Length", QString::number(data.size()));
    resp->writeHead(200);
    resp->end(data);
    file.close();
}
```
在main主函数里直接调用在QApplication对象创建后就创建HelloWorld(这个http server)，就可以实现想要的效果了。速度非常快，返回的数据量如果特别大那一定是渲染会花更多的时间而不是http请求的过程耗时间。用qrc的一个好处是编译成obj文件后占空间更小，而且不会被用户直接得到，但是编译会很花时间。     

另外有时我们会需要Qt的http request是同步的，比如我们的localhost需要先访问一个外部的资源，再用得到的结果响应请求，那么代码如下
```c++
class HelloWorld : public QObject
{
    Q_OBJECT

public:
    HelloWorld();
    QByteArray get(const QString&);
    QNetworkAccessManager m_qnam;
private slots:
    void handleRequest(QHttpRequest *req, QHttpResponse *resp);
};

HelloWorld::HelloWorld() : m_qnam()
{
    QHttpServer *server = new QHttpServer(this);
    connect(server, SIGNAL(newRequest(QHttpRequest*, QHttpResponse*)),
            this, SLOT(handleRequest(QHttpRequest*, QHttpResponse*)));

    server->listen(QHostAddress::Any, 8080);
}

QByteArray HelloWorld::get(const QString &strUrl)
{
    assert(!strUrl.isEmpty());

    const QUrl url = QUrl::fromUserInput(strUrl);
    assert(url.isValid());

    QNetworkRequest qnr(url);
    qnr.setRawHeader("Origin","a");
    QNetworkReply* reply = m_qnam.get(qnr); //m_qnam是QNetworkAccessManager对象

    QEventLoop eventLoop;
    connect(reply, &QNetworkReply::finished, &eventLoop, &QEventLoop::quit);
    eventLoop.exec(QEventLoop::ExcludeUserInputEvents);

    QByteArray replyData = reply->readAll();
    reply->deleteLater();
    reply = nullptr;

    return replyData;
}

void HelloWorld::handleRequest(QHttpRequest *req, QHttpResponse *resp)
{
    QByteArray body = req->path().toLocal8Bit();
    qDebug() << req->path();

    QByteArray data = get("some domain" + req->path());
    qDebug() << data;
    resp->setHeader("Content-Length", QString::number(data.size()));
    resp->writeHead(200);
    resp->end(data);
}
```
这样我们就能够综合js,qml,c++的好处，得到一个十分优化的web应用程序。一个神奇的现象是安卓的后台机制，如果我在这个程序里面开了host，自己访问会很快，但是别的浏览器访问就会很慢，如果我们此时切回server的那个程序，再切出到外部浏览器，那么会发现资源又加载好了，这个的原因应该是Android的后台程序只会得到很少的性能的分配。  