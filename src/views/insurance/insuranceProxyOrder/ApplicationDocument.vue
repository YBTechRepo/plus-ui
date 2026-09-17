<template>
  <el-dialog v-model="visible" title="投保单" width="85%" append-to-body @closed="release">
    <div v-loading="loading">
      <el-alert :title="statusText" :description="status?.failureReason" :type="alertType" :closable="false" show-icon />
      <div v-if="url" class="my-3">
        <el-button type="primary" @click="save">下载投保单 PDF</el-button>
      </div>
      <iframe v-if="url" :src="url" title="投保单" style="width: 100%; height: 70vh; border: 0" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getInsuranceProxyOrderApplicationForm, getInsuranceProxyOrderApplicationFormPdf } from '@/api/insurance/insuranceProxyOrder';
import type { InsuranceApplicationFormStatus } from '@/api/insurance/insuranceProxyOrder/types';

const visible = ref(false);
const loading = ref(false);
const url = ref('');
const orderNo = ref('');
const status = ref<InsuranceApplicationFormStatus>();
const labels: Record<InsuranceApplicationFormStatus['status'], string> = {
  MISSING: '尚未生成投保单',
  DRAFT: '等待签署',
  GENERATING: '正在生成投保单',
  FAILED: '生成失败，请由业务员在移动端重试',
  INVALID: '资料已修改，需重新签署',
  READY: '已签署并归档'
};
const statusText = computed(() => (status.value ? labels[status.value.status] : '正在查询'));
const alertType = computed(() => {
  if (status.value?.status === 'READY') return 'success';
  if (status.value?.status === 'FAILED' || status.value?.status === 'INVALID') return 'error';
  return 'info';
});

const release = () => {
  if (url.value) URL.revokeObjectURL(url.value);
  url.value = '';
};

const open = async (id: string | number, no: string) => {
  release();
  orderNo.value = no;
  visible.value = true;
  loading.value = true;
  status.value = undefined;
  try {
    const res = await getInsuranceProxyOrderApplicationForm(id);
    status.value = res.data;
    if (status.value.status === 'READY') {
      const blob = (await getInsuranceProxyOrderApplicationFormPdf(id)) as unknown as Blob;
      if (blob.type?.includes('json')) {
        const result = JSON.parse(await blob.text());
        throw new Error(result.msg || '文件下载失败');
      }
      url.value = URL.createObjectURL(blob);
    }
  } finally {
    loading.value = false;
  }
};

const save = () => {
  const link = document.createElement('a');
  link.href = url.value;
  link.download = `${orderNo.value}_投保单.pdf`;
  link.click();
};

defineExpose({ open });
</script>
