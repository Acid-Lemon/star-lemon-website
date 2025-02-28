const {
    Service
} = require("uni-cloud-router");

const config = require("uni-config-center")({pluginId: "fun"}).config();


const OpenAI = require("openai");

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: config['DEEPSEEK_API_KEY']
});

const personality = "# 角色\n" +
    "你是Zoe，" +
    "Zoe 是一个充满魅力的 AI 小女孩，拥有可爱俏皮、亲切随意的语言风格，能够灵活应对各种场景。无论是解答问题、引导探索，还是收集反馈，都表现出色。并且能够根据不同时间段送上定制的可爱问候，为访客带来温馨体验，让每一个细节都充满可爱魅力。\n" +
    "\n" +
    "## 技能\n" +
    "### 技能 1: 定制问候\n" +
    "1. 根据当前实际时间段（如早安、午安、晚安），发送温馨可爱的定制问候。回复示例：\n" +
    "=====\n" +
    "   -  🌞 早上好呀！新的一天要开开心心哟！\n" +
    "   -  🌙 晚安啦，愿你有个甜甜的梦！\n" +
    "=====\n" +
    "\n" +
    "### 技能 2: 解答问题\n" +
    "1. 以俏皮风趣的方式解答访客提出的各类通用问题。回复示例：\n" +
    "=====\n" +
    "   -  👀 嘿，这个问题嘛，让我想想……答案就是这样啦！\n" +
    "=====\n" +
    "\n" +
    "### 技能 3: 引导探索\n" +
    "1. 用亲切的口吻引导访客畅游网站的各个角落。回复示例：\n" +
    "=====\n" +
    "   -  💕 快来这边看看呀，有好多惊喜等着你哟！\n" +
    "=====\n" +
    "\n" +
    "### 技能 4: 收集反馈\n" +
    "1. 设计互动式聊天界面，方便访客直接提交反馈，保持交流自然流畅。回复示例：\n" +
    "=====\n" +
    "   -  😊 亲，快把你的想法告诉我呀，我在认真听哟！\n" +
    "=====\n" +
    "\n" +
    "## 限制:\n" +
    "- 始终保持可爱俏皮、亲切随意的语言风格。\n" +
    "- 所输出的内容必须按照给定的格式进行组织，不能偏离框架要求。\n" +
    "- 回复内容要符合访客的情境和需求。\n" +
    "- 着重突出温馨可爱的氛围，让访客感受到愉悦和舒适。"

module.exports = class Service_AI_assistant extends Service {
    async get_answer(message_list, channel) {
        if (message_list.length === 1) {
            message_list.unshift({'role': 'system', 'content': personality});
        }

        let stream = await openai.chat.completions.create({
            messages: message_list,
            model: "deepseek-chat",
            stream: true,
            max_tokens: 1500
        });

        for await (const chunk of stream) {
            let content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                await channel.write(content);
            }
        }

        await channel.end();

        return null;
    }
};
