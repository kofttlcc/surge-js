const url = "http://ip.im/info"; // 查询 ISP 信息的接口
const timeout = 5000; // 超时时间

(async () => {
  try {
    console.log("[Surge] Initiating request to fetch ISP info...");
    // 发起 HTTP 请求
    $httpClient.get({ url, timeout }, (error, response, data) => {
      if (error) {
        console.log(`[Surge] Request error: ${error}`);
        $done();
        return;
      }

      if (response && response.status === 200) {
        console.log(`[Surge] Raw response:\n${data}`);

        // 使用正则提取 HTML 中的 ISP 信息
        const ispMatch = data.match(/<td>\s*Isp\s*<\/td>\s*<td><code>([^<]+)<\/code><\/td>/i);
        const isp = ispMatch ? ispMatch[1].trim() : "unknown"; // 获取 ISP 值并去除空格
        console.log(`[Surge] Extracted ISP: ${isp}`);

        // 根据 ISP 动态切换策略组
          if (isp.includes("中国移动")) {
            $surge.setSelectGroupPolicy("DynamicGroup", "SG优选");
            console.log("[Surge] Switched to ProxyGroup1 (中国移动 detected)");
          } else if (isp.includes("中国联通")) {
            $surge.setSelectGroupPolicy("DynamicGroup", "KR优选");
            console.log("[Surge] Switched to ProxyGroup2 (中国联通 detected)");
          } else if (isp.includes("中国电信")) {
            $surge.setSelectGroupPolicy("DynamicGroup", "US-A1");
            console.log("[Surge] Switched to ProxyGroup3 (中国电信 detected)");
        } else {
          console.log(`[Surge] Unknown ISP: ${isp}, no change applied`);
        }
      } else {
        console.log(`[Surge] Invalid response: ${response ? response.status : "no response"}`);
      }

      $done();
    });
  } catch (e) {
    console.log(`[Surge] Unexpected error: ${e.message}`);
    $done();
  }
})();
