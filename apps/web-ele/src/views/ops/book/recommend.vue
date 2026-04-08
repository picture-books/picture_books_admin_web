<script lang="ts" setup>
import type { AdminBookRecommendationItem, BookRecommendSuggestionItem } from "#/api/types";

import { computed, onMounted, ref } from "vue";

import { ElMessage, ElMessageBox } from "element-plus";

import {
  getBookRecommendationsApi,
  putBookRecommendationsApi,
  suggestBookRecommendationsApi,
} from "#/api";

const loading = ref(false);
const saving = ref(false);
const rows = ref<AdminBookRecommendationItem[]>([]);

const suggestOpen = ref(false);
const suggestLoading = ref(false);
const suggestRows = ref<BookRecommendSuggestionItem[]>([]);
const selectedSuggest = ref<BookRecommendSuggestionItem[]>([]);

const orderedIds = computed(() => rows.value.map((r) => r.book_id));

async function fetchList() {
  loading.value = true;
  try {
    const list = await getBookRecommendationsApi();
    rows.value = (list ?? []).map((r, i) => ({ ...r, sort_order: i }));
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

function reindex() {
  rows.value = rows.value.map((r, i) => ({ ...r, sort_order: i }));
}

function moveUp(i: number) {
  if (i <= 0) return;
  const next = [...rows.value];
  const a = next[i - 1];
  const b = next[i];
  if (!a || !b) return;
  next[i - 1] = b;
  next[i] = a;
  rows.value = next;
  reindex();
}

function moveDown(i: number) {
  if (i >= rows.value.length - 1) return;
  const next = [...rows.value];
  const a = next[i];
  const b = next[i + 1];
  if (!a || !b) return;
  next[i] = b;
  next[i + 1] = a;
  rows.value = next;
  reindex();
}

function removeAt(i: number) {
  rows.value = rows.value.filter((_, idx) => idx !== i);
  reindex();
}

async function saveOrder() {
  saving.value = true;
  try {
    await putBookRecommendationsApi(orderedIds.value);
    ElMessage.success("已保存");
    await fetchList();
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "保存失败";
    ElMessage.error(msg);
  } finally {
    saving.value = false;
  }
}

async function confirmClear() {
  try {
    await ElMessageBox.confirm("清空后 App 市场推荐区将暂无绘本，确认？", "提示", { type: "warning" });
    rows.value = [];
    await saveOrder();
  } catch {
    /* cancel */
  }
}

async function openSuggest() {
  suggestOpen.value = true;
  suggestLoading.value = true;
  selectedSuggest.value = [];
  try {
    suggestRows.value = (await suggestBookRecommendationsApi(30)) ?? [];
  } catch {
    ElMessage.error("候选加载失败");
    suggestRows.value = [];
  } finally {
    suggestLoading.value = false;
  }
}

function applySuggestSelection() {
  const existing = new Set(rows.value.map((r) => r.book_id));
  for (const s of selectedSuggest.value) {
    if (existing.has(s.book_id)) continue;
    existing.add(s.book_id);
    rows.value.push({
      book_id: s.book_id,
      sort_order: rows.value.length,
      title: s.title,
      cover_image: s.cover_image,
      author_id: 0,
    });
  }
  reindex();
  suggestOpen.value = false;
  ElMessage.success("已加入列表，请检查顺序后保存");
}

onMounted(fetchList);
</script>

<template>
  <div class="p-5">
    <el-card shadow="never" class="mb-4">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <el-button type="primary" :loading="saving" v-access:code="['book:recommend_write']" @click="saveOrder">
          保存顺序
        </el-button>
        <el-button v-access:code="['book:recommend_list']" @click="openSuggest">一键推荐候选</el-button>
        <el-button :loading="loading" @click="fetchList">刷新</el-button>
        <el-button type="danger" plain v-access:code="['book:recommend_write']" @click="confirmClear">清空推荐</el-button>
      </div>
      <p class="text-muted-foreground mb-3 text-sm">
        仅<strong>已发布</strong>绘本可写入推荐表。以下为 App「市场」Tab 展示顺序（由上至下、横滑推荐与前 N
        本一致）。
      </p>
      <el-table v-loading="loading" :data="rows" border stripe row-key="book_id" style="width: 100%">
        <el-table-column prop="sort_order" label="#" width="56" />
        <el-table-column label="封面" width="90">
          <template #default="{ row }">
            <el-image
              v-if="row.cover_image"
              :src="row.cover_image"
              fit="cover"
              class="h-14 w-10 rounded"
              :preview-src-list="[row.cover_image]"
              preview-teleported
            />
            <span v-else class="text-gray-400">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="book_id" label="绘本 ID" width="100" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="author_id" label="作者 ID" width="100" />
        <el-table-column label="排序" width="200" fixed="right">
          <template #default="{ $index }">
            <el-button size="small" :disabled="$index === 0" @click="moveUp($index)">上移</el-button>
            <el-button size="small" :disabled="$index === rows.length - 1" @click="moveDown($index)">下移</el-button>
            <el-button size="small" type="danger" link v-access:code="['book:recommend_write']" @click="removeAt($index)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="suggestOpen" title="一键推荐候选" width="900px" destroy-on-close>
      <p class="text-muted-foreground mb-2 text-sm">
        按阅读次数、收藏数、阅读时长综合排序（仅候选）。勾选后加入上方列表，不会自动保存。
      </p>
      <el-table
        v-loading="suggestLoading"
        :data="suggestRows"
        border
        max-height="420"
        @selection-change="(s: BookRecommendSuggestionItem[]) => (selectedSuggest = s)"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="book_id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="session_count" label="阅读次数" width="100" />
        <el-table-column prop="favorite_count" label="收藏数" width="88" />
        <el-table-column prop="total_read_sec" label="阅读总秒" width="110" />
        <el-table-column prop="score" label="score" width="88" />
      </el-table>
      <template #footer>
        <el-button @click="suggestOpen = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedSuggest.length" @click="applySuggestSelection">加入列表</el-button>
      </template>
    </el-dialog>
  </div>
</template>
