<script lang="ts" setup>
import type { BookGenTask } from "#/api/types";

import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { ElMessage } from "element-plus";

import { getBookGenTaskDetailApi } from "#/api";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const task = ref<BookGenTask | null>(null);
const id = computed(() => Number(route.params.id));

async function load() {
  if (!Number.isFinite(id.value)) return;
  loading.value = true;
  try {
    task.value = await getBookGenTaskDetailApi(id.value);
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

watch(
  () => route.params.id,
  () => load(),
  { immediate: true },
);
</script>

<template>
  <div v-loading="loading" class="p-5">
    <el-page-header content="任务详情" @back="router.push({ name: 'OpsGenTasks' })" />
    <el-card v-if="task" class="mt-4" shadow="never">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ task.id }}</el-descriptions-item>
        <el-descriptions-item label="用户 ID">{{ task.user_id }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ task.status }}</el-descriptions-item>
        <el-descriptions-item label="进度">{{ task.progress }}</el-descriptions-item>
        <el-descriptions-item label="Book ID">{{ task.book_id ?? "-" }}</el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2">
{{
          task.error_message || "-"
        }}
</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre class="max-h-48 overflow-auto text-xs whitespace-pre-wrap">{{
            JSON.stringify(task.request_params ?? {}, null, 2)
          }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>
