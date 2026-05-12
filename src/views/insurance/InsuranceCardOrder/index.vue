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
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable>
                <el-option v-for="dict in insurance_card_order_status" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
              </el-select>
            </el-form-item>
            <el-form-item label="卡密保司" prop="selectedCompanyCode">
              <el-select v-model="queryParams.selectedCompanyCode" placeholder="请选择卡密保司" clearable>
                <el-option v-for="dict in insurance_card_company" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:cardOrder:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="InsuranceCardOrderList">
        <el-table-column label="订单号" align="center" prop="orderNo" width="230">
          <template #default="scope">
            <el-link type="primary" @click="openDetail(scope.row)">{{ scope.row.orderNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" align="center" prop="productName" min-width="180" show-overflow-tooltip />
        <el-table-column label="规格" align="center" prop="specName" width="130" show-overflow-tooltip />
        <el-table-column label="数量" align="center" prop="goodsQuantity" width="80" />
        <el-table-column label="卡密保司" align="center" prop="selectedCompanyCode" width="140">
          <template #default="scope">
            <dict-tag :options="insurance_card_company" :value="scope.row.selectedCompanyCode" />
          </template>
        </el-table-column>
        <el-table-column label="应付金额" align="center" width="110">
          <template #default="scope">¥{{ formatAmount(getPayAmount(scope.row)) }}</template>
        </el-table-column>
        <el-table-column label="订单状态" align="center" prop="status" width="110">
          <template #default="scope">
            <el-tag :type="getOrderStatusTagType(scope.row.status)">{{ getOrderStatusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="快递公司" align="center" prop="expressCompany" width="120" show-overflow-tooltip />
        <el-table-column label="快递单号" align="center" prop="expressNo" width="160" show-overflow-tooltip />
        <el-table-column label="创建时间" align="center" prop="createTime" width="160">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="100" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="openDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-drawer v-model="detailDrawer.visible" title="卡密订单详情" size="720px" direction="rtl">
      <div v-loading="detailDrawer.loading" class="p-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ detailDrawer.data.orderNo || '--' }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getOrderStatusTagType(detailDrawer.data.status)">{{ getOrderStatusLabel(detailDrawer.data.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ detailDrawer.data.productName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品编码">{{ detailDrawer.data.productCode || '--' }}</el-descriptions-item>
          <el-descriptions-item label="规格">{{ detailDrawer.data.specName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ detailDrawer.data.goodsQuantity || 1 }}</el-descriptions-item>
          <el-descriptions-item label="卡密保司">
            <dict-tag :options="insurance_card_company" :value="detailDrawer.data.selectedCompanyCode" />
          </el-descriptions-item>
          <el-descriptions-item label="商品金额">¥{{ formatAmount(detailDrawer.data.goodsAmount) }}</el-descriptions-item>
          <el-descriptions-item label="运费">
            {{ detailDrawer.data.freightPayType === 'collect' ? '到付' : `¥${formatAmount(detailDrawer.data.freightAmount)}` }}
          </el-descriptions-item>
          <el-descriptions-item label="应付金额">¥{{ formatAmount(getPayAmount(detailDrawer.data)) }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ detailDrawer.data.customerName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailDrawer.data.customerMobile || '--' }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ detailDrawer.data.receiverName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="收货手机">{{ detailDrawer.data.receiverMobile || '--' }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ detailDrawer.data.receiverAddress || '--' }}</el-descriptions-item>
          <el-descriptions-item label="快递公司">{{ detailDrawer.data.expressCompany || '--' }}</el-descriptions-item>
          <el-descriptions-item label="快递单号">{{ detailDrawer.data.expressNo || '--' }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ parseTime(detailDrawer.data.deliveryTime) || '--' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(detailDrawer.data.createTime) || '--' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup name="InsuranceCardOrder" lang="ts">
import { listInsuranceCardOrder, getInsuranceCardOrder } from '@/api/insurance/InsuranceCardOrder';
import { InsuranceCardOrderVO, InsuranceCardOrderQuery, InsuranceCardOrderForm } from '@/api/insurance/InsuranceCardOrder/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_card_order_status, insurance_card_company } = toRefs<any>(proxy?.useDict('insurance_card_order_status', 'insurance_card_company'));

const InsuranceCardOrderList = ref<InsuranceCardOrderVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();

const detailDrawer = reactive({
  visible: false,
  loading: false,
  data: {} as InsuranceCardOrderVO
});

const data = reactive<PageData<InsuranceCardOrderForm, InsuranceCardOrderQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    productName: undefined,
    status: undefined,
    selectedCompanyCode: undefined,
    params: {}
  },
  rules: {}
});

const { queryParams } = toRefs(data);

const statusFallback: Record<string, { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' }> = {
  '0': { label: '已支付', type: 'success' },
  '1': { label: '未提交', type: 'danger' },
  '3': { label: '待支付', type: 'warning' },
  '4': { label: '已取消', type: 'info' },
  '5': { label: '已发货', type: 'success' }
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listInsuranceCardOrder(queryParams.value);
    InsuranceCardOrderList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const getOrderStatusOption = (status: number | string) =>
  insurance_card_order_status.value?.find((item: DictDataOption) => String(item.value) === String(status));

const getOrderStatusLabel = (status: number | string) => {
  const statusKey = String(status);
  return getOrderStatusOption(status)?.label || statusFallback[statusKey]?.label || statusKey || '--';
};

const getOrderStatusTagType = (status: number | string) => {
  const optionType = getOrderStatusOption(status)?.elTagType;
  if (optionType && ['primary', 'success', 'info', 'warning', 'danger'].includes(optionType)) {
    return optionType;
  }
  return statusFallback[String(status)]?.type || 'info';
};

const formatAmount = (amount: any) => Number(amount || 0).toFixed(2);

const getPayAmount = (row: Partial<InsuranceCardOrderVO>) => Number(row.payAmount ?? Number(row.goodsAmount || 0) + Number(row.freightAmount || 0));

const openDetail = async (row: InsuranceCardOrderVO) => {
  detailDrawer.visible = true;
  detailDrawer.loading = true;
  try {
    const res = await getInsuranceCardOrder(row.id);
    detailDrawer.data = res.data || row;
  } finally {
    detailDrawer.loading = false;
  }
};

const handleExport = () => {
  proxy?.download('insurance/InsuranceCardOrder/export', { ...queryParams.value }, `InsuranceCardOrder_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>
