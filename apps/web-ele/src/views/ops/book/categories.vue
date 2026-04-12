<script lang="ts" setup>
import type { BookCategoryAdminItem } from "#/api/types";

import { onMounted, reactive, ref } from "vue";

import { ElMessage, ElMessageBox } from "element-plus";

import {
  createAdminBookCategoryApi,
  deleteAdminBookCategoryApi,
  getAdminBookCategoriesApi,
  updateAdminBookCategoryApi,
} from "#/api";

const loading = ref(false);
const list = ref<BookCategoryAdminItem[]>([]);

const dialogVisible = ref(false);
const dialogSaving = ref(false);
const editingId = ref<null | number>(null);
const form = reactive({
  name: "",
  sort_order: 0,
  enabled: true,
});

async function load() {
  loading.value = true;
  try {
    list.value = await getAdminBookCategoriesApi();
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  form.name = "";
  form.sort_order = list.value.length;
  form.enabled = true;
  dialogVisible.value = true;
}

function openEdit(row: BookCategoryAdminItem) {
  editingId.value = row.id;
  form.name = row.name;
  form.sort_order = row.sort_order;
  form.enabled = row.enabled;
  dialogVisible.value = true;
}

async function saveDialog() {
  const name = form.name?.trim() ?? "";
  if (!name) {
    ElMessage.warning("请填写分类名称");
    return;
  }
  dialogSaving.value = true;
  try {
    if (editingId.value == null) {
      await createAdminBookCategoryApi({
        name,
        sort_order: form.sort_order,
        enabled: form.enabled,
      });
      ElMessage.success("已创建");
    } else {
      await updateAdminBookCategoryApi(editingId.value, {
        name,
        sort_order: form.sort_order,
        enabled: form.enabled,
      });
      ElMessage.success("已保存");
    }
    dialogVisible.value = false;
    await load();
  } catch {
    ElMessage.error("保存失败");
  } finally {
    dialogSaving.value = false;
  }
}

async function toggleEnabled(row: BookCategoryAdminItem) {
  try {
    await updateAdminBookCategoryApi(row.id, { enabled: !row.enabled });
    ElMessage.success("已更新");
    await load();
  } catch {
    ElMessage.error("更新失败");
  }
}

async function removeRow(row: BookCategoryAdminItem) {
  try {
    await ElMessageBox.confirm(
      `确定删除分类「${row.name}」？若有绘本仍使用该主题将无法删除。`,
      "删除确认",
      { type: "warning" },
    );
  } catch {
    return;
  }
  try {
    await deleteAdminBookCategoryApi(row.id);
    ElMessage.success("已删除");
    await load();
  } catch {
    ElMessage.error("删除失败（可能仍有绘本使用该主题）");
  }
}

onMounted(load);
</script>

<template>
  <div class="p-5">
    <el-card shadow="never" header="绘本主题分类">
      <p class="mb-4 text-sm text-gray-600">
        与 App 端
        <code class="rounded bg-gray-100 px-1">GET /api/v1/book-categories</code> 及绘本字段
        <code class="rounded bg-gray-100 px-1">theme</code> 一致；改名不会自动迁移已有绘本。
      </p>
      <div class="mb-3">
        <el-button v-access:code="['book:category_write']" type="primary" @click="openCreate">
          新建分类
        </el-button>
        <el-button @click="load">刷新</el-button>
      </div>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="id" label="ID" width="72" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="sort_order" label="排序" width="88" />
        <el-table-column prop="book_count" label="绘本数" width="88" />
        <el-table-column label="启用" width="88">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">
              {{ row.enabled ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" min-width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              v-access:code="['book:category_write']"
              link
              type="primary"
              @click="openEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-access:code="['book:category_write']"
              link
              type="warning"
              @click="toggleEnabled(row)"
            >
              {{ row.enabled ? "禁用" : "启用" }}
            </el-button>
            <el-button
              v-access:code="['book:category_write']"
              link
              type="danger"
              @click="removeRow(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId == null ? '新建分类' : '编辑分类'"
      width="480px"
      destroy-on-close
    >
      <el-form label-width="88px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :step="1" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogSaving" @click="saveDialog"> 保存 </el-button>
      </template>
    </el-dialog>
  </div>
</template>
