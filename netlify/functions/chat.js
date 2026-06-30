// Netlify Function: 代理扣子 Coze v3 Chat API
// 部署后前端可通过 /api/chat 调用，无需本地后端

// 优先用环境变量（Netlify 后台设置），兜底用硬编码值
const COZE_PAT = process.env.COZE_PAT || "pat_zAV00pJuQCGGwvfoA1pTq4HCvpEh0ptrqbojc5Yj3QzCDYmEg3dB7IFCkgEZKswd";
const COZE_BOT_ID = "7654942789465702452";

exports.handler = async (event) => {
    // 只处理 POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let query, user_id;
    try {
        const body = JSON.parse(event.body);
        query = body.query || '';
        user_id = body.user_id || 'anonymous';
    } catch {
        return { statusCode: 400, body: 'Invalid JSON' };
    }

    if (!query.trim()) {
        return { statusCode: 200, body: 'data: 请输入你的问题~\n\ndata: [DONE]\n\n' };
    }

    try {
        // 1. 创建非流式对话
        const chatRes = await fetch("https://api.coze.cn/v3/chat", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${COZE_PAT}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bot_id: COZE_BOT_ID,
                user_id: user_id,
                stream: false,
                additional_messages: [{ role: "user", content: query, content_type: "text" }]
            })
        });
        const chatData = await chatRes.json();

        if (chatData.code !== 0) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "text/event-stream" },
                body: `data: AI助手暂时不可用：${chatData.msg}\n\ndata: [DONE]\n\n`
            };
        }

        const chatId = chatData.data.id;
        const convId = chatData.data.conversation_id;

        // 2. 轮询等待完成（最多等 8 秒，适应 Netlify 10s 限制）
        let answer = "";
        for (let i = 0; i < 6; i++) {
            await new Promise(r => setTimeout(r, 1300));
            const pollRes = await fetch(
                `https://api.coze.cn/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${convId}`,
                { headers: { "Authorization": `Bearer ${COZE_PAT}` } }
            );
            const pollData = await pollRes.json();

            if (pollData.data && pollData.data.status === "completed") {
                // 从消息中提取文本内容
                const messages = pollData.data.messages || pollData.data;
                answer = extractAnswer(messages);
                break;
            }
            if (pollData.data && pollData.data.status === "failed") {
                answer = "AI处理失败，请稍后重试";
                break;
            }
        }

        // 3. 返回 SSE（没拿到答案时发 [TIMEOUT] 让前端切 Coze 直连）
        let sse = "";
        if (answer) {
            const cleaned = answer
                .replace(/([。！？；])(?!\n)/g, '$1\n')
                .replace(/\\n/g, '\n');
            const lines = cleaned.split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    sse += `data: ${line.trim()}\n\n`;
                }
            }
        } else {
            // 无答案 → 发超时信号，前端自动切 Coze 直连
            sse = "data: [TIMEOUT]\n\n";
        }
        sse += `data: [DONE]\n\n`;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*"
            },
            body: sse
        };

    } catch (err) {
        return {
            statusCode: 200,
            headers: { "Content-Type": "text/event-stream" },
            body: `data: AI助手连接失败，请稍后重试\n\ndata: [DONE]\n\n`
        };
    }
};

// 从 Coze 返回数据中提取回答文本
function extractAnswer(messages) {
    if (!messages) return "";
    // messages 可能是数组或对象
    const arr = Array.isArray(messages) ? messages : [messages];

    for (const msg of arr) {
        // 找 assistant 角色的 answer 类型消息
        if (msg.role === "assistant" && msg.type === "answer") {
            if (msg.content) return msg.content;
        }
        // 有些格式下 content 直接在顶层
        if (msg.content && msg.type === "answer") return msg.content;
    }

    // 没找到结构化消息，尝试 JSON 序列化找 content
    const raw = JSON.stringify(messages);
    const match = raw.match(/"content"\s*:\s*"([^"]+)"/);
    return match ? match[1] : "";
}
