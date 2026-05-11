<template>
  <div class="p-2 payment-page">
    <el-card v-loading="loading" shadow="never">
      <template #header>
        <div class="page-header">
          <div>
            <el-button link icon="ArrowLeft" @click="router.back()">返回</el-button>
            <span class="page-title">收银台</span>
          </div>
          <el-button icon="Refresh" :loading="refreshingBalance" @click="fetchBalance">刷新余额</el-button>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col :xs="24" :md="14">
          <el-card shadow="never" class="info-card">
            <template #header><span class="section-title">订单信息</span></template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="投保人">{{ orderInfo.customerName || '--' }}</el-descriptions-item>
              <el-descriptions-item label="产品名称">{{ orderInfo.productName || '--' }}</el-descriptions-item>
              <el-descriptions-item v-if="isCardSecretOrder" label="商品规格">{{ orderInfo.specName || '--' }}</el-descriptions-item>
              <el-descriptions-item v-if="isCardSecretOrder" label="商品金额">¥{{ Number(orderInfo.goodsAmount || 0).toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item v-if="isCardSecretOrder" label="运费">{{ orderInfo.freightPayType === 'collect' ? '到付' : `¥${Number(orderInfo.freightAmount || 0).toFixed(2)}` }}</el-descriptions-item>
              <el-descriptions-item label="订单编号">{{ orderNo }}</el-descriptions-item>
              <el-descriptions-item label="应付金额">
                <span class="amount">¥{{ amount.toFixed(2) }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="10">
          <el-card shadow="never" class="info-card wallet-card">
            <template #header><span class="section-title">钱包余额支付</span></template>
            <div class="balance-row">
              <span>当前账户余额</span>
              <span class="balance" :class="{ insufficient: balance < amount }">¥{{ balance.toFixed(2) }}</span>
            </div>
            <el-alert v-if="balance < amount" type="warning" show-icon :closable="false" title="余额不足，请先充值或联系管理员" />
            <el-button
              class="pay-button"
              type="primary"
              size="large"
              :disabled="balance < amount || amount <= 0"
              :loading="paying"
              @click="handlePay"
            >
              立即支付 ¥{{ amount.toFixed(2) }}
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup name="InsuranceTenantProductPayment" lang="ts">
import { getInfo } from '@/api/login';
import { getUserAccount } from '@/api/finance/userAccount';
import { getInsuranceApplyRecordByOrderNo, payWithBalance } from '@/api/insurance/InsuranceApplyRecord';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const refreshingBalance = ref(false);
const paying = ref(false);
const orderNo = ref('');
const orderInfo = ref<any>({});
const balance = ref(0);
const isCardSecretOrder = computed(() => Number(orderInfo.value?.productMode) === 3 && Number(orderInfo.value?.insureMode) === 2);
const amount = computed(() => Number(orderInfo.value?.netPremium ?? orderInfo.value?.premium ?? 0));

const fetchOrder = async () => {
  orderNo.value = (route.query.orderNo as string) || '';
  if (!orderNo.value) {
    proxy?.$modal.msgError('缺少订单号');
    router.back();
    return;
  }
  const res = await getInsuranceApplyRecordByOrderNo(orderNo.value);
  orderInfo.value = res.data || {};
};

const fetchBalance = async () => {
  refreshingBalance.value = true;
  try {
    const userRes: any = await getInfo();
    const user = userRes.data?.user || userRes.user || {};
    if (!user.userId) return;
    const accountRes: any = await getUserAccount(user.userId);
    balance.value = Number(accountRes.data?.balance || 0);
  } finally {
    refreshingBalance.value = false;
  }
};

const handlePay = async () => {
  if (balance.value < amount.value) {
    proxy?.$modal.msgWarning('余额不足，无法支付');
    return;
  }
  paying.value = true;
  try {
    await payWithBalance({ orderNo: orderNo.value, payAmount: amount.value });
    proxy?.$modal.msgSuccess('支付成功');
    router.push({ path: '/insurance/tenant-product/payment-success', query: { orderNo: orderNo.value } });
  } finally {
    paying.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await fetchOrder();
    await fetchBalance();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-header {
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

.info-card {
  min-height: 260px;
}

.amount {
  color: var(--el-color-danger);
  font-size: 22px;
  font-weight: 700;
}

.wallet-card {
  display: flex;
  flex-direction: column;
}

.balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 14px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.balance {
  font-size: 22px;
  font-weight: 700;
}

.balance.insufficient {
  color: var(--el-color-danger);
}

.pay-button {
  width: 100%;
  margin-top: 16px;
}
</style>
