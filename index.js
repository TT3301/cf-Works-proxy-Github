addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// 准备反代的目的域名
let target_url = "https://github.com";
// 要替换内容的正则表达式
let target_url_reg = /github\.com/g;

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

    // 如果是文本类型，替换响应主体中的URL
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
    // 如果不是文本类型，直接返回响应对象
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
