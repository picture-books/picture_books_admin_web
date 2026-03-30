<script lang="ts" setup>
import type { AdminBook } from "#/api/types";

import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getAdminBookDetailApi } from "#/api";

import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const book = ref<AdminBook | null>(null);
const id = computed(() => Number(route.params.id));

async function load() {
  if (!Number.isFinite(id.value)) return;
  loading.value = true;
  try {
    book.value = await getAdminBookDetailApi(id.value);
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
    <el-page-header content="绘本详情" @back="router.push({ name: 'OpsBooks' })" />
    <template v-if="book">
      <el-card class="mt-4" shadow="never">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ book.id }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ book.title }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ book.status }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{
            book.author?.nickname ?? book.author_id
          }}</el-descriptions-item>
          <el-descriptions-item label="体验模式">{{ book.experience_mode }}</el-descriptions-item>
          <el-descriptions-item label="年龄段">{{ book.age_group || "-" }}</el-descriptions-item>
          <el-descriptions-item label="主题" :span="2">{{
            book.theme || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="简介" :span="2">{{
            book.description || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="封面" :span="2">
            <el-image
              v-if="book.cover_image"
              :src="book.cover_image"
              style="width: 120px; height: 120px"
              fit="cover"
            />
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-card class="mt-4" shadow="never">
        <template #header>页面</template>
        <el-table :data="book.pages || []" border size="small">
          <el-table-column prop="page_num" label="#" width="60" />
          <el-table-column prop="content" label="正文" min-width="200" show-overflow-tooltip />
          <el-table-column label="插图" width="100">
            <template #default="scope">
              <el-image
                v-if="scope?.row?.image_url"
                :src="scope.row.image_url"
                style="width: 48px; height: 48px"
                fit="cover"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>
