# The Safex Mine — Windows 安装与首次使用

> **社区翻译。** 本页是由 AI 辅助完成的项目社区翻译，内容涵盖必要的安装与安全说明。[英文安装指南](../../WINDOWS_INSTALLATION.md)仍是项目的规范参考。欢迎提交语言和术语修正。

## 1. 仅从官方发布页下载

The Safex Mine 是一款**未签名**的 Windows x64 应用，其中包含 CPU 挖矿后端、需要提升权限的辅助程序以及 WinRing 驱动。请只从项目官方 GitHub Release 下载安装程序。

## 2. **运行之前**验证 SHA-256

在 PowerShell 中运行：

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

请将结果与 GitHub Release 中公布的 SHA-256 仔细核对。

**如果 Microsoft Defender 在下载后立即隔离安装程序：**先恢复/允许**这一份具体的已下载安装程序**，然后计算其 SHA-256；只有在哈希与官方值一致时才执行它。

## 3. SmartScreen 与防病毒软件

由于软件未签名且包含挖矿组件，SmartScreen 或其他安全产品可能发出警告或隔离文件。只有在确认来源并验证哈希后才继续。

不要整体关闭防病毒保护。不要把 Downloads、整个用户配置文件或整块磁盘加入排除项。若在验证发布文件后确实需要排除项，请仅限于：

    %LOCALAPPDATA%\The Safex Mine

## 4. 安装、语言与风险确认

NSIS 安装程序通常会根据 Windows 显示语言自动选择简体中文。应用启动后仍可单独更改应用语言。

首次启动时会以所选的受支持应用语言显示 **挖矿风险确认 — v1.0**。继续之前请阅读。选择 **退出** 会关闭应用且不会记录接受状态。英文仍是规范参考：[挖矿风险确认 v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md)。

## 5. UAC 辅助程序与 MSR

图形界面以普通用户身份运行。在一次应用会话中首次点击 **开始挖矿** 时，Windows 会要求为以下程序进行 UAC 确认：

    safex-mine-helper.exe

只有该辅助程序会提升权限。它负责启动并监管 XMRig，并允许尝试 MSR 优化。如果 Windows 安全功能阻止 MSR 写入，挖矿仍可继续，但性能可能降低。不要仅为了提高哈希率而关闭安全功能。

## 6. 卸载

卸载会移除应用。你手动添加的 Defender 排除项可能仍会保留；若不再需要，请在卸载后手动删除。

更多帮助：[英文故障排除](../../../TROUBLESHOOTING.md)。
