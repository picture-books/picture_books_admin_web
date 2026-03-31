<script lang="ts" setup>
import type { BookGenTask } from "#/api/types";

import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { ElMessage } from "element-plus";

import { cancelBookGenTaskApi, deleteBookGenTaskApi, getBookGenTaskDetailApi } from "#/api";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const task = ref<BookGenTask | null>(null);
const id = computed(() => Number(route.params.id));

const userPrompt = computed(() => {
  const value = task.value?.request_params as Record<string, unknown> | undefined;
  const raw = value?.user_prompt;
  return typeof raw === "string" ? raw : "-";
});

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

async function handleDelete() {
  if (!task.value) return;
  try {
    await deleteBookGenTaskApi(task.value.id);
    ElMessage.success("删除成功");
    router.push({ name: "OpsGenTasks" });
  } catch {
    ElMessage.error("删除失败");
  }
}

async function handleCancel() {
  if (!task.value) return;
  if (task.value.status !== 0 && task.value.status !== 1) {
    ElMessage.info("仅待处理/生成中的任务需要停止");
    return;
  }
  try {
    await cancelBookGenTaskApi(task.value.id);
    ElMessage.success("已提交停止");
    await load();
  } catch {
    ElMessage.error("停止失败");
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
      <template #header>
        <div class="flex items-center justify-between">
          <span>任务详情</span>
          <div class="space-x-2">
            <el-button
              v-if="task.status === 0 || task.status === 1"
              type="warning"
              plain
              @click="handleCancel"
            >
              停止任务
            </el-button>
            <el-popconfirm
              title="确定要删除该任务吗？此操作不可撤销。"
              confirm-button-text="删除"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleDelete"
            >
              <template #reference>
                <el-button type="danger" plain>删除任务</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ task.id }}</el-descriptions-item>
        <el-descriptions-item label="用户 ID">{{ task.user_id }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ task.status }}</el-descriptions-item>
        <el-descriptions-item label="进度">{{ task.progress }}</el-descriptions-item>
        <el-descriptions-item label="Book ID">{{ task.book_id ?? "-" }}</el-descriptions-item>
        <el-descriptions-item label="用户 Prompt" :span="2">
          {{ userPrompt }}
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2">
          {{ task.error_detail || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre class="max-h-48 overflow-auto text-xs whitespace-pre-wrap">
            {{ JSON.stringify(task.request_params ?? {}, null, 2) }}
          </pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>
