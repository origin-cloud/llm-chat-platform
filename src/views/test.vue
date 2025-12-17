<template>
  <div
    class="container"
    :style="{ height: listHeight + 'px' }"
    @scroll="handleScroll"
    ref="listRef"
  >
    <div
      class="space"
      :style="{ height: list.length * itemHeight + 'px' }"
    ></div>
    <div class="list" :style="{ transform: `translateY(${offsetY}px)` }">
      <div
        class="item"
        :style="{ height: itemHeight + 'px' }"
        v-for="index in itemlist"
        :key="index"
        ref="itemRef"
      >
        {{ index }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
/**
 * 盒子高度
 * 占位高度  list.length * itemHeight
 * 绝对位置设为上
 * 然后向下滑transform: `translateY(${offsetY}px)`
 * 起始位置乘以item高度    start.value * (itemHeight.value + 10);
 *
 *
 */

//开始位置
const start = ref(0);
//可视高度显示数量
const nums = computed(() => {
  return Math.ceil(listHeight.value / (itemHeight.value + 10)) + 2;
});
const scrollTop = ref(0);
// 每个item的高度
const itemHeight = ref(50);
// 列表总高度
const listHeight = ref(600);
const offsetY = computed(() => {
  return start.value * (itemHeight.value + 10);
});
// 列表数据
const list = ref(Array.from({ length: 101 }, (_, index) => index));
// 列表显示数据
const itemlist = computed(() => {
  return list.value.slice(start.value, start.value + nums.value);
});

// 列表滚动事件
const listRef = ref<HTMLDivElement | null>(null);

const itemRef = ref<Array<HTMLDivElement>>([]);

const handleScroll = () => {
  if (itemRef.value.length > 0) {
    if (itemRef.value[0]) console.log(itemRef.value[0].offsetHeight);
  }
  if (!listRef.value) return;
  scrollTop.value = listRef.value.scrollTop;

  start.value = Math.floor(scrollTop.value / (itemHeight.value + 10));
  // 确保start不小于0
  start.value = Math.max(0, start.value);
};
</script>
<style scoped>
.container {
  width: 300px;
  margin: 0 auto;
  margin-top: 80px;
  overflow-y: scroll;

  border: 1px solid #000;
  position: relative;
}
.list {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}
.item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
  background: skyblue;
  border-radius: 30px;
}
</style>
