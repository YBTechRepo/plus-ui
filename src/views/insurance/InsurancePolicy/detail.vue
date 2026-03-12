<template>
  <div class="p-2">
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <el-button icon="Back" circle @click="handleBack" class="mr-3" />
            <span class="text-lg font-bold">保单详情</span>
          </div>
          <el-tag :type="getStatusType(form.status)">
            <dict-tag :options="insurance_policy_status" :value="form.status" />
          </el-tag>
        </div>
      </template>

      <el-skeleton :loading="loading" animated>
        <template #default>
          <el-descriptions title="基础信息" :column="3" border class="mb-5">
            <el-descriptions-item label="保单号">{{ form.policyNo }}</el-descriptions-item>
            <el-descriptions-item label="产品名称">{{ form.productName }}</el-descriptions-item>
            <el-descriptions-item label="产品编码">{{ form.productCode }}</el-descriptions-item>
            <el-descriptions-item label="订单号">{{ form.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="保费">{{ form.premium }}</el-descriptions-item>
            <el-descriptions-item label="保额">{{ form.amt }}</el-descriptions-item>
            <el-descriptions-item label="业务人员">{{ form.agentName }}</el-descriptions-item>
            <el-descriptions-item label="结算状态">
              <dict-tag :options="insurance_commission_status" :value="form.commissionStatus" />
            </el-descriptions-item>
          </el-descriptions>

          <el-descriptions title="投保人信息" :column="3" border class="mb-5">
            <el-descriptions-item label="姓名">{{ form.applicantName }}</el-descriptions-item>
            <el-descriptions-item label="性别">
              <dict-tag :options="insurance_sex" :value="form.applicantSex" />
            </el-descriptions-item>
            <el-descriptions-item label="手机号">{{ form.applicantMobile }}</el-descriptions-item>
            <el-descriptions-item label="证件类型">
              <dict-tag :options="insurance_id_type" :value="form.applicantIdType" />
            </el-descriptions-item>
            <el-descriptions-item label="证件号">{{ form.applicantIdNo }}</el-descriptions-item>
          </el-descriptions>

          <el-descriptions title="被保人信息" :column="3" border class="mb-5">
            <el-descriptions-item label="姓名">{{ form.insuredName }}</el-descriptions-item>
            <el-descriptions-item label="性别">
              <dict-tag :options="insurance_sex" :value="form.insuredSex" />
            </el-descriptions-item>
            <el-descriptions-item label="手机号">{{ form.insuredMobile }}</el-descriptions-item>
            <el-descriptions-item label="与投保人关系">
              <dict-tag :options="insurance_relationship_to_insured" :value="form.relationshipToInsured" />
            </el-descriptions-item>
            <el-descriptions-item label="证件类型">
              <dict-tag :options="insurance_id_type" :value="form.insuredIdType" />
            </el-descriptions-item>
            <el-descriptions-item label="证件号">{{ form.insuredIdNo }}</el-descriptions-item>
          </el-descriptions>

          <el-descriptions title="时间信息" :column="2" border>
            <el-descriptions-item label="投保时间">{{ parseTime(form.appntDate) }}</el-descriptions-item>
            <el-descriptions-item label="承保时间">{{ parseTime(form.accecptDate) }}</el-descriptions-item>
            <el-descriptions-item label="保障开始时间">{{ parseTime(form.policyStartDate) }}</el-descriptions-item>
            <el-descriptions-item label="保障结束时间">{{ parseTime(form.policyEndDate) }}</el-descriptions-item>
            <el-descriptions-item label="保单失效时间">{{ parseTime(form.policyInvalidDate) }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script setup name="InsurancePolicyDetail" lang="ts">
import { getInsurancePolicy } from '@/api/insurance/InsurancePolicy';
import { InsurancePolicyVO } from '@/api/insurance/InsurancePolicy/types';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const {
  insurance_policy_status,
  insurance_id_type,
  insurance_relationship_to_insured,
  insurance_sex,
  insurance_commission_status
} = toRefs<any>(proxy?.useDict('insurance_policy_status', 'insurance_id_type', 'insurance_relationship_to_insured', 'insurance_sex', 'insurance_commission_status'));

const loading = ref(true);
const form = ref<Partial<InsurancePolicyVO>>({});

const getStatusType = (status: any): 'success' | 'info' | 'warning' | 'danger' => {
  switch (status) {
    case '1':
      return 'success';
    case '2':
      return 'danger';
    case '3':
      return 'info';
    default:
      return 'info';
  }
};

const handleBack = () => {
  router.back();
};

const getDetail = async (id: string | number) => {
  loading.value = true;
  try {
    const res = await getInsurancePolicy(id);
    form.value = res.data;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const id = route.query.id as string;
  // 优先从 state 获取已加载的数据
  const stateData = (history.state as any)?.policyData;
  if (stateData) {
    form.value = stateData;
    loading.value = false;
  } else if (id) {
    getDetail(id);
  } else {
    proxy?.$modal.msgError('参数错误，无法加载详情');
    loading.value = false;
  }
});
</script>

<style scoped>
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.mr-3 {
  margin-right: 0.75rem;
}
.mb-5 {
  margin-bottom: 1.25rem;
}
.text-lg {
  font-size: 1.125rem;
}
.font-bold {
  font-weight: 700;
}
</style>