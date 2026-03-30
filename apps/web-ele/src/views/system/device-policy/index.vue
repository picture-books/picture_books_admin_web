<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { getDevicePolicyApi, updateDevicePolicyApi } from "#/api";

import { ElMessage } from "element-plus";

const loading = ref(false);
const saving = ref(false);
const maxDevicesDefault = ref(3);

async function loadPolicy() {
  loading.value = true;
  try {
    const res = await getDevicePolicyApi();
    maxDevicesDefault.value = res.max_devices_default || 3;
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

async function savePolicy() {
  if (maxDevicesDefault.value < 1) {
    ElMessage.warning("设备数上限必须 >= 1");
    return;
  }
  saving.value = true;
  try {
    const res = await updateDevicePolicyApi(maxDevicesDefault.value);
    maxDevicesDefault.value = res.max_devices_default || maxDevicesDefault.value;
    ElMessage.success("保存成功");
  } catch {
    ElMessage.error("保存失败");
  } finally {
    saving.value = false;
  }
}

onMounted(loadPolicy);
</script>

<template>
  <div class="p-5">
    <el-card v-loading="loading" shadow="never" header="登录设备策略">
      <el-form label-width="220px" style="max-width: 560px">
        <el-form-item label="默认最大在线设备数">
          <el-input-number
            v-model="maxDevicesDefault"
            :min="1"
            :max="20"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <el-button
        v-access:code="['system:device_policy']"
        type="primary"
        :loading="saving"
        @click="savePolicy"
      >
        保存
      </el-button>
    </el-card>
  </div>
</template>
