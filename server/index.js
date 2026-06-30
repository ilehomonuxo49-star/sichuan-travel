const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// ============ 中间件 ============
app.use(cors());                        // 允许跨域
app.use(express.json());                // 解析 JSON 请求体

// 静态文件服务 — 前端直接通过 http://localhost:3000 访问
app.use(express.static(path.join(__dirname, "..")));

// ============ SSE 聊天接口 ============
app.post("/api/chat", (req, res) => {
    const { query, user_id } = req.body;

    console.log(`[${new Date().toLocaleTimeString()}] ${user_id}: ${query}`);

    // 设置 SSE 响应头
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");  // 禁用 nginx 缓冲

    // TODO: 在这里接入真正的 AI 大模型 API
    // 目前是模拟回复，用于测试前后端联通
    const mockReply = `您好 ${user_id}！收到您的问题："${query}"。\n\n这是来自后端的模拟回复，证明前后端已成功联通。\n\n请将此处替换为真正的 AI 接口调用。`;

    // 模拟流式逐字输出（每 50ms 发一个字）
    let index = 0;
    const timer = setInterval(() => {
        if (index < mockReply.length) {
            const char = mockReply[index];
            res.write(`data: ${char}\n\n`);
            index++;
        } else {
            res.write("data: [DONE]\n\n");
            res.end();
            clearInterval(timer);
        }
    }, 50);

    // 客户端断开时清理
    req.on("close", () => {
        clearInterval(timer);
    });
});

// ============ 启动服务 ============
app.listen(PORT, () => {
    console.log(`✅ 后端服务已启动: http://localhost:${PORT}`);
    console.log(`📡 聊天接口: POST http://localhost:${PORT}/api/chat`);
});
