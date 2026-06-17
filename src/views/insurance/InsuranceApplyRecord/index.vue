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
            <el-form-item label="导出产品" prop="productId">
              <el-select v-model="queryParams.productId" filterable clearable placeholder="请选择产品" style="width: 240px">
                <el-option v-for="item in productOptions" :key="item.id" :label="item.productName" :value="item.id" />
              </el-select>
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
        <el-table-column label="操作" align="center" fixed="right" min-width="300" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="openDetailDrawer(scope.row)">详情</el-button>
            <el-button v-if="canPreviewVoucher(scope.row)" link type="primary" icon="Document" @click="handlePreviewVoucher(scope.row)"
              >投保凭证</el-button
            >
            <el-button v-if="canGoPayment(scope.row)" link type="warning" icon="Wallet" @click="handleGoPayment(scope.row)">去支付</el-button>
            <el-button
              v-if="hasApprovePermission"
              link
              type="primary"
              icon="Check"
              :disabled="isApproveDisabled(scope.row)"
              @click="handleApprove(scope.row)"
              >审批</el-button
            >
            <el-dropdown
              v-if="hasMoreActions(scope.row)"
              class="operation-more-dropdown"
              trigger="click"
              @command="(command: string) => handleMoreCommand(command, scope.row)"
            >
              <el-button link type="primary" icon="MoreFilled">更多</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="canCancelOrder(scope.row)" command="cancel" icon="CircleClose">取消订单</el-dropdown-item>
                  <el-dropdown-item v-if="canDeleteOrder(scope.row)" command="delete" icon="Delete">删除订单</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
          <template v-if="detailExtraItems.length > 0">
            <el-divider />
            <el-descriptions title="扩展字段" :column="2" border>
              <el-descriptions-item v-for="item in detailExtraItems" :key="item.key" :label="item.label">{{ displayExtraValue(item) }}</el-descriptions-item>
            </el-descriptions>
          </template>
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

    <!-- 投保凭证预览 -->
    <el-dialog v-model="voucherDialog.visible" title="投保凭证预览" width="920px" append-to-body destroy-on-close class="voucher-dialog">
      <div v-loading="voucherDialog.loading" class="voucher-wrapper">
        <div v-if="showBatchVoucherList" class="voucher-batch-list">
          <el-table border :data="voucherDialog.batchMembers" style="width: 100%">
            <el-table-column type="index" label="序号" width="55" align="center" />
            <el-table-column label="子单号" align="center" prop="orderNo" min-width="260" show-overflow-tooltip />
            <el-table-column label="投保人" align="center" prop="appName" min-width="140" />
            <el-table-column label="被保人" align="center" prop="insuredName" min-width="140" />
            <el-table-column label="子单状态" align="center" prop="status" min-width="120">
              <template #default="scope">
                <el-tag :type="getApplyStatusTagType(scope.row.status)">{{ getApplyStatusLabel(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" fixed="right" width="200">
              <template #default="scope">
                <el-button link type="primary" icon="View" @click="handlePreviewSubVoucher(scope.row)">预览</el-button>
                <el-button
                  link
                  type="primary"
                  icon="Document"
                  :loading="voucherDialog.pdfLoading && voucherDialog.generatingOrderNo === scope.row.orderNo"
                  @click="handleGeneratePdf(scope.row)"
                  >生成凭证</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-else class="voucher-pdf">
          <div class="voucher-title">{{ `${displayValue(voucherDialog.orderInfo.productName)}-投保凭证` }}</div>
          <div class="voucher-notice">
            本凭证用于证明用户已完成投保信息提交及订单生成。具体承保结果、保障责任、免责条款及理赔要求，最终以保险公司出具的正式保单、保险条款及保险公司审核结果为准。
          </div>

          <div class="voucher-section">
            <div class="section-title">订单信息</div>
            <table class="voucher-table">
              <tbody>
                <tr>
                  <td class="label">订单号</td>
                  <td class="value">{{ displayValue(voucherDialog.orderInfo.orderNo) }}</td>
                  <td class="label">下单时间</td>
                  <td class="value">{{ displayTime(voucherDialog.orderInfo.createTime) }}</td>
                </tr>
                <tr>
                  <td class="label">登记客户</td>
                  <td class="value">{{ displayValue(voucherDialog.orderInfo.customerName) }}</td>
                  <td class="label">客户手机号</td>
                  <td class="value">{{ displayValue(voucherDialog.orderInfo.customerMobile) }}</td>
                </tr>
                <tr>
                  <td class="label">业务员姓名</td>
                  <td class="value" colspan="3">{{ displayValue(voucherDialog.orderInfo.agentName) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="voucher-section">
            <div class="section-title">投保须知</div>
            <table v-if="voucherInsureNotice.length > 0" class="voucher-table">
              <tbody>
                <tr v-for="item in voucherInsureNotice" :key="`${item.title}-${item.content}`">
                  <td class="label">{{ displayValue(item.title) }}</td>
                  <td class="value" colspan="3">{{ displayValue(item.content) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="voucher-empty">暂无投保须知</div>
          </div>

          <div v-if="showVoucherPersonInfo" class="voucher-section">
            <div class="section-title">投保人信息</div>
            <table class="voucher-table">
              <tbody>
                <tr>
                  <td class="label">投保人姓名</td>
                  <td class="value">{{ displayValue(voucherDialog.personDetail.appName) }}</td>
                  <td class="label">证件号码</td>
                  <td class="value">{{ displayValue(voucherDialog.personDetail.appCertNo) }}</td>
                </tr>
                <tr>
                  <td class="label">联系电话</td>
                  <td class="value">{{ displayValue(voucherDialog.personDetail.appPhone) }}</td>
                  <td class="label">投保时间</td>
                  <td class="value">{{ displayTime(voucherDialog.orderInfo.createTime) }}</td>
                </tr>
                <tr>
                  <td class="label">证件类型</td>
                  <td class="value">{{ getDictLabel(insurance_id_type, voucherDialog.personDetail.appCertType) }}</td>
                  <td class="label">联系地址</td>
                  <td class="value">{{ displayValue(voucherDialog.personDetail.appAddress) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="showVoucherPersonInfo" class="voucher-section">
            <div class="section-title">被保人信息</div>
            <table class="voucher-table">
              <tbody>
                <tr>
                  <td class="label">被保人姓名</td>
                  <td class="value">{{ displayValue(voucherDialog.personDetail.insuredName) }}</td>
                  <td class="label">证件号码</td>
                  <td class="value">{{ displayValue(voucherDialog.personDetail.insuredCertNo) }}</td>
                </tr>
                <tr>
                  <td class="label">与投保人关系</td>
                  <td class="value">{{ getDictLabel(insurance_relationship_to_insured, voucherDialog.personDetail.relation) }}</td>
                  <td class="label">证件类型</td>
                  <td class="value">{{ getDictLabel(insurance_id_type, voucherDialog.personDetail.insuredCertType) }}</td>
                </tr>
                <tr>
                  <td class="label">联系电话</td>
                  <td class="value">{{ displayValue(voucherDialog.personDetail.insuredPhone) }}</td>
                  <td class="label">联系地址</td>
                  <td class="value">{{ displayValue(voucherDialog.personDetail.insuredAddress) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="voucherExtraItems.length > 0" class="voucher-section">
            <div class="section-title">扩展字段</div>
            <table class="voucher-table">
              <tbody>
                <tr v-for="item in voucherExtraItems" :key="item.key">
                  <td class="label">{{ item.label }}</td>
                  <td class="value" colspan="3">{{ displayExtraValue(item) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="voucher-section">
            <div class="section-title">保障信息</div>
            <table v-if="voucherLiabilityList.length > 0" class="voucher-table">
              <tbody>
                <tr v-for="item in voucherLiabilityList" :key="`${item.liabilityName}-${item.insuredAmountDesc}`">
                  <td class="label">责任名称</td>
                  <td class="value">{{ displayValue(item.liabilityName) }}</td>
                  <td class="label">保额</td>
                  <td class="value">{{ displayValue(item.insuredAmountDesc) }}</td>
                </tr>
                <tr v-for="item in voucherLiabilityList" :key="`${item.liabilityName}-desc`">
                  <td class="label">{{ `${displayValue(item.liabilityName)}-责任说明` }}</td>
                  <td class="value" colspan="3">{{ displayValue(item.description) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="voucher-empty">暂无保障责任</div>
          </div>

          <div class="voucher-section">
            <div class="section-title">保险条款</div>
            <div v-if="voucherClauseFiles.length > 0" class="voucher-link-list">
              <el-link
                v-for="item in voucherClauseFiles"
                :key="`${item.clauseName}-${item.fileUrl}`"
                type="primary"
                underline="never"
                @click="openFile(item.fileUrl)"
              >
                《{{ displayValue(item.clauseName) }}》
              </el-link>
            </div>
            <div v-else class="voucher-empty">暂无条款规则</div>
          </div>

          <div class="voucher-section">
            <div class="section-title">理赔说明</div>
            <table v-if="voucherClaimInstructions.length > 0" class="voucher-table">
              <tbody>
                <tr v-for="item in voucherClaimInstructions" :key="`${item.sort}-${item.title}`">
                  <td class="label">{{ displayValue(item.title) }}</td>
                  <td class="value" colspan="3">{{ displayValue(item.content) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="voucher-empty">暂无理赔说明</div>
          </div>

          <div class="voucher-section">
            <div class="section-title">重要说明</div>
            <div class="important-note">
              <p>1. 本凭证不等同于正式保险合同，正式保障内容以保险公司出具的电子保单及保险条款为准。</p>
              <p>2. 若订单处于待承保、待审核或待生效状态，保险责任是否成立以保险公司最终审核结果为准。</p>
              <p>3. 如发生退保、撤单、承保失败、信息变更等情况，请以系统最新订单状态及保险公司通知为准。</p>
              <p>4. 理赔申请需按保险公司要求提交真实、完整、有效的理赔材料。</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button
          v-if="!showBatchVoucherList"
          type="primary"
          icon="Document"
          :loading="voucherDialog.pdfLoading"
          :disabled="voucherDialog.loading"
          @click="handleGeneratePdf()"
          >生成PDF</el-button
        >
        <el-button @click="voucherDialog.visible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InsuranceApplyRecord" lang="ts">
import {
  listInsuranceApplyRecord,
  getInsuranceApplyRecord,
  confirmPay,
  cancelInsuranceApplyRecord,
  delInsuranceApplyRecord
} from '@/api/insurance/InsuranceApplyRecord';
import { InsuranceApplyRecordVO, InsuranceApplyRecordQuery, InsuranceApplyRecordForm } from '@/api/insurance/InsuranceApplyRecord/types';
import { getProductFull, listInsuranceProductConfig } from '@/api/insurance/InsuranceProductConfig';
import type { InsuranceDynamicField } from '@/api/insurance/dynamicForm/types';
import { useUserStore } from '@/store/modules/user';
import request from '@/utils/request';
import { blobValidate, parseTime } from '@/utils/ruoyi';
import FileSaver from 'file-saver';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const userStore = useUserStore();
const { insurance_apply_status, insurance_commission_status, insurance_id_type, insurance_relationship_to_insured } = toRefs<any>(
  proxy?.useDict('insurance_apply_status', 'insurance_commission_status', 'insurance_id_type', 'insurance_relationship_to_insured')
);

const InsuranceApplyRecordList = ref<InsuranceApplyRecordVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const productOptions = ref<any[]>([]);

const queryFormRef = ref<ElFormInstance>();
const hasApprovePermission = computed(
  () => userStore.permissions.includes('*:*:*') || userStore.permissions.includes('insurance:InsuranceApplyRecord:edit')
);

// 审批用的表单和数据
const ApproveFormRef = ref<ElFormInstance>();
const approveDialog = reactive<DialogOption>({ visible: false, title: '审批订单记录' });
const approveButtonLoading = ref(false);
const approveForm = ref<any>({});
const approveRules = {
  status: [{ required: true, message: '请选择订单状态', trigger: 'change' }]
};
const voucherDialog = reactive({
  visible: false,
  loading: false,
  pdfLoading: false,
  generatingOrderNo: '',
  orderInfo: {} as any,
  personDetail: {} as any,
  batchMembers: [] as any[],
  batchParentInfo: {} as any,
  productData: {} as any
});

const data = reactive<PageData<InsuranceApplyRecordForm, InsuranceApplyRecordQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    productId: undefined,
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

const canPreviewVoucher = (row: InsuranceApplyRecordVO) => {
  return Number(row.status) === 0;
};

const canDeleteOrder = (row: InsuranceApplyRecordVO) => {
  return Number(row.status) !== 0 && Number(row.commissionStatus) !== 0;
};

const hasMoreActions = (row: InsuranceApplyRecordVO) => {
  return canCancelOrder(row) || canDeleteOrder(row);
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

const hasValue = (value: unknown) => {
  return value !== undefined && value !== null && value !== '';
};

const displayValue = (value: unknown) => {
  return hasValue(value) ? value : '--';
};

const displayAmount = (value: unknown) => {
  return hasValue(value) ? `${value} 元` : '--';
};

const displayTime = (value: string) => {
  return value ? parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}') : '--';
};

const getDictLabel = (options: DictDataOption[] = [], value: unknown) => {
  if (!hasValue(value)) {
    return '--';
  }
  return options.find((item) => String(item.value) === String(value))?.label || String(value);
};

const normalizeArray = (raw: any): any[] => {
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw;
  }
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const voucherLiabilityList = computed(() => normalizeArray(voucherDialog.productData?.liabilityList));
const voucherInsureNotice = computed(() => normalizeArray(voucherDialog.productData?.insureNotice));
const voucherClauseFiles = computed(() => normalizeArray(voucherDialog.productData?.clauseFiles));
const voucherClaimInstructions = computed(() => normalizeArray(voucherDialog.productData?.claimInstructions));
const showBatchVoucherList = computed(() => Number(voucherDialog.orderInfo?.isBatch) === 1);
const showVoucherPersonInfo = computed(() => Number(voucherDialog.orderInfo?.insureMode) === 1 && !showBatchVoucherList.value);
const voucherExtraItems = computed(() => buildExtraItems(voucherDialog.productData?.product?.insureFormSchema, voucherDialog.orderInfo?.insureExtraData || voucherDialog.personDetail?.insureExtraData));
const detailExtraItems = computed(() => buildExtraItems(detailDrawer.productData?.product?.insureFormSchema, detailDrawer.personDetail?.insureExtraData));

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

const handleGoPayment = (row: InsuranceApplyRecordVO) => {
  router.push({ path: '/insurance/tenant-product/payment', query: { orderNo: row.orderNo } });
};

const handlePreviewVoucher = async (row: InsuranceApplyRecordVO) => {
  voucherDialog.visible = true;
  voucherDialog.loading = true;
  voucherDialog.orderInfo = { ...row };
  voucherDialog.personDetail = {};
  voucherDialog.batchMembers = [];
  voucherDialog.batchParentInfo = {};
  voucherDialog.productData = {};
  voucherDialog.generatingOrderNo = '';
  try {
    if (Number(row.isBatch) === 1) {
      const batchMembersRes = (await request({
        url: '/insurance/InsuranceApplyRecord/subOrders',
        method: 'get',
        params: { batchOrderNo: row.orderNo }
      })) as any;
      voucherDialog.batchMembers = batchMembersRes.rows || batchMembersRes.data || [];
      voucherDialog.batchParentInfo = { ...row };
      return;
    }

    const personDetailPromise =
      Number(row.insureMode) === 1
        ? (request({
            url: '/insurance/InsuranceApplyRecord/personDetail',
            method: 'get',
            params: { orderNo: row.orderNo }
          }) as any)
        : Promise.resolve({ data: {} });
    const [personRes, productRes] = await Promise.all([
      personDetailPromise,
      row.productId ? getProductFull(row.productId) : Promise.resolve({ data: {} })
    ]);
    voucherDialog.personDetail = Number(row.insureMode) === 1 ? personRes.data || {} : {};
    voucherDialog.productData = productRes.data || productRes || {};
  } finally {
    voucherDialog.loading = false;
  }
};

const handlePreviewSubVoucher = async (row: any) => {
  voucherDialog.loading = true;
  voucherDialog.orderInfo = {
    ...voucherDialog.batchParentInfo,
    ...row,
    isBatch: 2,
    insureMode: row.insureMode ?? voucherDialog.batchParentInfo.insureMode
  };
  voucherDialog.personDetail = {};
  voucherDialog.productData = {};
  try {
    const [personRes, productRes] = await Promise.all([
      request({
        url: '/insurance/InsuranceApplyRecord/personDetail',
        method: 'get',
        params: { orderNo: row.orderNo }
      }) as any,
      row.productId ? getProductFull(row.productId) : Promise.resolve({ data: {} })
    ]);
    voucherDialog.personDetail = personRes.data || {};
    voucherDialog.productData = productRes.data || productRes || {};
  } finally {
    voucherDialog.loading = false;
  }
};

const openFile = (url: string) => {
  if (url) {
    window.open(url, '_blank');
  }
};

const buildVoucherPdfFileName = (orderNo?: string) => {
  const productName = String(voucherDialog.orderInfo.productName || '投保凭证').replace(/[\\/:*?"<>|]/g, '');
  const orderNoSuffix = orderNo || voucherDialog.orderInfo.orderNo ? `_${orderNo || voucherDialog.orderInfo.orderNo}` : '';
  return `${productName}-投保凭证${orderNoSuffix}`;
};

const handleGeneratePdf = async (targetOrder?: any) => {
  const orderNo = targetOrder?.orderNo || voucherDialog.orderInfo.orderNo;
  if (!orderNo) {
    proxy?.$modal.msgError('缺少订单号');
    return;
  }

  const fileName = `${buildVoucherPdfFileName(orderNo)}.pdf`;
  voucherDialog.pdfLoading = true;
  voucherDialog.generatingOrderNo = orderNo;
  try {
    const resp = await request({
      url: `/insurance/InsuranceApplyRecord/voucherPdf/${orderNo}`,
      method: 'get',
      responseType: 'blob',
      headers: { repeatSubmit: false }
    });

    if (blobValidate(resp)) {
      FileSaver.saveAs(new Blob([resp], { type: 'application/pdf' }), fileName);
      proxy?.$modal.msgSuccess('PDF生成成功');
    } else {
      const resText = await new Blob([resp]).text();
      const rspObj = JSON.parse(resText);
      proxy?.$modal.msgError(rspObj.msg || 'PDF生成失败');
    }
  } catch (error) {
    console.error(error);
    proxy?.$modal.msgError('PDF生成失败');
  } finally {
    voucherDialog.pdfLoading = false;
    voucherDialog.generatingOrderNo = '';
  }
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

const handleDeleteOrder = async (row: InsuranceApplyRecordVO) => {
  await proxy?.$modal.confirm(`确认要删除订单"${row.orderNo}"吗？`);
  await delInsuranceApplyRecord(row.id);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleMoreCommand = (command: string, row: InsuranceApplyRecordVO) => {
  if (command === 'cancel') {
    handleCancelOrder(row);
    return;
  }
  if (command === 'delete') {
    handleDeleteOrder(row);
  }
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
  const selectedProduct = productOptions.value.find((item: any) => String(item.id) === String(queryParams.value.productId));
  const exportName = queryParams.value.productId && selectedProduct?.productName ? `投保记录_${selectedProduct.productName}.xlsx` : '投保记录_多产品.xlsx';
  proxy?.download(
    'insurance/InsuranceApplyRecord/export',
    {
      ...queryParams.value
    },
    exportName
  );
};

const getProductOptions = async () => {
  const pageSize = 500;
  const rows: any[] = [];
  const firstPage = await listInsuranceProductConfig({ pageNum: 1, pageSize } as any);
  rows.push(...(firstPage.rows || []));
  const allTotal = Number(firstPage.total ?? rows.length);

  for (let pageNum = 2; rows.length < allTotal; pageNum += 1) {
    const res = await listInsuranceProductConfig({ pageNum, pageSize } as any);
    const pageRows = res.rows || [];
    if (pageRows.length === 0) {
      break;
    }
    rows.push(...pageRows);
  }

  productOptions.value = rows;
};

// ===================== 详情下钻逻辑 =====================
const detailDrawer = reactive({
  visible: false,
  loading: false,
  viewType: 'SUB_LIST' as 'SUB_LIST' | 'PERSON_DETAIL',
  isFromBatch: false,
  currentOrderNo: '',
  list: [] as any[],
  personDetail: {} as any,
  productData: {} as any
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
    detailDrawer.productData = {};
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
    if (detailDrawer.personDetail.productId) {
      const productRes = await getProductFull(detailDrawer.personDetail.productId);
      detailDrawer.productData = productRes.data || productRes || {};
    } else {
      detailDrawer.productData = {};
    }
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
  getProductOptions();
});
</script>

<style scoped lang="scss">
:deep(.operation-more-dropdown) {
  display: inline-flex;
  align-items: center;
  height: 22px;
  margin-left: 12px;
  vertical-align: middle;

  .el-button {
    height: 22px;
    padding: 0;
    line-height: 22px;
  }
}

:deep(.voucher-dialog) {
  .el-dialog__body {
    max-height: 72vh;
    padding: 0;
    overflow: auto;
    background: #f5f5f5;
  }
}

.voucher-wrapper {
  min-height: 360px;
  padding: 16px;
  overflow-x: auto;
}

.voucher-pdf {
  box-sizing: border-box;
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 30mm 20mm 25mm;
  background: #ffffff;
  color: #333333;
  font-family: 'Noto Sans CJK SC', SimSun, sans-serif;
  font-size: 13px;
  line-height: 1.6;
}

.voucher-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.voucher-notice {
  padding: 10px 12px;
  margin-bottom: 18px;
  color: #666666;
  font-size: 12px;
  line-height: 1.8;
  border: 1px solid #dddddd;
}

.voucher-section {
  margin-bottom: 0;
}

.section-title {
  padding-left: 8px;
  margin: 20px 0 10px;
  font-size: 16px;
  font-weight: bold;
  line-height: 1.25;
  border-left: 4px solid #333333;
}

.voucher-empty {
  padding: 10px 8px;
  margin-bottom: 12px;
  color: #666666;
  border: 1px solid #dddddd;
}

.voucher-link-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  margin-bottom: 12px;
}

.important-note {
  padding: 10px 12px;
  color: #444444;
  border: 1px solid #dddddd;

  p {
    margin: 0 0 8px;
  }

  p:last-child {
    margin-bottom: 0;
  }
}

.voucher-table {
  width: 100%;
  margin-bottom: 12px;
  border-collapse: collapse;
  table-layout: fixed;

  td {
    padding: 8px;
    line-height: 1.6;
    vertical-align: top;
    word-break: break-all;
    border: 1px solid #999999;
  }

  .label {
    width: 20%;
    color: #333333;
    font-weight: bold;
    background: #f5f5f5;
  }

  .value {
    width: 30%;
  }
}
</style>
