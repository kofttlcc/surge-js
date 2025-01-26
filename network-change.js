// Surge Script: 自动根据 ISP 切换策略组

// 配置 ISP 对应的策略组
const PROXY_GROUPS = {
  "中国电信": "US-Group",
  "中国移动": "SG-Group",
  "中国联通": "KR-Group",
};

// 默认策略组（当无法匹配 ISP 时使用）
const DEFAULT_GROUP = "SG-Group";

// 核心函数：检测 ISP 并切换策略组
function detectAndSwitchProxy() {
  console.log("[AutoSwitch] 开始检测 ISP 并切换策略组");

  const TIMEOUT = 5000; // 请求超时设置（毫秒）
  let isDone = false; // 请求完成状态

  // 超时处理
  setTimeout(() => {
    if (!isDone) {
      console.error("[AutoSwitch] 请求超时");
      $notification.post("自动切换失败", "请求超时", "请检查网络连接或接口是否可用");
      $done();
    }
  }, TIMEOUT);

  // 请求 ISP 信息
  $httpClient.get("https://ip.im", (error, response, data) => {
    isDone = true;

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

    console.log(`[AutoSwitch] 接口返回数据: ${data}`);

    // 解析 ISP 信息
    const ispMatch = data.match(/<td>\s*Isp\s*<\/td>\s*<td><code>(.*?)<\/code><\/td>/);
    const isp = ispMatch ? ispMatch[1] : null;

    if (!isp) {
      console.error("[AutoSwitch] 未能解析 ISP 信息");
      $notification.post("自动切换失败", "未能解析 ISP 信息", "请检查返回内容格式是否正确");
      $done();
      return;
    }

    console.log(`[AutoSwitch] 检测到 ISP: ${isp}`);

    // 根据 ISP 决定目标策略组
    const targetGroup = PROXY_GROUPS[isp] || DEFAULT_GROUP;
    console.log(`[AutoSwitch] 准备切换到策略组: ${targetGroup}`);

    // 切换策略组
    const success = $surge.setSelectGroupPolicy("AutoSwitch", targetGroup);

    if (success) {
      $notification.post("策略组切换成功", `当前 ISP: ${isp}`, `切换到策略组: ${targetGroup}`);
      console.log(`[AutoSwitch] 成功切换到策略组: ${targetGroup}`);
    } else {
      $notification.post("策略组切换失败", "Surge API 调用失败", `尝试切换到: ${targetGroup}`);
      console.error("[AutoSwitch] 策略组切换失败");
    }

    $done();
  });
}

// 调用核心函数
detectAndSwitchProxy();
