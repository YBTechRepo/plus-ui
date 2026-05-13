<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="租户编号" prop="tenantId">
              <el-input v-model="queryParams.tenantId" placeholder="请输入租户编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="租户名称" prop="tenantName">
              <el-input v-model="queryParams.tenantName" placeholder="请输入租户名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品编码" prop="productCode">
              <el-input v-model="queryParams.productCode" placeholder="请输入产品编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="保单号" prop="policyNo">
              <el-input v-model="queryParams.policyNo" placeholder="请输入保单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="业务人员姓名" prop="agentName">
              <el-input v-model="queryParams.agentName" placeholder="请输入业务人员姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="保费" prop="premium">
              <el-input v-model="queryParams.premium" placeholder="请输入保费" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="保额" prop="amt">
              <el-input v-model="queryParams.amt" placeholder="请输入保额" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="结算状态" prop="commissionStatus">
              <el-select v-model="queryParams.commissionStatus" placeholder="请选择结算状态" clearable>
                <el-option v-for="dict in insurance_commission_status" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
              </el-select>
            </el-form-item>
            <el-form-item label="保单状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择保单状态" clearable>
                <el-option v-for="dict in insurance_policy_status" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
              </el-select>
            </el-form-item>
            <el-form-item label="投保时间" prop="appntDate">
              <el-date-picker v-model="queryParams.appntDate" clearable type="date" value-format="YYYY-MM-DD" placeholder="请选择投保时间" />
            </el-form-item>
            <el-form-item label="投保人姓名" prop="applicantName">
              <el-input v-model="queryParams.applicantName" placeholder="请输入投保人姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:InsurancePolicyAdmin:export']">
              导出
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="insurancePolicyAdminList">
        <el-table-column label="租户编号" align="center" prop="tenantId" width="110" />
        <el-table-column label="租户名称" align="center" prop="tenantName" width="160" show-overflow-tooltip />
        <el-table-column label="保单号" align="center" prop="policyNo" width="180">
          <template #default="scope">
            <el-link type="primary" @click="openDetail(scope.row)">{{ scope.row.policyNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="订单号" align="center" prop="orderNo" width="180" />
        <el-table-column label="产品编码" align="center" prop="productCode" width="130" show-overflow-tooltip />
        <el-table-column label="产品名称" align="center" prop="productName" min-width="180" show-overflow-tooltip />
        <el-table-column label="业务人员姓名" align="center" prop="agentName" width="130" />
        <el-table-column label="保费" align="center" prop="premium" width="100" />
        <el-table-column label="保额" align="center" prop="amt" width="100" />
        <el-table-column label="保单状态" align="center" prop="status" width="110">
          <template #default="scope">
            <dict-tag :options="insurance_policy_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="投保人姓名" align="center" prop="applicantName" width="120" />
        <el-table-column label="投保时间" align="center" prop="appntDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.appntDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="承保时间" align="center" prop="accecptDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.accecptDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="保障开始时间" align="center" prop="policyStartDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.policyStartDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="保障结束时间" align="center" prop="policyEndDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.policyEndDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结算状态" align="center" prop="commissionStatus" width="110">
          <template #default="scope">
            <dict-tag :options="insurance_commission_status" :value="scope.row.commissionStatus" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="100" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button
                link
                type="primary"
                icon="View"
                @click="openDetail(scope.row)"
                v-hasPermi="['insurance:InsurancePolicyAdmin:query']"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-drawer v-model="detailDrawer.visible" title="承保保单详情" size="760px" direction="rtl">
      <div v-loading="detailDrawer.loading" class="p-4">
        <el-descriptions title="租户信息" :column="2" border class="mb-5">
          <el-descriptions-item label="租户编号">{{ detailDrawer.data.tenantId || '--' }}</el-descriptions-item>
          <el-descriptions-item label="租户名称">{{ detailDrawer.data.tenantName || '--' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="基础信息" :column="2" border class="mb-5">
          <el-descriptions-item label="保单号">{{ detailDrawer.data.policyNo || '--' }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ detailDrawer.data.orderNo || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ detailDrawer.data.productName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品编码">{{ detailDrawer.data.productCode || '--' }}</el-descriptions-item>
          <el-descriptions-item label="保费">{{ detailDrawer.data.premium ?? '--' }}</el-descriptions-item>
          <el-descriptions-item label="保额">{{ detailDrawer.data.amt ?? '--' }}</el-descriptions-item>
          <el-descriptions-item label="业务人员">{{ detailDrawer.data.agentName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="保单状态">
            <dict-tag :options="insurance_policy_status" :value="detailDrawer.data.status" />
          </el-descriptions-item>
          <el-descriptions-item label="结算状态">
            <dict-tag :options="insurance_commission_status" :value="detailDrawer.data.commissionStatus" />
          </el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="投保人信息" :column="2" border class="mb-5">
          <el-descriptions-item label="姓名">{{ detailDrawer.data.applicantName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            <dict-tag :options="insurance_sex" :value="detailDrawer.data.applicantSex" />
          </el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detailDrawer.data.applicantMobile || '--' }}</el-descriptions-item>
          <el-descriptions-item label="证件类型">
            <dict-tag :options="insurance_id_type" :value="detailDrawer.data.applicantIdType" />
          </el-descriptions-item>
          <el-descriptions-item label="证件号">{{ detailDrawer.data.applicantIdNo || '--' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="被保人信息" :column="2" border class="mb-5">
          <el-descriptions-item label="姓名">{{ detailDrawer.data.insuredName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            <dict-tag :options="insurance_sex" :value="detailDrawer.data.insuredSex" />
          </el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detailDrawer.data.insuredMobile || '--' }}</el-descriptions-item>
          <el-descriptions-item label="与投保人关系">
            <dict-tag :options="insurance_relationship_to_insured" :value="detailDrawer.data.relationshipToInsured" />
          </el-descriptions-item>
          <el-descriptions-item label="证件类型">
            <dict-tag :options="insurance_id_type" :value="detailDrawer.data.insuredIdType" />
          </el-descriptions-item>
          <el-descriptions-item label="证件号">{{ detailDrawer.data.insuredIdNo || '--' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="时间信息" :column="2" border>
          <el-descriptions-item label="投保时间">{{ parseTime(detailDrawer.data.appntDate) || '--' }}</el-descriptions-item>
          <el-descriptions-item label="承保时间">{{ parseTime(detailDrawer.data.accecptDate) || '--' }}</el-descriptions-item>
          <el-descriptions-item label="保障开始时间">{{ parseTime(detailDrawer.data.policyStartDate) || '--' }}</el-descriptions-item>
          <el-descriptions-item label="保障结束时间">{{ parseTime(detailDrawer.data.policyEndDate) || '--' }}</el-descriptions-item>
          <el-descriptions-item label="保单失效时间">{{ parseTime(detailDrawer.data.policyInvalidDate) || '--' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup name="InsurancePolicyAdmin" lang="ts">
import { getInsurancePolicyAdmin, listInsurancePolicyAdmin } from '@/api/insurance/InsurancePolicyAdmin';
import { InsurancePolicyAdminQuery, InsurancePolicyAdminVO } from '@/api/insurance/InsurancePolicyAdmin/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_policy_status, insurance_id_type, insurance_relationship_to_insured, insurance_sex, insurance_commission_status } = toRefs<any>(
  proxy?.useDict('insurance_policy_status', 'insurance_id_type', 'insurance_relationship_to_insured', 'insurance_sex', 'insurance_commission_status')
);

const insurancePolicyAdminList = ref<InsurancePolicyAdminVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();

const detailDrawer = reactive({
  visible: false,
  loading: false,
  data: {} as Partial<InsurancePolicyAdminVO>
});

const data = reactive<PageData<Partial<InsurancePolicyAdminVO>, InsurancePolicyAdminQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: undefined,
    tenantName: undefined,
    productCode: undefined,
    productName: undefined,
    policyNo: undefined,
    orderNo: undefined,
    agentName: undefined,
    premium: undefined,
    amt: undefined,
    commissionStatus: undefined,
    status: undefined,
    appntDate: undefined,
    applicantName: undefined,
    params: {}
  },
  rules: {}
});

const { queryParams } = toRefs(data);

/** 查询平台承保保单列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await listInsurancePolicyAdmin(queryParams.value);
    insurancePolicyAdminList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 打开详情 */
const openDetail = async (row: InsurancePolicyAdminVO) => {
  detailDrawer.visible = true;
  detailDrawer.loading = true;
  detailDrawer.data = row;
  try {
    const res = await getInsurancePolicyAdmin(row.id);
    detailDrawer.data = res.data || row;
  } finally {
    detailDrawer.loading = false;
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('insurance/InsurancePolicyAdmin/export', { ...queryParams.value }, `InsurancePolicyAdmin_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.mb-5 {
  margin-bottom: 1.25rem;
}
</style>
