<template>
  <el-drawer title="批量投保向导" v-model="visible" size="85%" :close-on-click-modal="false" class="batch-drawer" @closed="resetDrawer">
    <el-steps :active="wizardStep" finish-status="success" simple style="margin-bottom: 20px">
      <el-step title="上传人员清单" />
      <el-step title="数据预审" />
      <el-step title="确认收银" />
    </el-steps>

    <div v-if="wizardStep === 1" class="wizard-step-container">
      <div class="template-section">
        <h3>1. 下载模板</h3>
        <p class="desc">请务必使用系统提供的标准模板导入，否则可能导致解析失败。</p>
        <el-button type="primary" plain @click="downloadTemplate">下载《人员清单导入模板.xlsx》</el-button>
      </div>
      <el-divider />
      <div class="upload-section">
        <h3>2. 上传数据</h3>
        <el-upload class="upload-demo" drag action="#" :auto-upload="false" :show-file-list="false" accept=".xls,.xlsx" :on-change="handleFileChange">
          <div v-if="!uploadedFile">
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
          </div>
          <div v-else class="uploaded-file">
            <el-icon class="uploaded-file-icon"><Document /></el-icon>
            <div class="uploaded-file-name">{{ uploadedFile.name }}</div>
            <div class="uploaded-file-tip">点击或拖拽此处可重新上传其他文件</div>
          </div>
          <template #tip>
            <div class="el-upload__tip">仅支持 xls/xlsx 格式文件，且不超过 10MB</div>
          </template>
        </el-upload>
      </div>
      <el-divider />
      <div class="policy-date-section">
        <h3>3. 选择起保日期</h3>
        <p class="desc">本批次所有人员将统一使用该起保日期。</p>
        <el-date-picker
          v-model="policyStartDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择起保日期"
          :disabled-date="disableBeforeTomorrow"
          class="policy-date-picker"
        />
      </div>
    </div>

    <div v-if="wizardStep === 2" class="wizard-step-container audit-step">
      <div class="audit-header">
        <div class="audit-stats">
          解析完成：共 <span class="strong-text">{{ auditList.length }}</span> 条数据， 其中成功
          <span class="success-text">{{ validCount }}</span> 条， 失败 <span class="danger-text">{{ invalidCount }}</span> 条。
        </div>
        <div class="policy-date-summary">起保日期：{{ policyStartDate }}</div>
      </div>

      <el-table :data="auditList" style="width: 100%" height="calc(100vh - 300px)" border :row-class-name="tableRowClassName">
        <el-table-column label="投保人信息" align="center">
          <el-table-column fixed prop="appName" label="姓名" width="110">
            <template #default="scope">
              <span v-if="!scope.row.isEditing">{{ scope.row.appName }}</span>
              <el-input v-else v-model="scope.row.appName" size="small" clearable />
            </template>
          </el-table-column>
          <el-table-column prop="appCertType" label="证件类型" width="100">
            <template #default="scope">
              <span v-if="!scope.row.isEditing">{{ getDictLabel(sys_cert_types, scope.row.appCertType) }}</span>
              <el-select v-else v-model="scope.row.appCertType" size="small">
                <el-option v-for="dict in sys_cert_types" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="appCertNo" label="证件号" width="200">
            <template #default="scope">
              <span v-if="!scope.row.isEditing">{{ scope.row.appCertNo }}</span>
              <el-input v-else v-model="scope.row.appCertNo" size="small" clearable />
            </template>
          </el-table-column>
          <el-table-column prop="appPhone" label="手机号" width="130">
            <template #default="scope">
              <span v-if="!scope.row.isEditing">{{ scope.row.appPhone }}</span>
              <el-input v-else v-model="scope.row.appPhone" size="small" clearable />
            </template>
          </el-table-column>
          <el-table-column prop="appAddress" label="地址" width="180" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="!scope.row.isEditing">{{ scope.row.appAddress }}</span>
              <el-input v-else v-model="scope.row.appAddress" size="small" clearable />
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column prop="relation" label="被/投关系" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.relation === '0' || scope.row.relation === '本人' ? 'success' : 'info'">
              {{ getDictLabel(sys_relation_types, scope.row.relation) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="被保人信息" align="center">
          <el-table-column prop="name" label="姓名" width="110">
            <template #default="scope">
              <span v-if="!scope.row.isEditing">{{ scope.row.name }}</span>
              <el-input v-else v-model="scope.row.name" size="small" clearable />
            </template>
          </el-table-column>
          <el-table-column prop="certType" label="证件类型" width="100">
            <template #default="scope">
              <span v-if="!scope.row.isEditing">{{ getDictLabel(sys_cert_types, scope.row.certType) }}</span>
              <el-select v-else v-model="scope.row.certType" size="small">
                <el-option v-for="dict in sys_cert_types" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="certNo" label="证件号" width="200">
            <template #default="scope">
              <span v-if="!scope.row.isEditing">{{ scope.row.certNo }}</span>
              <el-input v-else v-model="scope.row.certNo" size="small" clearable />
              <div v-if="scope.row.errors?.certNo" class="row-error">
                <el-icon><Warning /></el-icon> {{ scope.row.errors.certNo }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" width="130">
            <template #default="scope">
              <span v-if="!scope.row.isEditing">{{ scope.row.phone }}</span>
              <el-input v-else v-model="scope.row.phone" size="small" clearable />
              <div v-if="scope.row.errors?.phone" class="row-error">
                <el-icon><Warning /></el-icon> {{ scope.row.errors.phone }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="!scope.row.isEditing">{{ scope.row.address }}</span>
              <el-input v-else v-model="scope.row.address" size="small" clearable />
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column v-if="dynamicFields.length > 0" label="投保扩展字段" align="center">
          <el-table-column v-for="field in dynamicFields" :key="field.key" :label="field.label" min-width="180" show-overflow-tooltip>
            <template #default="scope">
              <template v-if="!scope.row.isEditing">
                <span>{{ displayExtraValue(scope.row.extraData?.[field.key]) }}</span>
              </template>
              <template v-else-if="field.type === 'select' || field.type === 'radio'">
                <el-select v-model="scope.row.extraData[field.key]" size="small" clearable class="w-full">
                  <el-option v-for="option in field.options || []" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
              </template>
              <template v-else-if="field.type === 'checkbox'">
                <el-select v-model="scope.row.extraData[field.key]" size="small" multiple clearable class="w-full">
                  <el-option v-for="option in field.options || []" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
              </template>
              <template v-else-if="field.type === 'address'">
                <div class="extra-address-editor">
                  <el-cascader
                    :model-value="getExtraAddressAreaPath(scope.row, field.key)"
                    :options="areaOptions"
                    :props="areaCascaderProps"
                    size="small"
                    placeholder="请选择省市区"
                    clearable
                    filterable
                    class="extra-address-area"
                    @change="(value) => onExtraAddressAreaChange(scope.row, field.key, value)"
                  />
                  <el-input v-model="ensureExtraAddress(scope.row, field.key).detail" size="small" placeholder="详细地址" clearable />
                </div>
              </template>
              <template v-else>
                <el-input v-model="scope.row.extraData[field.key]" size="small" clearable />
              </template>
              <div v-if="scope.row.errors?.[`extraData.${field.key}`]" class="row-error">
                <el-icon><Warning /></el-icon> {{ scope.row.errors[`extraData.${field.key}`] }}
              </div>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="130" align="center">
          <template #default="scope">
            <el-button v-if="!scope.row.isEditing" link type="primary" size="small" @click="scope.row.isEditing = true">修改</el-button>
            <el-button v-else link type="success" size="small" @click="saveRowEdit(scope.row)">保存</el-button>
            <el-popconfirm title="确定要删除此人员记录吗？" @confirm="deleteRow(scope.$index)" width="200px">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="wizardStep === 3" class="wizard-step-container">
      <el-card class="cashier-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>批量投保收银台</span>
          </div>
        </template>
        <div class="cashier-content">
          <div class="cashier-item">
            <span class="label">投保产品：</span>
            <span class="value">{{ cashierData?.productName ?? product?.productName }}</span>
          </div>
          <div class="cashier-item">
            <span class="label">单人应交净费：</span>
            <span class="value price">¥{{ cashierData?.netPremium ?? getNetPremium(product) }}</span>
          </div>
          <div class="cashier-item">
            <span class="label">有效投保人数：</span>
            <span class="value"
              ><span class="strong-count">{{ cashierData?.validCount ?? validCount }}</span> 人</span
            >
          </div>
          <div class="cashier-item">
            <span class="label">起保日期：</span>
            <span class="value">{{ policyStartDate }}</span>
          </div>
          <el-divider />
          <div class="cashier-item total">
            <span class="label">预计总扣款金额：</span>
            <span class="value price total-price">¥{{ cashierData?.totalAmount ?? (Number(getNetPremium(product)) * validCount).toFixed(2) }}</span>
          </div>
          <div class="cashier-item balance">
            <span class="label">当前账户余额：</span>
            <span class="value">¥{{ cashierData ? Number(cashierData.walletBalance).toFixed(2) : userBalance.toFixed(2) }}</span>
          </div>

          <el-alert
            v-if="cashierData ? !cashierData.isBalanceSufficient : userBalance < Number(getNetPremium(product)) * validCount"
            title="余额不足，请先充值后再进行批量投保提交。"
            type="error"
            :closable="false"
            show-icon
            style="margin-top: 15px"
          />
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button v-if="wizardStep > 1 && !submittingBatch" @click="wizardStep--">上一步</el-button>
        <el-button v-if="wizardStep === 1" type="primary" :disabled="!uploadedFile || !policyStartDate" @click="parseExcelFile" :loading="parsingFile">
          开始解析
        </el-button>
        <el-button v-if="wizardStep === 2" type="primary" :disabled="invalidCount > 0" :loading="previewLoading" @click="goCashier">
          确认无误，去收银台
        </el-button>
        <el-button
          v-if="wizardStep === 3"
          type="primary"
          @click="submitBatchPay"
          :loading="submittingBatch"
          :disabled="userBalance < Number(getNetPremium(product)) * validCount || validCount === 0"
        >
          全员投保出单并扣款
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus';
import { Document, UploadFilled, Warning } from '@element-plus/icons-vue';
import { areaList } from '@vant/area-data';
import { getDicts } from '@/api/system/dict/data';
import { getUserAccount } from '@/api/finance/myWallet';
import { downloadBatchTemplate, importBatchData, previewBatch, submitBatch } from '@/api/insurance/batchInsurance';
import { getProductFull } from '@/api/insurance/InsuranceProductConfig';
import type { InsuranceDynamicField } from '@/api/insurance/dynamicForm/types';
import { useUserStore } from '@/store/modules/user';
import { blobValidate } from '@/utils/ruoyi';
import FileSaver from 'file-saver';

interface AreaOption {
  label: string;
  value: string;
  children?: AreaOption[];
}

const props = defineProps<{
  modelValue: boolean;
  product?: any;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success', data: any): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const userStore = useUserStore();
const sys_cert_types = ref<any[]>([]);
const sys_relation_types = ref<any[]>([]);
const userBalance = ref(0);
const wizardStep = ref(1);
const uploadedFile = ref<any>(null);
const parsingFile = ref(false);
const auditList = ref<any[]>([]);
const previewLoading = ref(false);
const cashierData = ref<any>(null);
const submittingBatch = ref(false);
const dynamicFields = ref<InsuranceDynamicField[]>([]);
const policyStartDate = ref('');

const validCount = computed(() => auditList.value.filter((item) => item.isValid).length);
const invalidCount = computed(() => auditList.value.filter((item) => !item.isValid).length);

const areaCascaderProps = {
  value: 'label',
  label: 'label',
  children: 'children',
  emitPath: true
};

const areaOptions = computed<AreaOption[]>(() => {
  const provinceList = areaList.province_list || {};
  const cityList = areaList.city_list || {};
  const countyList = areaList.county_list || {};

  return Object.entries(provinceList).map(([provinceCode, provinceName]) => {
    const provincePrefix = provinceCode.slice(0, 2);
    const cities = Object.entries(cityList)
      .filter(([cityCode]) => cityCode.startsWith(provincePrefix))
      .map(([cityCode, cityName]) => {
        const cityPrefix = cityCode.slice(0, 4);
        const counties = Object.entries(countyList)
          .filter(([countyCode]) => countyCode.startsWith(cityPrefix))
          .map(([, countyName]) => ({
            label: countyName,
            value: countyName
          }));
        return {
          label: cityName,
          value: cityName,
          children: counties
        };
      });

    return {
      label: provinceName,
      value: provinceName,
      children: cities
    };
  });
});

const getDictLabel = (dictOptions: any[], value: string | number) => {
  if (value === null || value === undefined || value === '') return '';
  const option = dictOptions.find((d: any) => String(d.dictValue) === String(value));
  return option ? option.dictLabel : value;
};

const getNetPremium = (product: any) => {
  if (!product) return '0.00';
  if (product.netPremium !== null && product.netPremium !== undefined && product.netPremium !== '') {
    return Number(product.netPremium).toFixed(2);
  }
  const raw = Number(product.minPremium || 0);
  const rate = Number(product.displayCommissionRate ?? product.commissionRate ?? product.serviceFee ?? 0);
  return (raw * (1 - rate)).toFixed(2);
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
};

const getTomorrowDate = () => formatDate(getTomorrow());

const disableBeforeTomorrow = (date: Date) => {
  const tomorrow = getTomorrow();
  tomorrow.setHours(0, 0, 0, 0);
  return date.getTime() < tomorrow.getTime();
};

const fetchDicts = () => {
  getDicts('insurance_id_type').then((res: any) => {
    sys_cert_types.value = res.data || res || [];
  });
  getDicts('insurance_relationship_to_insured').then((res: any) => {
    sys_relation_types.value = res.data || res || [];
  });
};

const fetchWalletBalance = async () => {
  if (!userStore.userId) return;
  try {
    const res: any = await getUserAccount(userStore.userId);
    userBalance.value = Number(res.data?.balance || 0);
  } catch (err) {
    console.error('Failed to fetch wallet balance:', err);
  }
};

const fetchDynamicFields = async () => {
  dynamicFields.value = [];
  if (!props.product?.id) return;
  try {
    const res = (await getProductFull(props.product.id)) as any;
    dynamicFields.value = parseDynamicFields(res.data?.product?.insureFormSchema || res.product?.insureFormSchema);
  } catch (err) {
    console.error('Failed to fetch dynamic fields:', err);
  }
};

const resetDrawer = () => {
  wizardStep.value = 1;
  uploadedFile.value = null;
  parsingFile.value = false;
  auditList.value = [];
  previewLoading.value = false;
  cashierData.value = null;
  submittingBatch.value = false;
  policyStartDate.value = getTomorrowDate();
};

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      resetDrawer();
      fetchDicts();
      fetchWalletBalance();
      fetchDynamicFields();
    }
  }
);

const downloadTemplate = async () => {
  if (!props.product?.id) {
    ElMessage.warning('缺少产品信息，无法下载模板');
    return;
  }
  try {
    const resp = (await downloadBatchTemplate(props.product.id)) as unknown as Blob;
    const isBlob = await blobValidate(resp);
    if (isBlob) {
      FileSaver.saveAs(new Blob([resp]), '人员清单导入模板.xlsx');
    } else {
      const resText = await new Blob([resp]).text();
      const rspObj = JSON.parse(resText);
      ElMessage.error(rspObj.msg || '模板下载失败');
    }
  } catch (err) {
    console.error(err);
    ElMessage.error('模板下载失败');
  }
};

const handleFileChange = (file: any) => {
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (extension !== '.xls' && extension !== '.xlsx') {
    ElMessage.error('只能上传 xls / xlsx 格式的文件！');
    return false;
  }
  if (file.size / 1024 / 1024 > 10) {
    ElMessage.error('文件大小不能超过 10MB！');
    return false;
  }
  uploadedFile.value = file;
  ElMessage.success(`文件 ${file.name} 选择成功`);
  return true;
};

const parseExcelFile = async () => {
  if (!uploadedFile.value || !uploadedFile.value.raw) {
    ElMessage.warning('请先上传文件！');
    return;
  }
  if (!policyStartDate.value) {
    ElMessage.warning('请选择起保日期！');
    return;
  }
  parsingFile.value = true;
  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.value.raw);
    formData.append('productId', String(props.product?.id || ''));
    const res = (await importBatchData(formData)) as any;
    if (res.code === 200 && res.data) {
      auditList.value = res.data.auditList || [];
      wizardStep.value = 2;
      ElMessage.success(`解析完成！成功 ${res.data.validCount} 条，异常 ${res.data.invalidCount} 条`);
    } else {
      ElMessage.error(res.msg || '解析失败，请检查文件内容或格式');
    }
  } catch (error) {
    console.error('File parse error:', error);
    ElMessage.error('网络异常或解析处理失败，请检查后台日志');
  } finally {
    parsingFile.value = false;
  }
};

const tableRowClassName = ({ row }: { row: any }) => {
  return row.isValid ? '' : 'error-row';
};

const saveRowEdit = (row: any) => {
  row.errors = {};
  let valid = true;
  if (!row.appName) valid = false;
  if (row.appCertNo?.length !== 18) {
    row.errors.appCertNo = '投保人身份证必须18位';
    valid = false;
  }
  if (!row.name) valid = false;
  if (row.certNo?.length !== 18) {
    row.errors.certNo = '被保人身份证必须18位';
    valid = false;
  }
  if (row.phone?.length !== 11) {
    row.errors.phone = '被保人手机必须11位';
    valid = false;
  }
  if (!validateDynamicRow(row)) {
    valid = false;
  }
  row.isValid = valid;
  if (valid) {
    row.isEditing = false;
    ElMessage.success('校验通过');
  } else {
    ElMessage.warning('校验仍有误，请继续修改');
  }
};

const parseDynamicFields = (schema?: string | InsuranceDynamicField[]) => {
  if (!schema) return [];
  try {
    const parsed = typeof schema === 'string' ? JSON.parse(schema) : schema;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((field: InsuranceDynamicField) => field?.key && field?.label && field?.type)
      .sort((a: InsuranceDynamicField, b: InsuranceDynamicField) => Number(a.sort || 0) - Number(b.sort || 0));
  } catch {
    return [];
  }
};

const displayExtraValue = (value: any) => {
  if (Array.isArray(value)) return value.length > 0 ? value.join('、') : '--';
  if (value && typeof value === 'object') return [value.regionText, value.detail].filter(Boolean).join(' ') || '--';
  return value || '--';
};

const ensureExtraAddress = (row: any, key: string) => {
  row.extraData = row.extraData || {};
  if (!row.extraData[key] || typeof row.extraData[key] !== 'object' || Array.isArray(row.extraData[key])) {
    row.extraData[key] = { regionText: '', detail: '' };
  }
  return row.extraData[key];
};

const findAreaPathByText = (regionText: string) => {
  const text = regionText.trim();
  if (!text) return [];
  for (const province of areaOptions.value) {
    if (!text.includes(province.label)) continue;
    for (const city of province.children || []) {
      if (!text.includes(city.label)) continue;
      const county = (city.children || []).find((item) => text.includes(item.label));
      if (county) return [province.label, city.label, county.label];
      return [province.label, city.label];
    }
    return [province.label];
  }
  return [];
};

const getAreaPathFromRegionText = (regionText: unknown) => {
  if (Array.isArray(regionText)) {
    return regionText.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 3);
  }
  const text = String(regionText || '').trim();
  if (!text) return [];
  const parts = text
    .split(/[\s,，/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (parts.length > 1) return parts.slice(0, 3);
  return findAreaPathByText(text);
};

const getExtraAddressAreaPath = (row: any, key: string) => {
  return getAreaPathFromRegionText(ensureExtraAddress(row, key).regionText);
};

const onExtraAddressAreaChange = (row: any, key: string, value: unknown) => {
  const address = ensureExtraAddress(row, key);
  address.regionText = Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean).join(' ') : '';
};

const getExtraText = (value: any) => {
  if (Array.isArray(value)) return value.join('、');
  if (value && typeof value === 'object') return [value.regionText, value.detail].filter(Boolean).join(' ');
  return value === undefined || value === null ? '' : String(value);
};

const validateDynamicRow = (row: any) => {
  row.extraData = row.extraData || {};
  let valid = true;
  dynamicFields.value.forEach((field) => {
    const value = row.extraData[field.key];
    const text = getExtraText(value);
    if (field.required && !text) {
      row.errors[`extraData.${field.key}`] = `${field.label}不能为空`;
      valid = false;
      return;
    }
    if (!text) return;
    if ((field.type === 'number' || field.type === 'money') && Number.isNaN(Number(text))) {
      row.errors[`extraData.${field.key}`] = `${field.label}必须为数字`;
      valid = false;
    }
  });
  return valid;
};

const deleteRow = (index: number) => {
  auditList.value.splice(index, 1);
  ElMessage.success('记录已删除');
};

const goCashier = async () => {
  previewLoading.value = true;
  try {
    const res = (await previewBatch({
      productId: props.product?.id,
      policyStartDate: policyStartDate.value,
      auditList: auditList.value.filter((item) => item.isValid)
    })) as any;
    if (res.code === 200) {
      cashierData.value = res.data;
    }
  } catch (err) {
    console.error('preview error:', err);
  } finally {
    previewLoading.value = false;
  }
  wizardStep.value = 3;
};

const submitBatchPay = async () => {
  if (submittingBatch.value) return;
  submittingBatch.value = true;
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在生成订单并扣款，请勿刷新页面...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {
    const res = (await submitBatch({
      productId: props.product?.id,
      policyStartDate: policyStartDate.value,
      auditList: auditList.value.filter((item) => item.isValid)
    })) as any;
    if (res.code === 200) {
      const batchOrderNo = res.data?.batchOrderNo;
      visible.value = false;
      emit('success', res.data);
      ElMessageBox.alert(`批量投保出单成功！批次单号：${batchOrderNo}`, '出单成功', {
        confirmButtonText: '已完成',
        type: 'success'
      });
    } else {
      ElMessage.error(res.msg || '出单失败，请重试');
    }
  } catch (err) {
    ElMessage.error('网络异常，出单失败，请重试');
    console.error(err);
  } finally {
    loadingInstance.close();
    submittingBatch.value = false;
  }
};
</script>

<style scoped lang="scss">
.uploaded-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.uploaded-file-icon {
  margin-bottom: 12px;
  color: #67c23a;
  font-size: 52px;
}

.uploaded-file-name {
  color: #67c23a;
  font-size: 16px;
  font-weight: bold;
}

.uploaded-file-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 13px;
}

.audit-step {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.audit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.policy-date-section {
  max-width: 420px;
}

.policy-date-picker {
  width: 240px;
}

.policy-date-summary {
  color: #606266;
  font-weight: 600;
}

.strong-text,
.strong-count {
  font-weight: bold;
}

.success-text {
  color: #67c23a;
  font-size: 16px;
  font-weight: bold;
}

.danger-text,
.row-error {
  color: #f56c6c;
}

.row-error {
  margin-top: 4px;
  font-size: 12px;
}

.extra-address-editor {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.extra-address-area {
  width: 100%;
}

.cashier-card {
  width: 50%;
  margin: 40px auto;
}

.cashier-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cashier-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
}

.cashier-item .label {
  color: #606266;
}

.cashier-item .value {
  color: #303133;
}

.cashier-item .price {
  color: #f56c6c;
  font-weight: bold;
}

.cashier-item.total .total-price {
  font-size: 24px;
}
</style>
