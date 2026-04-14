<template>
  <div class="p-2 app-container">
    <el-row :gutter="20">
      <!-- 账户余额卡片 -->
      <el-col :span="24">
        <el-card shadow="hover" class="balance-card">
          <div class="bc-content">
            <div class="bc-left">
              <div class="bc-label">
                <el-icon><Wallet /></el-icon> 账户可用余额
              </div>
              <div class="bc-amount">
                <span class="bc-symbol">¥</span>
                <span class="bc-value">{{ balance.toFixed(2) }}</span>
              </div>
            </div>
            <div class="bc-right">
              <el-button class="recharge-btn" size="large" icon="Plus" round @click="openRecharge">
                充值
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 资金流水 -->
    <el-row class="mt-4">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>资金明细</span>
            </div>
          </template>

          <el-table :data="transactions" v-loading="loading" border style="width: 100%">
            <el-table-column label="序号" width="80" align="center">
              <template #default="scope">
                {{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column label="交易时间" prop="time" width="180" align="center" />
            <el-table-column label="交易类型" align="center" width="120">
              <template #default="scope">
                <el-tag :type="scope.row.type === 'income' ? 'success' : 'warning'">
                  {{ scope.row.type === 'income' ? '收入' : '支出' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="交易摘要" prop="title" show-overflow-tooltip />
            <el-table-column label="发生金额" align="center" width="150">
              <template #default="scope">
                <span :class="scope.row.type === 'income' ? 'text-success' : 'text-warning'" style="font-weight: bold; font-size: 15px;">
                  {{ scope.row.type === 'income' ? '+' : '-' }}¥{{ scope.row.amount.toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty description="暂无交易记录"></el-empty>
            </template>
          </el-table>

          <div class="pagination-container" v-show="total > 0" style="display: flex; justify-content: flex-end; margin-top: 15px;">
            <el-pagination
              v-model:current-page="queryParams.pageNum"
              v-model:page-size="queryParams.pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="fetchAccountFlow"
              @current-change="fetchAccountFlow"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 充值向导 Dialog -->
    <el-dialog title="账户充值" v-model="showRechargePopup" width="700px" append-to-body destroy-on-close @close="closeRecharge">
      <div class="recharge-wizard">
        <!-- 步骤条 -->
        <el-steps :active="currentStep" finish-status="success" align-center class="mb-5">
          <el-step title="扫码付款" icon="Money"></el-step>
          <el-step title="填写金额" icon="Edit"></el-step>
          <el-step title="上传凭证" icon="Picture"></el-step>
          <el-step title="等待审核" icon="Timer"></el-step>
        </el-steps>

        <!-- Step 0：收款二维码 -->
        <div v-if="currentStep === 0" class="step-content">
          <el-alert title="扫描下方二维码支付充值费用，支付成功后点击下一步" type="info" center show-icon :closable="false" class="mb-4" />
          <div class="qr-wrapper flex-center flex-column">
            <el-image :src="qrCodeUrl" class="qr-image" fit="cover">
              <template #error>
                <div class="image-slot">暂无收款码配置</div>
              </template>
            </el-image>
            <div class="qr-label mt-2 text-primary">
              <el-icon><ChatDotSquare /></el-icon> 微信扫码付款
            </div>
          </div>
          <div class="step-note mt-2 text-center text-muted">如二维码无法识别，请联系平台客服获取收款账户信息</div>
          <el-alert title="请务必保存支付记录截图，下一步需上传凭证" type="warning" center show-icon :closable="false" class="mt-4" />
        </div>

        <!-- Step 1：填写充值金额 -->
        <div v-if="currentStep === 1" class="step-content">
          <el-alert title="请选择或填写您实际支付的充值金额" type="info" show-icon :closable="false" class="mb-4" />
          <div class="amount-grid">
            <el-button
              v-for="amt in presetAmounts"
              :key="amt"
              :type="selectedAmount === amt ? 'primary' : 'default'"
              @click="selectedAmount = amt; customAmount = ''"
              class="amount-item"
            >
              ¥{{ amt }}
            </el-button>
          </div>
          <div class="mt-4">
            <el-input
              v-model="customAmount"
              type="number"
              placeholder="输入其他金额"
              @input="selectedAmount = 0"
              clearable>
              <template #prepend>¥</template>
            </el-input>
          </div>
          <div class="recharge-total mt-4 text-right" v-if="finalAmount > 0">
            本次充值：<span class="total-amount text-primary" style="font-size: 24px; font-weight: bold;">¥{{ finalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Step 2：上传支付凭证 -->
        <div v-if="currentStep === 2" class="step-content">
          <el-alert title="请上传支付成功的截图作为凭证，管理员审核后金额将到账" type="info" show-icon :closable="false" class="mb-4" />

          <div class="flex-center flex-column">
            <el-upload
              class="voucher-uploader"
              action="#"
              :http-request="handleVoucherUpload"
              :show-file-list="false"
              accept="image/*"
            >
              <img v-if="voucherPreview" :src="voucherPreview" class="voucher-image" />
              <el-icon v-else class="voucher-uploader-icon" :class="{ 'is-loading': uploadingVoucher }">
                <Loading v-if="uploadingVoucher" />
                <Plus v-else />
              </el-icon>
            </el-upload>
            <div class="upload-status mt-2 text-success" v-if="voucherOssId">
              <el-icon><Select /></el-icon> 图片上传成功
            </div>

            <div class="upload-hint mt-4 text-center text-muted" style="font-size: 13px;">
              <p>· 仅支持 JPG / PNG 格式，大小不超过 5MB</p>
              <p>· 请确保截图清晰可见支付金额和时间</p>
            </div>
            <div class="amount-confirm-tag mt-3" v-if="finalAmount > 0">
              <el-tag size="large" type="primary">充值金额：¥{{ finalAmount.toFixed(2) }}</el-tag>
            </div>
          </div>
        </div>

        <!-- Step 3：提交完成 -->
        <div v-if="currentStep === 3" class="step-content step-done flex-center flex-column pt-5 pb-5">
          <el-icon color="#67C23A" :size="64" class="mb-3"><CircleCheckFilled /></el-icon>
          <div class="done-title" style="font-size: 20px; font-weight: bold;">已提交，等待审核</div>
          <div class="done-desc text-center mt-3" style="color: #666; line-height: 1.8;">
            您的充值申请已成功提交！<br />
            平台管理员将在 <b>1 个工作日内</b> 完成审核，<br />
            审核通过后充值金额将自动到账。
          </div>
          <div class="mt-4">
            <el-tag size="large" effect="plain" type="success">充值金额：¥{{ finalAmount.toFixed(2) }}</el-tag>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="currentStep > 0 && currentStep < 3" @click="currentStep--">上一步</el-button>

          <el-button v-if="currentStep < 2" type="primary" @click="handleNext">下一步</el-button>

          <el-button v-if="currentStep === 2" type="primary" :loading="submitLoading" @click="submitRecharge">确认充值</el-button>

          <el-button v-if="currentStep === 3" type="primary" @click="closeRecharge">我知道了</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="MyWallet">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { rechargeApply, uploadOss, getUserAccount, getUserAccountFlow } from '@/api/finance/myWallet/index';
import { getConfigKey } from '@/api/system/config/index';
import { ElMessage } from 'element-plus';
import type { UploadRequestOptions } from 'element-plus';

const userStore = useUserStore();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const balance = ref(0);
const loading = ref(false);
const transactions = ref<any[]>([]);
const total = ref(0);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});

// 动态收款二维码
const qrCodeUrl = ref('');

const fetchAccountData = async () => {
  const userId = userStore.userId;
  if (!userId) return;
  try {
    // 获取余额
    const baRes: any = await getUserAccount(userId);
    balance.value = Number(baRes.data?.balance || 0);
  } catch (err) {
    console.error('获取账户数据失败', err);
  }
};

const fetchAccountFlow = async () => {
  const userId = userStore.userId;
  if (!userId) return;
  try {
    loading.value = true;
    const flowRes: any = await getUserAccountFlow(userId, queryParams.pageNum, queryParams.pageSize);
    if (flowRes.code === 200 && Array.isArray(flowRes.rows)) {
      transactions.value = flowRes.rows.map((item: any) => ({
        id: item.id,
        // flowType 1、3、4 为收入，2、5 为支出
        type: [1, 3, 4].includes(Number(item.flowType)) ? 'income' : 'withdraw',
        title: item.remark || '账户变动',
        amount: Number(item.amount || 0),
        time: item.createTime || '-'
      }));
      total.value = flowRes.total || 0;
    }
  } catch (err) {
    console.error('获取明细失败', err);
  } finally {
    loading.value = false;
  }
};

const fetchQrCode = async () => {
  try {
    const res: any = await getConfigKey('recharge.qrcode.wechat');
    if (res.code === 200 || res.code === "200") {
      qrCodeUrl.value = res.data || res.msg || '';
    }
  } catch (err) {
    console.error('获取充值二维码配置失败', err);
  }
};

onMounted(() => {
  fetchAccountData();
  fetchAccountFlow();
  fetchQrCode();
});

// === 充值向导 ===
const showRechargePopup = ref(false);
const currentStep = ref(0);
const presetAmounts = [100, 200, 500, 1000, 2000, 5000];
const selectedAmount = ref(0);
const customAmount = ref('');
const voucherOssId = ref('');
const voucherPreview = ref('');
const uploadingVoucher = ref(false);
const submitLoading = ref(false);

const finalAmount = computed(() => {
  if (customAmount.value && Number(customAmount.value) > 0) return Number(customAmount.value);
  return selectedAmount.value;
});

const openRecharge = () => {
  currentStep.value = 0;
  selectedAmount.value = 0;
  customAmount.value = '';
  voucherOssId.value = '';
  voucherPreview.value = '';
  uploadingVoucher.value = false;
  showRechargePopup.value = true;
};

const closeRecharge = () => {
  showRechargePopup.value = false;
  if (currentStep.value === 3) {
    // 提交成功如果关闭，则刷新余额
    fetchAccountData();
    fetchAccountFlow();
  }
  currentStep.value = 0;
};

const handleNext = () => {
  if (currentStep.value === 1 && finalAmount.value <= 0) {
    ElMessage.warning('请选择或输入充值金额');
    return;
  }
  currentStep.value++;
};

// 上传凭证
const handleVoucherUpload = async (options: UploadRequestOptions) => {
  const file = options.file;
  uploadingVoucher.value = true;
  try {
    const ossId = await uploadOss(file);
    voucherOssId.value = ossId;
    // 生成本地预览
    voucherPreview.value = URL.createObjectURL(file);
    ElMessage.success('凭证上传成功');
  } catch {
    voucherOssId.value = '';
    voucherPreview.value = '';
    ElMessage.error('凭证图片上传失败，请重试');
  } finally {
    uploadingVoucher.value = false;
  }
};

const submitRecharge = async () => {
  if (!voucherOssId.value) {
    ElMessage.warning('请上传支付凭证截图');
    return;
  }

  submitLoading.value = true;
  try {
    await rechargeApply({
      applyAmount: finalAmount.value,
      voucherImg: voucherOssId.value,
    });
    ElMessage.success('提交成功');
    currentStep.value = 3; // 进入等待审核步骤
  } catch (err: any) {
    ElMessage.error(err?.msg || '提交失败，请重试');
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.balance-card {
  background: linear-gradient(135deg, #4481eb 0%, #04befe 100%);
  color: white;
  border: none;

  .bc-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }

  .bc-left {
    .bc-label {
      font-size: 16px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
    }
    .bc-amount {
      display: flex;
      align-items: baseline;
      gap: 4px;
      .bc-symbol {
        font-size: 24px;
        font-weight: bold;
      }
      .bc-value {
        font-size: 48px;
        font-weight: bold;
        line-height: 1;
      }
    }
  }

  .recharge-btn {
    background-color: #ffffff;
    color: #4481eb;
    border: none;
    font-weight: bold;
    padding: 0 32px;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;

    &:hover, &:focus {
      background-color: #f5f7fa;
      color: #04befe;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      transform: translateY(-1px);
    }
  }
}

.text-success { color: #67C23A; }
.text-warning { color: #E6A23C; }
.text-primary { color: #409EFF; }
.text-muted { color: #909399; }
.flex-center { display: flex; justify-content: center; align-items: center; }
.flex-column { flex-direction: column; }

/* 充值向导样式 */
.recharge-wizard {
  min-height: 400px;
}
.qr-image {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  .amount-item {
    margin: 0 !important;
    height: 50px;
    font-size: 16px;
    font-weight: bold;
  }
}

.voucher-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);

  &:hover {
    border-color: var(--el-color-primary);
  }

  .voucher-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 200px;
    height: 200px;
    text-align: center;
    &.is-loading {
      animation: rotating 2s linear infinite;
    }
  }

  .voucher-image {
    width: 200px;
    height: 200px;
    display: block;
    object-fit: contain;
  }
}
</style>
