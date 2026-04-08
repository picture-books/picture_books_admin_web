<script lang="ts" setup>
import type { AdminFeedbackRow } from "#/api/types";

import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { ElMessage } from "element-plus";

import { getFeedbackListApi } from "#/api";

const router = useRouter();
const loading = ref(false);
const tableData = ref<AdminFeedbackRow[]>([]);
const total = ref(0);
const query = reactive({ page: 1, page_size: 20 });

async function fetchList() {
  loading.value = true;
  try {
    const res = await getFeedbackListApi({ ...query });
    tableData.value = res.list ?? [];
    total.value = res.total ?? 0;
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

function goDetail(row: AdminFeedbackRow) {
  router.push({ name: "OpsFeedbackDetail", params: { id: String(row.id) } });
}

onMounted(fetchList);
</script>

<template>
  <div class="p-5">
    <el-card v-loading="loading" shadow="never" header="用户意见反馈">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="72" />
        <el-table-column prop="nickname" label="昵称" width="120" show-overflow-tooltip />
        <el-table-column prop="phone_mask" label="手机" width="120" />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="配图" width="88" align="center">
          <template #default="{ row }: { row: AdminFeedbackRow }">
            <span v-if="row.image_count > 0">{{ row.image_count }} 张</span>
            <span v-else class="text-gray-400">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系方式" width="140" show-overflow-tooltip />
        <el-table-column prop="client_platform" label="端" width="88" />
        <el-table-column prop="created_at" label="时间" width="180" />
        <el-table-column label="操作" width="96" fixed="right">
          <template #default="{ row }: { row: AdminFeedbackRow }">
            <el-button link type="primary" @click="goDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.page_size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchList"
          @size-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>
