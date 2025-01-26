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
        try {
          // 处理非标准 JSON 数据，转换为合法 JSON 格式
          const sanitizedData = data
            .replace(/(\w+):/g, '"$1":') // 给 key 添加双引号
            .replace(/:([a-zA-Z0-9]+)/g, ':"$1"'); // 给 value 添加双引号

          console.log(`[Surge] Sanitized response: ${sanitizedData}`);

          // 解析为 JSON 对象
          const ispInfo = JSON.parse(sanitizedData);
          const isp = ispInfo.isp || "unknown"; // 获取 ISP 信息
          console.log(`[Surge] Fetched ISP: ${isp}`);

          // 根据 ISP 动态切换策略组
          if (isp.toLowerCase() === "中国电信") {
            $surge.setSelectGroupPolicy("DynamicGroup", "US-A1");
            console.log("[Surge] Switched to ProxyGroup1 (中国电信 detected)");
          } else if (isp.toLowerCase() === "中国移动") {
            $surge.setSelectGroupPolicy("DynamicGroup", "SG优选");
            console.log("[Surge] Switched to ProxyGroup2 (中国移动 detected)");
          } else {
            console.log(`[Surge] Unknown ISP: ${isp}, no change applied`);
          }
        } catch (jsonError) {
          console.log(`[Surge] Failed to parse response as JSON: ${jsonError}`);
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
