# 图标生成说明

## 图标设计说明

图标设计理念：
- **主题**：体现"弈鸣小筑-写作工具"的创作主题
- **元素**：包含纸张、笔和文字线条，象征写作和创作
- **配色**：蓝色渐变背景，白色纸张，简洁现代

## 生成 ICO 文件的方法

### 方法 1：使用在线工具（推荐）

1. 访问以下任一在线转换工具：
   - https://convertio.co/zh/svg-ico/
   - https://www.aconvert.com/cn/image/svg-to-ico/
   - https://cloudconvert.com/svg-to-ico

2. 上传 `icon.svg` 文件
3. 选择生成多个尺寸（16x16, 32x32, 48x48, 256x256）
4. 下载生成的 `icon.ico` 文件到 `build/` 目录

### 方法 2：使用 ImageMagick（命令行）

```bash
# 安装 ImageMagick（如果未安装）
# Windows: 下载并安装 https://imagemagick.org/script/download.php

# 转换 SVG 为 ICO（包含多个尺寸）
magick convert icon.svg -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### 方法 3：使用 Inkscape + IcoFX

1. 使用 Inkscape 打开 `icon.svg`
2. 导出为 PNG（256x256, 128x128, 64x64, 48x48, 32x32, 16x16）
3. 使用 IcoFX（https://icofx.ro/）将多个 PNG 合并为 ICO 文件

### 方法 4：使用 Node.js 工具

```bash
# 安装 sharp 和 to-ico
npm install --save-dev sharp to-ico

# 创建转换脚本 convert-icon.js
node convert-icon.js
```

## 图标文件位置

生成的 `icon.ico` 文件应放置在：
```
build/icon.ico
```

## 更新 package.json

图标生成后，`package.json` 中的配置会自动使用该图标。
