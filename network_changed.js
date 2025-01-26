const url = "http://ip.im/info"; // 获取 ISP 信息的接口
const timeout = 5000; // 超时时间

(async () => {
  try {
    // 发起 HTTP 请求获取 ISP 信息
    const response = await $httpClient.get({ url, timeout });
    if (response.status === 200) {
      const isp = JSON.parse(response.body).isp || "unknown"; // 提取 ISP 信息
      $persistentStore.write(isp, "current_isp"); // 保存当前 ISP 到本地存储

      // 根据 ISP 动态切换策略组
      if (isp.toLowerCase() === "t-mobile") {
        $surge.setSelectGroupPolicy("DynamicGroup", "ProxyGroup1"); // 切换到策略组1
        console.log("[Surge] Switched to ProxyGroup1 (T-Mobile detected)");
      } else if (isp.toLowerCase() === "att") {
        $surge.setSelectGroupPolicy("DynamicGroup", "ProxyGroup2"); // 切换到策略组2
        console.log("[Surge] Switched to ProxyGroup2 (AT&T detected)");
      } else {
        console.log(`[Surge] Unknown ISP: ${isp}, no change applied`);
      }
    } else {
      console.log(`[Surge] Failed to fetch ISP info, HTTP status: ${response.status}`);
    }
  } catch (error) {
    console.log(`[Surge] Error fetching ISP info: ${error.message}`);
  }
  $done();
})();
