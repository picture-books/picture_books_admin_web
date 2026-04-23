<script lang="ts" setup>
import type { AdminBook, AdminBookPage } from "#/api/types";

import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { ElMessage } from "element-plus";

import { getAdminBookDetailApi } from "#/api";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const book = ref<AdminBook | null>(null);
const id = computed(() => Number(route.params.id));

/** 封面 + 按页序的内页图，供预览时前后切换 */
const allBookImagePreviewUrls = computed(() => {
  const b = book.value;
  if (!b) {
    return [];
  }
  const u: string[] = [];
  if (b.cover_image) {
    u.push(b.cover_image);
  }
  const pages = [...(b.pages ?? [])].toSorted((a, c) => a.page_num - c.page_num);
  for (const p of pages) {
    if (p.image_url) {
      u.push(p.image_url);
    }
  }
  return u;
});

function pageRowImagePreviewIndex(row: AdminBookPage) {
  const b = book.value;
  if (!b || !row.image_url) {
    return 0;
  }
  const pages = [...(b.pages ?? [])].toSorted((a, c) => a.page_num - c.page_num);
  let at = 0;
  if (b.cover_image) {
    at++;
  }
  for (const p of pages) {
    if (!p.image_url) {
      continue;
    }
    if (p.page_num === row.page_num) {
      return at;
    }
    at++;
  }
  return 0;
}

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
          <el-descriptions-item label="作者">
            {{ book.author?.nickname ?? book.author_id }}
          </el-descriptions-item>
          <el-descriptions-item label="体验模式">{{ book.experience_mode }}</el-descriptions-item>
          <el-descriptions-item label="年龄段">{{ book.age_group || "-" }}</el-descriptions-item>
          <el-descriptions-item label="主题" :span="2">
            {{ book.theme || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="简介" :span="2">
            {{ book.description || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="封面" :span="2">
            <el-image
              v-if="book.cover_image"
              :src="book.cover_image"
              :preview-src-list="allBookImagePreviewUrls"
              :initial-index="0"
              preview-teleported
              hide-on-click-modal
              fit="cover"
              class="book-detail__thumb book-detail__thumb--lg"
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
                :preview-src-list="allBookImagePreviewUrls"
                :initial-index="pageRowImagePreviewIndex(scope.row)"
                preview-teleported
                hide-on-click-modal
                fit="cover"
                class="book-detail__thumb"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.book-detail__thumb {
  width: 48px;
  height: 48px;
  vertical-align: middle;
  cursor: zoom-in;
  border-radius: 4px;
}

.book-detail__thumb--lg {
  width: 120px;
  height: 120px;
  cursor: zoom-in;
}
</style>
