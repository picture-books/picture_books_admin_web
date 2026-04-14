<script lang="ts" setup>
import type { BookgenAIProviderRow } from "#/api/types";

import { computed, onMounted, reactive, ref } from "vue";

import { ElMessage, ElMessageBox } from "element-plus";

import {
  activateBookgenAIProviderApi,
  createBookgenAIProviderApi,
  deleteBookgenAIProviderApi,
  getBookgenAIProvidersApi,
  updateBookgenAIProviderApi,
} from "#/api";

const CAP_OPTS = [
  { label: "文生文（剧本）", value: "story_llm" },
  { label: "文生图（插图/封面）", value: "text_to_image" },
  { label: "语音 TTS（预留）", value: "speech" },
  { label: "视频（预留）", value: "video" },
] as const;

const DRIVER_BY_CAP: Record<string, { label: string; value: string }[]> = {
  story_llm: [{ label: "OpenAI 兼容 Chat", value: "openai_compatible_chat" }],
  text_to_image: [{ label: "ModelScope 文生图", value: "modelscope_image" }],
  speech: [{ label: "未接入（占位）", value: "none" }],
  video: [{ label: "未接入（占位）", value: "none" }],
};

function capLabel(v: string) {
  return CAP_OPTS.find((c) => c.value === v)?.label ?? v;
}

function driverLabel(cap: string, driver: string) {
  const list = DRIVER_BY_CAP[cap] ?? [];
  return list.find((d) => d.value === driver)?.label ?? driver;
}

const loading = ref(false);
const rows = ref<BookgenAIProviderRow[]>([]);

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const editingId = ref<number>(0);

const form = reactive({
  capability: "story_llm",
  driver: "openai_compatible_chat",
  name: "",
  base_url: "",
  api_key: "",
  /** 候选模型（多选）；空表示仅用 model 单字段 */
  models: [] as string[],
  model: "",
  extra: "",
  enabled: true,
});

const driverChoices = computed(() => DRIVER_BY_CAP[form.capability] ?? []);

/** 当前选用下拉的选项 = 候选 + 当前值（避免列表未同步时选不中） */
const modelPickOptions = computed(() => {
  const s = new Set<string>();
  for (const m of form.models) {
    const t = m.trim();
    if (t) {
      s.add(t);
    }
  }
  const cur = form.model.trim();
  if (cur) {
    s.add(cur);
  }
  return [...s];
});

async function load() {
  loading.value = true;
  try {
    rows.value = await getBookgenAIProvidersApi();
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  dialogMode.value = "create";
  editingId.value = 0;
  form.capability = "story_llm";
  form.driver = "openai_compatible_chat";
  form.name = "";
  form.base_url = "";
  form.api_key = "";
  form.models = [];
  form.model = "";
  form.extra = "";
  form.enabled = true;
  dialogVisible.value = true;
}

function openEdit(row: BookgenAIProviderRow) {
  dialogMode.value = "edit";
  editingId.value = row.id;
  form.capability = row.capability;
  form.driver = row.driver;
  form.name = row.name;
  form.base_url = row.base_url;
  form.api_key = "";
  form.models = [...(row.models ?? [])];
  form.model = row.model ?? "";
  form.extra = row.extra;
  form.enabled = row.enabled;
  dialogVisible.value = true;
}

function onCapChange() {
  const list = DRIVER_BY_CAP[form.capability];
  const first = list?.[0];
  if (first) {
    form.driver = first.value;
  }
}

async function submitDialog() {
  if (!form.name.trim()) {
    ElMessage.warning("请填写名称");
    return;
  }
  const isAux = form.capability === "speech" || form.capability === "video";
  const trimmedModels = form.models.map((m) => m.trim()).filter(Boolean);
  if (
    (form.capability === "story_llm" || form.capability === "text_to_image") &&
    trimmedModels.length > 0 &&
    !trimmedModels.includes(form.model.trim())
  ) {
    ElMessage.warning("当前选用模型须为候选列表中的一项");
    return;
  }
  if (!isAux && (!form.base_url.trim() || !form.api_key.trim())) {
    if (dialogMode.value === "create") {
      ElMessage.warning("请填写 Base URL 与 API Key");
      return;
    }
    if (!form.base_url.trim()) {
      ElMessage.warning("请填写 Base URL");
      return;
    }
  }
  try {
    if (dialogMode.value === "create") {
      await createBookgenAIProviderApi({
        capability: form.capability,
        driver: form.driver,
        name: form.name.trim(),
        base_url: isAux ? "" : form.base_url.trim(),
        api_key: isAux ? "" : form.api_key.trim(),
        models: trimmedModels,
        model: form.model.trim(),
        extra: form.extra.trim(),
        enabled: form.enabled,
      });
      ElMessage.success("已创建");
    } else {
      const body: Parameters<typeof updateBookgenAIProviderApi>[1] = {
        name: form.name.trim(),
        base_url: form.base_url.trim(),
        models: trimmedModels,
        model: form.model.trim(),
        extra: form.extra.trim(),
        driver: form.driver,
        enabled: form.enabled,
      };
      if (form.api_key.trim()) {
        body.api_key = form.api_key.trim();
      }
      await updateBookgenAIProviderApi(editingId.value, body);
      ElMessage.success("已保存");
    }
    dialogVisible.value = false;
    await load();
  } catch {
    ElMessage.error(dialogMode.value === "create" ? "创建失败" : "保存失败");
  }
}

async function onActivate(row: BookgenAIProviderRow) {
  try {
    await ElMessageBox.confirm(
      `将「${row.name}」设为 ${capLabel(row.capability)} 的当前服务商？`,
      "确认",
      { type: "warning" },
    );
    await activateBookgenAIProviderApi(row.id);
    ElMessage.success("已切换");
    await load();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
    }
  }
}

async function onDelete(row: BookgenAIProviderRow) {
  try {
    await ElMessageBox.confirm(`删除「${row.name}」？`, "确认", { type: "warning" });
    await deleteBookgenAIProviderApi(row.id);
    ElMessage.success("已删除");
    await load();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
}

onMounted(load);
</script>

<template>
  <div class="p-5">
    <el-card v-loading="loading" shadow="never" header="绘本生成 AI 服务商">
      <div class="mb-3 flex flex-wrap gap-2">
        <el-button v-access:code="['system:bookgen_ai']" type="primary" @click="openCreate">
          新建配置
        </el-button>
      </div>
      <el-table :data="rows" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="72" />
        <el-table-column label="能力" width="160">
          <template #default="{ row }: { row: BookgenAIProviderRow }">
            {{ capLabel(row.capability) }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column label="实现" min-width="140">
          <template #default="{ row }: { row: BookgenAIProviderRow }">
            {{ driverLabel(row.capability, row.driver) }}
          </template>
        </el-table-column>
        <el-table-column prop="base_url" label="Base URL" min-width="200" show-overflow-tooltip />
        <el-table-column label="模型" min-width="200">
          <template #default="{ row }: { row: BookgenAIProviderRow }">
            <span v-if="(row.models?.length ?? 0) > 0">
              <el-tag size="small" type="success">{{ row.model || "—" }}</el-tag>
              <span class="ml-1 text-xs opacity-70">候选 {{ row.models?.length ?? 0 }}</span>
            </span>
            <span v-else>{{ row.model || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="密钥" width="88">
          <template #default="{ row }: { row: BookgenAIProviderRow }">
            {{ row.api_key_set ? "已配置" : "未配置" }}
          </template>
        </el-table-column>
        <el-table-column label="启用" width="80">
          <template #default="{ row }: { row: BookgenAIProviderRow }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前" width="80">
          <template #default="{ row }: { row: BookgenAIProviderRow }">
            <el-tag v-if="row.is_active" type="warning" size="small">当前</el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }: { row: BookgenAIProviderRow }">
            <el-button
              v-access:code="['system:bookgen_ai']"
              link
              type="primary"
              :disabled="!row.enabled || row.is_active"
              @click="onActivate(row)"
            >
              设为当前
            </el-button>
            <el-button
              v-access:code="['system:bookgen_ai']"
              link
              type="primary"
              @click="openEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-access:code="['system:bookgen_ai']"
              link
              type="danger"
              :disabled="row.is_active"
              @click="onDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建 AI 服务商' : '编辑 AI 服务商'"
      width="560px"
      destroy-on-close
    >
      <el-form label-width="120px">
        <el-form-item v-if="dialogMode === 'create'" label="能力">
          <el-select v-model="form.capability" class="w-full" @change="onCapChange">
            <el-option v-for="c in CAP_OPTS" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-else label="能力">
          <span>{{ capLabel(form.capability) }}</span>
        </el-form-item>
        <el-form-item label="实现">
          <el-select v-model="form.driver" class="w-full">
            <el-option
              v-for="d in driverChoices"
              :key="d.value"
              :label="d.label"
              :value="d.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item
          v-if="form.capability !== 'speech' && form.capability !== 'video'"
          label="Base URL"
        >
          <el-input v-model="form.base_url" placeholder="https://..." />
        </el-form-item>
        <el-form-item
          v-if="form.capability !== 'speech' && form.capability !== 'video'"
          label="API Key"
        >
          <el-input
            v-model="form.api_key"
            type="password"
            show-password
            :placeholder="dialogMode === 'edit' ? '不修改请留空' : ''"
          />
        </el-form-item>
        <template v-if="form.capability === 'story_llm' || form.capability === 'text_to_image'">
          <el-form-item label="候选模型">
            <el-select
              v-model="form.models"
              class="w-full"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="可添加多个，回车或选择确认"
            />
          </el-form-item>
          <el-form-item label="当前选用">
            <el-select
              v-if="form.models.some((m) => m.trim())"
              v-model="form.model"
              class="w-full"
              filterable
              placeholder="从候选中选择当前使用的模型"
            >
              <el-option v-for="m in modelPickOptions" :key="m" :label="m" :value="m" />
            </el-select>
            <el-input
              v-else
              v-model="form.model"
              placeholder="未配置候选列表时，直接填写单个模型名"
            />
          </el-form-item>
        </template>
        <el-form-item label="扩展 JSON">
          <el-input v-model="form.extra" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
