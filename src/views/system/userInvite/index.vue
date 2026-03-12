<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="用户姓名" prop="nickName">
              <el-input v-model="queryParams.nickName" placeholder="请输入用户姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="手机号码" prop="phoneNumber">
              <el-input v-model="queryParams.phoneNumber" placeholder="请输入手机号码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="queryParams.idCard" placeholder="请输入身份证号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="推荐人" prop="referrerName">
              <el-input v-model="queryParams.referrerName" placeholder="请输入推荐人" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="审核状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择审核状态" clearable >
                <el-option v-for="dict in user_invite_audit_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:userInvite:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:userInvite:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:userInvite:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:userInvite:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="userInviteList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" v-if="true" />
        <el-table-column label="用户账号" align="center" prop="userName" />
        <el-table-column label="用户姓名" align="center" prop="nickName" />
        <el-table-column label="手机号码" align="center" prop="phoneNumber" />
        <el-table-column label="身份证号" align="center" prop="idCard" />
        <el-table-column label="推荐人" align="center" prop="referrerName" />
        <el-table-column label="推荐人id" align="center" prop="referrerId" />
        <el-table-column label="申请部门ID(可选)" align="center" prop="deptId" />
        <el-table-column label="审核状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="user_invite_audit_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="审核意见" align="center" prop="remark" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="删除标识" align="center" prop="delFlag" />
        <el-table-column label="乐观锁版本" align="center" prop="version" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:userInvite:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:userInvite:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改人员邀请登记对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="userInviteFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户账号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户账号" />
        </el-form-item>
        <el-form-item label="用户姓名" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户姓名" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="推荐人" prop="referrerName">
          <el-input v-model="form.referrerName" placeholder="请输入推荐人" />
        </el-form-item>
        <el-form-item label="推荐人id" prop="referrerId">
          <el-input v-model="form.referrerId" placeholder="请输入推荐人id" />
        </el-form-item>
        <el-form-item label="申请部门ID(可选)" prop="deptId">
          <el-input v-model="form.deptId" placeholder="请输入申请部门ID(可选)" />
        </el-form-item>
        <el-form-item label="审核状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择审核状态">
            <el-option
                v-for="dict in user_invite_audit_status"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核意见" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="删除标识" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标识" />
        </el-form-item>
        <el-form-item label="乐观锁版本" prop="version">
          <el-input v-model="form.version" placeholder="请输入乐观锁版本" />
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

<script setup name="UserInvite" lang="ts">
import { listUserInvite, getUserInvite, delUserInvite, addUserInvite, updateUserInvite } from '@/api/system/userInvite';
import { UserInviteVO, UserInviteQuery, UserInviteForm } from '@/api/system/userInvite/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { user_invite_audit_status } = toRefs<any>(proxy?.useDict('user_invite_audit_status'));

const userInviteList = ref<UserInviteVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const userInviteFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: UserInviteForm = {
  id: undefined,
  userName: undefined,
  nickName: undefined,
  phoneNumber: undefined,
  idCard: undefined,
  referrerName: undefined,
  referrerId: undefined,
  deptId: undefined,
  status: undefined,
  remark: undefined,
  delFlag: undefined,
  version: undefined
}
const data = reactive<PageData<UserInviteForm, UserInviteQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    nickName: undefined,
    phoneNumber: undefined,
    idCard: undefined,
    referrerName: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "ID不能为空", trigger: "blur" }
    ],
    userName: [
      { required: true, message: "用户账号不能为空", trigger: "blur" }
    ],
    nickName: [
      { required: true, message: "用户姓名不能为空", trigger: "blur" }
    ],
    phoneNumber: [
      { required: true, message: "手机号码不能为空", trigger: "blur" }
    ],
    idCard: [
      { required: true, message: "身份证号不能为空", trigger: "blur" }
    ],
    referrerName: [
      { required: true, message: "推荐人不能为空", trigger: "blur" }
    ],
    referrerId: [
      { required: true, message: "推荐人id不能为空", trigger: "blur" }
    ],
    deptId: [
      { required: true, message: "申请部门ID(可选)不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "审核状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询人员邀请登记列表 */
const getList = async () => {
  loading.value = true;
  const res = await listUserInvite(queryParams.value);
  userInviteList.value = res.rows;
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
  userInviteFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: UserInviteVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加人员邀请登记";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: UserInviteVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getUserInvite(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改人员邀请登记";
}

/** 提交按钮 */
const submitForm = () => {
  userInviteFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateUserInvite(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addUserInvite(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: UserInviteVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除人员邀请登记编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delUserInvite(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/userInvite/export', {
    ...queryParams.value
  }, `userInvite_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
