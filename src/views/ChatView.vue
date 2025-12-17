<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import Sidebar from "../components/Layout/Sidebar.vue";
import ChatInput from "../components/Chat/ChatInput.vue";
import MessageBubble from "../components/Chat/MessageBubble.vue";
import { useChatStore } from "../stores/chat";
import { storeToRefs } from "pinia";
import { streamCompletion } from "../services/llm";

const chatStore = useChatStore();
const { currentSession, isStreaming } = storeToRefs(chatStore);
const scrollerRef = ref<any>(null);
const scrollTimer = ref<number | null>(null); // 防抖计时器

// 滚动到消息列表底部
const scrollToBottom = async () => {
  await nextTick();
  if (scrollerRef.value) {
    scrollerRef.value.scrollToBottom();
  }
};
// 监听消息列表变化，滚动到底部
watch(
  () => currentSession.value?.messages.length,
  () => {
    scrollToBottom();
  }
);
// 监听最新消息内容变化，智能滚动
watch(
  () =>
    currentSession.value?.messages[currentSession.value.messages.length - 1]
      ?.content,
  () => {
    if (scrollerRef.value) {
      const scroller = scrollerRef.value.$el;
      if (scroller) {
        // 清除之前的计时器
        if (scrollTimer.value) {
          clearTimeout(scrollTimer.value);
        }

        // 设置新的防抖计时器
        scrollTimer.value = setTimeout(() => {
          // 检查是否在底部附近
          const scrollBottom =
            scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
          const isNearBottom = scrollBottom <= 100;

          // 只有在底部附近时才滚动
          if (isNearBottom) {
            scrollToBottom();
          }
        }, 100) as unknown as number;
      }
    }
  },
  { deep: true }
);

// 组件卸载时清理计时器
onUnmounted(() => {
  if (scrollTimer.value) {
    clearTimeout(scrollTimer.value);
  }
});

const handleSend = async (content: string) => {
  if (!currentSession.value) return;
  // 发送用户消息
  chatStore.addMessage("user", content);
  // 设置为流式响应模式
  chatStore.setStreaming(true);
  // 添加助手空占位符
  chatStore.addMessage("assistant", "");

  try {
    // 获取当前会话的消息列表
    const messages = currentSession.value.messages;

    // 调用流式完成函数，处理每个返回的 chunk
    for await (const chunk of streamCompletion(messages)) {
      //如果当前会话存在
      //
      if (currentSession.value) {
        const lastMsgIdx = currentSession.value.messages.length - 1;
        const lastMsg = currentSession.value.messages[lastMsgIdx];
        if (lastMsg) {
          chatStore.updateLastMessageContent(lastMsg.content + chunk);
        }
      }
    }
  } catch (error) {
    console.error("Failed to generate response:", error);
    chatStore.updateLastMessageContent(
      "Sorry, I encountered an error while generating the response."
    );
  } finally {
    chatStore.setStreaming(false);
  }
};

onMounted(() => {
  // 初始化时创建会话
  if (!chatStore.currentSessionId) {
    chatStore.createSession();
  }
});
</script>

<template>
  <div class="chat-layout">
    <Sidebar />
    <main class="main-content">
      <header class="chat-header">
        <div class="selector">
          <span>Ai Chat (快速对话)</span>
        </div>
      </header>

      <div class="messages-container" ref="messagesContainerRef">
        <div
          v-if="!currentSession || currentSession.messages.length === 0"
          class="empty-state"
        >
          <div class="logo-large">
            <span class="logo-emoji">🐲</span>
          </div>
          <h2>你好！我是 ai智能助手</h2>
          <p>有什么我可以帮你的吗？</p>
        </div>

        <div v-else class="messages-list">
          <DynamicScroller
            ref="scrollerRef"
            :items="currentSession.messages"
            :min-item-size="60"
            class="scroller"
            :buffer="100"
            :prerender="10"
            key-field="id"
          >
            <template #default="{ item, index, active }">
              <DynamicScrollerItem
                :item="item"
                :active="active"
                :size-dependencies="[item.content]"
                :data-index="index"
              >
                <MessageBubble :message="item" />
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>
        </div>
      </div>

      <div class="input-area">
        <ChatInput @send="handleSend" :disabled="isStreaming" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  background-color: var(--bg-color);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chat-header {
  height: 60px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-color);
  z-index: 10;
}

.selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-color);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.selector:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.messages-list {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  padding: 0 24px;
  height: 100%;
}

.scroller {
  height: 100%;
  scroll-behavior: smooth;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  opacity: 0.8;
}

.logo-large {
  font-size: 4rem;
  margin-bottom: 20px;
}

.scroll-anchor {
  height: 1px;
}

.input-area {
  padding-bottom: 24px;
}
</style>
