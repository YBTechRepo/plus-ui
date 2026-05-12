<template>
  <div class="p-2">
    <el-card shadow="never" class="success-card">
      <el-result icon="success" title="支付成功" :sub-title="isCardOrder ? '订单已成功支付，平台将尽快安排发货' : '订单已成功支付并进入承保流程'">
        <template #extra>
          <div class="order-no">订单编号：{{ orderNo || '--' }}</div>
          <el-button type="primary" @click="goProductList">返回产品列表</el-button>
          <el-button @click="goApplyRecord">{{ isCardOrder ? '查看卡密订单' : '查看投保记录' }}</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup name="InsuranceTenantProductPaymentSuccess" lang="ts">
const router = useRouter();
const route = useRoute();
const orderNo = computed(() => route.query.orderNo as string);
const isCardOrder = computed(() => route.query.orderType === 'card');

const goProductList = () => {
  router.push('/insuranceProduct/InsuranceTenantProduct');
};

const goApplyRecord = () => {
  if (isCardOrder.value) {
    router.push('/insurance/InsuranceCardOrder');
    return;
  }
  router.push('/insurancePolicy/InsuranceApplyRecord');
};
</script>

<style scoped>
.success-card {
  min-height: 420px;
}

.order-no {
  margin-bottom: 18px;
  color: var(--el-text-color-secondary);
}
</style>
