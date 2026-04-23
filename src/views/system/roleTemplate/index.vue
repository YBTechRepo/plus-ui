<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="queryParams.templateName" placeholder="请输入模板名称" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:roleTemplate:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:roleTemplate:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:roleTemplate:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:roleTemplate:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="roleTemplateList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="模板ID" align="center" prop="id" v-if="true" />
        <el-table-column label="模板名称" align="center" prop="templateName" />
        <el-table-column label="租户套餐ID" align="center" prop="tenantPackageId" />
        <el-table-column label="模板描述" align="center" prop="remark" />
        <!-- <el-table-column label="角色及权限配置(JSON格式)" align="center" prop="rolesJson" /> -->
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:roleTemplate:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:roleTemplate:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改角色模板管理对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" append-to-body>
      <el-form ref="roleTemplateFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="form.templateName" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="模板描述" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="状态" prop="status">
              <el-switch v-model="form.status" active-value="0" inactive-value="1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">角色及权限配置</el-divider>
        <el-row :gutter="20">
          <!-- 预设角色列表区 -->
          <el-col :span="10">
            <div class="mb-2 flex justify-between items-center">
              <span class="font-bold text-sm">内置角色列表</span>
              <el-button type="primary" link icon="Plus" @click="handleAddSubRole">添加角色</el-button>
            </div>
            <el-table :data="form.subRoles" border size="small" highlight-current-row @current-change="handleSubRoleCurrentChange" height="300">
              <el-table-column label="角色名称" align="center" prop="roleName" :show-overflow-tooltip="true" />
              <el-table-column label="权限字符" align="center" prop="roleKey" :show-overflow-tooltip="true" />
              <el-table-column label="操作" align="center" width="80">
                <template #default="scope">
                  <el-button link type="danger" icon="Delete" @click.stop="handleRemoveSubRole(scope.$index)"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <!-- 菜单权限配置区 -->
          <el-col :span="14">
            <div class="mb-2 flex justify-between items-center">
              <span class="font-bold text-sm">菜单权限绑定 ({{ currentSubRole ? currentSubRole.roleName : '未选择角色' }})</span>
              <el-select
                v-model="form.tenantPackageId"
                placeholder="选择基准租户套餐"
                size="small"
                style="width: 200px"
                @change="handlePackageChange"
              >
                <el-option v-for="item in packageList" :key="item.packageId" :label="item.packageName" :value="item.packageId" />
              </el-select>
            </div>
            <div class="border rounded-md p-2 h-[300px] overflow-y-auto">
              <el-tree
                ref="menuTreeRef"
                :data="menuOptions"
                show-checkbox
                node-key="id"
                :props="{ label: 'label', children: 'children' }"
                empty-text="请在左侧选择或添加预设角色"
                @check="handleMenuCheck"
              ></el-tree>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 子角色添加/修改对话框 -->
    <el-dialog :title="subRoleDialog.title" v-model="subRoleDialog.visible" width="400px" append-to-body>
      <el-form ref="subRoleFormRef" :model="subRoleForm" :rules="subRoleRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="subRoleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="subRoleForm.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitSubRoleForm">确 定</el-button>
          <el-button @click="subRoleDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RoleTemplate" lang="ts">
import {
  listRoleTemplate,
  getRoleTemplate,
  delRoleTemplate,
  addRoleTemplate,
  updateRoleTemplate,
  changeRoleTemplateStatus
} from '@/api/system/roleTemplate';
import { selectTenantPackage } from '@/api/system/tenantPackage';
import { RoleTemplateVO, RoleTemplateQuery, RoleTemplateForm, SubRoleTemplate } from '@/api/system/roleTemplate/types';
import { tenantPackageMenuTreeselect } from '@/api/system/menu';
import { MenuTreeOption } from '@/api/system/menu/types';
import { TenantPkgVO } from '@/api/system/tenantPackage/types';
import { ElMessageBox } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const roleTemplateList = ref<RoleTemplateVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const menuOptions = ref<MenuTreeOption[]>([]);
const currentSubRole = ref<SubRoleTemplate | undefined>(undefined);
const packageList = ref<TenantPkgVO[]>([]);

const queryFormRef = ref<ElFormInstance>();
const roleTemplateFormRef = ref<ElFormInstance>();
const menuTreeRef = ref<ElTreeInstance>();
const subRoleFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const subRoleDialog = reactive<DialogOption>({
  visible: false,
  title: '新增内置角色'
});

const subRoleForm = ref<Partial<SubRoleTemplate>>({
  roleName: '',
  roleKey: ''
});

const subRoleRules = {
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }]
};

const initFormData: RoleTemplateForm = {
  id: undefined,
  templateName: undefined,
  remark: undefined,
  rolesJson: undefined,
  tenantPackageId: undefined,
  status: '0',
  subRoles: []
};
const data = reactive<PageData<RoleTemplateForm, RoleTemplateQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    templateName: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    templateName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询所有租户套餐 */
const getTenantPackage = async () => {
  const res = await selectTenantPackage();
  packageList.value = res.data;
};

/** 根据套餐ID查询菜单树结构 */
const handlePackageChange = async (packageId: string | number) => {
  if (!packageId) {
    menuOptions.value = [];
    return;
  }
  const res = await tenantPackageMenuTreeselect(packageId);
  const allowedKeys = res.data.checkedKeys || [];

  // 根据套餐实际拥有的权限，剔除树结构中超纲的菜单
  const filterMenuTree = (menus: MenuTreeOption[], keys: (string | number)[]): MenuTreeOption[] => {
    return menus
      .map((menu) => {
        const newMenu = { ...menu };
        if (newMenu.children) {
          newMenu.children = filterMenuTree(newMenu.children, keys);
        }
        return newMenu;
      })
      .filter((menu) => keys.includes(menu.id) || (menu.children && menu.children.length > 0));
  };

  menuOptions.value = filterMenuTree(res.data.menus, allowedKeys);
};

/** 查询租户角色管理列表 */
const getList = async () => {
  loading.value = true;
  const res = await listRoleTemplate(queryParams.value);
  roleTemplateList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 角色状态修改 */
const handleStatusChange = async (row: RoleTemplateVO) => {
  const text = row.status === '0' ? '启用' : '停用';
  try {
    await proxy?.$modal.confirm('确认要"' + text + '""' + row.templateName + '"角色模板吗？');
    await changeRoleTemplateStatus(row.id as string | number, row.status as string);
    proxy?.$modal.msgSuccess(text + '成功');
  } catch {
    row.status = row.status === '0' ? '1' : '0';
  }
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData, subRoles: [] };
  currentSubRole.value = undefined;
  menuOptions.value = [];
  menuTreeRef.value?.setCheckedKeys([]);
  roleTemplateFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: RoleTemplateVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  await getTenantPackage();
  dialog.visible = true;
  dialog.title = '添加租户角色模板';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: RoleTemplateVO) => {
  reset();
  await getTenantPackage();
  const _id = row?.id || ids.value[0];
  const res = await getRoleTemplate(_id);
  Object.assign(form.value, res.data);
  // 解析 JSON
  try {
    form.value.subRoles = res.data.rolesJson ? JSON.parse(res.data.rolesJson) : [];
  } catch (e) {
    form.value.subRoles = [];
  }

  // 如果有绑定的基准套餐，提前加载，确保菜单树有数据可以显示
  if (form.value.tenantPackageId) {
    await handlePackageChange(form.value.tenantPackageId);
  }

  dialog.visible = true;
  dialog.title = '修改租户角色模板';
};

/** 添加预置子角色 */
const handleAddSubRole = () => {
  subRoleForm.value = {
    roleName: '',
    roleKey: ''
  };
  subRoleDialog.visible = true;
};

/** 提交子角色表单 */
const submitSubRoleForm = () => {
  subRoleFormRef.value?.validate((valid) => {
    if (valid) {
      if (!form.value.subRoles) {
        form.value.subRoles = [];
      }
      form.value.subRoles.push({
        roleName: subRoleForm.value.roleName as string,
        roleKey: subRoleForm.value.roleKey as string,
        menuIds: [],
        sort: form.value.subRoles.length + 1
      });
      // 选中新角色
      currentSubRole.value = form.value.subRoles[form.value.subRoles.length - 1];
      menuTreeRef.value?.setCheckedKeys([]);
      subRoleDialog.visible = false;
    }
  });
};

/** 取出树的全部叶子节点 */
const getLeafKeys = (menus: MenuTreeOption[]): (string | number)[] => {
  const leafKeys: (string | number)[] = [];
  const traverse = (nodes: MenuTreeOption[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      } else {
        leafKeys.push(node.id);
      }
    });
  };
  traverse(menus);
  return leafKeys;
};

/** 选择角色行 */
const handleSubRoleCurrentChange = (val: SubRoleTemplate | undefined) => {
  currentSubRole.value = val;
  if (val) {
    nextTick(() => {
      if (!menuOptions.value || menuOptions.value.length === 0) {
        menuTreeRef.value?.setCheckedKeys([]);
        return;
      }
      const leafKeys = getLeafKeys(menuOptions.value);
      // 只给叶子节点回显，父节点会通过 el-tree 自己的联动自动半选并正确回显
      const leafCheckedKeys = (val.menuIds || []).filter((v) => leafKeys.includes(v as any));
      menuTreeRef.value?.setCheckedKeys(leafCheckedKeys as any, false);
    });
  } else {
    menuTreeRef.value?.setCheckedKeys([]);
  }
};

/** 删除角色 */
const handleRemoveSubRole = (index: number) => {
  if (form.value.subRoles) {
    const removing = form.value.subRoles[index];
    form.value.subRoles.splice(index, 1);
    if (currentSubRole.value === removing) {
      currentSubRole.value = undefined;
      menuTreeRef.value?.setCheckedKeys([]);
    }
  }
};

/** 树节点选中同步到角色对象 */
const handleMenuCheck = () => {
  if (currentSubRole.value) {
    const checkedKeys = menuTreeRef.value?.getCheckedKeys() || [];
    const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys() || [];
    currentSubRole.value.menuIds = [...halfCheckedKeys, ...checkedKeys];
  } else {
    proxy?.$modal.msgWarning('请先选择一个内置角色');
    menuTreeRef.value?.setCheckedKeys([]);
  }
};

/** 提交按钮 */
const submitForm = () => {
  roleTemplateFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      // 组装 rolesJson
      form.value.rolesJson = JSON.stringify(form.value.subRoles || []);
      const { subRoles, ...submitData } = form.value;
      if (form.value.id) {
        await updateRoleTemplate(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addRoleTemplate(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: RoleTemplateVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除租户角色管理编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delRoleTemplate(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/roleTemplate/export',
    {
      ...queryParams.value
    },
    `roleTemplate_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
