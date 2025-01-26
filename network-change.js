// Surge Script: 自动根据 ISP 切换策略组
const PROXY_GROUPS = {
  "中国电信": "US-Group",
  "中国移动": "SG-Group",
  "中国联通": "KR-Group",
};
const DEFAULT_GROUP = "SG-Group";

// 核心函数：检测 ISP 并切换策略组
function detectAndSwitchProxy() {
  console.log("[AutoSwitch] 网络变化检测中...");

  // 1. 请求 ISP 信息
  $httpClient.get("https://ip.im", (error, response, data) => {
    if (error) {
      console.error(`[AutoSwitch] 请求错误: ${error}`);
      $notification.post("自动切换失败", "请求错误", error);
      $done();
      return;
    }

    if (response.status !== 200 || !data) {
      console.error(`[AutoSwitch] 请求失败: 状态码 ${response.status}`);
      $notification.post("自动切换失败", "请求失败", `状态码: ${response.status}`);
      $done();
      return;
    }

    // 2. 解析响应，提取 ISP
    const ispMatch = data.match(/<td>\s*Isp\s*<\/td>\s*<td><code>(.*?)<\/code><\/td>/);
    const isp = ispMatch ? ispMatch[1] : null;

    if (!isp) {
      console.error("[AutoSwitch] 未能解析 ISP 信息");
      $notification.post("自动切换失败", "未能解析 ISP 信息", "请检查返回内容格式");
      $done();
      return;
    }

    console.log(`[AutoSwitch] 检测到 ISP: ${isp}`);

    // 3. 根据 ISP 切换策略组
    const targetGroup = PROXY_GROUPS[isp] || DEFAULT_GROUP;
    console.log(`[AutoSwitch] 切换到策略组: ${targetGroup}`);
    const success = $surge.setSelectGroupPolicy("YourPolicyGroupName", targetGroup);

    if (success) {
      $notification.post("策略组切换成功", `当前 ISP: ${isp}`, `切换到策略组: ${targetGroup}`);
    } else {
      $notification.post("策略组切换失败", "Surge API 调用失败", `尝试切换到: ${targetGroup}`);
    }

    $done();
  });
}

// 调用核心函数
detectAndSwitchProxy();
