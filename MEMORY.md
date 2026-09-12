# 长期记忆

## 用户：时鸿飞
- 车载测试工程师（5年，ADAS方向），2026-09 求职中，目标上海
- 履历：蔚来EC6座舱测试 → 小鹏P7 ADAS路测 → 奔腾E541/奇瑞M32T主动安全
- 已为他开发「ADAS面试通」安卓App（/workspace/ADASInterview/，APK已传其飞书）

## SSH 和私仓配置
- 私仓地址：sasigai1/zhaoli.git
- SSH 密钥：ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC+TlAPce02O7AVFJkFFdNcSoqDD+uPDvqeSOGRlRQo0 openclaw@local

## 构建环境备忘
- Android SDK 在 /opt/android-sdk（cmdline-tools/latest, platform-35, build-tools 35.0.0）
- 构建安卓项目必须用：真实 gradle（~/.local/share/mise/installs/gradle/8.14.5/gradle-8.14.5/bin/gradle）+ JAVA_HOME 指 JDK17；mise shim 会强制 JDK25 导致 AGP 报错
