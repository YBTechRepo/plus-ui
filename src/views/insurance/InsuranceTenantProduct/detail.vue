<template>
  <div class="p-2 product-detail-page">
    <el-card v-loading="loading" shadow="never">
      <template #header>
        <div class="page-header">
          <div>
            <el-button link icon="ArrowLeft" @click="goBack">返回</el-button>
            <span class="page-title">产品详情</span>
          </div>
          <el-button type="primary" icon="ShoppingCart" @click="handleBuy" :disabled="!product.id">{{
            isCardSecretProduct ? '立即购买' : '立即投保'
          }}</el-button>
        </div>
      </template>

      <el-empty v-if="!loading && !product.id" description="暂无产品详情" />
      <template v-else>
        <div class="hero-section">
          <el-image class="product-image" :src="productImage" fit="cover">
            <template #error>
              <div class="image-error">暂无图片</div>
            </template>
          </el-image>
          <div class="product-summary">
            <h2>{{ product.productName || '--' }}</h2>
            <div class="summary-meta">
              <dict-tag :options="insurance_company" :value="product.companyCode" />
              <dict-tag :options="insurance_product_mode" :value="product.productMode" />
              <el-tag v-if="product.categoryName" type="info">{{ product.categoryName }}</el-tag>
            </div>
            <div class="price-line">
              <span class="price">{{ displayPrice }}</span>
              <span class="price-label">{{ isCardSecretProduct ? '' : '起' }}</span>
            </div>
            <div v-if="featureTags.length > 0" class="tag-list">
              <el-tag v-for="tag in featureTags" :key="tag" effect="plain">{{ tag }}</el-tag>
            </div>
            <div v-if="descriptionList.length > 0" class="desc-list">
              <div v-for="item in descriptionList" :key="item">· {{ item }}</div>
            </div>
            <div v-if="isCardSecretProduct" class="spec-section">
              <div class="spec-title">商品规格</div>
              <el-radio-group v-model="selectedSpecId" class="spec-list">
                <el-radio-button v-for="spec in enabledCardSpecs" :key="spec.specId" :label="String(spec.specId)">
                  {{ spec.specName }} ¥{{ formatAmount(spec.price) }}
                </el-radio-button>
              </el-radio-group>
              <div v-if="selectedSpec" class="spec-meta">
                <span>运费：{{ isFreightCollect ? '到付' : `¥${formatAmount(productFreight)}` }}</span>
                <span>库存：{{ selectedSpec.stock ?? 0 }}</span>
                <span>合计：¥{{ formatAmount(cardOrderAmount) }}</span>
              </div>
              <el-empty v-if="enabledCardSpecs.length === 0" description="暂无可购买规格" />
            </div>
          </div>
        </div>

        <el-row v-if="!isCardSecretProduct" :gutter="12" class="mt-3">
          <el-col :xs="24" :md="12">
            <el-card shadow="never" class="section-card">
              <template #header><span class="section-title">保障责任</span></template>
              <el-table v-if="liabilityList.length > 0" :data="liabilityList" border>
                <el-table-column label="责任名称" prop="liabilityName" min-width="180" show-overflow-tooltip />
                <el-table-column label="保额说明" prop="insuredAmountDesc" width="160" />
                <el-table-column label="说明" min-width="220" show-overflow-tooltip>
                  <template #default="scope">{{ scope.row.description || '--' }}</template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="暂无保障责任" />
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-card shadow="never" class="section-card">
              <template #header><span class="section-title">投保须知</span></template>
              <el-descriptions v-if="insureNotice.length > 0" :column="1" border>
                <el-descriptions-item v-for="item in insureNotice" :key="item.title" :label="item.title">{{ item.content }}</el-descriptions-item>
              </el-descriptions>
              <el-empty v-else description="暂无投保须知" />
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="section-card mt-3">
          <template #header
            ><span class="section-title">{{ isCardSecretProduct ? '产品详情图' : '产品图文' }}</span></template
          >
          <div v-if="featureImages.length > 0" class="image-list">
            <el-image v-for="img in featureImages" :key="img" :src="img" fit="contain" class="detail-image" lazy />
          </div>
          <el-empty v-else :description="isCardSecretProduct ? '暂无产品详情图' : '暂无产品图文'" />
        </el-card>

        <el-row v-if="!isCardSecretProduct" :gutter="12" class="mt-3">
          <el-col :xs="24" :md="12">
            <el-card shadow="never" class="section-card">
              <template #header><span class="section-title">理赔指南</span></template>
              <div v-if="claimImages.length > 0" class="image-list compact">
                <el-image v-for="img in claimImages" :key="img" :src="img" fit="contain" class="detail-image" lazy />
              </div>
              <el-timeline v-if="claimInstructions.length > 0">
                <el-timeline-item v-for="step in claimInstructions" :key="step.sort || step.title" :timestamp="step.title">
                  {{ step.content }}
                </el-timeline-item>
              </el-timeline>
              <el-empty v-if="claimImages.length === 0 && claimInstructions.length === 0" description="暂无理赔指南" />
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-card shadow="never" class="section-card">
              <template #header><span class="section-title">条款须知</span></template>
              <el-table v-if="clauseFiles.length > 0" :data="clauseFiles" border>
                <el-table-column label="条款名称" prop="clauseName" show-overflow-tooltip />
                <el-table-column label="操作" width="120" align="center">
                  <template #default="scope">
                    <el-button link type="primary" icon="Download" @click="openFile(scope.row.fileUrl)">查看</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="暂无条款文件" />
            </el-card>
          </el-col>
        </el-row>
      </template>
    </el-card>

    <el-dialog :title="isCardSecretProduct ? '购买意向登记' : '投保意向登记'" v-model="leadDialog.visible" width="480px" append-to-body>
      <el-form ref="leadFormRef" :model="leadForm" :rules="leadRules" label-width="110px">
        <el-form-item :label="isCardSecretProduct ? '联系人姓名' : '被保人姓名'" prop="customerName">
          <el-input v-model="leadForm.customerName" :placeholder="isCardSecretProduct ? '请输入联系人姓名' : '请输入被保人姓名'" />
        </el-form-item>
        <el-form-item :label="isCardSecretProduct ? '联系人手机号' : '被保人手机号'" prop="customerMobile">
          <el-input
            v-model="leadForm.customerMobile"
            :placeholder="isCardSecretProduct ? '请输入联系人手机号' : '请输入被保人手机号'"
            maxlength="11"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="leadDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="leadDialog.loading" @click="submitLeadForm">{{
          isCardSecretProduct ? '确认购买' : '确认投保'
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InsuranceTenantProductDetail" lang="ts">
import { getInfo } from '@/api/login';
import { getProductFull } from '@/api/insurance/InsuranceProductConfig';
import { addInsuranceApplyRecord } from '@/api/insurance/InsuranceApplyRecord';
import { addInsuranceCardOrder } from '@/api/insurance/InsuranceCardOrder';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { insurance_company, insurance_product_mode } = toRefs<any>(proxy?.useDict('insurance_company', 'insurance_product_mode'));

const loading = ref(false);
const productData = ref<any>({});
const selectedSpecId = ref('');
let fetchSeq = 0;
const leadFormRef = ref<ElFormInstance>();
const leadDialog = reactive({ visible: false, loading: false });
const leadForm = reactive({ customerName: '', customerMobile: '' });
const leadRules = {
  customerName: [
    { required: true, message: '请输入被保人姓名', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5]{2,}$/, message: '姓名必须为全中文字符且至少2个字', trigger: 'blur' }
  ],
  customerMobile: [
    { required: true, message: '请输入被保人手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入11位有效手机号', trigger: 'blur' }
  ]
};

const product = computed(() => productData.value?.product || {});
const isCardSecretProduct = computed(() => Number(product.value?.productMode) === 3 && Number(product.value?.insureMode) === 2);
const liabilityList = computed(() => productData.value?.liabilityList || []);
const insureNotice = computed(() => normalizeArray(productData.value?.insureNotice));
const featureImages = computed(() => normalizeArray(productData.value?.featureImages));
const claimImages = computed(() => normalizeArray(productData.value?.claimImages));
const claimInstructions = computed(() => normalizeArray(productData.value?.claimInstructions));
const clauseFiles = computed(() => normalizeArray(productData.value?.clauseFiles));
const featureTags = computed(() => splitText(product.value?.productFeatures, /[,，]/));
const descriptionList = computed(() => splitText(product.value?.description, '。'));
const productImage = computed(() => product.value?.imgUrlUrl || productData.value?.imgUrl || product.value?.imgUrl || '');
const cardSpecs = computed(() => normalizeArray(productData.value?.cardSpecs));
const enabledCardSpecs = computed(() => {
  return cardSpecs.value.filter((item) => Number(item.status) === 0).sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
});
const selectedSpec = computed(() => enabledCardSpecs.value.find((item) => String(item.specId) === selectedSpecId.value));
const productFreightPayType = computed(() => product.value?.freightPayType || selectedSpec.value?.freightPayType || 'prepaid');
const productFreight = computed(() => Number(product.value?.freight ?? selectedSpec.value?.freight ?? 0));
const isFreightCollect = computed(() => productFreightPayType.value === 'collect');
const selectedSpecFreight = computed(() => {
  if (!selectedSpec.value || isFreightCollect.value) return 0;
  return productFreight.value;
});
const cardOrderAmount = computed(() => Number(selectedSpec.value?.price || 0) + selectedSpecFreight.value);
const displayPrice = computed(() => {
  if (!isCardSecretProduct.value) return `¥${formatAmount(product.value?.minPremium)}`;
  if (enabledCardSpecs.value.length === 0) return '暂无报价';
  const prices = enabledCardSpecs.value.map((item) => Number(item.price || 0));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `¥${formatAmount(min)}` : `¥${formatAmount(min)} - ¥${formatAmount(max)}`;
});

const normalizeArray = (raw: any): any[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const splitText = (raw: string | undefined, separator: string | RegExp) => {
  if (!raw) return [];
  return raw
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
};

const formatAmount = (amount: any) => Number(amount || 0).toFixed(2);

const fetchData = async (id: string) => {
  if (!id) {
    proxy?.$modal.msgError('缺少产品ID');
    goBack();
    return;
  }
  const currentSeq = ++fetchSeq;
  loading.value = true;
  productData.value = {};
  try {
    const res: any = await getProductFull(id);
    if (currentSeq !== fetchSeq) return;
    productData.value = res.data || res || {};
    selectedSpecId.value = String(enabledCardSpecs.value[0]?.specId || '');
  } finally {
    if (currentSeq === fetchSeq) {
      loading.value = false;
    }
  }
};

const goBack = () => {
  router.back();
};

const handleBuy = () => {
  if (isCardSecretProduct.value && !selectedSpec.value) {
    proxy?.$modal.msgWarning('请选择商品规格');
    return;
  }
  leadDialog.visible = true;
};

const submitLeadForm = () => {
  leadFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    leadDialog.loading = true;
    try {
      const userRes: any = await getInfo();
      const user = userRes.data?.user || userRes.user || {};
      const currentProduct = product.value;
      const orderNo = generateOrderNo();
      const orderPayload = {
        orderNo,
        productId: currentProduct.id,
        productCode: currentProduct.productCode,
        productName: currentProduct.productName,
        customerName: leadForm.customerName,
        customerMobile: leadForm.customerMobile,
        agentName: user.nickName || '',
        agentUserId: user.userId || '',
        agentDeptId: user.agentDeptId || user.deptId || '',
        status: 1,
        premium: isCardSecretProduct.value ? cardOrderAmount.value : Number(currentProduct.minPremium || 0),
        paymentMode: currentProduct.paymentMode,
        insureMode: currentProduct.insureMode,
        productMode: currentProduct.productMode,
        specId: selectedSpec.value?.specId,
        specName: selectedSpec.value?.specName,
        goodsAmount: isCardSecretProduct.value ? Number(selectedSpec.value?.price || 0) : undefined,
        freightPayType: isCardSecretProduct.value ? productFreightPayType.value : undefined,
        freightAmount: isCardSecretProduct.value ? selectedSpecFreight.value : undefined,
        payAmount: isCardSecretProduct.value ? cardOrderAmount.value : Number(currentProduct.minPremium || 0)
      };
      if (isCardSecretProduct.value) {
        await addInsuranceCardOrder(orderPayload);
      } else {
        await addInsuranceApplyRecord(orderPayload);
      }
      leadDialog.visible = false;

      if (isCardSecretProduct.value) {
        router.push({ path: '/insurance/tenant-product/apply', query: { orderNo, orderType: 'card' } });
        return;
      }

      if (Number(currentProduct.productMode) === 1 && Number(currentProduct.insureMode) === 1) {
        router.push({ path: '/insurance/tenant-product/apply', query: { orderNo } });
        return;
      }
      openProposalUrl(currentProduct, user);
    } finally {
      leadDialog.loading = false;
    }
  });
};

const generateOrderNo = () => {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `YT${stamp}${random}`;
};

const buildProposalUrl = (proposalUrl: string, user: any) => {
  const agentUserId = String(user?.userId || '');
  const agentCode = String(user?.agentCode || user?.userName || user?.userId || '');
  return proposalUrl
    .replace(/\$agentUserId\$/g, agentUserId)
    .replace(/\$\{agentUserId\}/g, agentUserId)
    .replace(/\{agentUserId\}/g, agentUserId)
    .replace(/\$agentCode\$/g, agentCode)
    .replace(/\$\{agentCode\}/g, agentCode)
    .replace(/\{agentCode\}/g, agentCode);
};

const openProposalUrl = (currentProduct: any, user: any) => {
  const proposalUrl = currentProduct.proposalUrl || currentProduct.ProposalUrl || '';
  if (!proposalUrl) {
    proxy?.$modal.msgSuccess('登记成功');
    return;
  }
  const url = buildProposalUrl(proposalUrl, user);
  if (!url) {
    proxy?.$modal.msgSuccess('登记成功');
    return;
  }
  window.open(url, '_blank');
};

const openFile = (url: string) => {
  if (url) window.open(url, '_blank');
};

watch(
  () => route.query.id,
  (id) => {
    fetchData(Array.isArray(id) ? id[0] : id || '');
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  margin-left: 10px;
  font-size: 16px;
  font-weight: 600;
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(280px, 420px) 1fr;
  gap: 20px;
}

.product-image {
  width: 100%;
  height: 260px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--el-fill-color-light);
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-secondary);
}

.product-summary h2 {
  margin: 4px 0 12px;
  font-size: 24px;
}

.summary-meta,
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.price-line {
  margin: 18px 0;
}

.price {
  color: var(--el-color-danger);
  font-size: 28px;
  font-weight: 700;
}

.price-label,
.desc-list {
  color: var(--el-text-color-secondary);
}

.desc-list {
  margin-top: 12px;
  line-height: 1.8;
}

.spec-section {
  margin-top: 18px;
}

.spec-title {
  margin-bottom: 10px;
  font-weight: 600;
}

.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 12px;
  color: var(--el-text-color-secondary);
}

.section-card {
  min-height: 220px;
}

.section-title {
  font-weight: 600;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-list.compact .detail-image {
  max-height: 280px;
}

.detail-image {
  width: 100%;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

@media (max-width: 960px) {
  .hero-section {
    grid-template-columns: 1fr;
  }
}
</style>
