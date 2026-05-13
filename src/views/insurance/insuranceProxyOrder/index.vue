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

      <el-table v-loading="loading" border :data="insuranceProxyOrderList">
        <el-table-column label="租户编号" align="center" prop="tenantId" width="110" />
        <el-table-column label="租户名称" align="center" prop="tenantName" width="160" show-overflow-tooltip />
        <el-table-column label="订单号" align="center" prop="orderNo" width="300">
          <template #default="scope">
            <el-link type="primary" @click="openDetailDrawer(scope.row)">{{ scope.row.orderNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" align="center" prop="productName" width="300" show-overflow-tooltip />
        <el-table-column label="业务员姓名" align="center" prop="agentName" width="150" />
        <el-table-column label="登记保费" align="center" prop="premium" width="150" />
        <el-table-column label="净费" align="center" prop="netPremium" width="150" />
        <el-table-column label="订单状态" align="center" prop="status" width="120">
          <template #default="scope">
            <dict-tag :options="insurance_apply_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="结算状态" align="center" prop="commissionStatus" width="120">
          <template #default="scope">
            <dict-tag :options="insurance_commission_status" :value="scope.row.commissionStatus" />
          </template>
        </el-table-column> -->
        <el-table-column label="创建时间" align="center" prop="createTime" width="150">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" min-width="100">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="openDetailDrawer(scope.row)">查看详情</el-button>
            </el-tooltip>
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
          </el-descriptions>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup name="InsuranceProxyOrder" lang="ts">
import { listInsuranceProxyOrder } from '@/api/insurance/insuranceProxyOrder';
import { InsuranceProxyOrderVO, InsuranceProxyOrderQuery } from '@/api/insurance/insuranceProxyOrder/types';
import request from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_apply_status, insurance_commission_status, insurance_id_type, insurance_relationship_to_insured } = toRefs<any>(
  proxy?.useDict('insurance_apply_status', 'insurance_commission_status', 'insurance_id_type', 'insurance_relationship_to_insured')
);

const insuranceProxyOrderList = ref<InsuranceProxyOrderVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

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
      url: '/insurance/InsuranceApplyRecord/subOrders',
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
      url: '/insurance/InsuranceApplyRecord/personDetail',
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
