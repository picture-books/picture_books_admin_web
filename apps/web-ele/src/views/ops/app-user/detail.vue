<script lang="ts" setup>
import type { EchartsUIType } from "@vben/plugins/echarts";

import type {
  AdminReadingSessionItem,
  AdminReadingSummaryResp,
  AppUserDetailItem,
} from "#/api/types";

import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { EchartsUI, useEcharts } from "@vben/plugins/echarts";
import { useAccessStore } from "@vben/stores";

import { ElMessage, ElMessageBox } from "element-plus";

import {
  getAppUserDetailApi,
  getAppUserReadingSessionsApi,
  getAppUserReadingSummaryApi,
  patchAppUserDevicePolicyApi,
  patchAppUserStatusApi,
} from "#/api";

const route = useRoute();
const router = useRouter();
const accessStore = useAccessStore();
const loading = ref(false);
const user = ref<AppUserDetailItem | null>(null);
const savingDevicePolicy = ref(false);

const readingLoading = ref(false);
const readingSummary = ref<AdminReadingSummaryResp | null>(null);
const sessionsLoading = ref(false);
const sessions = ref<AdminReadingSessionItem[]>([]);
const sessionsTotal = ref(0);
const sessionsPage = ref(1);
const sessionsPageSize = ref(10);

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const id = computed(() => Number(route.params.id));

const ageBandLabels: Record<string, string> = {
  under_1: "未满周岁",
  nursery_small: "小班",
  nursery_middle: "中班",
  nursery_large: "大班",
  preschool: "学前",
};

function ageBandLabel(code: null | string | undefined): string {
  if (!code) return "-";
  return ageBandLabels[code] ?? code;
}
const canEditDevicePolicy = computed(() =>
  (accessStore.accessCodes || []).includes("appuser:device_policy"),
);
const canViewReading = computed(() => (accessStore.accessCodes || []).includes("appuser:reading"));
function goGenerateBookForUser() {
  if (!id.value) return;
  router.push({ name: "OpsBookGenerate", query: { user_id: String(id.value) } });
}

function todayLocalDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function browserTimezoneIana(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function formatSec(sec: number): string {
  if (sec <= 0) return "0 秒";
  if (sec < 60) return `${sec} 秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s ? `${m} 分 ${s} 秒` : `${m} 分钟`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h} 小时 ${rm} 分`;
}

async function loadReadingSummary() {
  if (!canViewReading.value || !Number.isFinite(id.value)) return;
  readingLoading.value = true;
  try {
    readingSummary.value = await getAppUserReadingSummaryApi(id.value, {
      as_of_local_date: todayLocalDate(),
      timezone_iana: browserTimezoneIana(),
    });
  } catch {
    readingSummary.value = null;
    ElMessage.error("阅读概况加载失败");
  } finally {
    readingLoading.value = false;
  }
}

async function loadReadingSessions(page = 1) {
  if (!canViewReading.value || !Number.isFinite(id.value)) return;
  sessionsLoading.value = true;
  sessionsPage.value = page;
  try {
    const res = await getAppUserReadingSessionsApi(id.value, {
      page: sessionsPage.value,
      page_size: sessionsPageSize.value,
    });
    sessions.value = res.list;
    sessionsTotal.value = res.total;
  } catch {
    sessions.value = [];
    sessionsTotal.value = 0;
    ElMessage.error("阅读会话列表加载失败");
  } finally {
    sessionsLoading.value = false;
  }
}

async function load() {
  if (!Number.isFinite(id.value)) return;
  loading.value = true;
  try {
    user.value = await getAppUserDetailApi(id.value);
    if (canViewReading.value) {
      await loadReadingSummary();
      await loadReadingSessions(1);
    } else {
      readingSummary.value = null;
      sessions.value = [];
      sessionsTotal.value = 0;
    }
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
  () => readingSummary.value?.last_30_days,
  async (days) => {
    if (!days?.length) return;
    await nextTick();
    const labels = days.map((d) => d.local_date.slice(5));
    const minutes = days.map((d) => Math.round((d.total_sec / 60) * 10) / 10);
    const maxMin = Math.max(1, ...minutes);
    await renderEcharts({
      grid: {
        bottom: 24,
        containLabel: true,
        left: "2%",
        right: "2%",
        top: 28,
      },
      series: [
        {
          barMaxWidth: 22,
          data: minutes,
          itemStyle: { color: "#5ab1ef" },
          name: "阅读时长",
          type: "bar",
        },
      ],
      tooltip: {
        axisPointer: { type: "shadow" },
        formatter: (params: unknown) => {
          const arr = Array.isArray(params) ? params : [params];
          const p = arr[0] as { dataIndex?: number; name?: string };
          const i = p.dataIndex ?? 0;
          const point = days[i];
          if (!point) return "";
          return `${point.local_date}<br/>${formatSec(Number(point.total_sec))}`;
        },
        trigger: "axis",
      },
      xAxis: {
        axisLabel: { rotate: 45 },
        data: labels,
        type: "category",
      },
      yAxis: {
        max: Math.ceil(maxMin * 1.1),
        name: "分钟",
        splitNumber: 4,
        type: "value",
      },
    });
  },
  { flush: "post" },
);

watch(
  () => route.params.id,
  () => load(),
  { immediate: true },
);
</script>

<template>
  <div v-loading="loading" class="p-5">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <el-page-header content="用户详情" @back="router.push({ name: 'OpsAppUsers' })" />
      <el-button
        v-access:code="['book:generate']"
        type="primary"
        plain
        @click="goGenerateBookForUser"
      >
        代该用户生成绘本
      </el-button>
    </div>
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
        <el-descriptions-item label="阅读年龄档（账号）">
          {{ ageBandLabel(user.child_age_band) }}
        </el-descriptions-item>
        <el-descriptions-item label="偏好主题（账号）" :span="2">
          <template v-if="user.preferred_themes?.length">
            <el-tag v-for="t in user.preferred_themes" :key="t" class="mr-1 mb-1" size="small">
              {{ t }}
            </el-tag>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="设备引导完成次数">
          {{ user.device_onboarding_completed_count ?? 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="最近设备引导完成时间">
          {{ user.last_device_onboarding_at || "-" }}
        </el-descriptions-item>
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

      <div
        v-if="canViewReading"
        v-access:code="['appuser:reading']"
        class="mt-6 rounded-md border border-gray-200 p-4"
      >
        <div class="mb-3 text-sm font-medium">阅读概况</div>
        <div class="mb-1 text-xs text-gray-500">
          统计锚点为当前浏览器本地日与时区（与 C 端摘要口径一致）；连续阅读按服务端 streak 规则。
        </div>
        <div v-loading="readingLoading" class="min-h-[120px]">
          <template v-if="readingSummary">
            <el-descriptions :column="2" border class="mb-4">
              <el-descriptions-item label="连续阅读（天）">
                {{ readingSummary.streak_days }}
              </el-descriptions-item>
              <el-descriptions-item label="今日累计">
                {{ formatSec(readingSummary.today_sec) }}
              </el-descriptions-item>
              <el-descriptions-item label="总会话数">
                {{ readingSummary.total_sessions }}
              </el-descriptions-item>
              <el-descriptions-item label="总阅读时长">
                {{ formatSec(readingSummary.total_duration_sec) }}
              </el-descriptions-item>
              <el-descriptions-item label="阅读绘本数（去重）" :span="2">
                {{ readingSummary.total_books_read }}
              </el-descriptions-item>
            </el-descriptions>
            <div class="mb-2 text-xs text-gray-600">近 30 日每日阅读时长（分钟）</div>
            <div v-if="readingSummary.last_30_days?.length" class="w-full">
              <EchartsUI ref="chartRef" height="320px" />
            </div>
            <el-empty v-else description="近 30 日暂无阅读数据" :image-size="72" />
          </template>
        </div>

        <div class="mt-6">
          <div class="mb-2 text-sm font-medium">阅读会话明细</div>
          <el-table v-loading="sessionsLoading" :data="sessions" stripe border size="small">
            <el-table-column prop="id" label="ID" width="72" />
            <el-table-column prop="local_date" label="本地日" width="110" />
            <el-table-column prop="book_title" label="绘本" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.book_title || `绘本 #${row.book_id}` }}
              </template>
            </el-table-column>
            <el-table-column prop="duration_sec" label="时长" width="100">
              <template #default="{ row }">{{ formatSec(row.duration_sec) }}</template>
            </el-table-column>
            <el-table-column prop="started_at" label="开始" min-width="160" show-overflow-tooltip />
            <el-table-column prop="ended_at" label="结束" min-width="160" show-overflow-tooltip />
            <el-table-column prop="timezone_iana" label="时区" width="140" show-overflow-tooltip />
          </el-table>
          <div class="mt-3 flex justify-end">
            <el-pagination
              v-model:current-page="sessionsPage"
              v-model:page-size="sessionsPageSize"
              :total="sessionsTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @current-change="(p: number) => loadReadingSessions(p)"
              @size-change="
                () => {
                  sessionsPage = 1;
                  loadReadingSessions(1);
                }
              "
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
