<template>
  <div class="p-2 apply-page">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <div>
            <el-button link icon="ArrowLeft" @click="router.back()">返回</el-button>
            <span class="page-title">{{ isCardSecretOrder ? '填写购买信息' : '填写投保信息' }}</span>
          </div>
          <el-button type="primary" :loading="submitting" @click="submitForm">{{ isCardSecretOrder ? '提交购买信息' : '提交投保信息' }}</el-button>
        </div>
      </template>

      <el-alert v-if="orderInfo.orderNo" class="mb-3" type="info" show-icon :closable="false">
        <template #title>
          订单号：{{ orderInfo.orderNo }}；产品：{{ orderInfo.productName || '--' }}；登记客户：{{ orderInfo.customerName || '--' }}
        </template>
      </el-alert>

      <el-form v-if="isCardSecretOrder" ref="cardApplyFormRef" :model="cardForm" :rules="cardRules" label-width="120px">
        <el-card shadow="never" class="form-section">
          <template #header><span class="section-title">收货与购买信息</span></template>
          <el-row :gutter="16">
            <el-col :xs="24" :md="12">
              <el-form-item label="收货人姓名" prop="receiverName">
                <el-input v-model="cardForm.receiverName" placeholder="请输入收货人姓名" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="收货人手机号" prop="receiverMobile">
                <el-input v-model="cardForm.receiverMobile" placeholder="请输入收货人手机号" maxlength="11" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="所在地区" prop="receiverArea">
                <el-cascader
                  :model-value="getAreaPath(cardForm.receiverArea)"
                  :options="areaOptions"
                  :props="areaCascaderProps"
                  placeholder="请选择省市区"
                  clearable
                  filterable
                  class="w-full"
                  @change="(value) => onAreaChange('receiver', value)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="详细地址" prop="receiverDetailAddress">
                <el-input v-model="cardForm.receiverDetailAddress" placeholder="请输入街道门牌等详细地址" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="保险公司" prop="selectedCompanyCode">
                <el-select v-model="cardForm.selectedCompanyCode" placeholder="请选择保险公司" class="w-full">
                  <el-option v-for="dict in insurance_card_company" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
      </el-form>

      <el-form v-else ref="applyFormRef" :model="form" :rules="rules" label-width="120px">
        <el-card shadow="never" class="form-section">
          <template #header><span class="section-title">投保信息</span></template>
          <el-row :gutter="16">
            <el-col :xs="24" :md="12">
              <el-form-item label="起保日期" prop="policyStartDate">
                <el-date-picker
                  v-model="form.policyStartDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择起保日期"
                  :disabled-date="disableBeforeTomorrow"
                  class="w-full"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="form-section">
          <template #header><span class="section-title">投保人信息</span></template>
          <el-row :gutter="16">
            <el-col :xs="24" :md="12">
              <el-form-item label="姓名" prop="applicantName">
                <el-input v-model="form.applicantName" placeholder="请输入投保人姓名" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="证件类型" prop="applicantCertType">
                <el-select v-model="form.applicantCertType" class="w-full">
                  <el-option v-for="item in certTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="证件号码" prop="applicantCertNo">
                <el-input v-model="form.applicantCertNo" placeholder="请输入证件号码" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="手机号码" prop="applicantPhone">
                <el-input v-model="form.applicantPhone" placeholder="请输入手机号码" maxlength="11" />
              </el-form-item>
            </el-col>
            <template v-if="form.applicantCertType === '0'">
              <el-col :xs="24" :md="12">
                <el-form-item label="证件生效期" prop="applicantCertStartDate">
                  <el-date-picker
                    v-model="form.applicantCertStartDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择日期"
                    class="w-full"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="证件到期日" prop="applicantCertEndDate">
                  <div class="end-date-field">
                    <el-input :model-value="formatEndDate(form.applicantCertEndDate)" readonly placeholder="请选择到期日" />
                    <el-dropdown trigger="click" @command="(command) => handleEndDateCommand('applicant', command)">
                      <el-button type="primary" plain>选择</el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item v-for="item in endDateOptions" :key="item.value" :command="item.value">{{ item.label }}</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </el-form-item>
              </el-col>
            </template>
            <el-col :xs="24" :md="12">
              <el-form-item label="所在地区" prop="applicantArea">
                <el-cascader
                  :model-value="getAreaPath(form.applicantArea)"
                  :options="areaOptions"
                  :props="areaCascaderProps"
                  placeholder="请选择省市区"
                  clearable
                  filterable
                  class="w-full"
                  @change="(value) => onAreaChange('applicant', value)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="详细地址" prop="applicantDetailAddress">
                <el-input v-model="form.applicantDetailAddress" placeholder="请输入街道门牌等详细地址" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="form-section">
          <template #header>
            <div class="section-header">
              <span class="section-title">被保人信息</span>
              <el-button v-if="!isCardProduct" type="primary" plain icon="Plus" @click="addInsured">新增被保人</el-button>
            </div>
          </template>

          <div v-for="(insured, index) in form.insuredList" :key="index" class="insured-block">
            <div class="insured-title">
              <span>{{ isCardProduct ? '被保人' : `被保人 ${index + 1}` }}</span>
              <el-button v-if="form.insuredList.length > 1" link type="danger" icon="Delete" @click="removeInsured(index)">删除</el-button>
            </div>
            <el-row :gutter="16">
              <el-col :xs="24" :md="12">
                <el-form-item :label="'与投保人关系'" :prop="`insuredList.${index}.relation`" :rules="rules.relation">
                  <el-select v-model="insured.relation" class="w-full">
                    <el-option v-for="item in relationOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <template v-if="insured.relation !== '0'">
              <el-row :gutter="16">
                <el-col :xs="24" :md="12">
                  <el-form-item label="姓名" :prop="`insuredList.${index}.insuredName`" :rules="rules.insuredName">
                    <el-input v-model="insured.insuredName" placeholder="请输入被保人姓名" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="证件类型" :prop="`insuredList.${index}.insuredCertType`" :rules="rules.insuredCertType">
                    <el-select v-model="insured.insuredCertType" class="w-full">
                      <el-option v-for="item in certTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="证件号码" :prop="`insuredList.${index}.insuredCertNo`" :rules="rules.insuredCertNo">
                    <el-input v-model="insured.insuredCertNo" placeholder="请输入证件号码" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="手机号码" :prop="`insuredList.${index}.insuredPhone`" :rules="rules.insuredPhone">
                    <el-input v-model="insured.insuredPhone" placeholder="请输入手机号码" maxlength="11" />
                  </el-form-item>
                </el-col>
                <template v-if="insured.insuredCertType === '0'">
                  <el-col :xs="24" :md="12">
                    <el-form-item label="证件生效期" :prop="`insuredList.${index}.insuredCertStartDate`" :rules="rules.insuredCertStartDate">
                      <el-date-picker
                        v-model="insured.insuredCertStartDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择日期"
                        class="w-full"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :md="12">
                    <el-form-item label="证件到期日" :prop="`insuredList.${index}.insuredCertEndDate`" :rules="rules.insuredCertEndDate">
                      <div class="end-date-field">
                        <el-input :model-value="formatEndDate(insured.insuredCertEndDate)" readonly placeholder="请选择到期日" />
                        <el-dropdown trigger="click" @command="(command) => handleEndDateCommand('insured', command, index)">
                          <el-button type="primary" plain>选择</el-button>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item v-for="item in endDateOptions" :key="item.value" :command="item.value">{{ item.label }}</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>
                    </el-form-item>
                  </el-col>
                </template>
                <el-col :xs="24" :md="12">
                  <el-form-item label="所在地区" :prop="`insuredList.${index}.insuredArea`" :rules="rules.insuredArea">
                    <el-cascader
                      :model-value="getAreaPath(insured.insuredArea)"
                      :options="areaOptions"
                      :props="areaCascaderProps"
                      placeholder="请选择省市区"
                      clearable
                      filterable
                      class="w-full"
                      @change="(value) => onAreaChange('insured', value, index)"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="详细地址" :prop="`insuredList.${index}.insuredDetailAddress`" :rules="rules.insuredDetailAddress">
                    <el-input v-model="insured.insuredDetailAddress" placeholder="请输入街道门牌等详细地址" />
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
            <el-alert v-else type="success" :closable="false" title="被保人信息同投保人" />
          </div>
        </el-card>

        <el-card v-if="dynamicFields.length > 0" shadow="never" class="form-section">
          <template #header><span class="section-title">扩展字段</span></template>
          <dynamic-insurance-form ref="dynamicFormRef" v-model="extraForm" :fields="dynamicFields" />
        </el-card>
      </el-form>
    </el-card>

    <el-dialog v-model="customEndDateVisible" title="选择证件到期日" width="360px" append-to-body>
      <el-date-picker v-model="customEndDateValue" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" class="w-full" />
      <template #footer>
        <el-button @click="customEndDateVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCustomEndDate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InsuranceTenantProductApply" lang="ts">
import { getInsuranceApplyRecordByOrderNo, saveInsureInfo } from '@/api/insurance/InsuranceApplyRecord';
import { getInsuranceCardOrderByOrderNo, saveCardOrderInfo } from '@/api/insurance/InsuranceCardOrder';
import { getProductFull } from '@/api/insurance/InsuranceProductConfig';
import DynamicInsuranceForm from '@/views/insurance/components/DynamicInsuranceForm.vue';
import type { InsuranceDynamicField } from '@/api/insurance/dynamicForm/types';
import { areaList } from '@vant/area-data';

interface AreaOption {
  label: string;
  value: string;
  children?: AreaOption[];
}

type AreaTarget = 'receiver' | 'applicant' | 'insured';
type EndDateTarget = 'applicant' | 'insured';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const route = useRoute();
const { insurance_card_company } = toRefs<any>(proxy?.useDict('insurance_card_company'));
const applyFormRef = ref<ElFormInstance>();
const cardApplyFormRef = ref<ElFormInstance>();
const dynamicFormRef = ref<InstanceType<typeof DynamicInsuranceForm>>();
const submitting = ref(false);
const orderInfo = ref<any>({});
const dynamicFields = ref<InsuranceDynamicField[]>([]);
const extraForm = ref<Record<string, any>>({});
const isCardOrderRoute = computed(() => route.query.orderType === 'card');
const isCardProduct = computed(() => Number(orderInfo.value?.productMode) === 1);
const isCardSecretOrder = computed(
  () => isCardOrderRoute.value || (Number(orderInfo.value?.productMode) === 3 && Number(orderInfo.value?.insureMode) === 2)
);

const certTypeOptions = [
  { label: '身份证', value: '0' },
  { label: '护照', value: '1' },
  { label: '出生证', value: '2' },
  { label: '其他', value: '3' }
];
const relationOptions = [
  { label: '本人', value: '0' },
  { label: '配偶', value: '1' },
  { label: '父母', value: '2' },
  { label: '子女', value: '3' },
  { label: '其他', value: '4' }
];
const endDateOptions = [
  { label: '5年', value: '5' },
  { label: '10年', value: '10' },
  { label: '20年', value: '20' },
  { label: '长期', value: 'long' },
  { label: '自定义日期', value: 'custom' }
];

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

const initInsured = () => ({
  relation: '',
  insuredName: '',
  insuredCertType: '0',
  insuredCertNo: '',
  insuredCertStartDate: '',
  insuredCertEndDate: '',
  insuredPhone: '',
  insuredArea: '',
  insuredDetailAddress: ''
});

const form = reactive({
  orderNo: '',
  policyStartDate: getTomorrowDate(),
  applicantName: '',
  applicantCertType: '0',
  applicantCertNo: '',
  applicantCertStartDate: '',
  applicantCertEndDate: '',
  applicantPhone: '',
  applicantArea: '',
  applicantDetailAddress: '',
  insuredList: [initInsured()]
});

const cardForm = reactive({
  orderNo: '',
  receiverName: '',
  receiverMobile: '',
  receiverArea: '',
  receiverDetailAddress: '',
  selectedCompanyCode: ''
});

const customEndDateVisible = ref(false);
const customEndDateValue = ref('');
const customEndDateTarget = ref<{ target: EndDateTarget; index: number }>({ target: 'applicant', index: 0 });

const required = (message: string, trigger = 'blur') => [{ required: true, message, trigger }];
const rules: any = {
  policyStartDate: [{ required: true, message: '请选择起保日期', trigger: 'change' }],
  applicantName: required('请输入投保人姓名'),
  applicantCertType: [{ required: true, message: '请选择证件类型', trigger: 'change' }],
  applicantCertNo: required('请输入证件号码'),
  applicantCertStartDate: [{ required: true, message: '请选择证件生效期', trigger: 'change' }],
  applicantCertEndDate: [{ required: true, message: '请选择证件到期日', trigger: 'change' }],
  applicantPhone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  applicantArea: required('请选择所在地区', 'change'),
  applicantDetailAddress: required('请输入详细地址'),
  relation: [{ required: true, message: '请选择关系', trigger: 'change' }],
  insuredName: required('请输入被保人姓名'),
  insuredCertType: [{ required: true, message: '请选择证件类型', trigger: 'change' }],
  insuredCertNo: required('请输入证件号码'),
  insuredCertStartDate: [{ required: true, message: '请选择证件生效期', trigger: 'change' }],
  insuredCertEndDate: [{ required: true, message: '请选择证件到期日', trigger: 'change' }],
  insuredPhone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  insuredArea: required('请选择所在地区', 'change'),
  insuredDetailAddress: required('请输入详细地址')
};

const cardRules: any = {
  receiverName: required('请输入收货人姓名'),
  receiverMobile: [
    { required: true, message: '请输入收货人手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  receiverArea: required('请选择所在地区', 'change'),
  receiverDetailAddress: required('请输入详细地址'),
  selectedCompanyCode: [{ required: true, message: '请选择保险公司', trigger: 'change' }]
};

const getAreaPath = (value: unknown) => {
  return String(value || '')
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
};

const buildAreaText = (value: unknown) => {
  return (Array.isArray(value) ? value : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .join(' ');
};

const onAreaChange = (target: AreaTarget, value: unknown, index = 0) => {
  const areaText = buildAreaText(value);
  if (target === 'receiver') {
    cardForm.receiverArea = areaText;
    return;
  }
  if (target === 'applicant') {
    form.applicantArea = areaText;
    return;
  }
  const insured = form.insuredList[index];
  if (insured) {
    insured.insuredArea = areaText;
  }
};

const formatEndDate = (value: string) => {
  return value === '9999-12-31' ? '长期' : value;
};

const getEndDateValue = (target: EndDateTarget, index = 0) => {
  if (target === 'applicant') return form.applicantCertEndDate;
  return form.insuredList[index]?.insuredCertEndDate || '';
};

const setEndDateValue = (target: EndDateTarget, value: string, index = 0) => {
  if (target === 'applicant') {
    form.applicantCertEndDate = value;
    return;
  }
  const insured = form.insuredList[index];
  if (insured) {
    insured.insuredCertEndDate = value;
  }
};

const getStartDateValue = (target: EndDateTarget, index = 0) => {
  if (target === 'applicant') return form.applicantCertStartDate;
  return form.insuredList[index]?.insuredCertStartDate || '';
};

const handleEndDateCommand = (target: EndDateTarget, command: string | number | object, index = 0) => {
  const value = String(command);
  if (value === 'custom') {
    customEndDateTarget.value = { target, index };
    customEndDateValue.value = getEndDateValue(target, index) === '9999-12-31' ? '' : getEndDateValue(target, index);
    customEndDateVisible.value = true;
    return;
  }
  if (value === 'long') {
    setEndDateValue(target, '9999-12-31', index);
    return;
  }

  const startDate = getStartDateValue(target, index);
  if (!startDate) {
    proxy?.$modal.msgWarning('请先选择证件生效期');
    return;
  }
  const parts = startDate.split('-');
  if (parts.length !== 3) {
    proxy?.$modal.msgWarning('证件生效期格式错误');
    return;
  }
  const years = Number(value);
  setEndDateValue(target, `${Number(parts[0]) + years}-${parts[1]}-${parts[2]}`, index);
};

const confirmCustomEndDate = () => {
  if (!customEndDateValue.value) {
    proxy?.$modal.msgWarning('请选择证件到期日');
    return;
  }
  setEndDateValue(customEndDateTarget.value.target, customEndDateValue.value, customEndDateTarget.value.index);
  customEndDateVisible.value = false;
};

const fetchOrder = async () => {
  form.orderNo = (route.query.orderNo as string) || '';
  if (!form.orderNo) {
    proxy?.$modal.msgError('缺少订单号');
    router.back();
    return;
  }
  const res = isCardOrderRoute.value ? await getInsuranceCardOrderByOrderNo(form.orderNo) : await getInsuranceApplyRecordByOrderNo(form.orderNo);
  orderInfo.value = res.data || {};
  if (!orderInfo.value) {
    proxy?.$modal.msgError('未找到订单');
    router.back();
    return;
  }
  await loadDynamicFields(orderInfo.value.productId);
  form.policyStartDate = orderInfo.value.policyStartDate?.slice?.(0, 10) || getTomorrowDate();
  cardForm.orderNo = form.orderNo;
  cardForm.receiverName = orderInfo.value.receiverName || orderInfo.value.customerName || '';
  cardForm.receiverMobile = orderInfo.value.receiverMobile || orderInfo.value.customerMobile || '';
  cardForm.selectedCompanyCode = orderInfo.value.selectedCompanyCode || '';
  if (orderInfo.value.receiverAddress) {
    cardForm.receiverDetailAddress = orderInfo.value.receiverAddress;
  }
  if (form.insuredList.length > 0) {
    form.insuredList[0].insuredName = orderInfo.value.customerName || '';
    form.insuredList[0].insuredPhone = orderInfo.value.customerMobile || '';
  }
  limitCardProductInsured();
};

const loadDynamicFields = async (productId?: string | number) => {
  dynamicFields.value = [];
  extraForm.value = {};
  if (!productId || isCardSecretOrder.value) return;
  const res = await getProductFull(productId);
  const schema = res.data?.product?.insureFormSchema;
  if (!schema) return;
  try {
    const fields = typeof schema === 'string' ? JSON.parse(schema) : schema;
    dynamicFields.value = Array.isArray(fields) ? fields.filter((field) => field?.key && field?.label && field?.type) : [];
    extraForm.value = dynamicFields.value.reduce((data, field) => {
      data[field.key] = field.type === 'checkbox' ? [] : undefined;
      return data;
    }, {} as Record<string, any>);
  } catch {
    dynamicFields.value = [];
    extraForm.value = {};
  }
};

const addInsured = () => {
  if (isCardProduct.value) {
    proxy?.$modal.msgWarning('卡单产品只能填写一名被保人');
    return;
  }
  form.insuredList.push(initInsured());
};

const removeInsured = (index: number) => {
  form.insuredList.splice(index, 1);
};

const limitCardProductInsured = () => {
  if (isCardProduct.value && form.insuredList.length > 1) {
    form.insuredList.splice(1);
  }
};

const submitForm = () => {
  if (isCardSecretOrder.value) {
    submitCardForm();
    return;
  }
  limitCardProductInsured();
  applyFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    const extraValid = await dynamicFormRef.value?.validate();
    if (!extraValid) return;
    submitting.value = true;
    try {
      await saveInsureInfo(form.orderNo, buildDto());
      proxy?.$modal.msgSuccess('投保信息提交成功');
      router.push({ path: '/insurance/tenant-product/payment', query: { orderNo: form.orderNo } });
    } finally {
      submitting.value = false;
    }
  });
};

const submitCardForm = () => {
  cardApplyFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await saveCardOrderInfo(cardForm.orderNo, buildCardDto());
      proxy?.$modal.msgSuccess('购买信息提交成功');
      router.push({ path: '/insurance/tenant-product/payment', query: { orderNo: cardForm.orderNo, orderType: 'card' } });
    } finally {
      submitting.value = false;
    }
  });
};

const buildDto = () => {
  const applicantAddr = `${form.applicantArea} ${form.applicantDetailAddress}`.trim();
  return {
    policyStartDate: form.policyStartDate,
    applicantName: form.applicantName,
    applicantCertType: form.applicantCertType,
    applicantCertNo: form.applicantCertNo,
    certStartDate: form.applicantCertStartDate,
    certEndDate: form.applicantCertEndDate,
    applicantPhone: form.applicantPhone,
    applicantAddress: applicantAddr,
    insuredList: form.insuredList.map((insured) => {
      if (insured.relation === '0') {
        return {
          relation: '0',
          insuredName: form.applicantName,
          insuredCertType: form.applicantCertType,
          insuredCertNo: form.applicantCertNo,
          certStartDate: form.applicantCertStartDate,
          certEndDate: form.applicantCertEndDate,
          insuredPhone: form.applicantPhone,
          insuredAddress: applicantAddr
        };
      }
      return {
        relation: insured.relation,
        insuredName: insured.insuredName,
        insuredCertType: insured.insuredCertType,
        insuredCertNo: insured.insuredCertNo,
        certStartDate: insured.insuredCertStartDate,
        certEndDate: insured.insuredCertEndDate,
        insuredPhone: insured.insuredPhone,
        insuredAddress: `${insured.insuredArea} ${insured.insuredDetailAddress}`.trim()
      };
    }),
    extraData: extraForm.value
  };
};

const buildCardDto = () => {
  return {
    productMode: 3,
    selectedCompanyCode: cardForm.selectedCompanyCode,
    receiverName: cardForm.receiverName,
    receiverMobile: cardForm.receiverMobile,
    receiverAddress: `${cardForm.receiverArea} ${cardForm.receiverDetailAddress}`.trim()
  };
};

onMounted(() => {
  fetchOrder();
});
</script>

<style scoped>
.page-header,
.section-header,
.insured-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title,
.section-title {
  font-weight: 600;
}

.page-title {
  margin-left: 10px;
  font-size: 16px;
}

.form-section {
  margin-bottom: 12px;
}

.insured-block {
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}

.insured-title {
  margin-bottom: 12px;
  font-weight: 600;
}

.end-date-field {
  display: flex;
  width: 100%;
  gap: 8px;
}

.end-date-field .el-input {
  flex: 1;
}

.w-full {
  width: 100%;
}
</style>
