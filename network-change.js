// Surge Script: Detect ISP and Switch Proxy Group Dynamically
const IP_LOOKUP_URL = "https://ip.im"; // ISP 查询地址
const PROXY_GROUPS = {
  "中国电信": "US-Group",
  "中国移动": "SG-Group",
  "中国联通": "KR-Group",
  "默认": "SG-Group"
};

// 定义主函数
(async function detectAndSwitchProxy() {
  console.log("[Surge] Listening for network changes...");

  try {
    // 请求 ISP 信息
    const response = await $httpClient.get(IP_LOOKUP_URL);
    if (!response.status || response.status !== 200) {
      throw new Error(`Failed to fetch ISP info: HTTP ${response.status}`);
    }

    // 解析 ISP 信息
    const ispMatch = response.data.match(/<td> Isp <\/td>\s*<td><code>(.*?)<\/code><\/td>/);
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

// 网络变化事件监听
$network.on("NETWORK_CHANGED", detectAndSwitchProxy);
