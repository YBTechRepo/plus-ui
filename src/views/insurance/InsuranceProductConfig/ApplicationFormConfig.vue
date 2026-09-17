<template>
  <el-card shadow="never" class="mb-4">
    <template #header>签字投保单</template>
    <el-form-item label="启用签字投保单">
      <el-switch v-model="model.applicationFormRequired" :disabled="!eligible" />
      <span class="ml-3 text-gray-500">仅卡单的系统内代投保可开启，开启后禁止批量及多人投保</span>
    </el-form-item>
    <template v-if="model.applicationFormRequired">
      <el-form-item label="投保单模板">
        <el-select v-model="model.applicationTemplateCode" class="w-full" @change="handleTemplateChange">
          <el-option v-for="item in templates" :key="`${item.code}@${item.version}`" :label="item.name" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        :title="selectedTemplate ? `当前模板固定保费 ${selectedTemplate.premium} 元、保险期间 12 个月；保险责任、保额和分项保费均按模板原文生成。` : '请选择投保单模板。'"
      />
    </template>
  </el-card>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import request from '@/utils/request';
interface TemplateOption {
  code: string;
  version: string;
  name: string;
  premium: number;
}
const model = defineModel<Record<string, any>>({ required: true });
const metadata = ref<any>();
const templates = computed<TemplateOption[]>(() => metadata.value?.templates || []);
const selectedTemplate = computed(() => templates.value.find((item) => item.code === model.value.applicationTemplateCode));
const eligible = computed(() => Number(model.value.productMode) === 1 && Number(model.value.insureMode) === 1);
const handleTemplateChange = (code?: string) => {
  const selected = templates.value.find((item) => item.code === code);
  if (!selected) return;
  model.value.applicationTemplateVersion = selected.version;
  model.value.minPremium = selected.premium;
};
const selectDefaultTemplate = () => {
  if (!model.value.applicationFormRequired || templates.value.length === 0) return;
  const selected = selectedTemplate.value || templates.value[0];
  model.value.applicationTemplateCode = selected.code;
  handleTemplateChange(selected.code);
};
watch(() => model.value.applicationFormRequired, value => {
  if (value) selectDefaultTemplate();
});
watch(eligible, value => { if (!value) model.value.applicationFormRequired = false; });
onMounted(async () => {
  const res: any = await request({ url: '/insurance/InsuranceApplyRecord/applicationForm/templates' });
  metadata.value = res.data;
  selectDefaultTemplate();
});
</script>
