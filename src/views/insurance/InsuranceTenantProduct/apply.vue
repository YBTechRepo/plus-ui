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
                <el-input v-model="cardForm.receiverArea" placeholder="请输入省市区" />
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
                  <el-date-picker v-model="form.applicantCertEndDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" class="w-full" />
                </el-form-item>
              </el-col>
            </template>
            <el-col :xs="24" :md="12">
              <el-form-item label="所在地区" prop="applicantArea">
                <el-input v-model="form.applicantArea" placeholder="请输入省市区" />
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
                      <el-date-picker
                        v-model="insured.insuredCertEndDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择日期"
                        class="w-full"
                      />
                    </el-form-item>
                  </el-col>
                </template>
                <el-col :xs="24" :md="12">
                  <el-form-item label="所在地区" :prop="`insuredList.${index}.insuredArea`" :rules="rules.insuredArea">
                    <el-input v-model="insured.insuredArea" placeholder="请输入省市区" />
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
  </div>
</template>

<script setup name="InsuranceTenantProductApply" lang="ts">
import { getInsuranceApplyRecordByOrderNo, saveInsureInfo } from '@/api/insurance/InsuranceApplyRecord';
import { getInsuranceCardOrderByOrderNo, saveCardOrderInfo } from '@/api/insurance/InsuranceCardOrder';
import { getProductFull } from '@/api/insurance/InsuranceProductConfig';
import DynamicInsuranceForm from '@/views/insurance/components/DynamicInsuranceForm.vue';
import type { InsuranceDynamicField } from '@/api/insurance/dynamicForm/types';

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

const required = (message: string) => [{ required: true, message, trigger: 'blur' }];
const rules: any = {
  applicantName: required('请输入投保人姓名'),
  applicantCertType: [{ required: true, message: '请选择证件类型', trigger: 'change' }],
  applicantCertNo: required('请输入证件号码'),
  applicantCertStartDate: [{ required: true, message: '请选择证件生效期', trigger: 'change' }],
  applicantCertEndDate: [{ required: true, message: '请选择证件到期日', trigger: 'change' }],
  applicantPhone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  applicantArea: required('请输入所在地区'),
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
  insuredArea: required('请输入所在地区'),
  insuredDetailAddress: required('请输入详细地址')
};

const cardRules: any = {
  receiverName: required('请输入收货人姓名'),
  receiverMobile: [
    { required: true, message: '请输入收货人手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  receiverArea: required('请输入所在地区'),
  receiverDetailAddress: required('请输入详细地址'),
  selectedCompanyCode: [{ required: true, message: '请选择保险公司', trigger: 'change' }]
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

.w-full {
  width: 100%;
}
</style>
