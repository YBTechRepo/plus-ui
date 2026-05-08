<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="产品编码" prop="productCode">
              <el-input v-model="queryParams.productCode" placeholder="请输入产品编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="保险公司" prop="companyCode">
              <el-select v-model="queryParams.companyCode" placeholder="请选择保险公司" clearable >
                <el-option v-for="dict in insurance_company" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="产品类型" prop="productType">
              <el-select v-model="queryParams.productType" placeholder="请选择产品类型" clearable >
                <el-option v-for="dict in insurance_product_type" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:InsuranceProductConfig:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['insurance:InsuranceProductConfig:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['insurance:InsuranceProductConfig:remove']">删除</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="InsuranceProductConfigList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />

        <el-table-column label="产品ID" align="center" prop="id" width="180" show-overflow-tooltip />

        <el-table-column label="产品编码" align="center" prop="productCode" width="130" show-overflow-tooltip />

        <el-table-column label="产品名称" align="center" prop="productName" min-width="200" show-overflow-tooltip />

        <el-table-column label="保险公司" align="center" prop="companyCode" width="100">
          <template #default="scope"><dict-tag :options="insurance_company" :value="scope.row.companyCode" /></template>
        </el-table-column>

        <el-table-column label="所属分类" align="center" width="200">
          <template #default="scope">
            <span>{{ getCategoryPath(scope.row.categoryId) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="产品模式" align="center" prop="productMode" width="100">
          <template #default="scope">
            <dict-tag :options="insurance_product_mode" :value="scope.row.productMode" />
          </template>
        </el-table-column>

        <el-table-column label="最低保费" align="center" prop="minPremium" width="100" />

        <el-table-column label="产品图片" align="center" prop="imgUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.imgUrlUrl" :width="50" :height="50" />
          </template>
        </el-table-column>

        <el-table-column label="产品状态" align="center" prop="status" width="100">
          <template #default="scope"><dict-tag :options="insurance_product_status"
              :value="scope.row.status" /></template>
        </el-table-column>

        <el-table-column label="产品排序" align="center" prop="sort" width="80" />

        <el-table-column label="创建时间" align="center" prop="createTime" width="120">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" fixed="right" width="120" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                v-hasPermi="['insurance:InsuranceProductConfig:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                v-hasPermi="['insurance:InsuranceProductConfig:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1000px" append-to-body destroy-on-close>
      <el-form ref="InsuranceProductConfigFormRef" :model="form" :rules="rules" label-width="100px">

        <el-tabs v-model="activeTab" type="border-card">

          <el-tab-pane label="基础信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="产品编码" prop="product.productCode">
                  <el-input v-model="form.product.productCode" placeholder="请输入产品编码" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产品名称" prop="product.productName">
                  <el-input v-model="form.product.productName" placeholder="请输入产品名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="保险公司" prop="product.companyCode">
                  <el-select v-model="form.product.companyCode" placeholder="请选择保险公司" class="w-full">
                    <el-option v-for="dict in insurance_company" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属分类" prop="product.categoryId">
                  <el-tree-select
                    v-model="form.product.categoryId"
                    :data="categoryOptions"
                    :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
                    value-key="categoryId"
                    check-strictly
                    placeholder="请选择产品所属分类"
                    class="w-full"
                    @change="handleCategoryChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产品模式" prop="product.productMode">
                  <el-select v-model="form.product.productMode" placeholder="请选择产品模式" class="w-full">
                    <el-option v-for="dict in insurance_product_mode" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最低保费" prop="product.minPremium">
                  <el-input-number v-model="form.product.minPremium" :min="0" :precision="2" placeholder="请输入最低保费" class="w-full" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="投保模式" prop="product.insureMode">
                  <el-select v-model="form.product.insureMode" placeholder="请选择投保模式" class="w-full">
                    <el-option v-for="dict in insurance_product_insure_mode" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="支付模式" prop="product.paymentMode">
                  <el-select v-model="form.product.paymentMode" placeholder="请选择支付模式" class="w-full">
                    <el-option v-for="dict in insurance_product_payment_mode" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产品状态" prop="product.status">
                  <el-select v-model="form.product.status" placeholder="请选择产品状态" class="w-full">
                    <el-option v-for="dict in insurance_product_status" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="营销标签" prop="product.marketingTags">
                  <el-checkbox-group v-model="marketingTagsArr">
                    <el-checkbox v-for="tag in currentCategoryTags" :key="tag" :value="tag">
                      {{ tag }}
                    </el-checkbox>
                  </el-checkbox-group>
                  <div v-if="currentCategoryTags.length === 0" style="color: #999; font-size: 12px; margin-left: 10px;">
                    （该分类暂未配置任何营销标签）
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产品排序" prop="product.sort">
                  <el-input-number v-model="form.product.sort" :min="0" class="w-full"/>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="产品说明" prop="product.description">
                  <el-input v-model="form.product.description" type="textarea" :rows="2" placeholder="请输入核心亮点介绍" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="投保链接" prop="product.proposalUrl">
                  <el-input v-model="form.product.proposalUrl" placeholder="请输入产品投保链接 (如: https://...)" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="产品特点" prop="product.productFeatures">
                  <el-input v-model="form.product.productFeatures" placeholder="用逗号隔开，如：保证续保,核保宽松" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="头图/入口图" prop="product.imgUrl">
                  <image-upload v-model="form.product.imgUrl" :limit="1"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="保障责任" name="liability" v-if="!isRegularProduct">
            <el-button type="primary" plain icon="Plus" @click="addLiability" class="mb-2">新增保障责任</el-button>
            <el-table :data="form.liabilityList" border size="small">
              <el-table-column label="排序" width="90">
                <template #default="scope"><el-input-number v-model="scope.row.sort" :controls="false" class="w-full"/></template>
              </el-table-column>
              <el-table-column label="责任名称" width="220">
                <template #default="scope"><el-input v-model="scope.row.liabilityName" placeholder="如：一般医疗保险金"/></template>
              </el-table-column>
              <el-table-column label="保额说明" width="180">
                <template #default="scope"><el-input v-model="scope.row.insuredAmountDesc" placeholder="如：300万"/></template>
              </el-table-column>
              <el-table-column label="详情描述">
                <template #default="scope"><el-input v-model="scope.row.description" type="textarea" :rows="3" placeholder="选填..."/></template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="scope">
                  <el-button type="danger" icon="Delete" circle @click="removeLiability(scope.$index)" />
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="规则与条款" name="rules" v-if="!isRegularProduct">
            <el-divider content-position="left">投保须知</el-divider>
            <el-button type="success" plain icon="Plus" @click="addNotice" class="mb-2">新增投保须知</el-button>
            <el-table :data="form.insureNotice" border size="small" class="mb-4">
              <el-table-column label="排序" width="90">
                <template #default="scope"><el-input-number v-model="scope.row.sort" :controls="false" class="w-full"/></template>
              </el-table-column>
              <el-table-column label="标题(Title)" width="200">
                <template #default="scope"><el-input v-model="scope.row.title" placeholder="如：投保年龄"/></template>
              </el-table-column>
              <el-table-column label="内容(Content)">
                <template #default="scope"><el-input v-model="scope.row.content" placeholder="如：0-60岁"/></template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="scope"><el-button type="danger" icon="Delete" circle @click="removeNotice(scope.$index)" /></template>
              </el-table-column>
            </el-table>

            <el-divider content-position="left">条款与文件</el-divider>
            <el-button type="warning" plain icon="Plus" @click="addClause" class="mb-2">新增条款文件</el-button>
            <el-table :data="form.clauseFiles" border size="small">
              <el-table-column label="排序" width="90">
                <template #default="scope"><el-input-number v-model="scope.row.sort" :controls="false" class="w-full"/></template>
              </el-table-column>
              <el-table-column label="条款名称" width="300">
                <template #default="scope"><el-input v-model="scope.row.clauseName" placeholder="如：《尊享医疗保险条款》"/></template>
              </el-table-column>
              <!-- <el-table-column label="文件/链接(OSS ID)">
                <template #default="scope"><el-input v-model="scope.row.fileUrl" placeholder="请输入OSS ID或链接"/></template>
              </el-table-column> -->
              <el-table-column label="条款附件上传" min-width="200">
                <template #default="scope">
                  <file-upload v-model="scope.row.fileUrl" :limit="1" :file-type="['pdf', 'doc', 'docx']"
                    :isShowTip="false" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="scope"><el-button type="danger" icon="Delete" circle @click="removeClause(scope.$index)" /></template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="展示物料" name="images" v-if="!isRegularProduct">
            <el-alert title="图片将以 JSON 数组格式安全存入数据库附属表中" type="info" show-icon class="mb-4" />
            <el-form-item label="产品特点图">
              <image-upload v-model="featureImagesStr" :limit="5" />
            </el-form-item>
            <el-divider />
            <el-form-item label="理赔流程图">
              <image-upload v-model="claimImagesStr" :limit="3" />
            </el-form-item>

            <el-divider content-position="left">理赔说明 (步骤指引)</el-divider>
            <el-button type="primary" plain icon="Plus" @click="addClaimStep" class="mb-2">新增理赔步骤</el-button>
            <el-table :data="form.claimInstructions" border size="small" class="mb-4">
              <el-table-column label="步骤排序" width="90">
                <template #default="scope">
                  <el-input-number v-model="scope.row.sort" :controls="false" class="w-full" />
                </template>
              </el-table-column>
              <el-table-column label="步骤标题(Title)" width="200">
                <template #default="scope">
                  <el-input v-model="scope.row.title" placeholder="如：第一步：提交报案" />
                </template>
              </el-table-column>
              <el-table-column label="步骤说明(Content)">
                <template #default="scope">
                  <el-input v-model="scope.row.content" type="textarea" :rows="1" placeholder="如：请在发生事故后48小时内拨打..." />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="scope">
                  <el-button type="danger" icon="Delete" circle @click="removeClaimStep(scope.$index)" />
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="服务费配置" name="serviceFee">
            <el-alert type="info" show-icon class="mb-4">
              <template #title>
                服务费比例识别规则：每个时间段内应有且仅有一个生效费率。时间段不允许重叠或屑断。费率变动时，请将旧记录的失效时间修改为变动前一天，再新增一条记录。
              </template>
            </el-alert>
            <el-button type="primary" plain icon="Plus" @click="addServiceFee" class="mb-2">新增费率记录</el-button>
            <el-table :data="serviceFeeList" border size="small">
              <el-table-column label="服务费比例" width="200">
                <template #default="scope">
                  <div style="display:flex;align-items:center;gap:6px;padding:4px 8px">
                    <el-input-number v-model="scope.row.feeRatioDisplay" :min="0" :max="100" :step="1" controls-position="right" style="width:120px" />
                    <span style="font-weight:bold">%</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="生效开始时间" width="200">
                <template #default="scope">
                  <el-date-picker
                    v-model="scope.row.effectiveStartTime"
                    type="datetime"
                    placeholder="请选择开始时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width:100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="生效结束时间" width="200">
                <template #default="scope">
                  <el-date-picker
                    v-model="scope.row.effectiveEndTime"
                    type="datetime"
                    placeholder="请选择结束时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width:100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="scope">
                  <el-button type="danger" icon="Delete" circle @click="removeServiceFee(scope.$index)" />
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

        </el-tabs>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定 提 交</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InsuranceProductConfig" lang="ts">
// 🌟 核心 API 修改：导入自定义的 Full 接口
import {
  listInsuranceProductConfig,
  delInsuranceProductConfig,
  getProductFull,// 替换原来的 get
  addProductFull,// 替换原来的 add
  updateProductFull// 替换原来的 update
} from '@/api/insurance/InsuranceProductConfig';
import { InsuranceProductConfigVO, InsuranceProductConfigQuery } from '@/api/insurance/InsuranceProductConfig/types';
import { listInsuranceProductCategory } from '@/api/insurance/insuranceProductCategory';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const {
  insurance_product_type,
  insurance_product_mode,
  insurance_company,
  insurance_product_status,
  insurance_product_insure_mode,
  insurance_product_payment_mode
} = toRefs<any>(
  proxy?.useDict(
    'insurance_product_type',
    'insurance_product_mode',
    'insurance_company',
    'insurance_product_status',
    'insurance_product_insure_mode',
    'insurance_product_payment_mode'
  )
);


const InsuranceProductConfigList = ref<InsuranceProductConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();
const InsuranceProductConfigFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({ visible: false, title: '' });
const activeTab = ref('basic');

// 🌟 图片上传组件专用的响应式字符串 (拦截数组转字符串)
const featureImagesStr = ref('');
const claimImagesStr = ref('');
const marketingTagsArr = ref<string[]>([]);
const currentCategoryTags = ref<string[]>([]);
const categoryOptions = ref<any[]>([]);

// 🌟 重构超级大对象的初始值
const initFormData: any = {
  product: {
    id: undefined,
    productCode: undefined,
    productName: undefined,
    companyCode: undefined,
    productType: undefined,
    productMode: undefined,
    minPremium: undefined,
    proposalUrl: undefined,
    imgUrl: undefined,
    productFeatures: undefined,
    description: undefined,
    status: undefined,
    sort: 0,
    insureMode: undefined,
    paymentMode: undefined,
    categoryId: undefined,
    categoryName: undefined,
    marketingTags: undefined
  },
  liabilityList: [],
  insureNotice: [],
  clauseFiles: [],
  featureImages: [],
  claimImages: [],
  claimInstructions: []
}

const data = reactive<any>({
  form: JSON.parse(JSON.stringify(initFormData)),
  queryParams: {
    pageNum: 1, pageSize: 10,
    productCode: undefined, productName: undefined, companyCode: undefined, productType: undefined
  },
  // 🌟 嵌套校验规则
  rules: {
    'product.productCode': [{ required: true, message: "产品编码不能为空", trigger: "blur" }],
    'product.productName': [{ required: true, message: "产品名称不能为空", trigger: "blur" }],
    'product.companyCode': [{ required: true, message: "保险公司不能为空", trigger: "change" }],
    'product.categoryId': [{ required: true, message: "所属分类不能为空", trigger: "change" }],
    'product.status': [{ required: true, message: "产品状态不能为空", trigger: "change" }],
    'product.productMode': [{ required: true, message: "产品模式不能为空", trigger: "change" }],
    'product.minPremium': [{ required: true, message: "最低保费不能为空", trigger: "blur" }],
    'product.insureMode': [{ required: true, message: "投保模式不能为空", trigger: "change" }],
    'product.paymentMode': [{ required: true, message: "支付模式不能为空", trigger: "change" }],
    'product.description': [{ required: true, message: "产品说明不能为空", trigger: "blur" }],
    'product.imgUrl': [{ required: true, message: "产品头图不能为空", trigger: "change" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 判断产品模式是否为“常规产品”
const isRegularProduct = computed(() => {
  if (form.value.product.productMode == null) return false;
  // 字典数据加载需要时间，并且可能 undefined
  const modes = insurance_product_mode.value || [];
  const match = modes.find((d: any) => parseInt(d.value) === form.value.product.productMode);
  return match && match.label === '常规产品';
});

// 如果切换成了常规产品，强制切回“基础信息”页签
watch(isRegularProduct, (val) => {
  if (val && activeTab.value !== 'basic') {
    activeTab.value = 'basic';
  }
});

// ---------------- 列表通用操作 ----------------
const getList = async () => {
  loading.value = true;
  const res = await listInsuranceProductConfig(queryParams.value);
  InsuranceProductConfigList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}
const handleQuery = () => { queryParams.value.pageNum = 1; getList(); }
const resetQuery = () => { queryFormRef.value?.resetFields(); handleQuery(); }
const handleSelectionChange = (selection: InsuranceProductConfigVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

// ---------------- 弹窗控制与回显 ----------------
const cancel = () => { dialog.visible = false; reset(); }

const reset = () => {
  activeTab.value = 'basic';
  featureImagesStr.value = "";
  claimImagesStr.value = "";
  marketingTagsArr.value = [];
  currentCategoryTags.value = [];
  serviceFeeList.value = [];
  form.value = JSON.parse(JSON.stringify(initFormData));
  InsuranceProductConfigFormRef.value?.resetFields();
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加产品配置";
}

/** 🌟 修改按钮操作 (请求 getFull 接口) */
const handleUpdate = async (row?: InsuranceProductConfigVO) => {
  reset();
  const _id = row?.id || ids.value[0];

  // 发起获取超级大对象的请求
  const res = await getProductFull(_id);

  // 深度赋值给表单
  form.value = Object.assign({}, form.value, res.data);

  // 防空处理，确保是数组
  form.value.liabilityList = form.value.liabilityList || [];
  form.value.insureNotice = form.value.insureNotice || [];
  form.value.clauseFiles = form.value.clauseFiles || [];
  form.value.claimInstructions = form.value.claimInstructions || [];

  // 将后端传来的图片 JSON 数组，用逗号连接成字符串赋值给图片组件
  featureImagesStr.value = form.value.featureImages ? form.value.featureImages.join(',') : '';
  claimImagesStr.value = form.value.claimImages ? form.value.claimImages.join(',') : '';
  marketingTagsArr.value = form.value.product.marketingTags ? form.value.product.marketingTags.split(',') : [];

  // 回显时，根据 categoryId 动态加载该分类的可选标签（包含继承自父分类的标签）
  if (form.value.product.categoryId) {
    const node = findNode(categoryOptions.value, form.value.product.categoryId);
    if (node) {
      currentCategoryTags.value = getMergedCategoryTags(node);
    }
  }

  // 解析 serviceFeeConfig JSON 字符串 → 填充 serviceFeeList
  try {
    const feeConfig = form.value.product.serviceFeeConfig;
    if (feeConfig) {
      const parsed = typeof feeConfig === 'string' ? JSON.parse(feeConfig) : feeConfig;
      serviceFeeList.value = (parsed as any[]).map((item: any) => ({
        feeRatioDisplay: parseFloat((Number(item.feeRatio) * 100).toFixed(2)),
        effectiveStartTime: item.effectiveStartTime,
        effectiveEndTime: item.effectiveEndTime
      }));
    } else {
      serviceFeeList.value = [];
    }
  } catch {
    serviceFeeList.value = [];
  }

  dialog.visible = true;
  dialog.title = "修改保险产品";
}

/** 🌟 提交按钮操作 (组装超级大对象) */
const submitForm = () => {
  InsuranceProductConfigFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      // 提交前，把组件上的逗号图片字符串，切成数组塞进表单
      form.value.featureImages = featureImagesStr.value ? featureImagesStr.value.split(',') : [];
      form.value.claimImages = claimImagesStr.value ? claimImagesStr.value.split(',') : [];
      form.value.product.marketingTags = marketingTagsArr.value.length > 0 ? marketingTagsArr.value.join(',') : undefined;

      // 将 serviceFeeList 序列化为 JSON 字符串
      if (serviceFeeList.value.length > 0) {
        const feePayload = serviceFeeList.value.map((item: any) => ({
          feeRatio: parseFloat((item.feeRatioDisplay / 100).toFixed(4)),
          effectiveStartTime: item.effectiveStartTime,
          effectiveEndTime: item.effectiveEndTime
        }));
        form.value.product.serviceFeeConfig = JSON.stringify(feePayload);
      } else {
        form.value.product.serviceFeeConfig = null;
      }

      try {
        if (form.value.product.id) {
          await updateProductFull(form.value);
        } else {
          await addProductFull(form.value);
        }
        proxy?.$modal.msgSuccess("保存成功");
        dialog.visible = false;
        await getList();
      } finally {
        buttonLoading.value = false;
      }
    } else {
       proxy?.$modal.msgWarning("请检查其他选项卡中是否有未填写的必填项！");
    }
  });
}

const handleDelete = async (row?: InsuranceProductConfigVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除该产品？').finally(() => loading.value = false);
  await delInsuranceProductConfig(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

// ---------------- 动态表格操作方法 ----------------
const addLiability = () => { form.value.liabilityList.push({ sort: form.value.liabilityList.length + 1, liabilityName: '', insuredAmountDesc: '', description: '' }); }
const removeLiability = (index: number) => { form.value.liabilityList.splice(index, 1); }

const addNotice = () => { form.value.insureNotice.push({ sort: form.value.insureNotice.length + 1, title: '', content: '' }); }
const removeNotice = (index: number) => { form.value.insureNotice.splice(index, 1); }

const addClause = () => { form.value.clauseFiles.push({ sort: form.value.clauseFiles.length + 1, clauseName: '', fileUrl: '' }); }
const removeClause = (index: number) => { form.value.clauseFiles.splice(index, 1); }

const addClaimStep = () => {
  form.value.claimInstructions.push({
    sort: form.value.claimInstructions.length + 1,
    title: '',
    content: ''
  });
}

const removeClaimStep = (index: number) => {
  form.value.claimInstructions.splice(index, 1);
}

// ---------------- 服务费配置 (仅前端展示，暂不提交后端) ----------------
const serviceFeeList = ref<any[]>([]);

const addServiceFee = () => {
  serviceFeeList.value.push({
    feeRatioDisplay: 0,   // 页面展示用 0~100
    effectiveStartTime: undefined,
    effectiveEndTime: undefined
  });
};

const removeServiceFee = (index: number) => {
  serviceFeeList.value.splice(index, 1);
};

const getTreeselect = async () => {
  const res = await listInsuranceProductCategory();
  categoryOptions.value = proxy?.handleTree(res.rows, 'categoryId', 'parentId');
};

const handleCategoryChange = (val: any) => {
  if (val) {
    // find category name by id from categoryOptions
    const node = findNode(categoryOptions.value, val);
    if (node) {
      form.value.product.categoryName = node.categoryName;
      currentCategoryTags.value = getMergedCategoryTags(node);
      // 切换分类时，把不在当前分类标签池里的已选标签过滤掉
      marketingTagsArr.value = marketingTagsArr.value.filter(tag => currentCategoryTags.value.includes(tag));
    }
  } else {
    form.value.product.categoryName = undefined;
    currentCategoryTags.value = [];
    marketingTagsArr.value = [];
  }
};

const findNode = (tree: any[], id: any): any => {
  for (let node of tree) {
    if (node.categoryId === id) return node;
    if (node.children && node.children.length > 0) {
      let res = findNode(node.children, id);
      if (res) return res;
    }
  }
  return null;
};

/** 获取分类完整路径（一级 > 二级），用于列表展示 */
const getCategoryPath = (categoryId: any): string => {
  if (!categoryId) return '--';
  const all: any[] = [];
  const flatten = (nodes: any[]) => nodes.forEach(n => { all.push(n); if (n.children) flatten(n.children); });
  flatten(categoryOptions.value);
  const node = all.find(n => String(n.categoryId) === String(categoryId));
  if (!node) return '--';
  if (!node.parentId || node.parentId === 0) return node.categoryName;
  const parent = all.find(n => String(n.categoryId) === String(node.parentId));
  return parent ? `${parent.categoryName} > ${node.categoryName}` : node.categoryName;
};

/** 合并父级分类标签 + 本级分类标签，作为产品可选标签池 */
const getMergedCategoryTags = (node: any): string[] => {
  if (!node) return [];
  const ownTags = node.marketingTags ? node.marketingTags.split(',').filter(Boolean) : [];
  if (!node.parentId || node.parentId === 0) return ownTags;
  const parent = findNode(categoryOptions.value, node.parentId);
  const parentTags = parent?.marketingTags ? parent.marketingTags.split(',').filter(Boolean) : [];
  return [...new Set([...parentTags, ...ownTags])];
};

onMounted(() => { getList(); getTreeselect(); });
</script>

<style scoped>
/* 让内容更紧凑，适合超级表单 */
.mb-2 { margin-bottom: 10px; }
.mb-4 { margin-bottom: 20px; }
.w-full { width: 100%; }
</style>
