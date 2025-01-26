const IP_LOOKUP_URL = "http://ip.im"; // 注意这里使用的是HTTP
const PROXY_GROUPS = {
  "中国电信": "US-Group",
  "中国移动": "SG-Group",
  "中国联通": "KR-Group",
  "默认": "US-Group"
};

// 定义主函数
(async function detectAndSwitchProxy() {
  console.log("[Surge] Listening for network changes...");

  try {
    // 请求 ISP 信息，添加超时时间以避免网络请求过长
    const options = { 
      url: IP_LOOKUP_URL,
      timeout: 5000 // 5秒超时
    };
    const response = await $httpClient.get(options);
    
    if (!response.status || response.status !== 200) {
      throw new Error(`Failed to fetch ISP info: HTTP ${response.status}`);
    }

    // 解析 ISP 信息
    const ispMatch = response.body.match(/<td> Isp <\/td>\s*<td><code>(.*?)<\/code><\/td>/);
    const isp = ispMatch ? ispMatch[1] : "未知";

    console.log(`[Surge] Detected ISP: ${isp}`);

    // 根据 ISP 切换代理组
    const targetGroup = PROXY_GROUPS[isp] || PROXY_GROUPS["默认"];
    $surge.setSelectGroup(targetGroup);
    console.log(`[Surge] Switched to proxy group: ${targetGroup}`);

    // 返回结果
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
})();

// 网络变化事件监听，加上防抖动处理
let debounceTimer;
$network.on("NETWORK_CHANGED", function() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(detectAndSwitchProxy, 500); // 500毫秒防抖动
});