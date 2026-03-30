<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { getAdminStatsApi } from "#/api";
import type { AdminStats } from "#/api/types";

import { ElMessage } from "element-plus";

const loading = ref(false);
const stats = ref<AdminStats | null>(null);

async function load() {
  loading.value = true;
  try {
    stats.value = await getAdminStatsApi();
  } catch {
    ElMessage.error("加载统计数据失败");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="p-5">
    <el-row v-loading="loading" :gutter="16">
      <template v-if="stats">
        <el-col :xs="24" :sm="12" :md="6" class="mb-4">
          <el-card shadow="hover">
            <div class="text-muted-foreground text-sm">App 用户</div>
            <div class="text-2xl font-semibold">{{ stats.app_users }}</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" class="mb-4">
          <el-card shadow="hover">
            <div class="text-muted-foreground text-sm">绘本总数</div>
            <div class="text-2xl font-semibold">{{ stats.books }}</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" class="mb-4">
          <el-card shadow="hover">
            <div class="text-muted-foreground text-sm">已发布绘本</div>
            <div class="text-2xl font-semibold">{{ stats.published_books }}</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" class="mb-4">
          <el-card shadow="hover">
            <div class="text-muted-foreground text-sm">生成任务</div>
            <div class="text-2xl font-semibold">{{ stats.book_gen_tasks }}</div>
          </el-card>
        </el-col>
      </template>
    </el-row>
  </div>
</template>
