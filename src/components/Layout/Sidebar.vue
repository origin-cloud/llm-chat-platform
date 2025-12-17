<script setup lang="ts">
import { useChatStore } from "../../stores/chat";
import { storeToRefs } from "pinia";

const chatStore = useChatStore();
const { filteredSessions, currentSessionId, searchQuery } =
  storeToRefs(chatStore);
const { createSession, selectSession, deleteSession, clearAllSessions } =
  chatStore;

const handleDeleteSession = (e: Event, id: string) => {
  e.stopPropagation();
  if (confirm("确定要删除这个对话吗？")) {
    deleteSession(id);
  }
};

const handleClearAll = () => {
  if (confirm("确定要删除所有对话吗？")) {
    clearAllSessions();
  }
};

</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <div class="brand">
        <span class="brand-text">AI Chat</span>
      </div>
      <div class="subtitle">智能助手</div>

      <button class="new-chat-btn" @click="createSession">+ 新对话</button>

      <div class="search-bar">
        <span class="search-icon">
          <img src="../../assets/search.png" alt="" width="20" height="20" />
        </span>
        <input v-model="searchQuery" type="text" placeholder="搜索对话..." />
      </div>

      <div class="list-header">
        <span>历史记录</span>
        <button
          class="clear-btn"
          @click="handleClearAll"
          v-if="filteredSessions.length > 0"
          title="清空历史"
        >
          <img src="../../assets/delete.png" alt="" width="14" height="14" />
          清空
        </button>
      </div>
    </div>

    <div class="session-list">
      <RecycleScroller
        class="scroller"
        :items="filteredSessions"
        :item-size="74"
        key-field="id"
        v-slot="{ item }"
      >
        <div
          class="session-item"
          :class="{ active: currentSessionId === item.id }"
          @click="selectSession(item.id)"
        >
          <div class="session-info">
            <span class="session-title">{{ item.title }}</span>
            <span class="session-time">刚刚</span>
          </div>
          <div class="session-preview">
            {{
              item.messages[item.messages.length - 1]?.content.slice(0, 20) ||
              "新对话"
            }}...
          </div>
          <button
            class="delete-btn"
            @click="(e) => handleDeleteSession(e, item.id)"
          >
            <img src="../../assets/delete.png" alt="" width="14" height="14" />
          </button>
        </div>
      </RecycleScroller>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 16px;
}

.sidebar-top {
  margin-bottom: 20px;
}

.brand {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.brand-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-color);
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.1rem;
}

.subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.new-chat-btn {
  width: 100%;
  padding: 10px;
  background-color: var(--primary-color);
  border: none;
  border-radius: 20px; /* Rounded pill shape */
  color: white;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  transition: background-color 0.2s;
  box-shadow: 0 4px 12px rgba(77, 107, 254, 0.2);
}

.new-chat-btn:hover {
  background-color: var(--primary-hover);
}

.search-bar {
  position: relative;
  margin-bottom: 10px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 0.9rem;
  outline: none;
}

.search-bar input:focus {
  border-color: var(--primary-color);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
  padding: 0 4px;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
}

.clear-btn:hover {
  color: #ef4444;
}

.session-list {
  flex: 1;
  overflow: hidden; /* Hide overflow on container, let scroller handle it */
}

.scroller {
  height: 100%;
}

.session-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  cursor: pointer;
  background-color: var(--bg-color); /* Card style */
  border: 1px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.session-item:hover {
  border-color: var(--primary-color);
  background-color: white;
  box-shadow: var(--shadow-sm);
}

.session-item.active {
  border-color: var(--primary-color);
  background-color: white;
  box-shadow: var(--shadow-sm);
}

.session-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.session-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.session-time {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.session-preview {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ef4444;
}
</style>
