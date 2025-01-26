const IP_LOOKUP_URL = "http://ip.im";
const PROXY_GROUPS = {
  "中国电信": "ProxyGroup1",
  "中国移动": "ProxyGroup2",
  "中国联通": "ProxyGroup3",
  "默认": "DefaultProxyGroup"
};

// 定义主函数
(async function detectAndSwitchProxy() {
  console.log("[Surge] Listening for network changes...");

  try {
    const options = { 
      url: IP_LOOKUP_URL,
      timeout: 5000 
    };
    const response = await $httpClient.get(options);
    
    if (!response.status || response.status !== 200) {
      throw new Error(`Failed to fetch ISP info: HTTP ${response.status}`);
    }

    const ispMatch = response.body.match(/<td> Isp <\/td>\s*<td><code>(.*?)<\/code><\/td>/);
    const isp = ispMatch ? ispMatch[1] : "未知";

    console.log(`[Surge] Detected ISP: ${isp}`);

    const targetGroup = PROXY_GROUPS[isp] || PROXY_GROUPS["默认"];
    $surge.setSelectGroup(targetGroup);
    console.log(`[Surge] Switched to proxy group: ${targetGroup}`);

    return {
      isp,
      targetGroup,
    };
  } catch (error) {
    console.error(`[Surge] Error: ${error.message}`);
    return {
      error: error.message,
    };
  }
})().then(result => {
  $done(result);
});

// 网络变化事件监听，加上防抖动处理
let debounceTimer;
$network.on("NETWORK_CHANGED", function() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    detectAndSwitchProxy().then(result => {
      $done(result);
    });
  }, 500); // 500毫秒防抖动
});
