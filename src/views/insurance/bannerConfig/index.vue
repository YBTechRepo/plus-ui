<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="轮播图标题" prop="title">
              <el-input v-model="queryParams.title" placeholder="请输入轮播图标题" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="跳转类型" prop="jumpType">
              <el-select v-model="queryParams.jumpType" placeholder="请选择跳转类型" clearable >
                <el-option v-for="dict in banner_jump_type" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="跳转链接" prop="jumpUrl">
              <el-input v-model="queryParams.jumpUrl" placeholder="请输入跳转链接" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="排序" prop="sortOrder">
              <el-input v-model="queryParams.sortOrder" placeholder="请输入排序" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable >
                <el-option v-for="dict in banner_image_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:bannerConfig:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['insurance:bannerConfig:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['insurance:bannerConfig:remove']">删除</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:bannerConfig:export']">导出</el-button>
          </el-col> -->
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="bannerConfigList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="主键ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="轮播图标题" align="center" prop="title" />
        <el-table-column label="轮播图内容" align="center" prop="content" />
        <el-table-column label="轮播图" align="center" prop="imageIdUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.imageUrl" :width="50" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column label="跳转类型" align="center" prop="jumpType">
          <template #default="scope">
            <dict-tag :options="banner_jump_type" :value="scope.row.jumpType"/>
          </template>
        </el-table-column>
        <el-table-column label="跳转链接" align="center" prop="jumpUrl" />
        <el-table-column label="排序" align="center" prop="sortOrder" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="banner_image_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <!-- <el-table-column label="备注" align="center" prop="remark" /> -->
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="乐观锁版本" align="center" prop="version" /> -->
        <!-- <el-table-column label="租户ID" align="center" prop="tenantId" /> -->
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['insurance:bannerConfig:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['insurance:bannerConfig:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改轮播图配置对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <el-form ref="bannerConfigFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="轮播图标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入轮播图标题" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" class="w-full">
                <el-option v-for="dict in banner_image_status" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="轮播图内容" prop="content">
              <el-input v-model="form.content" type="textarea" :rows="3" placeholder="请输入内容" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="跳转类型" prop="jumpType">
              <el-select v-model="form.jumpType" placeholder="请选择跳转类型" class="w-full">
                <el-option v-for="dict in banner_jump_type" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" placeholder="请输入排序" class="w-full" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="跳转链接" prop="jumpUrl">
              <el-input v-model="form.jumpUrl" type="textarea" :rows="2" placeholder="请输入跳转链接" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="图片上传" prop="image">
              <image-upload v-model="form.image" />
              <el-alert title="图片上传建议" type="info" :closable="false" class="mt-2" show-icon>
                <template #default>
                  <p class="m-0 text-xs">
                    • <strong>推荐比例</strong>: 1.72 : 1 (约 16:9), 系统会自动裁剪铺满。<br />
                    • <strong>推荐尺寸</strong>: 750 × 430 px 或 1000 × 580 px (高清)。<br />
                    • <strong>制作建议</strong>: 直接按 750 × 430 px 出图效果最稳。
                  </p>
                </template>
              </el-alert>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="24">
            <el-form-item label="轮播图内容" prop="content">
              <el-input v-model="form.content" type="textarea" :rows="3" placeholder="请输入内容" class="w-full" />
            </el-form-item>
          </el-col> -->
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注内容" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-form-item label="乐观锁版本" prop="version">
          <el-input v-model="form.version" placeholder="请输入乐观锁版本" />
        </el-form-item>
        <el-form-item label="租户ID" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
        </el-form-item> -->
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

<script setup name="BannerConfig" lang="ts">
import { listBannerConfig, getBannerConfig, delBannerConfig, addBannerConfig, updateBannerConfig } from '@/api/insurance/bannerConfig';
import { BannerConfigVO, BannerConfigQuery, BannerConfigForm } from '@/api/insurance/bannerConfig/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { banner_image_status, banner_jump_type } = toRefs<any>(proxy?.useDict('banner_image_status', 'banner_jump_type'));

const bannerConfigList = ref<BannerConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const bannerConfigFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: BannerConfigForm = {
  id: undefined,
  title: undefined,
  content: undefined,
  image: undefined,
  jumpType: undefined,
  jumpUrl: undefined,
  sortOrder: undefined,
  status: undefined,
  remark: undefined,
  version: undefined,
  tenantId: undefined
}
const data = reactive<PageData<BannerConfigForm, BannerConfigQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    jumpType: undefined,
    jumpUrl: undefined,
    sortOrder: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询轮播图配置列表 */
const getList = async () => {
  loading.value = true;
  const res = await listBannerConfig(queryParams.value);
  bannerConfigList.value = res.rows;
  total.value = res.total;
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
  bannerConfigFormRef.value?.resetFields();
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

/** 多选框选中数据 */
const handleSelectionChange = (selection: BannerConfigVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加轮播图配置";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: BannerConfigVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getBannerConfig(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改轮播图配置";
}

/** 提交按钮 */
const submitForm = () => {
  bannerConfigFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateBannerConfig(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBannerConfig(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: BannerConfigVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除轮播图配置编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delBannerConfig(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'insurance/bannerConfig/export',
    {
      ...queryParams.value
    },
    `bannerConfig_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
