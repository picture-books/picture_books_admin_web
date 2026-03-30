<script lang="ts" setup>
import type { AppUserDetailItem } from "#/api/types";

import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAccessStore } from "@vben/stores";

import { ElMessage, ElMessageBox } from "element-plus";

import { getAppUserDetailApi, patchAppUserDevicePolicyApi, patchAppUserStatusApi } from "#/api";

const route = useRoute();
const router = useRouter();
const accessStore = useAccessStore();
const loading = ref(false);
const user = ref<AppUserDetailItem | null>(null);
const savingDevicePolicy = ref(false);

const id = computed(() => Number(route.params.id));
const canEditDevicePolicy = computed(() =>
  (accessStore.accessCodes || []).includes("appuser:device_policy"),
);

async function load() {
  if (!Number.isFinite(id.value)) return;
  loading.value = true;
  try {
    user.value = await getAppUserDetailApi(id.value);
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

async function toggleStatus() {
  if (!user.value) return;
  const next = user.value.status === 1 ? 0 : 1;
  const label = next === 1 ? "启用" : "禁用";
  try {
    await ElMessageBox.confirm(`确认${label}该用户？`, "提示");
    await patchAppUserStatusApi(user.value.id, next);
    ElMessage.success("已更新");
    await load();
  } catch (error) {
    if (error !== "cancel") ElMessage.error("操作失败");
  }
}

async function saveDevicePolicy() {
  if (!canEditDevicePolicy.value) {
    ElMessage.warning("无权限：缺少 appuser:device_policy");
    return;
  }
  if (!user.value) return;
  const value = user.value.max_devices_override;
  if (value != null && value < 1) {
    ElMessage.warning("设备数上限必须 >= 1");
    return;
  }
  savingDevicePolicy.value = true;
  try {
    await patchAppUserDevicePolicyApi(user.value.id, value ?? null);
    ElMessage.success("已更新");
    await load();
  } catch {
    ElMessage.error("更新失败");
  } finally {
    savingDevicePolicy.value = false;
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
    <el-page-header content="用户详情" @back="router.push({ name: 'OpsAppUsers' })" />
    <el-card v-if="user" class="mt-4" shadow="never">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ user.id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ user.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机">{{ user.phone_mask || "-" }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ user.status === 1 ? "正常" : "禁用" }}
        </el-descriptions-item>
        <el-descriptions-item label="设备上限覆盖">
          {{ user.max_devices_override ?? "跟随系统默认" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ user.created_at }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ user.updated_at }}</el-descriptions-item>
      </el-descriptions>
      <div class="mt-4">
        <el-button v-access:code="['appuser:status']" type="warning" @click="toggleStatus">
          {{ user.status === 1 ? "禁用" : "启用" }}
        </el-button>
      </div>
      <div class="mt-5 rounded-md border border-gray-200 p-4">
        <div class="mb-2 text-sm font-medium">在线设备策略配置</div>
        <div class="mb-3 text-xs text-gray-500">
          为空表示跟随系统默认；设置后该用户将使用覆盖值。
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <el-input-number
            v-model="user.max_devices_override"
            :min="1"
            :max="20"
            placeholder="空表示跟随系统默认"
            controls-position="right"
          />
          <el-button
            :disabled="!canEditDevicePolicy"
            :type="canEditDevicePolicy ? 'default' : 'info'"
            :class="!canEditDevicePolicy ? 'text-gray-400 border-gray-200' : ''"
            @click="user.max_devices_override = null"
          >
            跟随系统默认
          </el-button>
          <el-button
            :disabled="!canEditDevicePolicy"
            type="primary"
            :class="!canEditDevicePolicy ? 'bg-gray-300 border-gray-300 text-white' : ''"
            :loading="savingDevicePolicy"
            @click="saveDevicePolicy"
          >
            保存配置
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
