# 1、引言

HostLoc是个全球vps主机交流论坛,论坛因为常有人们分享些国外vps主机使用经验、些网站安全方面知识及介绍些网站经历经验而火爆时。

但是天有不测风云,HostLoc遭到了GFW的重点关注,国内已经无法正常访问。

所以就有了今天这个简单易于上手的反代教程,教你一分钟完美反代HostLoc,从此以后上HostLoc不求人,做一个合格的MJJ。

相信大家最近都申请下来了eu.org的免费域名,正好可以有用武之地了。

来源:[https://hostloc.com/thread-1172664-1-1.html](https://hostloc.com/thread-1172664-1-1.html)

> 提醒:使用来源不明的非官方反代有被窃取数据的风险,cfworker使用门槛很低,推荐自己搭建!

# 2、环境准备

1、注册 Cloudflare 账户一个,官网地址:[https://www.cloudflare.com/zh-cn/](https://www.cloudflare.com/zh-cn/)

2、域名一个,接入到 Cloudflare

3、一双手,一个脑子

# 3、开始

点击Workers 和 Page

![image-20230524193140639](https://cdn.jsdelivr.net/gh/ZengHuuu/images/img/202305241931856.webp)

点击创建应用程序

![image-20230524193243407](https://cdn.jsdelivr.net/gh/ZengHuuu/images/img/202305241932630.webp)

点击创建Worker

![image-20230524193318212](https://cdn.jsdelivr.net/gh/ZengHuuu/images/img/202305241933427.webp)

部署Worker

![image-20230524193458940](https://cdn.jsdelivr.net/gh/ZengHuuu/images/img/202305241934164.webp)

编辑代码

![image-20230524193534421](https://cdn.jsdelivr.net/gh/ZengHuuu/images/img/202305241935647.webp)

把如下代码粘贴进对话框

```js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));  
});

// 准备反代的目的域名  
let target_url = "https://hostloc.com";
// 要替换内容的正则表达式
let target_url_reg = /hostloc\.com/g;

async function handleRequest(request) {
  let url = new URL(request.url);
  url.hostname = new URL(target_url).hostname;   

  // 复制请求对象并更新它的属性
  let headers = new Headers(request.headers);
  headers.set("Referer", target_url);
  headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36");

  const param = {    
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: "manual"  
  }  

  let response = await fetch(url, param);   

  // 检查响应头中的内容类型  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text')) {

    // 如果是文本类型,替换响应主体中的URL
    let responseBody = await response.text(); 
    responseBody = await handleResBody(request,responseBody);     

    // 复制响应对象并更新它的属性
    let headers = await handleResHeader(response);    

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,  
      headers: headers
    });
  } else {   
    // 如果不是文本类型,直接返回响应对象
    return response;
  }  
}


async function handleResBody(request, responseBody){
  responseBody = responseBody.replace(target_url_reg, new URL(request.url).hostname);
  responseBody = responseBody.replace("<head>", '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');
  responseBody = responseBody.replace("</head>", '<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/gh/lifespy/css-and-js-hub/css/responsive.css">\n</head>');
  responseBody = responseBody.replace("</body>", '<script src="//cdn.jsdelivr.net/gh/lifespy/css-and-js-hub/js/polish.js" type="text/javascript"></script>\n</body>'); 
  return responseBody;
}

async function handleResHeader(resp){
  let headers = new Headers(resp.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET');  
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return headers; 
}
