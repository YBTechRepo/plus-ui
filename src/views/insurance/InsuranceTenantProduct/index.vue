<template>
  <div class="p-2">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="5" :lg="4" :xl="4">
        <el-card shadow="never" class="category-card">
          <template #header>
            <div class="category-header">
              <span>产品分类</span>
            </div>
          </template>
          <div class="category-all" :class="{ active: activeCategoryId === undefined }" @click="handleAllCategory">
            <span :style="getCategoryIconStyle(defaultCategoryIcon, undefined, 16)"></span>
            <span>全部产品</span>
          </div>
          <el-tree
            ref="categoryTreeRef"
            :data="categoryTreeOptions"
            :props="{ label: 'categoryName', children: 'children' }"
            node-key="categoryId"
            highlight-current
            default-expand-all
            :expand-on-click-node="false"
            @node-click="handleCategoryNodeClick"
          >
            <template #default="{ data }">
              <span class="category-node">
                <span :style="getCategoryIconStyle(data.icon, data.iconColor, 16)"></span>
                <span class="category-name">{{ data.categoryName }}</span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="19" :lg="20" :xl="20">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div v-show="showSearch" class="mb-[10px]">
            <el-card shadow="hover">
              <el-form ref="queryFormRef" :model="queryParams" :inline="true">
                <el-form-item label="上架状态" prop="status">
                  <el-select v-model="queryParams.status" placeholder="请选择上架状态" clearable>
                    <el-option v-for="dict in insurance_product_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="产品模式" prop="productMode">
                  <el-select v-model="queryParams.productMode" placeholder="请选择产品模式" clearable>
                    <el-option v-for="dict in insurance_product_mode" :key="dict.value" :label="dict.label" :value="Number(dict.value)" />
                  </el-select>
                </el-form-item>
                <el-form-item :label="filterTagLabel">
                  <el-space wrap class="marketing-tags-filter">
                    <el-check-tag :checked="isAllFilterTagActive" @change="handleFilterTagClick()">全部产品</el-check-tag>
                    <el-check-tag
                      v-for="tag in visibleFilterTags"
                      :key="tag.value"
                      :checked="isFilterTagActive(tag)"
                      @change="handleFilterTagClick(tag)"
                    >
                      {{ tag.label }}
                    </el-check-tag>
                    <span v-if="visibleFilterTags.length === 0" class="empty-tags">暂无可筛选项</span>
                  </el-space>
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
                <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:InsuranceTenantProduct:add']"
                  >添加产品</el-button
                >
              </el-col>
              <!-- <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['insurance:InsuranceTenantProduct:edit']">修改</el-button>
              </el-col> -->
              <el-col :span="1.5">
                <el-button
                  type="danger"
                  plain
                  icon="Delete"
                  :disabled="multiple"
                  @click="handleDelete()"
                  v-hasPermi="['insurance:InsuranceTenantProduct:remove']"
                  >删除</el-button
                >
              </el-col>
              <!-- <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:InsuranceTenantProduct:export']">导出</el-button>
              </el-col> -->
              <el-col :span="1.5">
                <div class="sort-toolbar">
                  <span class="sort-toolbar-label">排序选项：</span>
                  <el-button-group>
                    <el-button
                      v-for="item in sortOptions"
                      :key="item.field"
                      plain
                      :type="activeSortField === item.field ? 'primary' : 'default'"
                      @click="handleSortClick(item.field)"
                    >
                      {{ item.label }}
                      <el-icon v-if="activeSortField === item.field" class="sort-direction-icon">
                        <CaretTop v-if="sortOrder === 'asc'" />
                        <CaretBottom v-else />
                      </el-icon>
                    </el-button>
                  </el-button-group>
                </div>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" border :data="InsuranceTenantProductList" @selection-change="handleSelectionChange">
            <!-- <el-table-column type="selection" width="55" align="center" /> -->
            <el-table-column type="expand" label="详情" width="64" align="center">
              <template #default="scope">
                <div class="product-expand">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="保险公司">
                      <dict-tag :options="insurance_company" :value="scope.row.companyCode" />
                    </el-descriptions-item>
                    <el-descriptions-item label="产品代码">{{ scope.row.productCode || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="产品头图">
                      <image-preview :src="scope.row.imgUrl" :width="56" :height="56" />
                    </el-descriptions-item>
                    <el-descriptions-item label="投保链接" :span="2">
                      <el-link v-if="scope.row.proposalUrl" type="primary" :href="scope.row.proposalUrl" target="_blank" class="proposal-link">
                        {{ scope.row.proposalUrl }}
                      </el-link>
                      <span v-else>-</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="产品特点" :span="3">{{ scope.row.description || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column label="ID" align="center" prop="id" v-if="true" /> -->
            <!-- <el-table-column label="产品ID" align="center" prop="productId" /> -->
            <el-table-column label="产品名称" align="left" prop="productName" min-width="150" fixed="left" show-overflow-tooltip />
            <el-table-column label="所属分类" align="center" min-width="150" show-overflow-tooltip>
              <template #default="scope">
                <span>{{ getCategoryPath(scope.row.categoryId) }}</span>
              </template>
            </el-table-column>

            <el-table-column label="产品模式" align="center" prop="productMode" width="100" show-overflow-tooltip>
              <template #default="scope">
                <dict-tag :options="insurance_product_mode" :value="scope.row.productMode" />
              </template>
            </el-table-column>
            <el-table-column label="费用" align="left" width="150">
              <template #default="scope">
                <div class="fee-cell">
                  <span>保费：{{ scope.row.minPremium ?? '-' }}</span>
                  <span>服务费：{{ scope.row.serviceFee != null ? (parseFloat(scope.row.serviceFee) * 100).toFixed(2) + '%' : '-' }}</span>
                  <span>净费：{{ scope.row.netPremium != null ? scope.row.netPremium : '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column label="产品特点" align="center" prop="description" /> -->
            <el-table-column label="上架状态" align="center" prop="status" width="90">
              <template #default="scope">
                <dict-tag :options="insurance_product_status" :value="scope.row.status" />
              </template>
            </el-table-column>
            <el-table-column label="排序" align="center" prop="sort" width="80" />
            <!-- <el-table-column label="乐观锁版本" align="center" prop="version" /> -->
            <!-- <el-table-column label="删除标记" align="center" prop="delFlag" /> -->
            <el-table-column label="操作" align="center" fixed="right" width="230" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情 / 投保</el-button>
                <el-button v-if="canBatchInsure(scope.row)" link type="warning" icon="Upload" @click="handleBatchInsure(scope.row)"
                  >批量投保</el-button
                >
                <el-dropdown trigger="click" class="table-more-actions">
                  <el-button link type="primary" icon="MoreFilled">更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item icon="Tickets" @click="handleViewServiceFee(scope.row)">服务费详情</el-dropdown-item>
                      <el-dropdown-item icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['insurance:InsuranceTenantProduct:edit']">
                        状态修改
                      </el-dropdown-item>
                      <!-- <el-dropdown-item icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['insurance:InsuranceTenantProduct:remove']">
                        删除
                      </el-dropdown-item> -->
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </el-card>
      </el-col>
    </el-row>
    <!-- 添加或修改产品库对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="InsuranceTenantProductFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="上架状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择上架状态" style="width: 100%">
            <el-option v-for="dict in insurance_product_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自定义排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 选择产品弹窗 (取代原本的新增) -->
    <el-dialog title="选择产品" v-model="productSelectDialog.visible" width="1200px" append-to-body>
      <el-form :model="productSelectQueryParams" ref="productSelectQueryRef" :inline="true" v-show="true">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="productSelectQueryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleProductSelectQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleProductSelectQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetProductSelectQuery">重置</el-button>
          <el-button type="success" plain icon="Plus" @click="handleCreateProduct" v-hasPermi="['insurance:InsuranceProductConfig:add']"
            >新增产品</el-button
          >
        </el-form-item>
      </el-form>

      <el-table v-loading="productSelectLoading" border :data="productConfigList" @selection-change="handleProductSelectionChange">
        <el-table-column type="selection" width="55" align="center" :selectable="(row) => !row.hasAdded" />
        <el-table-column label="产品名称" align="center" prop="productName" min-width="260" show-overflow-tooltip />
        <el-table-column label="所属分类" align="center" width="200" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ getCategoryPath(scope.row.categoryId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品代码" align="center" prop="productCode" />
        <el-table-column label="保险公司" align="center" prop="companyCode">
          <template #default="scope">
            <dict-tag :options="insurance_company" :value="scope.row.companyCode" />
          </template>
        </el-table-column>
        <el-table-column label="产品类型" align="center" prop="productType">
          <template #default="scope">
            <dict-tag :options="insurance_product_type" :value="scope.row.productType" />
          </template>
        </el-table-column>
        <el-table-column label="产品模式" align="center" prop="productMode">
          <template #default="scope">
            <dict-tag :options="insurance_product_mode" :value="scope.row.productMode" />
          </template>
        </el-table-column>
        <el-table-column label="最低保费" align="center" prop="minPremium" />
        <el-table-column label="服务费" align="center" min-width="120">
          <template #default="scope">
            <template v-if="scope.row.serviceFeeConfig">
              <el-tag v-for="(item, idx) in parseServiceFeeConfig(scope.row.serviceFeeConfig)" :key="idx" size="small" type="success" class="mr-1">
                {{ (Number(item.feeRatio) * 100).toFixed(1) }}%
              </el-tag>
            </template>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>
        <el-table-column label="净费出单" align="center" width="100">
          <template #default="scope">
            <span>{{ calcNetPremium(scope.row.minPremium, scope.row.serviceFeeConfig) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品图" align="center" prop="imgUrlUrl" show-overflow-tooltip>
          <template #default="scope">
            <image-preview :src="scope.row.imgUrlUrl" :width="50" :height="50" />
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="productSelectTotal > 0"
        :total="productSelectTotal"
        v-model:page="productSelectQueryParams.pageNum"
        v-model:limit="productSelectQueryParams.pageSize"
        @pagination="loadProductConfigList"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitBatchAdd">添 加</el-button>
          <el-button @click="productSelectDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 服务费详情弹窗 -->
    <el-dialog title="服务费配置详情" v-model="serviceFeeDialog.visible" width="700px" append-to-body>
      <div v-if="serviceFeeDialog.loading" style="text-align: center; padding: 30px">
        <el-icon class="is-loading" size="30"><Loading /></el-icon>
        <div style="margin-top: 8px; color: #999">加载中...</div>
      </div>
      <template v-else>
        <div style="margin-bottom: 12px"><span style="font-weight: 600">产品名称：</span>{{ serviceFeeDialog.productName }}</div>
        <el-table :data="serviceFeeDialog.configList" border stripe size="small">
          <el-table-column label="服务费比例" align="center">
            <template #default="scope">
              <el-tag type="success">{{ (Number(scope.row.feeRatio) * 100).toFixed(2) }}%</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="生效开始时间" align="center" prop="effectiveStartTime" />
          <el-table-column label="生效结束时间" align="center" prop="effectiveEndTime" />
        </el-table>
        <el-empty v-if="serviceFeeDialog.configList.length === 0" description="暂无服务费配置" />
      </template>
      <template #footer>
        <el-button @click="serviceFeeDialog.visible = false">关 闭</el-button>
      </template>
    </el-dialog>

    <batch-insurance-drawer v-model="batchDrawerVisible" :product="currentBatchProduct" />
  </div>
</template>

<script setup name="InsuranceTenantProduct" lang="ts">
import {
  listInsuranceTenantProduct,
  getInsuranceTenantProduct,
  delInsuranceTenantProduct,
  addInsuranceTenantProduct,
  updateInsuranceTenantProduct,
  addInsuranceTenantProductBatch,
  listMarketProduct
} from '@/api/insurance/InsuranceTenantProduct';
import { getServiceFeeConfig } from '@/api/insurance/InsuranceProductConfig';
import type { InsuranceProductConfigVO } from '@/api/insurance/InsuranceProductConfig/types';
import { InsuranceTenantProductVO, InsuranceTenantProductQuery, InsuranceTenantProductForm } from '@/api/insurance/InsuranceTenantProduct/types';
import { listInsuranceProductCategory } from '@/api/insurance/insuranceProductCategory';
import BatchInsuranceDrawer from '@/views/insurance/batchInsurance/components/BatchInsuranceDrawer.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_product_type, insurance_product_mode, insurance_company, insurance_product_status } = toRefs<any>(
  proxy?.useDict('insurance_product_type', 'insurance_product_mode', 'insurance_company', 'insurance_product_status')
);

const InsuranceTenantProductList = ref<InsuranceTenantProductVO[]>([]);

/** 解析服务费配置 JSON（用于产品选择弹窗展示） */
const parseServiceFeeConfig = (raw: any): any[] => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
/** 计算净费出单 = minPremium × (1 - feeRatio)，取第一条费率 */
const calcNetPremium = (minPremium: any, serviceFeeConfig: any): string => {
  const fees = parseServiceFeeConfig(serviceFeeConfig);
  if (!minPremium || fees.length === 0) return '-';
  const feeRatio = Number(fees[0].feeRatio);
  const net = Number(minPremium) * (1 - feeRatio);
  return net.toFixed(2);
};

const buttonLoading = ref(false);

/** 服务费详情弹窗状态 */
const serviceFeeDialog = reactive({
  visible: false,
  loading: false,
  productName: '',
  configList: [] as any[]
});

/** 查看服务费详情 */
const handleViewServiceFee = async (row: InsuranceTenantProductVO) => {
  serviceFeeDialog.visible = true;
  serviceFeeDialog.loading = true;
  serviceFeeDialog.productName = row.productName || '';
  serviceFeeDialog.configList = [];
  try {
    const res = await getServiceFeeConfig(row.productId as string | number);
    const raw = res.data;
    if (raw) {
      serviceFeeDialog.configList = typeof raw === 'string' ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
    }
  } catch (e) {
    serviceFeeDialog.configList = [];
  } finally {
    serviceFeeDialog.loading = false;
  }
};

const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const activeCategoryId = ref<string | number>();
const categoryOptions = ref<any[]>([]);
const categoryTreeOptions = ref<any[]>([]);
const defaultCategoryIcon = 'fluent:tag-24-filled';
type SortField = 'minPremium' | 'netPremium' | 'serviceFee';
type FilterTag = { label: string; value: string; type: 'category' | 'marketingTag' };
const activeSortField = ref<SortField>();
const sortOrder = ref<'asc' | 'desc'>('desc');
const activeFilterCategoryId = ref<string | number>();
const sortOptions: Array<{ label: string; field: SortField }> = [
  { label: '保费', field: 'minPremium' },
  { label: '净费', field: 'netPremium' },
  { label: '服务费', field: 'serviceFee' }
];

const queryFormRef = ref<ElFormInstance>();
const InsuranceTenantProductFormRef = ref<ElFormInstance>();
const categoryTreeRef = ref();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

/** 产品选择弹窗状态与数据 */
const productSelectDialog = reactive({ visible: false });
const productSelectLoading = ref(false);
const productConfigList = ref<InsuranceProductConfigVO[]>([]);
const productSelectTotal = ref(0);
const selectedProductIds = ref<Array<string | number>>([]);
const batchDrawerVisible = ref(false);
const currentBatchProduct = ref<any>();

const productSelectQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: undefined
});

const loadProductConfigList = async () => {
  productSelectLoading.value = true;
  // 调用新的 marketList 接口
  const res = await listMarketProduct(productSelectQueryParams);
  productConfigList.value = res.rows ?? [];
  productSelectTotal.value = res.total;
  productSelectLoading.value = false;
};

const handleProductSelectQuery = () => {
  productSelectQueryParams.pageNum = 1;
  loadProductConfigList();
};

const resetProductSelectQuery = () => {
  productSelectQueryParams.productName = undefined;
  handleProductSelectQuery();
};

const handleCreateProduct = () => {
  productSelectDialog.visible = false;
  proxy?.$router.push({
    path: '/insurance/InsuranceProductConfig',
    query: { action: 'add' }
  });
};

const handleProductSelectionChange = (selection: InsuranceProductConfigVO[]) => {
  selectedProductIds.value = selection.map((item) => item.id);
};

const initFormData: InsuranceTenantProductForm = {
  id: undefined,
  productId: undefined,
  companyCode: undefined,
  productCode: undefined,
  productName: undefined,
  productType: undefined,
  productMode: undefined,
  minPremium: undefined,
  img: undefined,
  description: undefined,
  status: undefined,
  sort: undefined,
  version: undefined,
  delFlag: undefined,
  categoryId: undefined,
  categoryName: undefined,
  marketingTags: undefined,
  proposalUrl: undefined
};
const data = reactive<PageData<InsuranceTenantProductForm, InsuranceTenantProductQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyCode: undefined,
    productCode: undefined,
    productName: undefined,
    productType: undefined,
    productMode: undefined,
    status: undefined,
    categoryId: undefined,
    params: {}
  },
  rules: {
    productId: [{ required: true, message: '产品ID不能为空', trigger: 'blur' }],
    companyCode: [{ required: true, message: '保险公司不能为空', trigger: 'change' }],
    productCode: [{ required: true, message: '产品代码不能为空', trigger: 'blur' }],
    productName: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
    productType: [{ required: true, message: '产品类型不能为空', trigger: 'change' }],
    productMode: [{ required: true, message: '产品模式不能为空', trigger: 'change' }],
    minPremium: [{ required: true, message: '最低保费不能为空', trigger: 'blur' }],
    img: [{ required: true, message: '产品头图不能为空', trigger: 'blur' }],
    description: [{ required: true, message: '产品特点不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '上架状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const activeMarketingTag = computed(() => String(queryParams.value.params?.marketingTag || ''));

const filterTagLabel = computed(() => (activeCategoryId.value === undefined ? '一级分类' : '标签'));

const visibleFilterTags = computed<FilterTag[]>(() => {
  if (activeCategoryId.value === undefined) {
    return categoryOptions.value.map((item) => ({
      label: item.categoryName,
      value: String(item.categoryId),
      type: 'category'
    }));
  }

  const categoryTags = collectMarketingTagsFromCategories(
    findCategoryNode(categoryOptions.value, activeCategoryId.value)?.children ?? [],
    findCategoryNode(categoryOptions.value, activeCategoryId.value)
  );

  if (categoryTags.length > 0) {
    return categoryTags.map((tag) => ({ label: tag, value: tag, type: 'marketingTag' }));
  }
  return collectMarketingTagsFromProducts(InsuranceTenantProductList.value).map((tag) => ({ label: tag, value: tag, type: 'marketingTag' }));
});

const isAllFilterTagActive = computed(() => activeMarketingTag.value === '' && activeFilterCategoryId.value === undefined);

const isFilterTagActive = (tag: FilterTag) => {
  if (tag.type === 'category') {
    return String(activeFilterCategoryId.value ?? '') === tag.value;
  }
  return activeMarketingTag.value === tag.value;
};

const normalizeTenantProduct = (row: InsuranceTenantProductVO): InsuranceTenantProductVO => {
  return {
    ...row,
    proposalUrl: row.proposalUrl || row.ProposalUrl || ''
  };
};

const ensureQueryParams = () => {
  if (!queryParams.value.params) {
    queryParams.value.params = {};
  }
  return queryParams.value.params;
};

const parseMarketingTags = (raw?: string): string[] => {
  if (!raw) return [];
  return raw
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const collectMarketingTagsFromCategories = (nodes: any[] = [], rootNode?: any): string[] => {
  const tags = new Set<string>();
  const collect = (node: any) => {
    parseMarketingTags(node?.marketingTags).forEach((tag) => tags.add(tag));
    node?.children?.forEach(collect);
  };
  if (rootNode) {
    collect(rootNode);
  } else {
    nodes.forEach(collect);
  }
  return Array.from(tags);
};

const collectMarketingTagsFromProducts = (rows: InsuranceTenantProductVO[] = []): string[] => {
  const tags = new Set<string>();
  rows.forEach((row) => parseMarketingTags(row.marketingTags).forEach((tag) => tags.add(tag)));
  return Array.from(tags);
};

const rowHasMarketingTag = (row: InsuranceTenantProductVO, tag: string) => {
  if (!tag) return true;
  return parseMarketingTags(row.marketingTags).includes(tag);
};

const toSortNumber = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

const sortRows = (rows: InsuranceTenantProductVO[]) => {
  if (!activeSortField.value) return rows;
  const field = activeSortField.value;
  const direction = sortOrder.value === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => (toSortNumber(a[field]) - toSortNumber(b[field])) * direction);
};

const getLocalProcessedList = async () => {
  const res = await listInsuranceTenantProduct({
    ...queryParams.value,
    pageNum: 1,
    pageSize: 10000,
    categoryId: undefined
  });
  const categoryFilterId = activeCategoryId.value ?? activeFilterCategoryId.value;
  const categoryIds = categoryFilterId !== undefined ? getCategoryAndChildrenIds(categoryFilterId) : [];
  const marketingTag = activeMarketingTag.value;
  let rows = (res.rows ?? []).map(normalizeTenantProduct);

  if (categoryIds.length > 0) {
    rows = rows.filter((item) => categoryIds.includes(String(item.categoryId)));
  }
  if (marketingTag) {
    rows = rows.filter((item) => rowHasMarketingTag(item, marketingTag));
  }

  rows = sortRows(rows);
  total.value = rows.length;
  const start = (Number(queryParams.value.pageNum) - 1) * Number(queryParams.value.pageSize);
  InsuranceTenantProductList.value = rows.slice(start, start + Number(queryParams.value.pageSize));
};

/** 查询产品库列表 */
const getList = async () => {
  loading.value = true;
  try {
    if (activeCategoryId.value !== undefined || activeFilterCategoryId.value !== undefined || activeSortField.value) {
      await getLocalProcessedList();
      return;
    }
    const res = await listInsuranceTenantProduct(queryParams.value);
    InsuranceTenantProductList.value = (res.rows ?? []).map(normalizeTenantProduct);
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

/** 分类筛选兜底：历史租户产品可能未同步 categoryId，使用缝合后的 VO 分类字段过滤 */
const getCategoryProductList = async () => {
  await getLocalProcessedList();
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  InsuranceTenantProductFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const clearMarketingTag = () => {
  ensureQueryParams().marketingTag = undefined;
};

const clearFilterTags = () => {
  activeFilterCategoryId.value = undefined;
  clearMarketingTag();
};

const handleFilterTagClick = (tag?: FilterTag) => {
  if (!tag) {
    clearFilterTags();
    queryParams.value.pageNum = 1;
    getList();
    return;
  }
  if (tag.type === 'category') {
    activeFilterCategoryId.value = String(activeFilterCategoryId.value ?? '') === tag.value ? undefined : tag.value;
    clearMarketingTag();
  } else {
    activeFilterCategoryId.value = undefined;
    ensureQueryParams().marketingTag = activeMarketingTag.value === tag.value ? undefined : tag.value;
  }
  queryParams.value.pageNum = 1;
  getList();
};

const resetSort = () => {
  activeSortField.value = undefined;
  sortOrder.value = 'desc';
};

const handleSortClick = (field: SortField) => {
  if (activeSortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    activeSortField.value = field;
    sortOrder.value = 'desc';
  }
  queryParams.value.pageNum = 1;
  getList();
};

const canBatchInsure = (row: InsuranceTenantProductVO) => {
  return Number(row.productMode) === 1 && Number(row.insureMode) === 1 && Number(row.paymentMode) === 1;
};

const handleBatchInsure = (row: InsuranceTenantProductVO) => {
  currentBatchProduct.value = {
    ...row,
    id: row.productId
  };
  batchDrawerVisible.value = true;
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  clearFilterTags();
  resetSort();
  handleQuery();
};

/** 分类树 - 全部产品 */
const handleAllCategory = () => {
  activeCategoryId.value = undefined;
  queryParams.value.categoryId = undefined;
  queryParams.value.pageNum = 1;
  clearFilterTags();
  categoryTreeRef.value?.setCurrentKey();
  getList();
};

/** 分类树节点点击 */
const handleCategoryNodeClick = (data: any) => {
  activeCategoryId.value = data.categoryId;
  queryParams.value.categoryId = undefined;
  queryParams.value.pageNum = 1;
  clearFilterTags();
  getList();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: InsuranceTenantProductVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 - 改为打开批量选择弹窗 */
const handleAdd = () => {
  selectedProductIds.value = [];
  productSelectDialog.visible = true;
  loadProductConfigList();
};

/** 批量添加提交 */
const submitBatchAdd = async () => {
  if (selectedProductIds.value.length === 0) {
    proxy?.$modal.msgWarning('请至少选择一项产品');
    return;
  }
  buttonLoading.value = true;
  try {
    await addInsuranceTenantProductBatch(selectedProductIds.value);
    proxy?.$modal.msgSuccess('批量添加成功');
    productSelectDialog.visible = false;
    await getList();
  } finally {
    buttonLoading.value = false;
  }
};

/** 修改按钮操作 */
const handleUpdate = async (row?: InsuranceTenantProductVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getInsuranceTenantProduct(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改产品库';
};

/** 提交按钮 */
const submitForm = () => {
  InsuranceTenantProductFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateInsuranceTenantProduct(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addInsuranceTenantProduct(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 查看产品详情 */
const handleView = (row: InsuranceTenantProductVO) => {
  if (Number(row.productMode) === 1) {
    proxy?.$router.push({
      path: '/insurance/tenant-product/detail',
      query: { id: row.productId }
    });
    return;
  }
  if (Number(row.productMode) === 2) {
    if (!row.proposalUrl) {
      proxy?.$modal.msgWarning('该产品未配置投保链接');
      return;
    }
    window.open(row.proposalUrl, '_blank');
    return;
  }
  proxy?.$router.push({
    path: '/insurance/InsuranceProductConfig',
    query: { id: row.productId }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: InsuranceTenantProductVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除产品库编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delInsuranceTenantProduct(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'insurance/InsuranceTenantProduct/export',
    {
      ...queryParams.value
    },
    `InsuranceTenantProduct_${new Date().getTime()}.xlsx`
  );
};

const getTreeselect = async () => {
  const res = await listInsuranceProductCategory();
  const rows = cloneCategoryRows(res.rows);
  categoryOptions.value = proxy?.handleTree(rows, 'categoryId', 'parentId');
  categoryTreeOptions.value = proxy?.handleTree(filterEnabledCategories(cloneCategoryRows(res.rows)), 'categoryId', 'parentId');
};

const cloneCategoryRows = (rows: any[] = []) => rows.map((item) => ({ ...item, children: undefined }));

const filterEnabledCategories = (rows: any[] = []) => {
  return rows.filter((item) => Number(item.status) === 0);
};

const getCategoryIconStyle = (icon?: string, color?: string, size = 16) => {
  const iconName = icon || defaultCategoryIcon;
  const url = `url('https://api.iconify.design/${iconName}.svg') no-repeat center / contain`;
  return {
    display: 'inline-block',
    flex: `0 0 ${size}px`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color || 'var(--el-color-primary)',
    mask: url,
    WebkitMask: url
  };
};

const findCategoryNode = (nodes: any[] = [], categoryId: string | number | undefined): any => {
  if (categoryId === undefined) return undefined;
  for (const node of nodes) {
    if (String(node.categoryId) === String(categoryId)) {
      return node;
    }
    const child = findCategoryNode(node.children ?? [], categoryId);
    if (child) {
      return child;
    }
  }
  return undefined;
};

const getCategoryPath = (categoryId: any): string => {
  if (!categoryId) return '--';
  const all: any[] = [];
  const flatten = (nodes: any[]) =>
    nodes.forEach((n) => {
      all.push(n);
      if (n.children) flatten(n.children);
    });
  flatten(categoryOptions.value);
  const node = all.find((n) => String(n.categoryId) === String(categoryId));
  if (!node) return '--';
  if (!node.parentId || node.parentId === 0) return node.categoryName;
  const parent = all.find((n) => String(n.categoryId) === String(node.parentId));
  return parent ? `${parent.categoryName} > ${node.categoryName}` : node.categoryName;
};

const getCategoryAndChildrenIds = (categoryId: string | number | undefined): string[] => {
  if (categoryId === undefined) return [];
  const ids: string[] = [];
  const collect = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (String(node.categoryId) === String(categoryId) || ids.includes(String(node.parentId))) {
        ids.push(String(node.categoryId));
      }
      if (node.children) collect(node.children);
    });
  };
  collect(categoryOptions.value);
  return ids;
};

onMounted(() => {
  getList();
  getTreeselect();
});
</script>

<style scoped lang="scss">
.category-card {
  margin-bottom: 10px;
}

.category-header {
  display: flex;
  align-items: center;
  height: 22px;
  font-weight: 600;
}

.category-all {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 8px;
  margin-bottom: 6px;
  color: var(--el-text-color-regular);
  border-radius: 4px;
  cursor: pointer;

  &:hover,
  &.active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }
}

.category-node {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.category-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.marketing-tags-filter {
  max-width: 680px;
}

.empty-tags {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.sort-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-toolbar-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  white-space: nowrap;
}

.sort-direction-icon {
  margin-left: 4px;
  vertical-align: -2px;
}

.product-expand {
  padding: 12px 24px;
  background-color: var(--el-fill-color-lighter);
}

.fee-cell {
  display: grid;
  gap: 2px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.proposal-link {
  max-width: 100%;
  vertical-align: top;

  :deep(.el-link__inner) {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.table-more-actions {
  margin-left: 8px;
}
</style>
