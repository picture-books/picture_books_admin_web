<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";

import { ElMessage } from "element-plus";

import { getDoubaoTtsApi, updateDoubaoTtsApi } from "#/api";

const loading = ref(false);
const saving = ref(false);

const form = reactive({
  app_id: "",
  resource_id: "",
  speaker: "",
  base_url: "",
  poll_every_ms: 500,
  query_timeout_sec: 900,
  access_key: "",
  access_key_set: false,
});

async function load() {
  loading.value = true;
  try {
    const res = await getDoubaoTtsApi();
    form.app_id = res.app_id ?? "";
    form.resource_id = res.resource_id ?? "";
    form.speaker = res.speaker ?? "";
    form.base_url = res.base_url ?? "";
    form.poll_every_ms = res.poll_every_ms ?? 500;
    form.query_timeout_sec = res.query_timeout_sec ?? 900;
    form.access_key_set = res.access_key_set ?? false;
    form.access_key = "";
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!form.app_id.trim() || !form.resource_id.trim() || !form.speaker.trim()) {
    ElMessage.warning("请填写 AppID、ResourceID、Speaker");
    return;
  }
  if (form.poll_every_ms < 100) {
    ElMessage.warning("轮询间隔建议 ≥ 100ms");
    return;
  }
  if (form.query_timeout_sec < 60) {
    ElMessage.warning("查询超时建议 ≥ 60 秒");
    return;
  }
  saving.value = true;
  try {
    if (!form.access_key_set && !form.access_key.trim()) {
      ElMessage.warning("请填写 AccessKey（当前未检测到已配置密钥）");
      saving.value = false;
      return;
    }
    const body = {
      app_id: form.app_id.trim(),
      resource_id: form.resource_id.trim(),
      speaker: form.speaker.trim(),
      base_url: form.base_url.trim(),
      poll_every_ms: form.poll_every_ms,
      query_timeout_sec: form.query_timeout_sec,
      ...(form.access_key.trim() ? { access_key: form.access_key.trim() } : {}),
    };
    const res = await updateDoubaoTtsApi(body);
    form.access_key_set = res.access_key_set ?? false;
    form.access_key = "";
    ElMessage.success("保存成功");
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
    <el-card v-loading="loading" shadow="never" header="豆包语音合成（纯听绘本）">
      <p class="mb-4 text-sm text-gray-600">
        配置写入业务库并与配置文件合并；Worker 每次纯听任务会读取最新合并结果。密钥不会在列表中回显，仅显示是否已配置。
      </p>
      <el-form label-width="180px" style="max-width: 640px">
        <el-form-item label="AppID">
          <el-input v-model="form.app_id" placeholder="doubao_tts.app_id" clearable />
        </el-form-item>
        <el-form-item label="AccessKey">
          <el-input
            v-model="form.access_key"
            type="password"
            show-password
            :placeholder="form.access_key_set ? '已配置，留空则不修改' : '未配置时必填（保存前请确保其他字段已填）'"
            clearable
          />
        </el-form-item>
        <el-form-item label="ResourceID">
          <el-input v-model="form.resource_id" placeholder="如 seed-tts-2.0" clearable />
        </el-form-item>
        <el-form-item label="Speaker（voice_type）">
          <el-input v-model="form.speaker" placeholder="与 ResourceID 同属豆包文档同一模型分表" clearable />
        </el-form-item>
        <el-form-item label="BaseURL（可选）">
          <el-input v-model="form.base_url" placeholder="默认可空，使用 SDK 默认域名" clearable />
        </el-form-item>
        <el-form-item label="轮询间隔（毫秒）">
          <el-input-number v-model="form.poll_every_ms" :min="100" :max="60_000" controls-position="right" />
        </el-form-item>
        <el-form-item label="查询超时（秒）">
          <el-input-number v-model="form.query_timeout_sec" :min="60" :max="7200" controls-position="right" />
        </el-form-item>
      </el-form>
      <el-button
        v-access:code="['system:doubao_tts']"
        type="primary"
        :loading="saving"
        @click="save"
      >
        保存
      </el-button>
    </el-card>
  </div>
</template>
