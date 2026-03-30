<script lang="ts" setup>
import type { BookGenTask } from "#/api/types";

import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { ElMessage } from "element-plus";

import { getBookGenTaskListApi } from "#/api";

const router = useRouter();
const loading = ref(false);
const rows = ref<BookGenTask[]>([]);
const total = ref(0);
const query = reactive({
  page: 1,
  page_size: 20,
  status: -1,
  user_id: 0,
});

const statusMap: Record<number, string> = {
  [-1]: "全部",
  0: "待处理",
  1: "生成中",
  2: "已完成",
  3: "失败",
  4: "已取消",
};

async function fetchList() {
  loading.value = true;
  try {
    const res = await getBookGenTaskListApi({
      page: query.page,
      page_size: query.page_size,
      status: query.status >= 0 ? query.status : undefined,
      user_id: query.user_id > 0 ? query.user_id : undefined,
    });
    rows.value = res.list ?? [];
    total.value = res.total ?? 0;
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

function goDetail(row: BookGenTask) {
  router.push({ name: "OpsGenTaskDetail", params: { id: String(row.id) } });
}

onMounted(fetchList);
</script>

<template>
  <div class="p-5">
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" @submit.prevent="fetchList">
        <el-form-item label="用户 ID">
          <el-input-number v-model="query.user_id" :min="0" :controls="false" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" style="width: 140px">
            <el-option :value="-1" label="全部" />
            <el-option :value="0" label="待处理" />
            <el-option :value="1" label="生成中" />
            <el-option :value="2" label="已完成" />
            <el-option :value="3" label="失败" />
            <el-option :value="4" label="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-table v-loading="loading" :data="rows" row-key="id" border>
        <el-table-column prop="id" label="ID" width="72" />
        <el-table-column prop="user_id" label="用户" width="88" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            {{ scope?.row ? (statusMap[scope.row.status] ?? scope.row.status) : "" }}
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="80" />
        <el-table-column prop="book_id" label="BookID" width="88" />
        <el-table-column prop="created_at" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button v-if="scope?.row" link type="primary" @click="goDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.page_size"
          :total="total"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="fetchList"
          @size-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>
