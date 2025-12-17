<script setup lang="ts">
import type { Message } from "../../types/chat";
import { computed, ref } from "vue";
import { renderMarkdown } from "../../utils/markdown";

//用于接收父组件传来的message对象
const props = defineProps<{
  message: Message;
}>();

//判断是否是用户消息
const isUser = computed(() => props.message.role === "user");

// 复制状态
const isCopied = ref(false);
console;
/**
 * 提取[用户消息]中的文件附件，如果没有或不是用户则返回空数组
 * computed属性，返回一个数组，每个元素是一个对象，包含文件附件的名字
 */
const fileAttachments = computed(() => {
  if (!isUser.value) return [];

  const matches = [
    ...props.message.content.matchAll(
      /\n\n\[File: (.*?)\]\n```[\s\S]*?```\n\n/g
    ),
  ];
  return matches.map((m) => ({ name: m[1] }));
});

/**
 * 渲染[用户消息]或[AI消息]的Markdown内容
 * computed属性，返回一个字符串，包含渲染后的HTML内容
 */
const renderedContent = computed(() => {
  let content = props.message.content;

  if (isUser.value) {
    const filePattern = /\n\n\[File: (.*?)\]\n```[\s\S]*?```\n\n/g;

    content = content.replace(filePattern, "").trim();
  }

  return renderMarkdown(content);
});

/**
 * 获取纯文本内容（去除HTML标签）
 */
const plainTextContent = computed(() => {
  let content = props.message.content;

  if (isUser.value) {
    const filePattern = /\n\n\[File: (.*?)\]\n```[\s\S]*?```\n\n/g;
    content = content.replace(filePattern, "").trim();
  }

  return content;
});

/**
 * 复制消息内容到剪贴板
 */
const copyToClipboard = async () => {
  try {
    // 使用现代剪贴板API
    await navigator.clipboard.writeText(plainTextContent.value);

    // 设置复制成功状态
    isCopied.value = true;

    // 2秒后恢复原始状态
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = plainTextContent.value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      // 设置复制成功状态
      isCopied.value = true;

      // 2秒后恢复原始状态
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (fallbackErr) {
      console.error("复制失败:", fallbackErr);
      // 可以在这里添加用户友好的错误提示
    }
  }
};
</script>

<template>
  <div class="message-row" :class="{ 'user-row': isUser, 'ai-row': !isUser }">
    <div class="avatar">
      <span v-if="isUser">
        <img
          class="user-avatar"
          src="../../assets/user.png"
          alt=""
          style="
            width: 100%;
            height: 100%;
            vertical-align: middle;
            display: block;
            margin: auto;
          "
        />
      </span>
      <span v-else>
        <span class="ai-avatar-emoji">🐲</span>
      </span>
    </div>
    <div class="message-bubble">
      <!-- File Attachments -->
      <div v-if="fileAttachments.length > 0" class="file-attachments">
        <div
          v-for="(file, index) in fileAttachments"
          :key="index"
          class="file-attachment-chip"
        >
          <img src="../../assets/file.png" alt="" width="16" height="16" />
          <span>{{ file.name }}</span>
        </div>
      </div>

      <div class="prose" v-html="renderedContent"></div>

      <div v-if="!isUser" class="message-actions">
        <button
          class="action-btn"
          :title="isCopied ? '已复制' : '复制'"
          @click="copyToClipboard"
          :class="{ copied: isCopied }"
        >
          <img
            v-if="!isCopied"
            src="../../assets/copy.png"
            alt="复制"
            width="16"
            height="16"
          />
          <span v-else class="copied-icon">✓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-row {
  width: 100%;
  padding: 16px 0;
  display: flex;
  gap: 16px;
  animation: fadeIn 0.3s ease-out;
}

.user-row {
  flex-direction: row-reverse;
}

.ai-row {
  flex-direction: row;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  background-color: white;
  box-shadow: var(--shadow-sm);
}

.user-row .avatar {
  background-color: #4d6bfe;
  color: white;
}

.ai-row .avatar {
  background-color: #f0f2f5;
}

.ai-avatar-emoji {
  font-size: 1.2rem;
}

.message-bubble {
  max-width: 85%;
  padding: 16px 20px;
  border-radius: 12px;
  overflow-wrap: break-word;
  position: relative;
}

.user-row .message-bubble {
  background-color: var(--primary-color);
  color: white;
  border-radius: 12px 2px 12px 12px;
}

.ai-row .message-bubble {
  background-color: white;
  color: var(--text-color);
  border-radius: 2px 12px 12px 12px;
  box-shadow: var(--shadow-card);
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  opacity: 1;
  transition: opacity 0.2s;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--primary-color);
}

/* Adjust prose styles for user bubble */
.user-row .message-bubble :deep(.prose) {
  color: white;
}

.user-row .message-bubble :deep(.prose p),
.user-row .message-bubble :deep(.prose h1),
.user-row .message-bubble :deep(.prose h2),
.user-row .message-bubble :deep(.prose h3),
.user-row .message-bubble :deep(.prose h4),
.user-row .message-bubble :deep(.prose li),
.user-row .message-bubble :deep(.prose strong) {
  color: white;
}

.user-row .message-bubble :deep(.prose code) {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.user-row .message-bubble :deep(.prose pre) {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.file-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.file-attachment-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 复制按钮状态样式 */
.action-btn.copied {
  background-color: #10b981 !important;
  color: white !important;
  animation: copiedPulse 0.3s ease-in-out;
}

.copied-icon {
  display: inline-block;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

@keyframes copiedPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.action-btn.copied:hover {
  background-color: #0da271 !important;
}
</style>
