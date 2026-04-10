<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { ElMessage } from "element-plus";

import { getAppAboutApi, updateAppAboutApi } from "#/api";

const loading = ref(false);
const saving = ref(false);
const content = ref("");

async function load() {
  loading.value = true;
  try {
    const res = await getAppAboutApi();
    content.value = res.content ?? "";
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

async function save() {
  const text = content.value?.trim() ?? "";
  if (!text) {
    ElMessage.warning("文案不能为空");
    return;
  }
  saving.value = true;
  try {
    const res = await updateAppAboutApi(content.value);
    content.value = res.content ?? content.value;
    ElMessage.success("已保存，App 端将读取更新后的文案");
  } catch {
    ElMessage.error("保存失败");
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="p-5">
    <el-card v-loading="loading" shadow="never" header="App「关于绘本故事」文案">
      <p class="mb-3 text-sm text-gray-600">
        对应 App 个人中心「关于绘本故事」；C 端接口
        <code class="rounded bg-gray-100 px-1">GET /api/v1/app/about</code>
        ，纯文本、支持换行。
      </p>
      <el-input
        v-model="content"
        type="textarea"
        :rows="16"
        maxlength="65535"
        show-word-limit
        placeholder="在此编辑展示文案…"
      />
      <div class="mt-4">
        <el-button
          v-access:code="['system:app_about']"
          type="primary"
          :loading="saving"
          @click="save"
        >
          保存
        </el-button>
      </div>
    </el-card>
  </div>
</template>
