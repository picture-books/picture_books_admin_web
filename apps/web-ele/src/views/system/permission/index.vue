<script lang="ts" setup>
import type { AdminPermission } from "#/api/types";

import { onMounted, ref } from "vue";

import { getAdminPermissionListApi } from "#/api";

import { ElMessage } from "element-plus";

const loading = ref(false);
const rows = ref<AdminPermission[]>([]);

async function fetchList() {
  loading.value = true;
  try {
    rows.value = await getAdminPermissionListApi();
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(fetchList);
</script>

<template>
  <div class="p-5">
    <el-card shadow="never">
      <el-table v-loading="loading" :data="rows" row-key="id" border>
        <el-table-column prop="id" label="ID" width="72" />
        <el-table-column prop="code" label="权限码" min-width="160" />
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="kind" label="类型" width="88" />
        <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>
