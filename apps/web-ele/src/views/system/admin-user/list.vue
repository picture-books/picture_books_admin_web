<script lang="ts" setup>
import type { AdminRole, AdminUserDetail, AdminUserRow } from "#/api/types";

import { onMounted, reactive, ref } from "vue";

import { ElMessage, ElMessageBox } from "element-plus";

import {
  createAdminUserApi,
  deleteAdminUserApi,
  getAdminRoleListApi,
  getAdminUserDetailApi,
  getAdminUserListApi,
  updateAdminUserApi,
} from "#/api";

const loading = ref(false);
const rows = ref<AdminUserRow[]>([]);
const total = ref(0);
const query = reactive({ page: 1, page_size: 20 });

const dialogVisible = ref(false);
const dialogSaving = ref(false);
const editingId = ref<null | number>(null);
const rolesOptions = ref<AdminRole[]>([]);

const form = reactive({
  username: "",
  password: "",
  real_name: "",
  status: 1,
  role_ids: [] as number[],
  new_password: "",
});

async function loadRoles() {
  try {
    rolesOptions.value = await getAdminRoleListApi();
  } catch {
    /* ignore */
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await getAdminUserListApi({ ...query });
    rows.value = res.list ?? [];
    total.value = res.total ?? 0;
  } catch {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  form.username = "";
  form.password = "";
  form.real_name = "";
  form.status = 1;
  form.role_ids = [];
  form.new_password = "";
  dialogVisible.value = true;
}

async function openEdit(row: AdminUserRow) {
  editingId.value = row.id;
  form.new_password = "";
  dialogVisible.value = true;
  dialogSaving.value = true;
  try {
    const detail: AdminUserDetail = await getAdminUserDetailApi(row.id);
    form.username = detail.username;
    form.password = "";
    form.real_name = detail.real_name;
    form.status = detail.status;
    form.role_ids = [...(detail.role_ids ?? [])];
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
      if (!form.username || !form.password) {
        ElMessage.warning("请填写用户名与密码");
        return;
      }
      await createAdminUserApi({
        username: form.username,
        password: form.password,
        real_name: form.real_name,
        role_ids: form.role_ids,
      });
      ElMessage.success("已创建");
    } else {
      await updateAdminUserApi(editingId.value, {
        real_name: form.real_name,
        status: form.status,
        role_ids: form.role_ids,
        new_password: form.new_password || undefined,
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

async function remove(row: AdminUserRow) {
  try {
    await ElMessageBox.confirm("确认删除该管理员？", "提示", {
      type: "warning",
    });
    await deleteAdminUserApi(row.id);
    ElMessage.success("已删除");
    fetchList();
  } catch (error) {
    if (error !== "cancel") ElMessage.error("删除失败");
  }
}

onMounted(() => {
  loadRoles();
  fetchList();
});
</script>

<template>
  <div class="p-5">
    <el-card shadow="never">
      <div class="mb-4">
        <el-button v-access:code="['adminuser:write']" type="primary" @click="openCreate">
          新建管理员
        </el-button>
      </div>
      <el-table v-loading="loading" :data="rows" row-key="id" border>
        <el-table-column prop="id" label="ID" width="72" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="real_name" label="姓名" min-width="100" />
        <el-table-column label="状态" width="88">
          <template #default="scope">
            {{ scope?.row == null ? "" : scope.row.status === 1 ? "正常" : "禁用" }}
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="160">
          <template #default="scope">
            {{ (scope?.row?.roles || []).join(", ") }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <el-button
                v-access:code="['adminuser:write']"
                link
                type="primary"
                @click="openEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-access:code="['adminuser:delete']"
                link
                type="danger"
                @click="remove(scope.row)"
              >
                删除
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
      v-model="dialogVisible"
      :title="editingId == null ? '新建管理员' : '编辑管理员'"
      width="520px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item v-if="editingId == null" label="用户名">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item v-if="editingId == null" label="密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item v-else label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.real_name" />
        </el-form-item>
        <el-form-item v-if="editingId != null" label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="editingId != null" label="新密码">
          <el-input
            v-model="form.new_password"
            type="password"
            show-password
            placeholder="不修改请留空"
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="form.role_ids"
            multiple
            filterable
            placeholder="选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="r in rolesOptions"
              :key="r.id"
              :label="`${r.name} (${r.code})`"
              :value="r.id"
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
