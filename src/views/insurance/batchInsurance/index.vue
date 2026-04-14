<template>
  <div class="product-mall-container">
    <!-- 筛选面板 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-row">
        <span class="filter-label">产品分类：</span>
        <el-radio-group v-model="activeCategory" @change="fetchProducts">
          <el-radio-button :label="0">全部</el-radio-button>
          <el-radio-button v-for="cat in productCategories" :key="cat.dictValue" :label="cat.dictValue">
            {{ cat.dictLabel }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <!-- 产品列表 (Grid) -->
    <div class="product-list-section" v-loading="loadingProducts">
      <el-empty v-if="productList.length === 0" description="暂无该分类产品" />
      <el-row :gutter="20" v-else>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in productList" :key="product.id" class="product-col">
          <el-card class="product-card" shadow="hover" :body-style="{ padding: '0px' }" @click="handleProductClick(product)">
            <div class="card-image-wrapper">
              <el-image :src="product.imgUrlUrl || defaultProductImg" fit="cover" class="product-image">
                <template #placeholder>
                  <div class="image-slot">加载中<span class="dot">...</span></div>
                </template>
              </el-image>
            </div>
            <div class="card-content">
              <div class="card-header">
                <el-tooltip class="item" effect="dark" :content="product.productName" placement="top">
                  <h4 class="product-title">{{ product.productName }}</h4>
                </el-tooltip>
              </div>

              <div class="product-tags" v-if="product.productFeatures">
                <el-tag
                  v-for="(feature, idx) in getFeatures(product)"
                  :key="idx"
                  size="small"
                  color="#f0f5ff"
                  effect="plain"
                  style="margin-right: 4px; margin-bottom: 4px; border-color: #d6e4ff; color: #6e8efb"
                >
                  {{ feature }}
                </el-tag>
              </div>

              <div class="product-desc" v-if="product.description">
                <div v-for="(desc, idx) in getDescriptions(product)" :key="idx" class="desc-line">· {{ desc }}</div>
              </div>
            </div>

            <div class="card-footer">
              <div class="product-price">
                <span class="currency">¥</span>
                <span class="amount">{{ product.minPremium ? Number(product.minPremium).toFixed(2) : '0.00' }}</span>
              </div>
              <div class="labels-column" v-if="product.displayCommissionRate !== null && product.displayCommissionRate !== undefined">
                <div class="net-premium-pill">
                  净费 ¥{{ (Number(product.minPremium || 0) * (1 - Number(product.displayCommissionRate || 0))).toFixed(2) }}
                </div>
                <div class="commission-pill">推广佣金 {{ formatCommission(product.displayCommissionRate) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 批量投保向导 -->
    <el-drawer title="批量投保向导" v-model="showBatchDrawer" size="85%" :close-on-click-modal="false" class="batch-drawer">
      <el-steps :active="wizardStep" finish-status="success" simple style="margin-bottom: 20px">
        <el-step title="上传人员清单" />
        <el-step title="数据预审" />
        <el-step title="确认收银" />
      </el-steps>

      <!-- Step 1: 上传人员清单 -->
      <div v-if="wizardStep === 1" class="wizard-step-container">
        <div class="template-section">
          <h3>1. 下载模板</h3>
          <p class="desc">请务必使用系统提供的标准模板导入，否则可能导致解析失败。</p>
          <el-button type="primary" plain @click="downloadTemplate">下载《人员清单导入模板.xlsx》</el-button>
        </div>
        <el-divider />
        <div class="upload-section">
          <h3>2. 上传数据</h3>
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept=".xls,.xlsx"
            :on-change="handleFileChange"
          >
            <!-- 未上传时的默认外观 -->
            <div v-if="!uploadedFile">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
            </div>
            <!-- 已上传时的文件信息展示 -->
            <div v-else style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%">
              <el-icon style="font-size: 52px; color: #67c23a; margin-bottom: 12px"><Document /></el-icon>
              <div class="el-upload__text" style="color: #67c23a; font-weight: bold; font-size: 16px">{{ uploadedFile.name }}</div>
              <div style="margin-top: 10px; color: #909399; font-size: 13px">点击或拖拽此处可重新上传其他文件</div>
            </div>

            <template #tip>
              <div class="el-upload__tip">仅支持 xls/xlsx 格式文件，且不超过 10MB</div>
            </template>
          </el-upload>
        </div>
      </div>

      <!-- Step 2: 预审表 -->
      <div v-if="wizardStep === 2" class="wizard-step-container" style="display: flex; flex-direction: column; height: 100%">
        <div class="audit-header" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center">
          <div class="audit-stats">
            解析完成：共 <span style="font-weight: bold">{{ auditList.length }}</span> 条数据， 其中成功
            <span style="color: #67c23a; font-weight: bold; font-size: 16px">{{ validCount }}</span> 条， 失败
            <span style="color: #f56c6c; font-weight: bold; font-size: 16px">{{ invalidCount }}</span> 条。
          </div>
        </div>

        <el-table :data="auditList" style="width: 100%" height="calc(100vh - 300px)" border :row-class-name="tableRowClassName">
          <!-- 投保人信息 -->
          <el-table-column label="投保人信息" align="center">
            <el-table-column fixed prop="appName" label="姓名" width="110">
              <template #default="scope">
                <span v-if="!scope.row.isEditing">{{ scope.row.appName }}</span>
                <el-input v-else v-model="scope.row.appName" size="small" clearable />
              </template>
            </el-table-column>
            <el-table-column prop="appCertType" label="证件类型" width="100">
              <template #default="scope">
                <span v-if="!scope.row.isEditing">{{ getDictLabel(sys_cert_types, scope.row.appCertType) }}</span>
                <el-select v-else v-model="scope.row.appCertType" size="small">
                  <el-option v-for="dict in sys_cert_types" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="appCertNo" label="证件号" width="200">
              <template #default="scope">
                <span v-if="!scope.row.isEditing">{{ scope.row.appCertNo }}</span>
                <el-input v-else v-model="scope.row.appCertNo" size="small" clearable />
              </template>
            </el-table-column>
            <el-table-column prop="appPhone" label="手机号" width="130">
              <template #default="scope">
                <span v-if="!scope.row.isEditing">{{ scope.row.appPhone }}</span>
                <el-input v-else v-model="scope.row.appPhone" size="small" clearable />
              </template>
            </el-table-column>
            <el-table-column prop="appAddress" label="地址" width="180" show-overflow-tooltip>
              <template #default="scope">
                <span v-if="!scope.row.isEditing">{{ scope.row.appAddress }}</span>
                <el-input v-else v-model="scope.row.appAddress" size="small" clearable />
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 关系列 -->
          <el-table-column prop="relation" label="被/投关系" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.relation === '0' || scope.row.relation === '本人' ? 'success' : 'info'">{{
                getDictLabel(sys_relation_types, scope.row.relation)
              }}</el-tag>
            </template>
          </el-table-column>

          <!-- 被保人信息 -->
          <el-table-column label="被保人信息" align="center">
            <el-table-column prop="name" label="姓名" width="110">
              <template #default="scope">
                <span v-if="!scope.row.isEditing">{{ scope.row.name }}</span>
                <el-input v-else v-model="scope.row.name" size="small" clearable />
              </template>
            </el-table-column>
            <el-table-column prop="certType" label="证件类型" width="100">
              <template #default="scope">
                <span v-if="!scope.row.isEditing">{{ getDictLabel(sys_cert_types, scope.row.certType) }}</span>
                <el-select v-else v-model="scope.row.certType" size="small">
                  <el-option v-for="dict in sys_cert_types" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="certNo" label="证件号" width="200">
              <template #default="scope">
                <span v-if="!scope.row.isEditing">{{ scope.row.certNo }}</span>
                <el-input v-else v-model="scope.row.certNo" size="small" clearable />
                <div v-if="scope.row.errors?.certNo" style="color: #f56c6c; font-size: 12px; margin-top: 4px">
                  <el-icon><Warning /></el-icon> {{ scope.row.errors.certNo }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" width="130">
              <template #default="scope">
                <span v-if="!scope.row.isEditing">{{ scope.row.phone }}</span>
                <el-input v-else v-model="scope.row.phone" size="small" clearable />
                <div v-if="scope.row.errors?.phone" style="color: #f56c6c; font-size: 12px; margin-top: 4px">
                  <el-icon><Warning /></el-icon> {{ scope.row.errors.phone }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip>
              <template #default="scope">
                <span v-if="!scope.row.isEditing">{{ scope.row.address }}</span>
                <el-input v-else v-model="scope.row.address" size="small" clearable />
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column fixed="right" label="操作" width="130" align="center">
            <template #default="scope">
              <el-button v-if="!scope.row.isEditing" link type="primary" size="small" @click="scope.row.isEditing = true">修改</el-button>
              <el-button v-else link type="success" size="small" @click="saveRowEdit(scope.row)">保存</el-button>
              <el-popconfirm title="确定要删除此人员记录吗？" @confirm="deleteRow(scope.$index)" width="200px">
                <template #reference>
                  <el-button link type="danger" size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Step 3: 收银台 -->
      <div v-if="wizardStep === 3" class="wizard-step-container">
        <el-card class="cashier-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>批量投保收银台</span>
            </div>
          </template>
          <div class="cashier-content">
            <div class="cashier-item">
              <span class="label">投保产品：</span>
              <span class="value">{{ cashierData?.productName ?? currentProduct?.productName }}</span>
            </div>
            <div class="cashier-item">
              <span class="label">单人应交净费：</span>
              <span class="value price">¥{{ cashierData?.netPremium ?? getNetPremium(currentProduct) }}</span>
            </div>
            <div class="cashier-item">
              <span class="label">有效投保人数：</span>
              <span class="value"
                ><span style="font-size: 18px; font-weight: bold">{{ cashierData?.validCount ?? validCount }}</span> 人</span
              >
            </div>
            <el-divider />
            <div class="cashier-item total">
              <span class="label">预计总扣款金额：</span>
              <span class="value price total-price"
                >¥{{ cashierData?.totalAmount ?? (Number(getNetPremium(currentProduct)) * validCount).toFixed(2) }}</span
              >
            </div>
            <div class="cashier-item balance">
              <span class="label">当前账户余额：</span>
              <span class="value">¥{{ cashierData ? Number(cashierData.walletBalance).toFixed(2) : userBalance.toFixed(2) }}</span>
            </div>

            <el-alert
              v-if="cashierData ? !cashierData.isBalanceSufficient : userBalance < Number(getNetPremium(currentProduct)) * validCount"
              title="余额不足，请先充値后再进行批量投保提交。"
              type="error"
              :closable="false"
              show-icon
              style="margin-top: 15px"
            />
          </div>
        </el-card>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showBatchDrawer = false">取 消</el-button>
          <el-button v-if="wizardStep > 1 && !submittingBatch" @click="wizardStep--">上一步</el-button>
          <el-button v-if="wizardStep === 1" type="primary" :disabled="!uploadedFile" @click="parseExcelFile" :loading="parsingFile"
            >开始解析</el-button
          >
          <el-button v-if="wizardStep === 2" type="primary" :disabled="invalidCount > 0" :loading="previewLoading" @click="goCashier"
            >确认无误，去收银台</el-button
          >
          <el-button
            v-if="wizardStep === 3"
            type="primary"
            @click="submitBatchPay"
            :loading="submittingBatch"
            :disabled="userBalance < Number(getNetPremium(currentProduct)) * validCount || validCount === 0"
            >全员投保出单并扣款</el-button
          >
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts" name="BatchInsurance">
import { ref, reactive, onMounted, onErrorCaptured, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled, Warning, Document } from '@element-plus/icons-vue';
import {
  listSalesProducts,
  addInsuranceApplyRecord,
  confirmPay,
  saveInsureInfo,
  importBatchData,
  previewBatch,
  submitBatch
} from '@/api/insurance/batchInsurance';
import { getDicts } from '@/api/system/dict/data';
import { getUserAccount } from '@/api/finance/myWallet';
import { getConfigKey } from '@/api/system/config';
import { useUserStore } from '@/store/modules/user';
import defaultProductImg from '@/assets/images/profile.jpg';

const router = useRouter();
const userStore = useUserStore();

// 字典翻译映射相关
const sys_cert_types = ref<any[]>([]);
const sys_relation_types = ref<any[]>([]);

const getDictLabel = (dictOptions: any[], value: string | number) => {
  if (value === null || value === undefined || value === '') return '';
  const option = dictOptions.find((d: any) => String(d.dictValue) === String(value));
  return option ? option.dictLabel : value;
};

onErrorCaptured((err, instance, info) => {
  ElMessage.error({
    message: `Page crash: ${err.message}`,
    duration: 10000
  });
  console.error('Component Crash:', err, info);
  return false;
});

const productCategories = ref<any[]>([]);
const productList = ref<any[]>([]);
const loadingProducts = ref(false);
const userBalance = ref(0);

const activeCategory = ref<number | string>(0);
const currentProduct = ref<any>(null);

// 向导状态变量
const showBatchDrawer = ref(false);
const wizardStep = ref(1);

// Step 1: 上传相关
const uploadedFile = ref<any>(null);
const parsingFile = ref(false);

const downloadTemplate = async () => {
  try {
    const res = await getConfigKey('insurance.batch.templateUrl');
    if (res.data) {
      const fileName = '人员清单导入模板.xlsx';
      // 使用 fetch 处理下载，以便指定文件名
      fetch(res.data)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(() => {
          // 如果 fetch 失败（可能是跨域限制），回退到 window.open
          window.open(res.data, '_blank');
        });
    } else {
      ElMessage.warning('后台参数 [insurance.batch.templateUrl] 未配置');
    }
  } catch (err) {
    console.error(err);
  }
};

const handleFileChange = (file: any) => {
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (extension !== '.xls' && extension !== '.xlsx') {
    ElMessage.error('只能上传 xls / xlsx 格式的文件！');
    return false;
  }
  if (file.size / 1024 / 1024 > 10) {
    ElMessage.error('文件大小不能超过 10MB！');
    return false;
  }
  uploadedFile.value = file;
  ElMessage.success(`文件 ${file.name} 选择成功`);
  return true;
};

const goCashier = async () => {
  previewLoading.value = true;
  try {
    const res = (await previewBatch({
      productId: currentProduct.value?.id,
      auditList: auditList.value.filter((item) => item.isValid)
    })) as any;
    if (res.code === 200) {
      cashierData.value = res.data; // 可能为 null，展示层有备用逻辑
    }
  } catch (err) {
    console.error('preview error:', err);
  } finally {
    previewLoading.value = false;
  }
  wizardStep.value = 3;
};

const parseExcelFile = async () => {
  if (!uploadedFile.value || !uploadedFile.value.raw) {
    ElMessage.warning('请先上传文件！');
    return;
  }
  parsingFile.value = true;
  try {
    const formData = new FormData();
    formData.append('file', uploadedFile.value.raw);

    // 调用实际后端接口
    const res = (await importBatchData(formData)) as any;

    if (res.code === 200 && res.data) {
      auditList.value = res.data.auditList || [];
      wizardStep.value = 2; // proceed to step 2 after parsing
      ElMessage.success(`解析完成！成功 ${res.data.validCount} 条，异常 ${res.data.invalidCount} 条`);
    } else {
      ElMessage.error(res.msg || '解析失败，请检查文件内容或格式格式');
    }
  } catch (error) {
    console.error('File parse error:', error);
    ElMessage.error('网络异常或解析处理失败，请检查后台日志');
  } finally {
    parsingFile.value = false;
  }
};

// Step 2 相关
const auditList = ref<any[]>([]);
const previewLoading = ref(false);
const cashierData = ref<any>(null);
const validCount = computed(() => auditList.value.filter((item) => item.isValid).length);
const invalidCount = computed(() => auditList.value.filter((item) => !item.isValid).length);

const tableRowClassName = ({ row }: { row: any }) => {
  if (!row.isValid) {
    return 'error-row';
  }
  return '';
};

const saveRowEdit = (row: any) => {
  row.errors = {};
  let valid = true;

  // 简易校验：投保人
  if (!row.appName) valid = false;
  if (row.appCertNo.length !== 18) {
    row.errors.appCertNo = '投保人身份证必须18位';
    valid = false;
  }

  // 简易校验：被保人
  if (!row.name) valid = false;
  if (row.certNo.length !== 18) {
    row.errors.certNo = '被保人身份证必须18位';
    valid = false;
  }
  if (row.phone.length !== 11) {
    row.errors.phone = '被保人手机必须11位';
    valid = false;
  }

  row.isValid = valid;
  if (valid) {
    row.isEditing = false;
    ElMessage.success('校验通过');
  } else {
    ElMessage.warning('校验仍有误，请继续修改');
  }
};

const deleteRow = (index: number) => {
  auditList.value.splice(index, 1);
  ElMessage.success('记录已删除');
};

// Step 3 相关
import { ElLoading } from 'element-plus';

const submittingBatch = ref(false);

const submitBatchPay = async () => {
  if (submittingBatch.value) return;

  submittingBatch.value = true;
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在生成订单并扣款，请勿刷新页面...',
    background: 'rgba(0, 0, 0, 0.7)'
  });

  try {
    const res = (await submitBatch({
      productId: currentProduct.value?.id,
      auditList: auditList.value.filter((item) => item.isValid)
    })) as any;

    loadingInstance.close();
    submittingBatch.value = false;

    if (res.code === 200) {
      const batchOrderNo = res.data?.batchOrderNo;
      showBatchDrawer.value = false;
      ElMessageBox.alert(`批量投保出单成功！批次单号：${batchOrderNo}`, '出单成功', {
        confirmButtonText: '已完成',
        type: 'success'
      });
    } else {
      ElMessage.error(res.msg || '出单失败，请重试');
    }
  } catch (err) {
    loadingInstance.close();
    submittingBatch.value = false;
    ElMessage.error('网络异常，出单失败，请重试');
    console.error(err);
  }
};

const getNetPremium = (product: any) => {
  if (!product) return '0.00';
  const raw = Number(product.minPremium || 0);
  const comm = Number(product.displayCommissionRate || product.commissionRate || 0);
  return (raw * (1 - comm)).toFixed(2);
};

const getDictsList = () => {
  getDicts('insurance_product_type').then((res: any) => {
    productCategories.value = res.data || res || [];
  });
  getDicts('insurance_id_type').then((res: any) => {
    sys_cert_types.value = res.data || res || [];
  });
  getDicts('insurance_relationship_to_insured').then((res: any) => {
    sys_relation_types.value = res.data || res || [];
  });
};

const fetchWalletBalance = async () => {
  if (userStore.userId) {
    try {
      const res: any = await getUserAccount(userStore.userId);
      userBalance.value = Number(res.data?.balance || 0);
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
    }
  }
};

const fetchProducts = async () => {
  loadingProducts.value = true;
  try {
    const query = { pageNum: 1, pageSize: 200 };
    const res: any = await listSalesProducts(query);
    let allProducts = res.rows || res.data?.rows || [];

    if (activeCategory.value !== 0 && activeCategory.value !== '0') {
      allProducts = allProducts.filter((p: any) => p.productType === activeCategory.value);
    }

    // 🌟 核心过滤：仅展示 productMode=1 (卡单) + insureMode=1 (直降) + paymentMode=1 (余额支付) 的产品
    allProducts = allProducts.filter((p: any) => p.productMode === 1 && p.insureMode === 1 && p.paymentMode === 1);

    productList.value = allProducts;
  } catch (err) {
    console.error('Failed to load products:', err);
  } finally {
    loadingProducts.value = false;
  }
};

const getFeatures = (product: any): string[] => {
  return product.productFeatures
    .split(/[,，]/)
    .map((f: string) => f.trim())
    .filter((f: string) => f.length > 0);
};

const getDescriptions = (product: any): string[] => {
  return product.description
    .split('。')
    .map((d: string) => d.trim())
    .filter((d: string) => d.length > 0);
};

const formatCommission = (rate: number | undefined) => {
  if (rate === undefined || rate === null) return '--';
  return (Number(rate) * 100).toFixed(2).replace(/\.?0+$/, '');
};

const handleProductClick = (product: any) => {
  if (product.status === 1) {
    ElMessageBox.alert('该产品已下架或维护中，如有疑问请联系平台管理员。', '提示', { confirmButtonText: '我知道了' });
    return;
  }
  currentProduct.value = product;
  showBatchDrawer.value = true;
  wizardStep.value = 1;
  uploadedFile.value = null;
};

onMounted(() => {
  getDictsList();
  fetchProducts();
  fetchWalletBalance();
});
</script>

<style scoped lang="scss">
.product-mall-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: none;
}

.filter-row {
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  margin-right: 16px;
  min-width: 70px;
}

.product-col {
  margin-bottom: 20px;
}

.product-card {
  border-radius: 12px;
  border: none;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
  }
}

.card-image-wrapper {
  height: 180px;
  width: 100%;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 12px;
}

.product-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-tags {
  margin-bottom: 12px;
}

.product-desc {
  flex: 1;
  color: #909399;
  font-size: 13px;
  line-height: 1.6;
}

.desc-line {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-bottom: 4px;
}

.card-footer {
  padding: 12px 16px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.product-price {
  color: #f56c6c;
}

.currency {
  font-size: 16px;
  font-weight: bold;
}

.amount {
  font-size: 26px;
  font-weight: bold;
}

.labels-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.net-premium-pill,
.commission-pill {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.net-premium-pill {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.commission-pill {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid rgba(230, 162, 60, 0.2);
}

.lead-form-tip {
  padding: 12px;
  background-color: #e8f3fe;
  color: #409eff;
  font-size: 13px;
  line-height: 1.5;
  border-radius: 4px;
  margin-bottom: 20px;
}

:deep(.lead-dialog .el-dialog__body) {
  padding: 10px 20px;
}

.payment-privew-box {
  background: #fdf6ec;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #faecd8;

  .preview-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #909399;
    }

    .value {
      color: #303133;
      font-weight: 500;

      &.price {
        color: #f56c6c;
        font-size: 18px;
        font-weight: bold;
      }
    }
  }
}

.cashier-card {
  width: 50%;
  margin: 40px auto;
}
.cashier-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.cashier-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
}
.cashier-item .label {
  color: #606266;
}
.cashier-item .value {
  color: #303133;
}
.cashier-item .price {
  color: #f56c6c;
  font-weight: bold;
}
.cashier-item.total .total-price {
  font-size: 24px;
}
</style>
