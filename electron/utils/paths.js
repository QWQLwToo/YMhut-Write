const path = require('path');
const { app } = require('electron');
const fs = require('fs-extra');

const isDev = !app.isPackaged;

let appRoot;

if (isDev) {
    // [核心修改] 开发模式下，使用项目根目录下的 debug_env 文件夹
    // process.cwd() 在 npm start 时通常是项目根目录
    appRoot = path.join(process.cwd(), 'debug_env');
    
    // 自动创建调试环境目录，防止报错
    fs.ensureDirSync(appRoot);
    fs.ensureDirSync(path.join(appRoot, 'bin')); // 模拟 bin 结构
    console.log('🚧 [DEV MODE] Running in debug sandbox:', appRoot);
} else {
    // 生产模式：Root-Bin 架构
    // exe 位于 /InstallDir/bin/app.exe，所以 root 是 ../
    appRoot = path.join(path.dirname(process.execPath), '..');
}

const paths = {
    root: appRoot,
    // 在开发模式下，我们模拟 bin 目录结构，虽然实际 electron 不在那运行，但逻辑保持一致
    bin: path.join(appRoot, 'bin'),
    data: path.join(appRoot, 'data'),
    docs: path.join(appRoot, 'docs'),
    tmp: path.join(appRoot, 'tmp'), // 临时文件目录
    config: path.join(appRoot, 'config.ini')
};

module.exports = paths;