<script lang="ts" setup>
import type { AppUserListItem } from "#/api/types";

import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { useAccessStore } from "@vben/stores";

import { ElMessage } from "element-plus";

import { getAppUserListApi, getDevicePolicyApi, patchAppUserDevicePolicyApi } from "#/api";

const router = useRouter();
const accessStore = useAccessStore();
const loading = ref(false);
const tableData = ref<AppUserListItem[]>([]);
const total = ref(0);
const query = reactive({ page: 1, page_size: 20 });
const canEditDevicePolicy = ref(false);
const maxDevicesDefault = ref(3);

const policyDialogVisible = ref(false);
const policySaving = ref(false);
const editingUser = ref<AppUserListItem | null>(null);
const policyValue = ref<null | number>(null);

function policyText(row: AppUserListItem) {
  const override = row.max_devices_override;
  if (override == null) {
    return `跟随系统（默认 ${maxDevicesDefault.value} 台）`;
  }
  return `用户覆盖 ${override} 台（系统默认 ${maxDevicesDefault.value} 台）`;
}

function effectivePolicy(row: AppUserListItem) {
  return row.max_devices_override ?? maxDevicesDefault.value;
}

async function fetchDevicePolicy() {
  try {
    const res = await getDevicePolicyApi();
    maxDevicesDefault.value = res.max_devices_default || 3;
  } catch {
    // ignore
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await getAppUserListApi({ ...query });
    tableData.value = res.list ?? [];
    total.value = res.total ?? 0;
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

function goDetail(row: AppUserListItem) {
  router.push({ name: "OpsAppUserDetail", params: { id: String(row.id) } });
}

function goSystemPolicyPage() {
  router.push({ name: "SystemDevicePolicy" });
}

function openPolicyDialog(row: AppUserListItem) {
  if (!canEditDevicePolicy.value) {
    ElMessage.warning("无权限：缺少 appuser:device_policy");
    return;
  }
  editingUser.value = row;
  policyValue.value = row.max_devices_override ?? null;
  policyDialogVisible.value = true;
}

async function savePolicy() {
  if (!canEditDevicePolicy.value) {
    ElMessage.warning("无权限：缺少 appuser:device_policy");
    return;
  }
  if (!editingUser.value) return;
  if (policyValue.value != null && policyValue.value < 1) {
    ElMessage.warning("设备数上限必须 >= 1");
    return;
  }
  policySaving.value = true;
  try {
    await patchAppUserDevicePolicyApi(editingUser.value.id, policyValue.value);
    ElMessage.success("已更新");
    policyDialogVisible.value = false;
    await fetchList();
  } catch {
    ElMessage.error("更新失败");
  } finally {
    policySaving.value = false;
  }
}

onMounted(fetchList);
onMounted(fetchDevicePolicy);
onMounted(() => {
  canEditDevicePolicy.value = (accessStore.accessCodes || []).includes("appuser:device_policy");
});
</script>

<template>
  <div class="p-5">
    <el-card shadow="never">
      <div class="mb-4 flex items-center justify-between rounded-md bg-gray-50 p-3">
        <div>
          <div class="text-sm text-gray-600">系统默认同时在线设备数</div>
          <div class="text-lg font-semibold">{{ maxDevicesDefault }} 台</div>
        </div>
        <el-button
          v-access:code="['system:device_policy']"
          type="primary"
          plain
          @click="goSystemPolicyPage"
        >
          去系统配置
        </el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" row-key="id" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone_mask" label="手机" width="120" />
        <el-table-column prop="status" label="状态" width="88">
          <template #default="scope">
            {{ scope?.row == null ? "" : scope.row.status === 1 ? "正常" : "禁用" }}
          </template>
        </el-table-column>
        <el-table-column label="设备策略" min-width="260">
          <template #default="scope">
            <template v-if="scope?.row">
              <div>{{ policyText(scope.row) }}</div>
              <div class="text-xs text-gray-500">当前生效：{{ effectivePolicy(scope.row) }} 台</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <el-button link type="primary" @click="goDetail(scope.row)"> 详情 </el-button>
              <el-button
                :disabled="!canEditDevicePolicy"
                link
                :type="canEditDevicePolicy ? 'success' : 'info'"
                :class="!canEditDevicePolicy ? 'text-gray-400' : ''"
                @click="openPolicyDialog(scope.row)"
              >
                配置设备策略
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

    <el-dialog
      v-model="policyDialogVisible"
      title="配置用户设备策略"
      width="480px"
      destroy-on-close
    >
      <div class="mb-3 text-sm text-gray-600">
        用户：{{ editingUser?.nickname || "-" }}（ID: {{ editingUser?.id || "-" }}）
      </div>
      <div class="mb-3 text-sm text-gray-600">系统默认：{{ maxDevicesDefault }} 台</div>
      <el-form label-width="140px">
        <el-form-item label="用户覆盖上限">
          <el-input-number
            v-model="policyValue"
            :min="1"
            :max="20"
            controls-position="right"
            placeholder="空表示跟随系统默认"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="policyDialogVisible = false">取消</el-button>
        <el-button
          :disabled="!canEditDevicePolicy"
          :type="canEditDevicePolicy ? 'default' : 'info'"
          :class="!canEditDevicePolicy ? 'text-gray-400 border-gray-200' : ''"
          @click="policyValue = null"
        >
          跟随系统默认
        </el-button>
        <el-button
          type="primary"
          :disabled="!canEditDevicePolicy"
          :class="!canEditDevicePolicy ? 'bg-gray-300 border-gray-300 text-white' : ''"
          :loading="policySaving"
          @click="savePolicy"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
