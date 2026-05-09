<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品编码" prop="productCode">
              <el-input v-model="queryParams.productCode" placeholder="请输入产品编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="业务员姓名" prop="agentName">
              <el-input v-model="queryParams.agentName" placeholder="请输入业务员姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="queryParams.customerName" placeholder="请输入客户姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="客户手机号" prop="customerMobile">
              <el-input v-model="queryParams.customerMobile" placeholder="请输入客户手机号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable>
                <el-option v-for="dict in insurance_apply_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="结算状态" prop="commissionStatus">
              <el-select v-model="queryParams.commissionStatus" placeholder="请选择结算状态" clearable>
                <el-option v-for="dict in insurance_commission_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:InsuranceApplyRecord:export']"
              >导出</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="InsuranceApplyRecordList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="订单号" align="center" prop="orderNo" width="250">
          <template #default="scope">
            <el-link type="primary" @click="openDetailDrawer(scope.row)">{{ scope.row.orderNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="产品编码" align="center" prop="productCode" width="140" />
        <el-table-column label="产品名称" align="center" prop="productName" width="200" show-overflow-tooltip />
        <el-table-column label="业务员姓名" align="center" prop="agentName" width="120" />
        <el-table-column label="客户姓名" align="center" prop="customerName" width="120" />
        <el-table-column label="客户手机号" align="center" prop="customerMobile" width="120" />
        <el-table-column label="登记保费" align="center" prop="premium" width="120" />
        <el-table-column label="订单状态" align="center" prop="status" width="120">
          <template #default="scope">
            <el-tag :type="getApplyStatusTagType(scope.row.status)">{{ getApplyStatusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结算状态" align="center" prop="commissionStatus" width="120">
          <template #default="scope">
            <dict-tag :options="insurance_commission_status" :value="scope.row.commissionStatus" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="120">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" min-width="260" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="openDetailDrawer(scope.row)">详情</el-button>
            <el-button v-if="canGoPayment(scope.row)" link type="warning" icon="Wallet" @click="handleGoPayment(scope.row)">去支付</el-button>
            <el-button v-if="canCancelOrder(scope.row)" link type="danger" icon="CircleClose" @click="handleCancelOrder(scope.row)"
              >取消订单</el-button
            >
            <el-button
              link
              type="primary"
              icon="Check"
              :disabled="isApproveDisabled(scope.row)"
              @click="handleApprove(scope.row)"
              v-hasPermi="['insurance:InsuranceApplyRecord:edit']"
              >审批</el-button
            >
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
        <div v-if="detailDrawer.viewType === 'SUB_LIST'">
          <el-table border :data="detailDrawer.list" style="width: 100%">
            <el-table-column type="index" label="序号" width="55" align="center" />
            <el-table-column label="子单号" align="center" prop="orderNo" width="300">
              <template #default="scope">
                <el-link type="primary" @click="fetchPersonDetail(scope.row.orderNo)">{{ scope.row.orderNo }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="投保人" align="center" prop="appName" width="200" />
            <el-table-column label="被保人" align="center" prop="insuredName" width="200" />
            <el-table-column label="子单状态" align="center" prop="status" width="200">
              <template #default="scope">
                <el-tag :type="getApplyStatusTagType(scope.row.status)">{{ getApplyStatusLabel(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="scope">
                <el-button link type="primary" @click="fetchPersonDetail(scope.row.orderNo)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-else-if="detailDrawer.viewType === 'PERSON_DETAIL'">
          <el-row :gutter="20">
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

    <!-- 审批/修改状态对话框 -->
    <el-dialog :title="approveDialog.title" v-model="approveDialog.visible" width="400px" append-to-body>
      <el-form ref="ApproveFormRef" :model="approveForm" :rules="approveRules" label-width="100px">
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="approveForm.status" placeholder="请选择订单状态" style="width: 100%">
            <el-option v-for="dict in insurance_apply_status" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="approveButtonLoading" type="primary" @click="submitApprove">确 定</el-button>
          <el-button @click="cancelApprove">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InsuranceApplyRecord" lang="ts">
import { listInsuranceApplyRecord, getInsuranceApplyRecord, confirmPay, cancelInsuranceApplyRecord } from '@/api/insurance/InsuranceApplyRecord';
import { InsuranceApplyRecordVO, InsuranceApplyRecordQuery, InsuranceApplyRecordForm } from '@/api/insurance/InsuranceApplyRecord/types';
import request from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const { insurance_apply_status, insurance_commission_status, insurance_id_type, insurance_relationship_to_insured } = toRefs<any>(
  proxy?.useDict('insurance_apply_status', 'insurance_commission_status', 'insurance_id_type', 'insurance_relationship_to_insured')
);

const InsuranceApplyRecordList = ref<InsuranceApplyRecordVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

// 审批用的表单和数据
const ApproveFormRef = ref<ElFormInstance>();
const approveDialog = reactive<DialogOption>({ visible: false, title: '审批订单记录' });
const approveButtonLoading = ref(false);
const approveForm = ref<any>({});
const approveRules = {
  status: [{ required: true, message: '请选择订单状态', trigger: 'change' }]
};

const data = reactive<PageData<InsuranceApplyRecordForm, InsuranceApplyRecordQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    productCode: undefined,
    productName: undefined,
    agentName: undefined,
    customerName: undefined,
    customerMobile: undefined,
    status: undefined,
    commissionStatus: undefined,
    params: {}
  },
  rules: {}
});

const { queryParams } = toRefs(data);

/** 查询投保记录列表 */
const getList = async () => {
  loading.value = true;
  const res = await listInsuranceApplyRecord(queryParams.value);
  InsuranceApplyRecordList.value = res.rows;
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
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: InsuranceApplyRecordVO[]) => {
  // 保持 RUOYI 默认提供的选择逻辑，如果后续需要导出勾选项会用到
};

const canGoPayment = (row: InsuranceApplyRecordVO) => {
  const status = Number(row.status);
  return Number(row.insureMode) === 1 && Number(row.paymentMode) === 1 && (status === 1 || status === 3);
};

const canCancelOrder = (row: InsuranceApplyRecordVO) => {
  return Number(row.status) === 1 || canGoPayment(row);
};

const isApproveDisabled = (row: InsuranceApplyRecordVO) => {
  const status = Number(row.status);
  return status === 0 || status === 4;
};

const applyStatusFallback: Record<string, { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' }> = {
  '0': { label: '已支付', type: 'success' },
  '1': { label: '未支付', type: 'danger' },
  '2': { label: '待录入', type: 'primary' },
  '3': { label: '待支付', type: 'warning' },
  '4': { label: '已取消', type: 'info' }
};

const getApplyStatusOption = (status: number | string) => {
  return insurance_apply_status.value?.find((item: DictDataOption) => String(item.value) === String(status));
};

const getApplyStatusLabel = (status: number | string) => {
  const statusKey = String(status);
  return getApplyStatusOption(status)?.label || applyStatusFallback[statusKey]?.label || statusKey;
};

const getApplyStatusTagType = (status: number | string) => {
  const option = getApplyStatusOption(status);
  const optionType = option?.elTagType;
  if (optionType && ['primary', 'success', 'info', 'warning', 'danger'].includes(optionType)) {
    return optionType;
  }
  return applyStatusFallback[String(status)]?.type || 'info';
};

const handleGoPayment = (row: InsuranceApplyRecordVO) => {
  router.push({ path: '/insurance/tenant-product/payment', query: { orderNo: row.orderNo } });
};

const handleCancelOrder = async (row: InsuranceApplyRecordVO) => {
  await proxy?.$modal.confirm(`确认要取消订单"${row.orderNo}"吗？`);
  await cancelInsuranceApplyRecord({
    id: row.id,
    orderNo: row.orderNo,
    productId: row.productId,
    agentUserId: row.agentUserId,
    agentDeptId: row.agentDeptId
  });
  proxy?.$modal.msgSuccess('订单已取消');
  await getList();
};

/** 审批按钮打开弹窗 */
const handleApprove = (row: InsuranceApplyRecordVO) => {
  approveForm.value = { ...row };
  approveDialog.visible = true;
};

/** 取消审批弹窗 */
const cancelApprove = () => {
  approveDialog.visible = false;
  ApproveFormRef.value?.resetFields();
};

/** 提交审批调用 confirmPay 接口 */
const submitApprove = () => {
  ApproveFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      approveButtonLoading.value = true;
      try {
        await confirmPay(approveForm.value);
        proxy?.$modal.msgSuccess('审批成功');
        approveDialog.visible = false;
        await getList();
      } finally {
        approveButtonLoading.value = false;
      }
    }
  });
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'insurance/InsuranceApplyRecord/export',
    {
      ...queryParams.value
    },
    `InsuranceApplyRecord_${new Date().getTime()}.xlsx`
  );
};

// ===================== 详情下钻逻辑 =====================
const detailDrawer = reactive({
  visible: false,
  loading: false,
  viewType: 'SUB_LIST' as 'SUB_LIST' | 'PERSON_DETAIL',
  isFromBatch: false,
  currentOrderNo: '',
  list: [] as any[],
  personDetail: {} as any
});

const drawerTitle = computed(() => {
  if (detailDrawer.viewType === 'SUB_LIST') {
    return `批次成员清单 - ${detailDrawer.currentOrderNo}`;
  }
  return `保单人员明细 - ${detailDrawer.personDetail.orderNo || detailDrawer.currentOrderNo}`;
});

const openDetailDrawer = async (row: InsuranceApplyRecordVO) => {
  detailDrawer.currentOrderNo = row.orderNo;
  detailDrawer.visible = true;
  detailDrawer.loading = true;

  if (row.isBatch === 1) {
    detailDrawer.viewType = 'SUB_LIST';
    detailDrawer.isFromBatch = true;
    await fetchSubOrders(row.orderNo);
  } else {
    detailDrawer.viewType = 'PERSON_DETAIL';
    detailDrawer.isFromBatch = false;
    await fetchPersonDetail(row.orderNo);
  }
};

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

const backToBatchList = () => {
  detailDrawer.viewType = 'SUB_LIST';
};

onMounted(() => {
  getList();
});
</script>
