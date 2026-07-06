<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="业务员姓名" prop="agentName">
              <el-input v-model="queryParams.agentName" placeholder="请输入业务员姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="订单状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable style="width: 130px">
                <el-option v-for="dict in insurance_apply_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item> -->
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:insuranceProxyOrder:export']"
              >导出</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table ref="proxyOrderTableRef" :key="proxyOrderTableKey" v-loading="loading" border :data="insuranceProxyOrderList" row-key="id">
        <el-table-column key="tenantId" column-key="tenantId" label="租户编号" align="center" prop="tenantId" width="110" />
        <el-table-column key="tenantName" column-key="tenantName" label="租户名称" align="center" prop="tenantName" width="160" show-overflow-tooltip />
        <el-table-column key="orderNo" column-key="orderNo" label="订单号" align="center" prop="orderNo" width="300">
          <template #default="scope">
            <el-link type="primary" @click="openDetailDrawer(scope.row)">{{ scope.row.orderNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column key="productName" column-key="productName" label="产品名称" align="center" prop="productName" width="300" show-overflow-tooltip />
        <el-table-column key="policyStartDate" column-key="policyStartDate" label="起保日期" align="center" prop="policyStartDate" width="120">
          <template #default="scope">
            <span>{{ displayDate(scope.row.policyStartDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column key="agentName" column-key="agentName" label="业务员姓名" align="center" prop="agentName" width="150" />
        <el-table-column key="premium" column-key="premium" label="登记保费" align="center" prop="premium" width="150" />
        <el-table-column key="netPremium" column-key="netPremium" label="净费" align="center" prop="netPremium" width="150" />
        <el-table-column key="status" column-key="status" label="订单状态" align="center" prop="status" width="120">
          <template #default="scope">
            <dict-tag :options="insurance_apply_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="结算状态" align="center" prop="commissionStatus" width="120">
          <template #default="scope">
            <dict-tag :options="insurance_commission_status" :value="scope.row.commissionStatus" />
          </template>
        </el-table-column> -->
        <el-table-column key="createTime" column-key="createTime" label="创建时间" align="center" prop="createTime" width="150">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column key="operation" column-key="operation" label="操作" align="center" fixed="right" min-width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="table-action">
              <el-button link type="primary" icon="View" @click="openDetailDrawer(scope.row)">查看详情</el-button>
              <el-dropdown v-if="canCancelOrder(scope.row)" trigger="click" @command="(command) => handleMoreCommand(command, scope.row)">
                <el-button link type="primary" icon="ArrowDown">更多</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="cancel" icon="CircleClose">取消订单</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailDrawer.visible" :title="drawerTitle" size="80%" direction="rtl">
      <template #header>
        <div class="flex items-center">
          <el-button
            v-if="detailDrawer.viewType === 'PERSON_DETAIL' && detailDrawer.isFromBatch"
            icon="Back"
            circle
            class="mr-2"
            @click="backToBatchList"
          />
          <span class="font-bold text-lg">{{ drawerTitle }}</span>
        </div>
      </template>

      <div v-loading="detailDrawer.loading" class="p-4">
        <!-- 视图 A：子单列表 (isBatch=1 时展示) -->
        <div v-if="detailDrawer.viewType === 'SUB_LIST'">
          <el-table border :data="detailDrawer.list" style="width: 100%">
            <el-table-column type="index" label="序号" width="55" align="center" />
            <el-table-column label="子单号" align="center" prop="orderNo" width="350">
              <template #default="scope">
                <el-link type="primary" @click="fetchPersonDetail(scope.row.orderNo)">{{ scope.row.orderNo }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="投保人" align="center" prop="appName" width="200" />
            <el-table-column label="被保人" align="center" prop="insuredName" width="200" />
            <el-table-column label="起保日期" align="center" prop="policyStartDate" width="160">
              <template #default="scope">
                <span>{{ displayDate(scope.row.policyStartDate) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="子单状态" align="center" prop="status" width="200">
              <template #default="scope">
                <dict-tag :options="insurance_apply_status" :value="scope.row.status" />
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="scope">
                <el-button link type="primary" @click="fetchPersonDetail(scope.row.orderNo)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 视图 B：个人详情 (isBatch=0 或点击子单后展示) -->
        <div v-else-if="detailDrawer.viewType === 'PERSON_DETAIL'">
          <el-row :gutter="20">
            <!-- 投保人信息 -->
            <el-col :span="12">
              <el-descriptions title="投保人信息" :column="1" border>
                <el-descriptions-item label="姓名">{{ detailDrawer.personDetail.appName }}</el-descriptions-item>
                <el-descriptions-item label="电话">{{ detailDrawer.personDetail.appPhone }}</el-descriptions-item>
                <el-descriptions-item label="地址">{{ detailDrawer.personDetail.appAddress }}</el-descriptions-item>
                <el-descriptions-item label="证件类型">
                  <dict-tag :options="insurance_id_type" :value="detailDrawer.personDetail.appCertType" />
                </el-descriptions-item>
                <el-descriptions-item label="证件号">{{ detailDrawer.personDetail.appCertNo }}</el-descriptions-item>
              </el-descriptions>
            </el-col>
            <!-- 被保人信息 -->
            <el-col :span="12">
              <el-descriptions title="被保人信息" :column="1" border>
                <el-descriptions-item label="姓名">{{ detailDrawer.personDetail.insuredName }}</el-descriptions-item>
                <el-descriptions-item label="电话">{{ detailDrawer.personDetail.insuredPhone }}</el-descriptions-item>
                <el-descriptions-item label="地址">{{ detailDrawer.personDetail.insuredAddress }}</el-descriptions-item>
                <el-descriptions-item label="证件类型">
                  <dict-tag :options="insurance_id_type" :value="detailDrawer.personDetail.insuredCertType" />
                </el-descriptions-item>
                <el-descriptions-item label="证件号">{{ detailDrawer.personDetail.insuredCertNo }}</el-descriptions-item>
                <el-descriptions-item label="与投保人关系">
                  <dict-tag :options="insurance_relationship_to_insured" :value="detailDrawer.personDetail.relation" />
                </el-descriptions-item>
              </el-descriptions>
            </el-col>
          </el-row>
          <el-divider />
          <el-descriptions title="订单其它信息" :column="2" border>
            <el-descriptions-item label="订单号">{{ detailDrawer.personDetail.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="起保日期">{{ displayDate(detailDrawer.personDetail.policyStartDate) }}</el-descriptions-item>
          </el-descriptions>
          <template v-if="detailExtraItems.length > 0">
            <el-divider />
            <el-descriptions title="扩展字段" :column="2" border>
              <el-descriptions-item v-for="item in detailExtraItems" :key="item.key" :label="item.label">{{ displayExtraValue(item) }}</el-descriptions-item>
            </el-descriptions>
          </template>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup name="InsuranceProxyOrder" lang="ts">
import { changeInsuranceProxyOrderStatus, listInsuranceProxyOrder } from '@/api/insurance/insuranceProxyOrder';
import { InsuranceProxyOrderVO, InsuranceProxyOrderQuery } from '@/api/insurance/insuranceProxyOrder/types';
import type { InsuranceDynamicField } from '@/api/insurance/dynamicForm/types';
import { useUserStore } from '@/store/modules/user';
import request from '@/utils/request';
import { parseTime } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const userStore = useUserStore();
const { insurance_apply_status, insurance_commission_status, insurance_id_type, insurance_relationship_to_insured } = toRefs<any>(
  proxy?.useDict('insurance_apply_status', 'insurance_commission_status', 'insurance_id_type', 'insurance_relationship_to_insured')
);

const insuranceProxyOrderList = ref<InsuranceProxyOrderVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const proxyOrderTableRef = ref();
const proxyOrderTableKey = ref(0);

const queryFormRef = ref<ElFormInstance>();

const data = reactive<PageData<any, InsuranceProxyOrderQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    productName: undefined,
    agentName: undefined,
    status: undefined,
    // 固定过滤：代投保模式
    insureMode: 1,
    params: {
      beginTime: undefined,
      endTime: undefined
    }
  },
  rules: {}
});

const { queryParams } = toRefs(data);

/** 查询代投保订单列表 */
const getList = async () => {
  loading.value = true;
  const res = await listInsuranceProxyOrder(queryParams.value);
  insuranceProxyOrderList.value = res.rows;
  total.value = res.total;
  proxyOrderTableKey.value += 1;
  await nextTick();
  proxyOrderTableRef.value?.doLayout?.();
  loading.value = false;
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
  proxy?.download('insurance/insuranceProxyOrder/export', { ...queryParams.value }, `代投保订单_${new Date().getTime()}.xlsx`);
};

const isSystemAdmin = computed(() => userStore.roles.includes('superadmin'));

const canCancelOrder = (row: InsuranceProxyOrderVO) => {
  return isSystemAdmin.value && Number(row.status) !== 4;
};

const handleCancelOrder = async (row: InsuranceProxyOrderVO) => {
  const batchTip = Number(row.isBatch) === 1 ? '，该批次主单及全部子单都会同步取消' : '';
  await proxy?.$modal.confirm(`确认要取消订单"${row.orderNo}"吗${batchTip}？`);
  await changeInsuranceProxyOrderStatus({
    id: row.id,
    orderNo: row.orderNo,
    status: 4
  });
  proxy?.$modal.msgSuccess('订单已取消');
  await getList();
};

const handleMoreCommand = (command: string | number | object, row: InsuranceProxyOrderVO) => {
  if (command === 'cancel') {
    handleCancelOrder(row);
  }
};

// ===================== 详情下钻逻辑 =====================
const detailDrawer = reactive({
  visible: false,
  loading: false,
  viewType: 'SUB_LIST' as 'SUB_LIST' | 'PERSON_DETAIL',
  isFromBatch: false, // 标记是否是从批次列表进入详情的
  currentOrderNo: '',
  list: [] as any[], // 子单列表
  personDetail: {} as any // 个人明细
});

const drawerTitle = computed(() => {
  if (detailDrawer.viewType === 'SUB_LIST') {
    return `批次成员清单 - ${detailDrawer.currentOrderNo}`;
  }
  return `保单人员明细 - ${detailDrawer.personDetail.orderNo || detailDrawer.currentOrderNo}`;
});

const detailExtraItems = computed(() => buildExtraItems(detailDrawer.personDetail?.insureFormSchema, detailDrawer.personDetail?.insureExtraData));

const hasValue = (value: unknown) => {
  return value !== undefined && value !== null && value !== '';
};

const displayValue = (value: unknown) => {
  return hasValue(value) ? value : '--';
};

const displayDate = (value?: string | null) => {
  const dateValue = typeof value === 'string' ? value.trim() : value;
  return hasValue(dateValue) ? parseTime(dateValue, '{y}-{m}-{d}') : '--';
};

const parseJsonValue = (value: any, fallback: any) => {
  if (!value) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const buildExtraItems = (schemaValue: any, dataValue: any) => {
  const schema = parseJsonValue(schemaValue, []) as InsuranceDynamicField[];
  const data = parseJsonValue(dataValue, {}) as Record<string, any>;
  if (!Array.isArray(schema) || !data || typeof data !== 'object') return [];
  return schema
    .filter((field) => field?.key && field?.label && Object.prototype.hasOwnProperty.call(data, field.key))
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .map((field) => ({ key: field.key, label: field.label, type: field.type, options: field.options || [], value: data[field.key] }));
};

const getExtraOptionLabel = (field: Pick<InsuranceDynamicField, 'options'>, value: any) => {
  const text = String(value ?? '');
  const matched = (field.options || []).find((option) => option.value === text || option.label === text);
  return matched?.label || text;
};

const displayExtraValue = (item: any) => {
  const value = item?.value;
  if (item?.type === 'address' && value && typeof value === 'object' && !Array.isArray(value)) {
    const text = [value.regionText, value.detail].filter(Boolean).join(' ');
    return text || '--';
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((val) => getExtraOptionLabel(item, val)).join('、') : '--';
  }
  if (item?.type === 'select' || item?.type === 'radio' || item?.type === 'checkbox') {
    const text = getExtraOptionLabel(item, value);
    return hasValue(text) ? text : '--';
  }
  return displayValue(value);
};

/** 打开详情主入口 */
const openDetailDrawer = async (row: InsuranceProxyOrderVO) => {
  detailDrawer.currentOrderNo = row.orderNo;
  detailDrawer.visible = true;
  detailDrawer.loading = true;

  if (row.isBatch === 1) {
    // 场景 A: 批量主单 -> 展示清单
    detailDrawer.viewType = 'SUB_LIST';
    detailDrawer.isFromBatch = true;
    await fetchSubOrders(row.orderNo);
  } else {
    // 场景 B: 普通单 (isBatch=0) -> 直接展示个人
    detailDrawer.viewType = 'PERSON_DETAIL';
    detailDrawer.isFromBatch = false;
    await fetchPersonDetail(row.orderNo);
  }
};

/** 获取批次下的子单列表 */
const fetchSubOrders = async (batchNo: string) => {
  detailDrawer.loading = true;
  try {
    const res = (await request({
      url: '/insurance/insuranceProxyOrder/subOrders',
      method: 'get',
      params: { batchOrderNo: batchNo }
    })) as any;
    detailDrawer.list = res.rows || res.data || [];
  } finally {
    detailDrawer.loading = false;
  }
};

/** 获取单人的详细投被保人信息 */
const fetchPersonDetail = async (orderNo: string) => {
  detailDrawer.loading = true;
  try {
    const res = (await request({
      url: '/insurance/insuranceProxyOrder/personDetail',
      method: 'get',
      params: { orderNo: orderNo }
    })) as any;
    detailDrawer.personDetail = res.data || {};
    detailDrawer.viewType = 'PERSON_DETAIL';
  } finally {
    detailDrawer.loading = false;
  }
};

/** 返回批次列表 */
const backToBatchList = () => {
  detailDrawer.viewType = 'SUB_LIST';
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.table-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  white-space: nowrap;
}

.table-action :deep(.el-button) {
  margin-left: 0;
  height: 22px;
  padding: 0;
}
</style>
