<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="父分类ID" prop="parentId">
              <el-input v-model="queryParams.parentId" placeholder="请输入父分类ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="祖级列表" prop="ancestors">
              <el-input v-model="queryParams.ancestors" placeholder="请输入祖级列表" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="分类名称" prop="categoryName">
              <el-input v-model="queryParams.categoryName" placeholder="请输入分类名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="分类图标 " prop="icon">
              <el-input v-model="queryParams.icon" placeholder="请输入分类图标 " clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="显示顺序" prop="sort">
              <el-input v-model="queryParams.sort" placeholder="请输入显示顺序" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:insuranceProductCategory:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['insurance:insuranceProductCategory:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['insurance:insuranceProductCategory:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:insuranceProductCategory:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table
        v-loading="loading"
        :data="insuranceProductCategoryList"
        row-key="categoryId"
        default-expand-all
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column label="分类名称" prop="categoryName" />
        <el-table-column label="分类图标" align="center" prop="icon">
          <template #default="scope">
             <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
               <span v-if="scope.row.icon" :style="getIconMaskStyle(scope.row.icon, 24)"></span>
               <span>{{ scope.row.icon || '--' }}</span>
             </div>
          </template>
        </el-table-column>
        <el-table-column label="显示顺序" align="center" prop="sort" />
        <el-table-column label="营销标签" align="center" prop="marketingTags" width="200">
          <template #default="scope">
            <template v-if="getMergedTags(scope.row).length > 0">
              <el-tag v-for="tag in getMergedTags(scope.row)" :key="tag" size="small" style="margin: 2px;">{{ tag }}</el-tag>
            </template>
            <span v-else style="color: #c0c4cc;">--</span>
          </template>
        </el-table-column>
        <el-table-column label="分类状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="新增下级" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['insurance:insuranceProductCategory:add']"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['insurance:insuranceProductCategory:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['insurance:insuranceProductCategory:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加或修改产品分类管理对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="insuranceProductCategoryFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级分类" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="categoryOptions"
            :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            value-key="categoryId"
            placeholder="请选择上级分类"
            check-strictly
            clearable
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <el-select v-model="form.icon" placeholder="请直接选择或输入Fluent图标" filterable allow-create clearable class="w-full">
            <template #prefix>
              <span v-if="form.icon" :style="getIconMaskStyle(form.icon, 18)" style="margin-right: 5px;"></span>
            </template>
            <el-option
              v-for="item in fluentIcons"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span :style="getIconMaskStyle(item.value, 20)"></span>
                  <span>{{ item.label }}</span>
                </div>
                <span style="color: #8492a6; font-size: 12px">{{ item.value }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图标颜色" prop="iconColor">
          <el-color-picker v-model="form.iconColor" color-format="hex" :predefine="predefineColors" />
          <span v-if="form.iconColor" style="margin-left: 12px; font-size: 12px; color: #909399;">{{ form.iconColor }}</span>
          <span v-else style="margin-left: 12px; font-size: 12px; color: #c0c4cc;">未设置（将使用默认颜色）</span>
        </el-form-item>
        <!-- 继承标签（只读，来自父级分类） -->
        <el-form-item label="继承标签" v-if="parentMarketingTags.length > 0">
          <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
            <el-tag v-for="tag in parentMarketingTags" :key="tag" type="info" size="small" style="opacity: 0.75;">{{ tag }}</el-tag>
            <span style="color: #c0c4cc; font-size: 12px; margin-left: 4px;">（继承自上级分类，不可修改）</span>
          </div>
        </el-form-item>
        <!-- 本级专属标签（可编辑） -->
        <el-form-item label="专属标签" prop="marketingTags">
          <el-select v-model="marketingTagsArr" multiple filterable allow-create default-first-option placeholder="可输入新标签并回车" class="w-full">
            <el-option v-for="tag in marketingTagsArr" :key="tag" :label="tag" :value="tag" />
          </el-select>
          <div v-if="parentMarketingTags.length > 0" style="color: #909399; font-size: 12px; margin-top: 4px;">
            最终生效标签 = 继承标签 + 专属标签（共 {{ parentMarketingTags.length + marketingTagsArr.length }} 个）
          </div>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="分类状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="parseInt(dict.value)">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InsuranceProductCategory" lang="ts">
import { listInsuranceProductCategory, getInsuranceProductCategory, delInsuranceProductCategory, addInsuranceProductCategory, updateInsuranceProductCategory } from '@/api/insurance/insuranceProductCategory';
import { InsuranceProductCategoryVO, InsuranceProductCategoryQuery, InsuranceProductCategoryForm } from '@/api/insurance/insuranceProductCategory/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const insuranceProductCategoryList = ref<InsuranceProductCategoryVO[]>([]);
const marketingTagsArr = ref<string[]>([]);
const parentMarketingTags = ref<string[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const categoryOptions = ref<any[]>([]);

const fluentIcons = ref([
  // ==== 核心业务 (7) ====
  { label: '全部/网格', value: 'fluent:grid-24-filled' },
  { label: '意外险/盾牌', value: 'fluent:shield-error-24-filled' },
  { label: '保障/安全盾', value: 'fluent:shield-checkmark-24-filled' },
  { label: '医疗险/急救箱', value: 'fluent:briefcase-medical-32-filled' },
  { label: '重疾险/心跳', value: 'fluent:heart-pulse-24-filled' },
  { label: '人寿险/丝带', value: 'fluent:document-ribbon-24-filled' },
  { label: '学平险/学士帽', value: 'fluent:hat-graduation-24-filled' },

  // ==== 人群与健康 (7) ====
  { label: '个人险/单人', value: 'fluent:person-24-filled' },
  { label: '家庭险/人群', value: 'fluent:people-24-filled' },
  { label: '养老险/关爱', value: 'fluent:person-support-24-filled' },
  { label: '健康/听诊器', value: 'fluent:stethoscope-24-filled' },
  { label: '用药/胶囊', value: 'fluent:pill-24-filled' },
  { label: '爱心/关怀', value: 'fluent:heart-24-filled' },
  { label: '食品/餐饮', value: 'fluent:food-24-filled' },

  // ==== 财产与出行 (7) ====
  { label: '家财险/房屋', value: 'fluent:home-24-filled' },
  { label: '企财险/大楼', value: 'fluent:building-24-filled' },
  { label: '车险/汽车', value: 'fluent:vehicle-car-24-filled' },
  { label: '交通险/公交', value: 'fluent:vehicle-bus-24-filled' },
  { label: '旅游险/飞机', value: 'fluent:airplane-24-filled' },
  { label: '定位/位置', value: 'fluent:location-24-filled' },
  { label: '全球/地球', value: 'fluent:globe-24-filled' },

  // ==== 细分行业/特定场景 (8) ====
  { label: '宠物险/动物', value: 'fluent:animal-dog-24-filled' },
  { label: '农险/树叶', value: 'fluent:leaf-24-filled' },
  { label: '责任险/法槌', value: 'fluent:gavel-24-filled' },
  { label: '工程险/扳手', value: 'fluent:wrench-24-filled' },
  { label: '设备险/电脑', value: 'fluent:laptop-24-filled' },
  { label: '碎屏险/手机', value: 'fluent:phone-24-filled' },
  { label: '网络安全/锁', value: 'fluent:lock-closed-24-filled' },
  { label: '天气/晴天', value: 'fluent:weather-sunny-24-filled' },

  // ==== 财富与金融 (7) ====
  { label: '高端险/皇冠', value: 'fluent:premium-24-filled' },
  { label: '银保/银行', value: 'fluent:building-bank-24-filled' },
  { label: '储蓄/存钱', value: 'fluent:savings-24-filled' },
  { label: '财富/钱包', value: 'fluent:wallet-24-filled' },
  { label: '理财/计算器', value: 'fluent:money-calculator-24-filled' },
  { label: '账单/凭证', value: 'fluent:receipt-24-filled' },
  { label: '现金/钱币', value: 'fluent:money-24-filled' },

  // ==== 营销与状态 (7) ====
  { label: '热门/星星', value: 'fluent:star-emphasis-24-filled' },
  { label: '推荐/闪电', value: 'fluent:flash-24-filled' },
  { label: '爆款/火焰', value: 'fluent:fire-24-filled' },
  { label: '活动/礼物', value: 'fluent:gift-24-filled' },
  { label: '口碑/点赞', value: 'fluent:thumb-like-24-filled' },
  { label: '宣传/喇叭', value: 'fluent:megaphone-24-filled' },
  { label: '荣誉/奖杯', value: 'fluent:trophy-24-filled' },

  // ==== 通用工具 (7) ====
  { label: '日历/日期', value: 'fluent:calendar-24-filled' },
  { label: '时钟/时间', value: 'fluent:clock-24-filled' },
  { label: '文档/合同', value: 'fluent:document-text-24-filled' },
  { label: '公文包/商务', value: 'fluent:briefcase-24-filled' },
  { label: '握手/合作', value: 'fluent:handshake-24-filled' },
  { label: '标签/分类', value: 'fluent:tag-24-filled' },
  { label: '确认/通过', value: 'fluent:checkmark-circle-24-filled' }
]);

// 预设的图标颜色色板
const predefineColors = [
  '#1890ff', '#4facfe', '#2f54eb', '#722ed1',
  '#52c41a', '#13c2c2', '#36cfc9', '#a0d911',
  '#faad14', '#fa8c16', '#fa541c', '#f5222d',
  '#eb2f96', '#ff4757', '#5cdb95', '#6e8efb'
];

// 动态获取图标预览样式（支持任意 Iconify 字符串且适配暗黑模式）
const getIconMaskStyle = (iconName?: string, size = 20) => {
  if (!iconName) return {};
  const url = `url('https://api.iconify.design/${iconName}.svg') no-repeat center / contain`;
  return {
    display: 'inline-block',
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: 'var(--el-text-color-regular)',
    mask: url,
    WebkitMask: url
  };
};

const queryFormRef = ref<ElFormInstance>();
const insuranceProductCategoryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: InsuranceProductCategoryForm = {
  categoryId: undefined,
  parentId: undefined,
  status: 0,
}
const data = reactive<PageData<InsuranceProductCategoryForm, InsuranceProductCategoryQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    parentId: undefined,
    ancestors: undefined,
    categoryName: undefined,
    icon: undefined,
    sort: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    parentId: [{ required: true, message: "上级分类不能为空", trigger: "change" }],
    categoryName: [{ required: true, message: "分类名称不能为空", trigger: "blur" }],
    icon: [{ required: true, message: "分类图标不能为空", trigger: "change" }],
    iconColor: [{ required: true, message: "图标颜色不能为空", trigger: "change" }],
    marketingTags: [{ required: true, message: "专属标签不能为空", trigger: "change" }],
    status: [{ required: true, message: "分类状态不能为空", trigger: "change" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品分类管理列表 */
const getList = async () => {
  loading.value = true;
  const res = await listInsuranceProductCategory();
  insuranceProductCategoryList.value = proxy?.handleTree(res.rows, 'categoryId', 'parentId');
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  marketingTagsArr.value = [];
  parentMarketingTags.value = [];
  insuranceProductCategoryFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}



/** 新增按钮操作 */
const handleAdd = (row?: any) => {
  reset();
  getTreeselect();
  if (row != null && row.categoryId) {
    form.value.parentId = row.categoryId;
  } else {
    form.value.parentId = 0;
  }
  dialog.visible = true;
  dialog.title = "添加产品分类管理";
}

/** 查询分类下拉树结构 */
const getTreeselect = async () => {
  const res = await listInsuranceProductCategory();
  const tree = proxy?.handleTree(res.rows, 'categoryId', 'parentId');
  const topNode = { categoryId: 0, categoryName: '顶级大类', children: tree };
  categoryOptions.value = [topNode];
}

/** 修改按钮操作 */
const handleUpdate = async (row?: InsuranceProductCategoryVO) => {
  reset();
  getTreeselect();
  const _categoryId = row?.categoryId;
  const res = await getInsuranceProductCategory(_categoryId);
  Object.assign(form.value, res.data);
  marketingTagsArr.value = form.value.marketingTags ? form.value.marketingTags.split(',').filter(Boolean) : [];
  // 加载父分类标签
  if (form.value.parentId && form.value.parentId !== 0) {
    const parentRes = await getInsuranceProductCategory(form.value.parentId);
    const tags = parentRes.data?.marketingTags;
    parentMarketingTags.value = tags ? tags.split(',').filter(Boolean) : [];
  }
  dialog.visible = true;
  dialog.title = "修改产品分类管理";
}

/** 提交按钮 */
const submitForm = () => {
  insuranceProductCategoryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.marketingTags = marketingTagsArr.value.join(',');
      if (form.value.categoryId) {
        await updateInsuranceProductCategory(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addInsuranceProductCategory(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: InsuranceProductCategoryVO) => {
  const _categoryIds = row?.categoryId;
  await proxy?.$modal.confirm('是否确认删除产品分类管理编号为"' + _categoryIds + '"的数据项？').finally(() => loading.value = false);
  await delInsuranceProductCategory(_categoryIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('insurance/insuranceProductCategory/export', {
    ...queryParams.value
  }, `insuranceProductCategory_${new Date().getTime()}.xlsx`)
}

/** 合并父级标签+本级标签，用于列表展示 */
const getMergedTags = (row: InsuranceProductCategoryVO): string[] => {
  const ownTags = row.marketingTags ? row.marketingTags.split(',').filter(Boolean) : [];
  if (!row.parentId || row.parentId === 0) return ownTags;
  // 从已加载的列表数据中找父节点（tree 已展平，需要从原始数据找）
  const allRows: InsuranceProductCategoryVO[] = [];
  const flatten = (nodes: any[]) => nodes.forEach(n => { allRows.push(n); if (n.children) flatten(n.children); });
  flatten(insuranceProductCategoryList.value);
  const parent = allRows.find(item => String(item.categoryId) === String(row.parentId));
  const parentTags = parent?.marketingTags ? parent.marketingTags.split(',').filter(Boolean) : [];
  return [...new Set([...parentTags, ...ownTags])];
};

/** 监听上级分类变更，自动加载父级营销标签 */
watch(
  () => form.value.parentId,
  async (newParentId) => {
    if (!newParentId || newParentId === 0) {
      parentMarketingTags.value = [];
      return;
    }
    try {
      const parentRes = await getInsuranceProductCategory(newParentId);
      const tags = parentRes.data?.marketingTags;
      parentMarketingTags.value = tags ? tags.split(',').filter(Boolean) : [];
    } catch {
      parentMarketingTags.value = [];
    }
  },
  { immediate: false }
);

onMounted(() => {
  getList();
});
</script>
