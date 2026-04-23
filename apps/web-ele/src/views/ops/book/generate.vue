<script lang="ts" setup>
import type { AdminCreateBookBody, BookCategoryAdminItem } from "#/api/types";

import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { ElMessage } from "element-plus";

import { getAdminBookCategoriesApi, postAdminGenerateBookApi } from "#/api";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const submitting = ref(false);
const categories = ref<BookCategoryAdminItem[]>([]);

const form = reactive<AdminCreateBookBody>({
  author_id: 0,
  age: "3-6岁",
  theme: "",
  pages: 8,
  experience_mode: 3,
  main_character_name: "",
  main_character_type: "",
  main_character_appearance: "",
  main_character_personality: "",
  illustration_style: "温暖柔和的儿童插画",
  color_style: "明亮温暖",
  visual_mood: "温馨、可爱",
  user_prompt: "",
});

const needVisual = computed(
  () => form.experience_mode === 1 || form.experience_mode === 3,
);

const themeOptions = computed(() =>
  categories.value.filter((c) => c.enabled).map((c) => c.name),
);

watch(
  () => form.experience_mode,
  (m) => {
    if (m === 2) {
      form.illustration_style = "";
      form.color_style = "";
      form.visual_mood = "";
    } else {
      if (!form.illustration_style) {
        form.illustration_style = "温暖柔和的儿童插画";
      }
      if (!form.color_style) {
        form.color_style = "明亮温暖";
      }
      if (!form.visual_mood) {
        form.visual_mood = "温馨、可爱";
      }
    }
  },
);

async function loadCategories() {
  loading.value = true;
  try {
    categories.value = await getAdminBookCategoriesApi();
  } catch {
    ElMessage.error("加载主题分类失败");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const uid = route.query.user_id;
  if (uid !== undefined && uid !== null && String(uid) !== "") {
    const n = Number(uid);
    if (Number.isFinite(n) && n > 0) {
      form.author_id = n;
    }
  }
  loadCategories();
});

async function submit() {
  if (!form.author_id || form.author_id < 1) {
    ElMessage.warning("请填写有效的 App 用户 ID（作者）");
    return;
  }
  if (!form.theme?.trim()) {
    ElMessage.warning("请选择故事主题");
    return;
  }
  if (needVisual.value) {
    if (!form.illustration_style?.trim() || !form.color_style?.trim() || !form.visual_mood?.trim()) {
      ElMessage.warning("纯阅读/普通模式需填写画风、色彩与氛围");
      return;
    }
  }
  submitting.value = true;
  try {
    const res = await postAdminGenerateBookApi({ ...form });
    ElMessage.success("任务已创建，正在排队生成");
    if (res?.task_id) {
      router.push({
        name: "OpsGenTaskDetail",
        params: { id: String(res.task_id) },
      });
    } else {
      await router.push({ name: "OpsGenTasks" });
    }
  } catch {
    ElMessage.error("创建失败");
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div v-loading="loading" class="p-5">
    <el-page-header
      class="mb-4"
      content="生成绘本"
      @back="router.push({ name: 'OpsBooks' })"
    />
    <p class="mb-4 text-sm opacity-80">
      参数与 App 端一致，绘本将归属到所填的 App 用户；可从「App 用户详情」以 `?user_id=` 带参打开本页。
    </p>
    <el-card shadow="never" class="max-w-3xl">
      <el-form label-width="140px" @submit.prevent="submit">
        <el-form-item label="作者（用户 ID）" required>
          <el-input-number
            v-model="form.author_id"
            :min="1"
            :step="1"
            class="max-w-xs"
            style="width: 100%"
            controls-position="right"
            placeholder="App 用户表 users.id，可在「App 用户」中查看"
          />
        </el-form-item>
        <el-form-item label="适读年龄" required>
          <el-input v-model="form.age" placeholder="如 3-6岁" />
        </el-form-item>
        <el-form-item label="故事主题" required>
          <el-select
            v-model="form.theme"
            class="w-full"
            clearable
            filterable
            placeholder="从已启用分类选择"
          >
            <el-option
              v-for="name in themeOptions"
              :key="name"
              :label="name"
              :value="name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="页数" required>
          <el-input-number
            v-model="form.pages"
            :min="1"
            :max="30"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="体验模式" required>
          <el-select v-model="form.experience_mode" class="w-full max-w-md">
            <el-option :value="1" label="纯阅读（插图+文案，需画风）" />
            <el-option
              :value="2"
              label="纯听（不生成插图，画风可不填）"
            />
            <el-option
              :value="3"
              label="普通（插图+文案+预留听读，需画风）"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主角名" required>
          <el-input v-model="form.main_character_name" />
        </el-form-item>
        <el-form-item label="主角类型" required>
          <el-input v-model="form.main_character_type" placeholder="如 小兔子" />
        </el-form-item>
        <el-form-item label="外观" required>
          <el-input
            v-model="form.main_character_appearance"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="性格" required>
          <el-input
            v-model="form.main_character_personality"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <template v-if="needVisual">
          <el-form-item label="画风" required>
            <el-input v-model="form.illustration_style" />
          </el-form-item>
          <el-form-item label="色彩" required>
            <el-input v-model="form.color_style" />
          </el-form-item>
          <el-form-item label="氛围" required>
            <el-input v-model="form.visual_mood" />
          </el-form-item>
        </template>
        <el-form-item label="内容期望">
          <el-input
            v-model="form.user_prompt"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="可选，对故事走向的补充说明"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" native-type="submit">
            创建生成任务
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
