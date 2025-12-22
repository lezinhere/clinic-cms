const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'client');
const publicDir = path.join(__dirname, '..', 'public');

console.log('🚀 Starting Client Integration...');

try {
    // 1. Install Client Dependencies
    console.log('📦 Installing client dependencies...');
    execSync('npm install --include=dev', { cwd: clientDir, stdio: 'inherit' });

    // 2. Build Client
    console.log('🛠️  Building Vite Client (Clean Build)...');
    const distDir = path.join(clientDir, 'dist');
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

    // 3. Move files to Public
    console.log('📂 Moving build artifacts to public folder...');
    // const distDir = path.join(clientDir, 'dist'); // Already defined above

    if (!fs.existsSync(distDir)) {
        throw new Error('Client build failed! dist folder not found.');
    }

    // Recursive copy function
    function copyRecursiveSync(src, dest) {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        const isDirectory = exists && stats.isDirectory();

        if (isDirectory) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest);
            }
            fs.readdirSync(src).forEach((childItemName) => {
                copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    }

    copyRecursiveSync(distDir, publicDir);
    console.log('✅ Client successfully integrated into Public folder!');

} catch (error) {
    console.error('❌ Integration Failed:', error);
    process.exit(1);
}
