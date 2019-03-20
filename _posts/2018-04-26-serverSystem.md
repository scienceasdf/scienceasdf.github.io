---
title: 实现一个简单的在线请假系统
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

**实现了一个B/S架构的在线请假申请系统。路子十分野，所以只是用于这种极为特殊的个人项目里面。**
  

  
---
自从上次发现了qhttpserver之后，便增加了很多可以玩的东西。以前有个同学找我希望我做一个在线的请假申请系统，当时我还比较弱，只会C++/Qt和sqlite开发，想的架构是C/S架构的，我想了想，这个不能跨平台，不便于产品更新，而且即使这样我也做不出来。现在写过网页，写过http server的程序，这个东西我想了想，还是能够实现的。  

## 基本需求
用户访问页面，填写相关信息，并且需要附上说明请假情况的图片，通过post请求发送到服务器。  

## 用户选择图片并在预览
首先需要一个文件输入框`<input type="file" id="take-picture" accept="image/*">`，用户点击按钮可以通过调用摄像头或者选择存储空间中的图片。选择了图片之后还需要预览，预览的相关代码如下：
```javascript
(function () {
    var takePicture = document.querySelector("#take-picture"),
        showPicture = document.querySelector("#show-picture");

    if (takePicture && showPicture) {
        // Set events
        takePicture.onchange = function (event) {
            // Get a reference to the taken picture or chosen file
            var files = event.target.files,
                file;
            if (files && files.length > 0) {
                file = files[0];
                try {
                    // Get window.URL object
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        showPicture.src = event.target.result;
                    };
                    fileReader.readAsDataURL(file);
                    imageFlag = true;
                }
                catch (e) {
                    try {
                        // Fallback if createObjectURL is not supported
                        var fileReader = new FileReader();
                        fileReader.onload = function (event) {
                            showPicture.src = event.target.result;
                        };
                        fileReader.readAsDataURL(file);
                    }
                    catch (e) {
                        //
                        window.alert("ca)");
                        var error = document.querySelector("#error");
                        if (error) {
                            error.innerHTML = "Neither createObjectURL or FileReader are supported";
                        }
                    }
                }
            }
        };
    }
})();
```
我经过实际的测试，发现本来预览图片应该有两种方法的，但是实际上在手机上获取window.URL既不抛出异常，也不能加载图片，因此就直接用`readAsDataURL`的方法。  

## 关于信息的上传
这里我用的是野得不能再野得路子了。通常的解决方案是生成multipart/form-data数据，但是这个方法我不用的原因是服务器端我没有使用任何PHP（目前还没有学习PHP的必要），C++来parse这个东西又需要另外写代码，比较麻烦，因此直接将单独的图片数据post到服务器。图片的post也是个大麻烦，理论上xhr可以直接send类型为file的对象的，但是实际上却在我的手机上不支持。因此，还是需要用下面的办法，就是`readAsArrayBuffer`，然后调用回调函数发送请求。
```javascript
var fileReader2 = new FileReader();
fileReader2.readAsArrayBuffer(document.getElementById("take-picture").files[0]);
fileReader2.onloadend = function (event) {
    var xhr2 = new XMLHttpRequest();
    xhr2.onreadystatechange = function () {
        if (xhr2.readyState == XMLHttpRequest.DONE) {
            swal(xhr2.response);
        }
    }
    xhr2.open("POST",  encodeURI(queryStr));
    xhr2.send(event.target.result);
}
```
接下来的问题就是其他信息的上传。本来想用header来发送的，不过却发现手机上连header都发不了（我感觉这里很有可能是我自己代码的问题，手机浏览器怎么可能不能发送请求头