/**
 * 图标转换脚本
 * 将 SVG 转换为 ICO 文件（需要安装依赖）
 * 
 * 使用方法：
 * npm install --save-dev sharp to-ico
 * node build/convert-icon.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

async function convertSvgToIco() {
  const svgPath = path.join(__dirname, 'icon.svg');
  const icoPath = path.join(__dirname, 'icon.ico');
  
  // 需要生成的尺寸
  const sizes = [16, 32, 48, 64, 128, 256];
  
  console.log('开始转换图标...');
  
  try {
    // 读取 SVG 文件
    const svgBuffer = fs.readFileSync(svgPath);
    
    // 生成各个尺寸的 PNG
    const pngBuffers = await Promise.all(
      sizes.map(async (size) => {
        console.log(`生成 ${size}x${size} PNG...`);
        return await sharp(svgBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();
      })
    );
    
    // 转换为 ICO
    console.log('合并为 ICO 文件...');
    const icoBuffer = await toIco(pngBuffers);
    
    // 保存 ICO 文件
    fs.writeFileSync(icoPath, icoBuffer);
    
    console.log(`✅ 图标转换完成！文件已保存到: ${icoPath}`);
  } catch (error) {
    console.error('❌ 转换失败:', error.message);
    console.error('\n请确保已安装依赖:');
    console.error('npm install --save-dev sharp to-ico');
    process.exit(1);
  }
}

convertSvgToIco();
