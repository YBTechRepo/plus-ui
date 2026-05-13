<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="租户" prop="tenantId">
              <el-select v-model="queryParams.tenantId" placeholder="请选择租户" clearable filterable style="width: 220px">
                <el-option v-for="item in tenantOptions" :key="item.tenantId" :label="item.companyName" :value="item.tenantId" />
              </el-select>
            </el-form-item>
            <el-form-item label="保单号" prop="policyNo">
              <el-input v-model="queryParams.policyNo" placeholder="请输入保单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="创建日期">
              <el-date-picker
                v-model="queryParams.params.beginTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="开始日期"
                style="width: 130px"
              />
              <span class="mx-1">-</span>
              <el-date-picker
                v-model="queryParams.params.endTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="结束日期"
                style="width: 130px"
              />
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['commission:CommissionRecordAdmin:export']">
              导出
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="commissionRecordAdminList">
        <el-table-column label="租户号" align="center" prop="tenantId" width="110" />
        <el-table-column label="租户名称" align="center" prop="tenantName" width="160" show-overflow-tooltip />
        <el-table-column label="保单号" align="center" prop="policyNo" width="150" />
        <el-table-column label="产品名称" align="center" prop="productName" width="150" show-overflow-tooltip />
        <el-table-column label="实交保费" align="center" prop="premium" width="100" />
        <el-table-column label="佣金计算基数" align="center" prop="commissionBase" width="110" />
        <el-table-column label="业务员姓名" align="center" prop="salesUserName" width="110" />
        <el-table-column label="团队长姓名" align="center" prop="teamUserName" width="110" />
        <el-table-column label="总代理姓名" align="center" prop="projectUserName" width="110" />
        <el-table-column label="业务员实发金额" align="center" prop="salesAmount" width="120" />
        <el-table-column label="团队长实发金额" align="center" prop="teamAmount" width="120" />
        <el-table-column label="总代理实发金额" align="center" prop="projectAmount" width="120" />
        <el-table-column label="计算依据" align="center" prop="calcStrategy" width="150">
          <template #default="scope">
            <dict-tag :options="commission_calc_strategy" :value="scope.row.calcStrategy" />
          </template>
        </el-table-column>
        <el-table-column label="业务佣金比例" align="center" prop="salesRatio" width="110">
          <template #default="scope">
            <span>{{ formatRatio(scope.row.salesRatio) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="团队佣金比例" align="center" prop="teamRatio" width="110">
          <template #default="scope">
            <span>{{ formatRatio(scope.row.teamRatio) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总代理佣金比例" align="center" prop="projectRatio" width="120">
          <template #default="scope">
            <span>{{ formatRatio(scope.row.projectRatio) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="业务员佣金发放状态" align="center" prop="salesStatus" width="150">
          <template #default="scope">
            <dict-tag :options="commission_pay_status" :value="scope.row.salesStatus" />
          </template>
        </el-table-column>
        <el-table-column label="团队收益发放状态" align="center" prop="teamStatus" width="150">
          <template #default="scope">
            <dict-tag :options="commission_pay_status" :value="scope.row.teamStatus" />
          </template>
        </el-table-column>
        <el-table-column label="总代理收益发放状态" align="center" prop="projectStatus" width="150">
          <template #default="scope">
            <dict-tag :options="commission_pay_status" :value="scope.row.projectStatus" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="110">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="CommissionRecordAdmin" lang="ts">
import { getTenantList } from '@/api/login';
import { TenantVO } from '@/api/types';
import { listCommissionRecordAdmin } from '@/api/commission/CommissionRecordAdmin';
import { CommissionRecordAdminQuery, CommissionRecordAdminVO } from '@/api/commission/CommissionRecordAdmin/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { commission_calc_strategy, commission_pay_status } = toRefs<any>(proxy?.useDict('commission_calc_strategy', 'commission_pay_status'));

const commissionRecordAdminList = ref<CommissionRecordAdminVO[]>([]);
const tenantOptions = ref<TenantVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();

const data = reactive<PageData<Partial<CommissionRecordAdminVO>, CommissionRecordAdminQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: undefined,
    policyNo: undefined,
    createTime: undefined,
    params: {
      beginTime: undefined,
      endTime: undefined
    }
  },
  rules: {}
});

const { queryParams } = toRefs(data);

const formatRatio = (value?: number | string) => {
  return value != null ? (Number(value) * 100).toFixed(0) + '%' : '--';
};

/** 查询租户选项 */
const getTenantOptions = async () => {
  const { data } = await getTenantList(true);
  tenantOptions.value = data.voList || [];
};

/** 查询租户佣金分配明细列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await listCommissionRecordAdmin(queryParams.value);
    commissionRecordAdminList.value = res.rows;
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
  queryParams.value.params = { beginTime: undefined, endTime: undefined };
  handleQuery();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('commission/CommissionRecordAdmin/export', { ...queryParams.value }, `CommissionRecordAdmin_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  getTenantOptions();
  getList();
});
</script>
