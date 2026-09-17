<template>
  <el-dialog v-model="createDialog.visible" title="批量导出投保单" width="520px" append-to-body>
    <el-form label-width="110px">
      <el-form-item label="导出范围">
        <el-radio-group v-model="createDialog.scope">
          <el-radio value="SELECTED" :disabled="selectedIds.length === 0">已勾选订单（{{ selectedIds.length }}）</el-radio>
          <el-radio value="FILTER">当前筛选结果</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-alert
        v-if="createDialog.scope === 'SELECTED'"
        title="任务将按当前勾选的订单创建，跨页勾选也会保留。"
        type="info"
        :closable="false"
        show-icon
      />
      <el-alert v-else title="任务将按当前查询条件冻结订单，不受后续列表变化影响。单次最多 200 单。" type="info" :closable="false" show-icon />
    </el-form>
    <template #footer>
      <el-button @click="createDialog.visible = false">取消</el-button>
      <el-button type="primary" :loading="creating" @click="submitTask">创建导出任务</el-button>
    </template>
  </el-dialog>

  <el-drawer v-model="recordsVisible" title="投保单导出记录" size="78%" append-to-body @closed="stopPolling">
    <el-alert title="导出文件保留 24 小时；任务完成后可下载 ZIP，ZIP 内包含逐单 PDF 和导出结果清单.txt。" type="info" :closable="false" />
    <el-table v-loading="recordsLoading" :data="records" border class="mt-3">
      <el-table-column label="任务ID" prop="id" width="100" align="center" />
      <el-table-column label="范围" prop="scope" width="100" align="center">
        <template #default="scope">{{ scope.row.scope === 'SELECTED' ? '已勾选' : '筛选结果' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="statusMeta[scope.row.status].type">{{ statusMeta[scope.row.status].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="总数" prop="totalCount" width="80" align="center" />
      <el-table-column label="成功" prop="successCount" width="80" align="center" />
      <el-table-column label="跳过" prop="skippedCount" width="80" align="center" />
      <el-table-column label="文件大小" width="110" align="center">
        <template #default="scope">{{ formatBytes(scope.row.zipSize) }}</template>
      </el-table-column>
      <el-table-column label="完成时间" prop="finishedAt" width="170" align="center">
        <template #default="scope">{{ formatTime(scope.row.finishedAt) }}</template>
      </el-table-column>
      <el-table-column label="过期时间" prop="expiresAt" width="170" align="center">
        <template #default="scope">{{ formatTime(scope.row.expiresAt) }}</template>
      </el-table-column>
      <el-table-column label="失败原因" prop="failureReason" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="100" fixed="right" align="center">
        <template #default="scope">
          <el-button v-if="scope.row.canDownload" link type="primary" :loading="downloadingId === scope.row.id" @click="download(scope.row)">
            下载
          </el-button>
          <span v-else>--</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="recordTotal > 0"
      :total="recordTotal"
      v-model:page="recordQuery.pageNum"
      v-model:limit="recordQuery.pageSize"
      @pagination="() => loadRecords()"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import FileSaver from 'file-saver';
import {
  createInsuranceApplicationExportTask,
  downloadInsuranceApplicationExportTask,
  listInsuranceApplicationExportTasks
} from '@/api/insurance/insuranceProxyOrder';
import type {
  InsuranceApplicationExportScope,
  InsuranceApplicationExportTaskStatus,
  InsuranceApplicationExportTaskVO,
  InsuranceProxyOrderQuery
} from '@/api/insurance/insuranceProxyOrder/types';
import { parseTime } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const selectedIds = ref<Array<string | number>>([]);
const frozenQuery = ref<Partial<InsuranceProxyOrderQuery>>({});
const creating = ref(false);
const createDialog = reactive({ visible: false, scope: 'FILTER' as InsuranceApplicationExportScope, requestId: '' });
const recordsVisible = ref(false);
const recordsLoading = ref(false);
const records = ref<InsuranceApplicationExportTaskVO[]>([]);
const recordTotal = ref(0);
const recordQuery = reactive({ pageNum: 1, pageSize: 10 });
const downloadingId = ref<string | number>();
let pollTimer: number | undefined;

const statusMeta: Record<InsuranceApplicationExportTaskStatus, { label: string; type: 'info' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  PENDING: { label: '等待中', type: 'info' },
  RUNNING: { label: '处理中', type: 'primary' },
  SUCCESS: { label: '成功', type: 'success' },
  PARTIAL: { label: '部分成功', type: 'warning' },
  FAILED: { label: '失败', type: 'danger' },
  EXPIRED: { label: '已过期', type: 'info' }
};

const newRequestId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
};

const openCreate = (ids: Array<string | number>, query: InsuranceProxyOrderQuery) => {
  selectedIds.value = [...new Set(ids)];
  const { pageNum: _pageNum, pageSize: _pageSize, ...criteria } = query;
  frozenQuery.value = JSON.parse(JSON.stringify(criteria));
  createDialog.scope = selectedIds.value.length > 0 ? 'SELECTED' : 'FILTER';
  createDialog.requestId = newRequestId();
  createDialog.visible = true;
};

const submitTask = async () => {
  if (createDialog.scope === 'SELECTED' && selectedIds.value.length === 0) {
    proxy?.$modal.msgWarning('请先勾选需要导出的订单');
    return;
  }
  if (selectedIds.value.length > 200 && createDialog.scope === 'SELECTED') {
    proxy?.$modal.msgWarning('单次最多导出 200 个订单');
    return;
  }
  creating.value = true;
  try {
    await createInsuranceApplicationExportTask({
      requestId: createDialog.requestId,
      scope: createDialog.scope,
      orderIds: createDialog.scope === 'SELECTED' ? selectedIds.value : undefined,
      query: createDialog.scope === 'FILTER' ? frozenQuery.value : undefined
    });
    proxy?.$modal.msgSuccess('导出任务已创建');
    createDialog.visible = false;
    await openRecords();
  } finally {
    creating.value = false;
  }
};

const loadRecords = async (silent = false) => {
  if (!silent) recordsLoading.value = true;
  try {
    const res = await listInsuranceApplicationExportTasks(recordQuery);
    records.value = res.rows || [];
    recordTotal.value = res.total || 0;
  } finally {
    if (!silent) recordsLoading.value = false;
  }
};

const stopPolling = () => {
  if (pollTimer !== undefined) window.clearInterval(pollTimer);
  pollTimer = undefined;
};

const startPolling = () => {
  stopPolling();
  pollTimer = window.setInterval(() => {
    if (recordsVisible.value && records.value.some((item) => item.status === 'PENDING' || item.status === 'RUNNING')) {
      loadRecords(true);
    }
  }, 3000);
};

const openRecords = async () => {
  recordsVisible.value = true;
  recordQuery.pageNum = 1;
  await loadRecords();
  startPolling();
};

const download = async (task: InsuranceApplicationExportTaskVO) => {
  downloadingId.value = task.id;
  try {
    const blob = (await downloadInsuranceApplicationExportTask(task.id)) as unknown as Blob;
    if (blob.type?.includes('json')) {
      const result = JSON.parse(await blob.text());
      throw new Error(result.msg || '文件下载失败');
    }
    FileSaver.saveAs(new Blob([blob], { type: 'application/zip' }), task.fileName || `投保单批量导出_${task.id}.zip`);
  } catch (error) {
    proxy?.$modal.msgError(error instanceof Error ? error.message : '文件下载失败');
  } finally {
    downloadingId.value = undefined;
  }
};

const formatBytes = (value?: number) => {
  if (value === undefined || value === null) return '--';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

const formatTime = (value?: string) => (value ? parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}') : '--');

onBeforeUnmount(stopPolling);

defineExpose({ openCreate, openRecords });
</script>
