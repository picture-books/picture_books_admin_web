<script lang="ts" setup>
import type { AdminBook } from "#/api/types";

import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import {
  approveAdminBookApi,
  deleteAdminBookApi,
  getAdminBookListApi,
  rejectAdminBookApi,
  unpublishAdminBookApi,
} from "#/api";

import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const loading = ref(false);
const rows = ref<AdminBook[]>([]);
const total = ref(0);
const query = reactive({
  page: 1,
  page_size: 20,
  status: 0,
  title: "",
});

const statusLabel: Record<number, string> = {
  0: "全部",
  1: "草稿",
  2: "已发布",
  3: "已下架",
  4: "待审核",
  5: "已拒绝",
};

async function fetchList() {
  loading.value = true;
  try {
    const params = {
      page: query.page,
      page_size: query.page_size,
      title: query.title || undefined,
      status: query.status > 0 ? query.status : undefined,
    };
    const res = await getAdminBookListApi(params);
    rows.value = res.list ?? [];
    total.value = res.total ?? 0;
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

function goDetail(row: AdminBook) {
  router.push({ name: "OpsBookDetail", params: { id: String(row.id) } });
}

async function doApprove(row: AdminBook) {
  try {
    await approveAdminBookApi(row.id);
    ElMessage.success("审核通过");
    fetchList();
  } catch {
    ElMessage.error("操作失败");
  }
}

async function doReject(row: AdminBook) {
  try {
    await rejectAdminBookApi(row.id);
    ElMessage.success("已拒绝");
    fetchList();
  } catch {
    ElMessage.error("操作失败");
  }
}

async function doUnpublish(row: AdminBook) {
  try {
    await unpublishAdminBookApi(row.id);
    ElMessage.success("已下架");
    fetchList();
  } catch {
    ElMessage.error("操作失败");
  }
}

async function doDelete(row: AdminBook) {
  try {
    await ElMessageBox.confirm("确认删除该绘本？", "危险操作", {
      type: "warning",
    });
    await deleteAdminBookApi(row.id);
    ElMessage.success("已删除");
    fetchList();
  } catch (e) {
    if (e !== "cancel") ElMessage.error("删除失败");
  }
}

onMounted(fetchList);
</script>

<template>
  <div class="p-5">
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" @submit.prevent="fetchList">
        <el-form-item label="标题">
          <el-input v-model="query.title" clearable placeholder="模糊搜索" style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" style="width: 120px">
            <el-option :value="0" label="全部" />
            <el-option :value="1" label="草稿" />
            <el-option :value="2" label="已发布" />
            <el-option :value="3" label="已下架" />
            <el-option :value="4" label="待审核" />
            <el-option :value="5" label="已拒绝" />
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
        <el-table-column prop="title" label="书名" min-width="160" />
        <el-table-column label="作者" min-width="100">
          <template #default="scope">
            {{ scope?.row?.author?.nickname ?? scope?.row?.author_id }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="96">
          <template #default="scope">
            {{ scope?.row ? (statusLabel[scope.row.status] ?? scope.row.status) : "" }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <el-button link type="primary" @click="goDetail(scope.row)">详情</el-button>
              <el-button
                v-access:code="['book:approve']"
                link
                type="success"
                :disabled="scope.row.status !== 4"
                @click="doApprove(scope.row)"
              >
                通过
              </el-button>
              <el-button
                v-access:code="['book:reject']"
                link
                type="danger"
                :disabled="scope.row.status !== 4"
                @click="doReject(scope.row)"
              >
                拒绝
              </el-button>
              <el-button
                v-access:code="['book:unpublish']"
                link
                type="warning"
                :disabled="scope.row.status !== 2"
                @click="doUnpublish(scope.row)"
              >
                下架
              </el-button>
              <el-button
                v-access:code="['book:delete']"
                link
                type="danger"
                @click="doDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
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
