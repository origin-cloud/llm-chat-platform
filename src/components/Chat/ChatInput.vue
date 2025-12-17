<script setup lang="ts">
import { ref, nextTick } from "vue";
import { sanitizeHTML } from "./../../utils/security";

// 定义发送消息事件
const emit = defineEmits<{
  (e: "send", content: string): void;
}>();

const props = defineProps<{
  disabled?: boolean;
}>();

const inputContent = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
// const attachedFile = ref({
//   name: "",
//   content: "",
// })
const attachedFile = ref<{ name: string; content: string } | null>(null);
const attachedFiles = ref<Array<{ name: string; content: string }>>([]);
const adjustHeight = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }
};

const handleInput = () => {
  adjustHeight();
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

const sendMessage = () => {
  // trim() 方法移除字符串首尾的空格
  if (
    (!inputContent.value.trim() && !attachedFiles.value.length) ||
    props.disabled
  )
    return;

  let finalContent = inputContent.value;
  if (attachedFiles.value) {
    attachedFiles.value.forEach((attachedFile) => {
      const fileHeader = `\n\n[File: ${attachedFile.name}]\n\`\`\`\n${attachedFile.content}\n\`\`\`\n\n`;
      finalContent += fileHeader;
    });
  }
  finalContent = sanitizeHTML(finalContent);
  emit("send", finalContent);
  inputContent.value = "";
  attachedFiles.value = [];

  nextTick(() => {
    adjustHeight();
  });
};

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

/**
 * 处理文件上传事件
 * 读取选中的文件内容，将其转换为文本格式，并存储在 attachedFile 中
 */
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (content) {
      attachedFiles.value.push({
        name: file.name,
        content: content,
      });
      nextTick(() => {
        textareaRef.value?.focus();
      });
    }
  };
  reader.readAsText(file);
  target.value = "";
};

const removeFile = (attachedFile: { name: string; content: string }) => {
  attachedFiles.value = attachedFiles.value.filter((f) => {
    return f.name !== attachedFile.name || f.content !== attachedFile.content;
  });
};
</script>

<template>
  <div class="chat-input-container">
    <div class="input-box">
      <div class="files" v-for="attachedFile in attachedFiles">
        <div v-if="attachedFile" class="file-preview">
          <div class="file-icon">
            <img src="../../assets/file.png" alt="" width="16" height="16" />
          </div>
          <span class="file-name">{{ attachedFile.name }}</span>
          <button class="remove-file-btn" @click="removeFile(attachedFile)">
            <img src="../../assets/remove.png" alt="" width="10" height="10" />
          </button>
        </div>
      </div>
      <textarea
        ref="textareaRef"
        v-model="inputContent"
        placeholder="输入你的问题........"
        rows="1"
        @input="handleInput"
        @keydown="handleKeydown"
        :disabled="disabled"
      ></textarea>

      <div class="input-toolbar">
        <div class="left-tools">
          <input
            type="file"
            ref="fileInputRef"
            style="display: none"
            @change="handleFileUpload"
            accept=".txt,.md,.js,.ts,.vue,.py,.html,.css,.json"
          />
          <button class="tool-btn" title="上传文件" @click="triggerFileUpload">
            <img src="../../assets/upload.png" alt="" width="14" height="14" />
            <span>上传文件</span>
          </button>
        </div>

        <div class="right-actions">
          <span class="hint-text">Shift + Enter 换行</span>
          <button
            class="send-btn"
            @click="sendMessage"
            :disabled="(!inputContent.trim() && !attachedFile) || disabled"
          >
            发送

            <img src="../../assets/send.png" alt="" width="16" height="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-input-container {
  padding: 0 24px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.input-box {
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--input-shadow);
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.input-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(77, 107, 254, 0.1);
}

textarea {
  width: 100%;
  background: transparent;
  border: none;
  resize: none;
  outline: none;
  color: var(--text-color);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  max-height: 200px;
  min-height: 60px;
  padding: 0;
  margin-bottom: 12px;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-tools {
  display: flex;
  gap: 16px;
}

.tool-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.tool-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--primary-color);
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hint-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: none;
}

@media (min-width: 768px) {
  .hint-text {
    display: block;
  }
}

.send-btn {
  background-color: var(--primary-color);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.send-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--text-secondary);
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--bg-color);
  border-radius: 8px;
  margin-bottom: 8px;
  width: fit-content;
  border: 1px solid var(--border-color);
}

.file-icon {
  color: var(--primary-color);
  display: flex;
  align-items: center;
}

.file-name {
  font-size: 0.85rem;
  color: var(--text-color);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
}

.remove-file-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #ef4444;
}
</style>
