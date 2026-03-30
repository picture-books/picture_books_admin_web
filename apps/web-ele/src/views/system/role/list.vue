<script lang="ts" setup>
import type { AdminPermission, AdminRole } from "#/api/types";

import { onMounted, reactive, ref } from "vue";

import {
  createAdminRoleApi,
  deleteAdminRoleApi,
  getAdminPermissionListApi,
  getAdminRoleDetailApi,
  getAdminRoleListApi,
  updateAdminRoleApi,
} from "#/api";

import { ElMessage, ElMessageBox } from "element-plus";

const loading = ref(false);
const rows = ref<AdminRole[]>([]);

const dialogVisible = ref(false);
const dialogSaving = ref(false);
const editingId = ref<number | null>(null);
const permOptions = ref<AdminPermission[]>([]);

const form = reactive({
  code: "",
  name: "",
  description: "",
  permission_ids: [] as number[],
});

async function loadPerms() {
  try {
    permOptions.value = await getAdminPermissionListApi();
  } catch {
    /* ignore */
  }
}

async function fetchList() {
  loading.value = true;
  try {
    rows.value = await getAdminRoleListApi();
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  form.code = "";
  form.name = "";
  form.description = "";
  form.permission_ids = [];
  dialogVisible.value = true;
}

async function openEdit(row: AdminRole) {
  if (row.is_builtin) {
    ElMessage.info("内置角色请谨慎编辑权限");
  }
  editingId.value = row.id;
  dialogVisible.value = true;
  dialogSaving.value = true;
  try {
    const detail = await getAdminRoleDetailApi(row.id);
    form.code = detail.code;
    form.name = detail.name;
    form.description = detail.description ?? "";
    form.permission_ids = (detail.permissions ?? []).map((p) => p.id);
  } catch {
    ElMessage.error("加载详情失败");
    dialogVisible.value = false;
  } finally {
    dialogSaving.value = false;
  }
}

async function save() {
  dialogSaving.value = true;
  try {
    if (editingId.value == null) {
      if (!form.code || !form.name) {
        ElMessage.warning("请填写编码与名称");
        return;
      }
      await createAdminRoleApi({
        code: form.code,
        name: form.name,
        description: form.description,
        permission_ids: form.permission_ids,
      });
      ElMessage.success("已创建");
    } else {
      await updateAdminRoleApi(editingId.value, {
        name: form.name,
        description: form.description,
        permission_ids: form.permission_ids,
      });
      ElMessage.success("已保存");
    }
    dialogVisible.value = false;
    fetchList();
  } catch {
    ElMessage.error("保存失败");
  } finally {
    dialogSaving.value = false;
  }
}

async function remove(row: AdminRole) {
  if (row.is_builtin) {
    ElMessage.warning("内置角色不可删除");
    return;
  }
  try {
    await ElMessageBox.confirm("确认删除该角色？", "提示", { type: "warning" });
    await deleteAdminRoleApi(row.id);
    ElMessage.success("已删除");
    fetchList();
  } catch (e) {
    if (e !== "cancel") ElMessage.error("删除失败");
  }
}

onMounted(() => {
  loadPerms();
  fetchList();
});
</script>

<template>
  <div class="p-5">
    <el-card shadow="never">
      <div class="mb-4">
        <el-button v-access:code="['role:write']" type="primary" @click="openCreate">
          新建角色
        </el-button>
      </div>
      <el-table v-loading="loading" :data="rows" row-key="id" border>
        <el-table-column prop="id" label="ID" width="72" />
        <el-table-column prop="code" label="编码" min-width="120" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column label="内置" width="80">
          <template #default="scope">
            {{ scope?.row?.is_builtin ? "是" : "否" }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <el-button
                v-access:code="['role:write']"
                link
                type="primary"
                @click="openEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-access:code="['role:delete']"
                link
                type="danger"
                :disabled="scope.row.is_builtin"
                @click="remove(scope.row)"
              >
                删除
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId == null ? '新建角色' : '编辑角色'"
      width="560px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item v-if="editingId == null" label="编码">
          <el-input v-model="form.code" placeholder="英文标识" />
        </el-form-item>
        <el-form-item v-else label="编码">
          <el-input v-model="form.code" disabled />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="权限">
          <el-select
            v-model="form.permission_ids"
            multiple
            filterable
            placeholder="选择权限点"
            style="width: 100%"
          >
            <el-option
              v-for="p in permOptions"
              :key="p.id"
              :label="`${p.name} (${p.code})`"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogSaving" @click="save"> 保存 </el-button>
      </template>
    </el-dialog>
  </div>
</template>
