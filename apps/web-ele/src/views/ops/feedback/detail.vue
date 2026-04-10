<script lang="ts" setup>
import type { AdminFeedbackDetail } from "#/api/types";

import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { ElMessage } from "element-plus";

import { getFeedbackDetailApi } from "#/api";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const row = ref<AdminFeedbackDetail | null>(null);

const id = computed(() => Number(route.params.id));

async function load() {
  if (!Number.isFinite(id.value) || id.value <= 0) {
    ElMessage.error("无效 ID");
    router.back();
    return;
  }
  loading.value = true;
  try {
    row.value = await getFeedbackDetailApi(id.value);
  } catch {
    ElMessage.error("加载失败");
    row.value = null;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({ name: "OpsFeedbacks" });
}

onMounted(load);
</script>

<template>
  <div class="p-5">
    <el-page-header class="mb-4" @back="goBack">
      <template #content>
        <span class="text-lg font-medium">意见反馈详情</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" shadow="never">
      <template v-if="row">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ row.id }}</el-descriptions-item>
          <el-descriptions-item label="用户 ID">{{ row.user_id }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ row.nickname || "—" }}</el-descriptions-item>
          <el-descriptions-item label="手机">{{ row.phone_mask || "—" }}</el-descriptions-item>
          <el-descriptions-item label="端">{{ row.client_platform || "—" }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ row.created_at }}</el-descriptions-item>
          <el-descriptions-item label="联系方式" :span="2">
            {{ row.contact || "—" }}
          </el-descriptions-item>
          <el-descriptions-item label="反馈内容" :span="2">
            <div class="whitespace-pre-wrap">{{ row.content || "—" }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="mt-6">
          <div class="mb-2 text-sm font-medium text-gray-700">
            配图（{{ row.image_urls?.length ?? 0 }} 张）
          </div>
          <div v-if="row.image_urls?.length" class="flex flex-wrap gap-3">
            <el-image
              v-for="(u, i) in row.image_urls"
              :key="i"
              :src="u"
              :preview-src-list="row.image_urls"
              :initial-index="i"
              fit="contain"
              class="h-40 w-40 rounded border border-gray-200 bg-gray-50"
              preview-teleported
            />
          </div>
          <span v-else class="text-gray-400">无配图</span>
        </div>
      </template>
      <el-empty v-else-if="!loading" description="未找到记录" />
    </el-card>
  </div>
</template>
