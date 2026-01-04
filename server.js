const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8008;

// 中间件配置
app.use(express.json());

// 提供React前端静态文件
const frontendBuildDir = path.join(__dirname, 'frontend/dist');
const publicDir = path.join(__dirname, 'public');

// 确保public目录存在
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

if (fs.existsSync(frontendBuildDir)) {
    app.use(express.static(frontendBuildDir));
    console.log('已配置React前端静态文件服务');
} else {
    console.log('未找到React前端构建文件，使用默认页面');
    
    // 创建简单的首页HTML
    const indexHtml = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>尹博一的个人网站</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            
            .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 3rem;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                width: 90%;
            }
            
            h1 {
                font-size: 3rem;
                margin-bottom: 1rem;
                font-weight: 300;
            }
            
            .status {
                background: rgba(255, 255, 255, 0.2);
                padding: 1rem;
                border-radius: 10px;
                margin: 2rem 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>尹博一的个人网站</h1>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">网站正在维护中，即将恢复访问</p>
            <p style="margin-top: 2rem; opacity: 0.8;">
                最后更新: ${new Date().toLocaleString('zh-CN')}
            </p>
        </div>
    </body>
    </html>`;
    
    // 写入首页文件
    fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
}

// API路由
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        server: {
            environment: process.env.NODE_ENV || 'development',
            port: PORT,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version
        },
        services: {
            fileSystem: true,
            dataFiles: {
                blogs: fs.existsSync(path.join(__dirname, 'data/blogs.json')),
                questions: fs.existsSync(path.join(__dirname, 'data/questions.json')),
                profile: fs.existsSync(path.join(__dirname, 'data/profile.json'))
            }
        },
        deployment: {
            type: 'lighthouse',
            serverIp: '43.138.3.207',
            cosConfigured: !!process.env.COS_SECRET_ID
        }
    });
});

// 博客API
app.get('/api/blogs', (req, res) => {
    const blogsPath = path.join(__dirname, 'data/blogs.json');
    if (fs.existsSync(blogsPath)) {
        const blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf8'));
        res.json(blogs);
    } else {
        res.json([]);
    }
});

// 问答API
app.get('/api/questions', (req, res) => {
    const questionsPath = path.join(__dirname, 'data/questions.json');
    if (fs.existsSync(questionsPath)) {
        const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
        res.json(questions);
    } else {
        res.json([]);
    }
});

// 根路径路由（支持 SPA）
app.get('*', (req, res) => {
    const frontendIndex = path.join(frontendBuildDir, 'index.html');
    if (fs.existsSync(frontendIndex)) {
        res.sendFile(frontendIndex);
    } else {
        res.sendFile(path.join(publicDir, 'index.html'));
    }
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`访问地址: http://43.138.3.207:8002`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
});