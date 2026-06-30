const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        // ============ 后端接口配置 ============
        const USER_ID = "huang";
        const API_URL = "/api/chat";  // 相对路径，无需跨域

        // 双语语言包完全原样保留
        const langMap = {
            zh: {
                langBtnText: "中文 ▾",
                backHome: "返回首页",
                sidebarTitle: "历史对话",
                newChatBtn: "+ 新对话",
                emptyTip: "暂无历史对话",
                mainTitle: "四川旅游智能助手",
                welcomeText: "您好！我是四川旅游专属助手，可咨询九寨沟、峨眉山、稻城亚丁、成都等全川景点游玩攻略、美食、行程规划~",
                inputPlaceholder: "输入你的问题...",
                sendBtn: "发送",
                tagTitle: "热门标签",
                qTitle: "常见问题",
                sceneTitle: "景区分类",
                loadingTip: "正在查询旅游攻略中...",
                tagJiuZhai: "九寨沟",
                tagEmei: "峨眉山",
                tagDaocheng: "稻城亚丁",
                tagChengduFood: "成都美食",
                tagWestLoop: "川西环线",
                faq1: "九寨沟最佳游玩季节？",
                faq2: "3天川西行程推荐",
                faq3: "成都必吃地道美食",
                faq4: "稻城亚丁高反注意事项",
                scene1: "成都周边",
                scene2: "川西高原",
                scene3: "川南山水",
                scene4: "世界遗产"
            },
            en: {
                langBtnText: "English ▾",
                backHome: "Back Home",
                sidebarTitle: "History Chat",
                newChatBtn: "+ New Chat",
                emptyTip: "No history chat",
                mainTitle: "Sichuan Travel Assistant",
                welcomeText: "Hello! I am Sichuan travel assistant. You can ask about Jiuzhaigou, Emei Mountain, Daocheng Yading, Chengdu travel guides, food and trip plans.",
                inputPlaceholder: "Enter your question...",
                sendBtn: "Send",
                tagTitle: "Hot Tags",
                qTitle: "FAQ",
                sceneTitle: "Scenic Areas",
                loadingTip: "Searching travel guide...",
                tagJiuZhai: "Jiuzhaigou",
                tagEmei: "Emei Mountain",
                tagDaocheng: "Daocheng Yading",
                tagChengduFood: "Chengdu Food",
                tagWestLoop: "West Sichuan Loop",
                faq1: "Best travel season for Jiuzhaigou?",
                faq2: "3-day West Sichuan itinerary",
                faq3: "Must-eat local food in Chengdu",
                faq4: "Altitude sickness tips for Daocheng Yading",
                scene1: "Chengdu Surroundings",
                scene2: "West Sichuan Plateau",
                scene3: "South Sichuan Scenery",
                scene4: "World Heritage"
            }
        };

        const tagQuestionMap = {
            jiuzhaigou: { zh: "讲讲九寨沟", en: "Tell me about Jiuzhaigou" },
            emei: { zh: "讲讲峨眉山", en: "Tell me about Emei Mountain" },
            daocheng: { zh: "讲讲稻城亚丁", en: "Tell me about Daocheng Yading" },
            chengduFood: { zh: "讲讲成都美食", en: "Introduce Chengdu local food" },
            westSichuan: { zh: "讲讲川西环线", en: "Introduce West Sichuan loop travel" }
        };

        const currentLang = ref("zh");
        const showDrop = ref(false);
        const inputVal = ref("");
        const loading = ref(false);
        const msgList = ref([]);
        const sidebarFold = ref(false);
        let msgId = 0;
        const langText = computed(() => langMap[currentLang.value]);

        const toggleSidebar = () => {
            sidebarFold.value = !sidebarFold.value;
        };
        const toggleDrop = () => {
            showDrop.value = !showDrop.value;
        };
        const setLang = (lang) => {
            currentLang.value = lang;
            showDrop.value = false;
        };
        const fillTag = (tagKey) => {
            const targetLang = currentLang.value;
            inputVal.value = tagQuestionMap[tagKey][targetLang];
        };
        const onFile = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            alert(`已选中文件：${file.name}，可搭配文字提问发送`);
        };

        // 原有工具函数完整保留
        function extractAnswerFromJSON(rawStr) {
            if (!rawStr) return '';
            try {
                const jsonData = JSON.parse(rawStr.trim());
                if (jsonData.answer !== undefined) {
                    return jsonData.answer;
                }
            } catch (e) {
                const match = rawStr.match(/"answer"\s*:\s*(".*?"|.*?)(?=,|}|$)/s);
                if (match && match[1]) {
                    let content = match[1].replace(/^"|"$/g, '');
                    return content;
                }
            }
            return rawStr;
        }
        function cleanText(rawText) {
            if (!rawText) return '';
            let pureContent = extractAnswerFromJSON(rawText);
            let res = pureContent
                .replace(/\\n/g, '\n')
                .replace(/^#{1,4}\s*/gm, '')
                .replace(/^-\s+/gm, '')
                .replace(/[\\{}"]/g, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            return res;
        }

        // ========== FAQ 硬编码答案（秒回，不调API）==========
        const FAQ = {
            "九寨沟最佳游玩季节": [
                "九寨沟的最佳游玩季节是秋季（9月-11月）🍂，这是九寨沟最美的季节！",
                "",
                "🌄 秋季（9-11月）★★★★★",
                "层林尽染、五彩斑斓，湖水与彩林交相辉映，是摄影的黄金时期。尤其是10月中下旬，红叶指数达到顶峰。",
                "",
                "🌿 夏季（6-8月）★★★★☆",
                "清凉避暑，瀑布水量充沛，平均气温19°C-22°C，是逃离酷暑的好去处。",
                "",
                "❄️ 冬季（12-2月）★★★☆☆",
                "游客稀少，雪后九寨沟宛如童话世界，但部分栈道可能因冰雪关闭。",
                "",
                "🌸 春季（3-5月）★★★☆☆",
                "万物复苏，山花烂漫，但春季水量相对较少。",
                "",
                "💡 小贴士：建议避开国庆黄金周（10月1日-7日）前往，游客量会暴增。提前在官网预约门票，每日限流4.1万人次。"
            ],
            "3天川西行程推荐": [
                "以下是一条经典的3天川西小环线行程，适合初次游玩的朋友 🏔️",
                "",
                "📅 第一天：成都 → 康定 → 新都桥（约350km）",
                "上午从成都出发走雅康高速，途经泸定桥感受红色文化，下午翻越折多山（海拔4298米），傍晚抵达'摄影天堂'新都桥。",
                "🏨 宿：新都桥镇",
                "",
                "📅 第二天：新都桥 → 塔公草原 → 墨石公园 → 丹巴（约200km）",
                "清晨在新都桥观贡嘎雪山日出，上午前往塔公草原和塔公寺，下午游览'异域星球'墨石公园，晚上抵达'千碉之国'丹巴。",
                "🏨 宿：甲居藏寨（体验藏式民宿）",
                "",
                "📅 第三天：丹巴 → 四姑娘山 → 成都（约330km）",
                "清晨在甲居藏寨拍日出，上午远眺四姑娘山（猫鼻梁观景台最佳），中午在日隆镇品尝牦牛肉汤锅，下午经巴朗山、映秀返回成都。",
                "",
                "⚠️ 注意事项：高原昼夜温差大，备好冲锋衣；提前服用红景天预防高反；折多山路段注意暗冰。"
            ],
            "成都必吃地道美食": [
                "成都作为'世界美食之都'，这些地道美食一定要尝！🌶️",
                "",
                "🔥 火锅",
                "推荐：小龙坎、蜀大侠、大龙燚。必点毛肚、鹅肠、黄喉、牛肉。吃不了辣选'微辣'锅底，搭配油碟解辣。",
                "",
                "🥟 小吃系列",
                "• 龙抄手 — 皮薄馅嫩，红油/清汤两种口味",
                "• 钟水饺 — 纯肉馅配红油蒜泥，甜辣口味",
                "• 担担面 — 臊子酥香，面条劲道，麻辣鲜香",
                "• 三大炮 — 糯米团裹黄豆粉淋红糖，糯软香甜",
                "• 蛋烘糕 — 街头小摊常见，外酥里嫩",
                "",
                "🍗 特色菜",
                "• 夫妻肺片 — 麻辣鲜香，牛肉牛杂切片",
                "• 麻婆豆腐 — 麻辣烫香，下饭神器",
                "• 回锅肉 — 四川第一名菜，肥而不腻",
                "• 宫保鸡丁 — 花生+鸡丁，荔枝味酸甜",
                "",
                "📍 美食集中地：锦里、宽窄巷子、建设路、玉林路。建议去本地人常去的苍蝇馆子，味道更地道、价格更实惠。"
            ],
            "稻城亚丁高反注意事项": [
                "稻城亚丁海拔较高（景区平均海拔4000米以上），高反是很多游客担心的问题。以下是详细注意事项 ⛑️",
                "",
                "🏔️ 海拔参考",
                "• 稻城县城：3700米",
                "• 香格里拉镇（日瓦）：2900米",
                "• 亚丁村：3900米",
                "• 牛奶海/五色海：4500-4700米",
                "",
                "💊 行前准备",
                "1. 提前7-10天服用红景天",
                "2. 备好高原安、葡萄糖口服液、布洛芬（止头痛）",
                "3. 携带便携氧气瓶（成都出发前购买，飞机不能带）",
                "4. 感冒药、肠胃药也建议带上",
                "",
                "📋 途中注意事项",
                "• 到达第一天不要洗头洗澡，避免感冒",
                "• 缓慢行动，不要跑跳，给身体适应时间",
                "• 多喝热水，少量多次，每天至少2升",
                "• 少食多餐，吃易消化的食物，避免油腻",
                "• 不要饮酒！酒精会加重高反",
                "• 保证充足睡眠，避免熬夜",
                "",
                "🚫 哪些人不适合去",
                "• 严重心脏病、高血压患者",
                "• 重度贫血患者",
                "• 孕妇和6岁以下儿童",
                "• 感冒期间不要上高原",
                "",
                "⚠️ 紧急处理",
                "如出现剧烈头痛、呕吐、呼吸困难等症状，应立即下撤到低海拔地区（日瓦镇2900米），并寻求当地医疗帮助。亚丁景区急救电话：0836-5721119。"
            ]
        };

        // 检查是否命中 FAQ
        const matchFAQ = (query) => {
            for (const key of Object.keys(FAQ)) {
                if (query.includes(key)) return key;
            }
            return null;
        };

        // ========== 文本清洗：去除可能的 JSON 残留和思考标记 ==========
        const cleanChunk = (raw) => {
            if (!raw) return '';
            let text = raw;
            // 去掉可能的 JSON 格式残留
            text = text.replace(/"?content"?\s*:\s*"/g, '')
                       .replace(/"?reasoning_content"?\s*:\s*"/g, '')
                       .replace(/"?msg_type"?\s*:\s*"[^"]*"/g, '')
                       .replace(/"?type"?\s*:\s*"[^"]*"/g, '')
                       .replace(/[{}"]/g, '')
                       .replace(/\\n/g, '\n');
            // 去掉纯元数据行
            if (/^(event:|data:\s*[\[{])/.test(text.trim())) return '';
            return text;
        };

        // ============ SSE 流式请求后端 /api/chat ============
        const fetchCozeChat = async (query, onChunk) => {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ query: query, user_id: USER_ID })
            });
            if (!res.ok) {
                throw new Error(`接口请求失败 (HTTP ${res.status})`);
            }
            // 读取 SSE 流
            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";
            let gotContent = false;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop();
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const payload = line.slice(6);
                        if (payload === "[DONE]") {
                            if (!gotContent) throw new Error("TIMEOUT");
                            return;
                        }
                        const cleaned = cleanChunk(payload);
                        if (cleaned) { gotContent = true; onChunk(cleaned); }
                    }
                }
            }
            if (!gotContent) throw new Error("TIMEOUT");
        };

        // ============ 兜底：直接调 Coze API（绕过 Netlify 10s 限制）============
        const COZE_PAT = "pat_zAV00pJuQCGGwvfoA1pTq4HCvpEh0ptrqbojc5Yj3QzCDYmEg3dB7IFCkgEZKswd";
        const COZE_BOT_ID = "7654942789465702452";
        const fetchCozeDirect = async (query, onChunk) => {
            const res = await fetch("https://api.coze.cn/v3/chat", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${COZE_PAT}`,
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream"
                },
                body: JSON.stringify({
                    bot_id: COZE_BOT_ID,
                    user_id: USER_ID,
                    stream: true,
                    additional_messages: [{ role: "user", content: query, content_type: "text" }]
                })
            });
            if (!res.ok) {
                throw new Error(`Coze API 请求失败 (HTTP ${res.status})`);
            }
            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop();
                for (const line of lines) {
                    if (line.startsWith("data:")) {
                        const payload = line.slice(5).trim();
                        if (!payload || payload === "[DONE]") continue;
                        try {
                            const json = JSON.parse(payload);
                            const text = json.content || "";
                            if (text) onChunk(text);
                        } catch (e) {
                            // 非 JSON，跳过
                        }
                    }
                }
            }
        };

        // ========== 新增历史对话持久化代码（完全不变）==========
        const chatSessionList = ref([]);
        const currentSessionId = ref("");
        const loadAllSession = () => {
            const localData = localStorage.getItem("sichuan_chat_session");
            if (localData) chatSessionList.value = JSON.parse(localData);
        };
        const saveAllSession = () => {
            localStorage.setItem("sichuan_chat_session", JSON.stringify(chatSessionList.value));
        };
        const createNewSession = () => {
            const sid = Date.now().toString();
            chatSessionList.value.unshift({
                id: sid,
                title: currentLang.value === 'zh' ? "新对话" : "New Chat",
                msgList: []
            });
            currentSessionId.value = sid;
            msgList.value = [];
            saveAllSession();
            renderChatList();
        };
        const switchSession = (sid) => {
            currentSessionId.value = sid;
            const targetSession = chatSessionList.value.find(s => s.id === sid);
            if (targetSession) msgList.value = targetSession.msgList;
        };
        const updateCurrentSessionMsg = () => {
            const index = chatSessionList.value.findIndex(s => s.id === currentSessionId.value);
            if (index !== -1) {
                chatSessionList.value[index].msgList = [...msgList.value];
                const firstUserMsg = msgList.value.find(m => m.type === 'user');
                if (firstUserMsg) chatSessionList.value[index].title = firstUserMsg.content.substring(0, 12);
                saveAllSession();
                renderChatList();
            }
        };
        const renderChatList = () => {
            const dom = document.getElementById('chatList');
            if (!dom) return;
            dom.innerHTML = '';
            chatSessionList.value.forEach(session => {
                const div = document.createElement('div');
                div.className = `chat-item ${session.id === currentSessionId.value ? 'active-chat' : ''}`;
                div.innerText = session.title;
                div.onclick = () => switchSession(session.id);
                dom.appendChild(div);
            })
        };
        // ==================================================================

        // 发送消息 — FAQ 本地秒回，其他走 API 流式
        const sendMsg = async () => {
            const query = inputVal.value.trim();
            if (!query) return;
            if (!currentSessionId.value) createNewSession();

            msgList.value.push({
                id: msgId++,
                type: "user",
                content: query
            });
            inputVal.value = "";
            loading.value = true;
            updateCurrentSessionMsg();

            let aiMsg = null;
            const scrollToBottom = () => {
                const el = document.getElementById("chatContent");
                if (el) el.scrollTop = el.scrollHeight;
            };

            // 检查 FAQ 命中 → 本地逐行模拟流式
            const faqKey = matchFAQ(query);
            if (faqKey) {
                loading.value = false;
                const lines = FAQ[faqKey];
                aiMsg = { id: msgId++, type: "ai", content: "" };
                msgList.value.push(aiMsg);
                for (let i = 0; i < lines.length; i++) {
                    await new Promise(r => setTimeout(r, 100));
                    aiMsg.content += (i > 0 ? "\n" : "") + lines[i];
                    scrollToBottom();
                    updateCurrentSessionMsg();
                }
                return;
            }

            // 优先走后端，超时则自动切 Coze 直连
            const doChat = async (useDirect) => {
                const fetcher = useDirect ? fetchCozeDirect : fetchCozeChat;
                await fetcher(query, (chunkText) => {
                    if (!aiMsg) {
                        loading.value = false;
                        aiMsg = { id: msgId++, type: "ai", content: chunkText };
                        msgList.value.push(aiMsg);
                    } else {
                        aiMsg.content += chunkText;
                    }
                    scrollToBottom();
                    updateCurrentSessionMsg();
                });
            };

            try {
                await doChat(false);
                if (!aiMsg) {
                    loading.value = false;
                    msgList.value.push({
                        id: msgId++,
                        type: "ai",
                        content: currentLang.value === 'zh' ? '（暂无回复内容）' : '(No response)'
                    });
                }
                updateCurrentSessionMsg();
            } catch (err) {
                // 后端超时 → 自动切 Coze 直连
                if (err.message === "TIMEOUT") {
                    console.log("后端超时，切换 Coze 直连...");
                    try {
                        await doChat(true);
                        if (!aiMsg) {
                            loading.value = false;
                            msgList.value.push({
                                id: msgId++,
                                type: "ai",
                                content: currentLang.value === 'zh' ? '（暂无回复内容）' : '(No response)'
                            });
                        }
                        updateCurrentSessionMsg();
                        return;
                    } catch (err2) {
                        loading.value = false;
                        if (aiMsg) {
                            aiMsg.content += `\n\n[请求中断：${err2.message}]`;
                        } else {
                            msgList.value.push({
                                id: msgId++,
                                type: "ai",
                                content: `请求失败：${err2.message}`
                            });
                        }
                        updateCurrentSessionMsg();
                        return;
                    }
                }
                loading.value = false;
                if (aiMsg) {
                    aiMsg.content += `\n\n[请求中断：${err.message}]`;
                } else {
                    msgList.value.push({
                        id: msgId++,
                        type: "ai",
                        content: `请求失败：${err.message}`
                    });
                }
                updateCurrentSessionMsg();
                console.error("接口请求错误：", err);
            }
        };

        onMounted(() => {
            document.addEventListener("click", () => {
                showDrop.value = false;
            });
            loadAllSession();
            renderChatList();
            if (chatSessionList.value.length === 0) createNewSession();
            else switchSession(chatSessionList.value[0].id);
        });

        // 格式化 AI 文本：换行 + 清除思考残留
        const formatAIText = (text) => {
            if (!text) return '';
            let html = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>')
                // 加粗 **文字**
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                // 标题 ###
                .replace(/^### (.+)$/gm, '<h4 style="margin:10px 0 6px;color:#2c2044;">$1</h4>')
                .replace(/^## (.+)$/gm, '<h3 style="margin:12px 0 6px;color:#2c2044;">$1</h3>');
            return html;
        };

        return {
            langText,
            showDrop,
            inputVal,
            loading,
            msgList,
            sidebarFold,
            formatAIText,
            toggleSidebar,
            toggleDrop,
            setLang,
            fillTag,
            onFile,
            sendMsg,
            createNewSession
        };
    }
}).mount("#app");