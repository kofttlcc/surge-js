// Surge Script: 自动根据 ISP 切换策略组
// 监听网络变化并自动切换策略组

const PROXY_GROUPS = {
  "中国电信": "US-Group",
  "中国移动": "SG-Group",
  "中国联通": "KR-Group",
  "默认": "SG-Group"
};
const DEFAULT_GROUP = "DefaultGroup";

// 核心函数：检测 ISP 并切换策略组
async function detectAndSwitchProxy() {
  console.log("[AutoSwitch] 网络变化检测中...");
  
  try {
    // 1. 请求 ISP 信息
    const response = await $httpClient.get("https://ip.im");
    if (response.status !== 200 || !response.body) {
      throw new Error("无法获取 ISP 信息");
    }

    // 2. 解析响应，提取 ISP
    const ispMatch = response.body.match(/<td>\s*Isp\s*<\/td>\s*<td><code>(.*?)<\/code><\/td>/);
    const isp = ispMatch ? ispMatch[1] : null;

    if (!isp) {
      throw new Error("未能解析 ISP 信息");
    }

    console.log(`[AutoSwitch] 检测到 ISP: ${isp}`);

    // 3. 根据 ISP 切换策略组
    const targetGroup = PROXY_GROUPS[isp] || DEFAULT_GROUP;
    console.log(`[AutoSwitch] 切换到策略组: ${targetGroup}`);
    $surge.setSelectGroupPolicy("YourPolicyGroupName", targetGroup);

  } catch (error) {
    console.error(`[AutoSwitch] 错误: ${error.message}`);
    $notification.post("自动切换失败", "无法检测到 ISP 或策略组切换失败", error.message);
  }
}

// 绑定网络变化事件
$network.on("NETWORK_CHANGED", detectAndSwitchProxy);

// 初始化脚本：确保启动时执行一次
(async () => {
  await detectAndSwitchProxy();
})();
