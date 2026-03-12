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
            <el-form-item label="保单号" prop="policyNo">
              <el-input v-model="queryParams.policyNo" placeholder="请输入保单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="业务人员姓名" prop="agentName">
              <el-input v-model="queryParams.agentName" placeholder="请输入业务人员姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="保费" prop="premium">
              <el-input v-model="queryParams.premium" placeholder="请输入保费" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="保额" prop="amt">
              <el-input v-model="queryParams.amt" placeholder="请输入保额" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="结算状态" prop="commissionStatus">
              <el-select v-model="queryParams.commissionStatus" placeholder="请选择结算状态" clearable >
                <el-option v-for="dict in insurance_commission_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="保单状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择保单状态" clearable >
                <el-option v-for="dict in insurance_policy_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="投保时间" prop="appntDate">
              <el-date-picker clearable
                v-model="queryParams.appntDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择投保时间"
              />
            </el-form-item>
            <el-form-item label="投保人姓名" prop="applicantName">
              <el-input v-model="queryParams.applicantName" placeholder="请输入投保人姓名" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:InsurancePolicy:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['insurance:InsurancePolicy:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['insurance:InsurancePolicy:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:InsurancePolicy:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="InsurancePolicyList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="id" align="center" prop="id" v-if="true" />
        <el-table-column label="产品id" align="center" prop="productId" /> -->

        <el-table-column label="保单号" align="center" prop="policyNo" width="180">
          <template #default="scope">
            <el-link type="primary" @click="handleView(scope.row)">
              {{ scope.row.policyNo }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="订单号" align="center" prop="orderNo" width="180" />

        <el-table-column label="产品编码" align="center" prop="productCode" />
        <el-table-column label="产品名称" align="center" prop="productName" />
        <!-- <el-table-column label="保单号" align="center" prop="policyNo" /> -->
        

        <el-table-column label="业务人员姓名" align="center" prop="agentName" />
        <!-- <el-table-column label="业务人员id" align="center" prop="agentUserId" /> -->
        <!-- <el-table-column label="业务人员所属部门" align="center" prop="agentDeptId" /> -->
        <el-table-column label="保费" align="center" prop="premium" />
        <el-table-column label="保额" align="center" prop="amt" />
        
        <el-table-column label="保单状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="insurance_policy_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="投保人姓名" align="center" prop="applicantName" />
        <el-table-column label="投保时间" align="center" prop="appntDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.appntDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="承保时间" align="center" prop="accecptDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.accecptDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="保单失效时间" align="center" prop="policyInvalidDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.policyInvalidDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="保障开始时间" align="center" prop="policyStartDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.policyStartDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="保障结束时间" align="center" prop="policyEndDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.policyEndDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="结算状态" align="center" prop="commissionStatus">
          <template #default="scope">
            <dict-tag :options="insurance_commission_status" :value="scope.row.commissionStatus"/>
          </template>
        </el-table-column>
        
        <!-- <el-table-column label="投保人性别" align="center" prop="applicantSex">
          <template #default="scope">
            <dict-tag :options="insurance_sex" :value="scope.row.applicantSex"/>
          </template>
        </el-table-column>
        <el-table-column label="投保人证件号" align="center" prop="applicantIdNo" />
        <el-table-column label="投保人证件类型" align="center" prop="applicantIdType">
          <template #default="scope">
            <dict-tag :options="insurance_id_type" :value="scope.row.applicantIdType"/>
          </template>
        </el-table-column>
        <el-table-column label="投保人手机号" align="center" prop="applicantMobile" />
        <el-table-column label="被保人与投保人关系" align="center" prop="relationshipToInsured">
          <template #default="scope">
            <dict-tag :options="insurance_relationship_to_insured" :value="scope.row.relationshipToInsured"/>
          </template>
        </el-table-column>
        <el-table-column label="被保人姓名" align="center" prop="insuredName" />
        <el-table-column label="被保人性别" align="center" prop="insuredSex">
          <template #default="scope">
            <dict-tag :options="insurance_sex" :value="scope.row.insuredSex"/>
          </template>
        </el-table-column>
        <el-table-column label="被保人证件号" align="center" prop="insuredIdNo" />
        <el-table-column label="被保人证件类型" align="center" prop="insuredIdType">
          <template #default="scope">
            <dict-tag :options="insurance_id_type" :value="scope.row.insuredIdType"/>
          </template>
        </el-table-column>
        <el-table-column label="被保人手机号" align="center" prop="insuredMobile" />
        <el-table-column label="删除标识" align="center" prop="delFlag" />
        <el-table-column label="乐观锁版本" align="center" prop="version" /> -->
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['insurance:InsurancePolicy:query']"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['insurance:InsurancePolicy:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['insurance:InsurancePolicy:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改承保保单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="InsurancePolicyFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品id" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入产品id" />
        </el-form-item>
        <el-form-item label="产品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入产品编码" />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="保单号" prop="policyNo">
          <el-input v-model="form.policyNo" placeholder="请输入保单号" />
        </el-form-item>
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="业务人员姓名" prop="agentName">
          <el-input v-model="form.agentName" placeholder="请输入业务人员姓名" />
        </el-form-item>
        <el-form-item label="业务人员id" prop="agentUserId">
          <el-input v-model="form.agentUserId" placeholder="请输入业务人员id" />
        </el-form-item>
        <el-form-item label="业务人员所属部门" prop="agentDeptId">
          <el-input v-model="form.agentDeptId" placeholder="请输入业务人员所属部门" />
        </el-form-item>
        <el-form-item label="保费" prop="premium">
          <el-input v-model="form.premium" placeholder="请输入保费" />
        </el-form-item>
        <el-form-item label="保额" prop="amt">
          <el-input v-model="form.amt" placeholder="请输入保额" />
        </el-form-item>
        <el-form-item label="结算状态" prop="commissionStatus">
          <el-select v-model="form.commissionStatus" placeholder="请选择结算状态">
            <el-option
                v-for="dict in insurance_commission_status"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="保单状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择保单状态">
            <el-option
                v-for="dict in insurance_policy_status"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="投保时间" prop="appntDate">
          <el-date-picker clearable
            v-model="form.appntDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择投保时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="承保时间" prop="accecptDate">
          <el-date-picker clearable
            v-model="form.accecptDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择承保时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="保单失效时间" prop="policyInvalidDate">
          <el-date-picker clearable
            v-model="form.policyInvalidDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择保单失效时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="保障开始时间" prop="policyStartDate">
          <el-date-picker clearable
            v-model="form.policyStartDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择保障开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="保障结束时间" prop="policyEndDate">
          <el-date-picker clearable
            v-model="form.policyEndDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择保障结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="投保人姓名" prop="applicantName">
          <el-input v-model="form.applicantName" placeholder="请输入投保人姓名" />
        </el-form-item>
        <el-form-item label="投保人性别" prop="applicantSex">
          <el-select v-model="form.applicantSex" placeholder="请选择投保人性别">
            <el-option
                v-for="dict in insurance_sex"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="投保人证件号" prop="applicantIdNo">
          <el-input v-model="form.applicantIdNo" placeholder="请输入投保人证件号" />
        </el-form-item>
        <el-form-item label="投保人证件类型" prop="applicantIdType">
          <el-select v-model="form.applicantIdType" placeholder="请选择投保人证件类型">
            <el-option
                v-for="dict in insurance_id_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="投保人手机号" prop="applicantMobile">
          <el-input v-model="form.applicantMobile" placeholder="请输入投保人手机号" />
        </el-form-item>
        <el-form-item label="被保人与投保人关系" prop="relationshipToInsured">
          <el-select v-model="form.relationshipToInsured" placeholder="请选择被保人与投保人关系">
            <el-option
                v-for="dict in insurance_relationship_to_insured"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="被保人姓名" prop="insuredName">
          <el-input v-model="form.insuredName" placeholder="请输入被保人姓名" />
        </el-form-item>
        <el-form-item label="被保人性别" prop="insuredSex">
          <el-select v-model="form.insuredSex" placeholder="请选择被保人性别">
            <el-option
                v-for="dict in insurance_sex"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="被保人证件号" prop="insuredIdNo">
          <el-input v-model="form.insuredIdNo" placeholder="请输入被保人证件号" />
        </el-form-item>
        <el-form-item label="被保人证件类型" prop="insuredIdType">
          <el-select v-model="form.insuredIdType" placeholder="请选择被保人证件类型">
            <el-option
                v-for="dict in insurance_id_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="被保人手机号" prop="insuredMobile">
          <el-input v-model="form.insuredMobile" placeholder="请输入被保人手机号" />
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

<script setup name="InsurancePolicy" lang="ts">
import { listInsurancePolicy, getInsurancePolicy, delInsurancePolicy, addInsurancePolicy, updateInsurancePolicy } from '@/api/insurance/InsurancePolicy';
import { InsurancePolicyVO, InsurancePolicyQuery, InsurancePolicyForm } from '@/api/insurance/InsurancePolicy/types';
import { useRouter } from 'vue-router';

const router = useRouter();

/** 查看按钮操作 */
async function handleView(row: InsurancePolicyVO) {
  const res = await getInsurancePolicy(row.id);
  router.push({
    path: '/insurancePolicy/detail',
    query: { id: row.id },
    state: { policyData: res.data as any }
  });
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_policy_status, insurance_id_type, insurance_relationship_to_insured, insurance_sex, insurance_commission_status } = toRefs<any>(proxy?.useDict('insurance_policy_status', 'insurance_id_type', 'insurance_relationship_to_insured', 'insurance_sex', 'insurance_commission_status'));

const InsurancePolicyList = ref<InsurancePolicyVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const InsurancePolicyFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: InsurancePolicyForm = {
  id: undefined,
  productId: undefined,
  productCode: undefined,
  productName: undefined,
  policyNo: undefined,
  orderNo: undefined,
  agentName: undefined,
  agentUserId: undefined,
  agentDeptId: undefined,
  premium: undefined,
  amt: undefined,
  commissionStatus: undefined,
  status: undefined,
  appntDate: undefined,
  accecptDate: undefined,
  policyInvalidDate: undefined,
  policyStartDate: undefined,
  policyEndDate: undefined,
  applicantName: undefined,
  applicantSex: undefined,
  applicantIdNo: undefined,
  applicantIdType: undefined,
  applicantMobile: undefined,
  relationshipToInsured: undefined,
  insuredName: undefined,
  insuredSex: undefined,
  insuredIdNo: undefined,
  insuredIdType: undefined,
  insuredMobile: undefined,
  delFlag: undefined,
  version: undefined
}
const data = reactive<PageData<InsurancePolicyForm, InsurancePolicyQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productCode: undefined,
    productName: undefined,
    policyNo: undefined,
    orderNo: undefined,
    agentName: undefined,
    premium: undefined,
    amt: undefined,
    commissionStatus: undefined,
    status: undefined,
    appntDate: undefined,
    applicantName: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "id不能为空", trigger: "blur" }
    ],
    productName: [
      { required: true, message: "产品名称不能为空", trigger: "blur" }
    ],
    policyNo: [
      { required: true, message: "保单号不能为空", trigger: "blur" }
    ],
    orderNo: [
      { required: true, message: "订单号不能为空", trigger: "blur" }
    ],
    agentName: [
      { required: true, message: "业务人员姓名不能为空", trigger: "blur" }
    ],
    agentUserId: [
      { required: true, message: "业务人员id不能为空", trigger: "blur" }
    ],
    agentDeptId: [
      { required: true, message: "业务人员所属部门不能为空", trigger: "blur" }
    ],
    premium: [
      { required: true, message: "保费不能为空", trigger: "blur" }
    ],
    amt: [
      { required: true, message: "保额不能为空", trigger: "blur" }
    ],
    commissionStatus: [
      { required: true, message: "结算状态不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "保单状态不能为空", trigger: "change" }
    ],
    appntDate: [
      { required: true, message: "投保时间不能为空", trigger: "blur" }
    ],
    accecptDate: [
      { required: true, message: "承保时间不能为空", trigger: "blur" }
    ],
    policyStartDate: [
      { required: true, message: "保障开始时间不能为空", trigger: "blur" }
    ],
    policyEndDate: [
      { required: true, message: "保障结束时间不能为空", trigger: "blur" }
    ],
    applicantName: [
      { required: true, message: "投保人姓名不能为空", trigger: "blur" }
    ],
    applicantSex: [
      { required: true, message: "投保人性别不能为空", trigger: "change" }
    ],
    applicantIdNo: [
      { required: true, message: "投保人证件号不能为空", trigger: "blur" }
    ],
    applicantIdType: [
      { required: true, message: "投保人证件类型不能为空", trigger: "change" }
    ],
    applicantMobile: [
      { required: true, message: "投保人手机号不能为空", trigger: "blur" }
    ],
    relationshipToInsured: [
      { required: true, message: "被保人与投保人关系不能为空", trigger: "change" }
    ],
    insuredName: [
      { required: true, message: "被保人姓名不能为空", trigger: "blur" }
    ],
    insuredSex: [
      { required: true, message: "被保人性别不能为空", trigger: "change" }
    ],
    insuredIdNo: [
      { required: true, message: "被保人证件号不能为空", trigger: "blur" }
    ],
    insuredIdType: [
      { required: true, message: "被保人证件类型不能为空", trigger: "change" }
    ],
    insuredMobile: [
      { required: true, message: "被保人手机号不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询承保保单列表 */
const getList = async () => {
  loading.value = true;
  const res = await listInsurancePolicy(queryParams.value);
  InsurancePolicyList.value = res.rows;
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
  InsurancePolicyFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: InsurancePolicyVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加承保保单";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: InsurancePolicyVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getInsurancePolicy(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改承保保单";
}

/** 提交按钮 */
const submitForm = () => {
  InsurancePolicyFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateInsurancePolicy(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addInsurancePolicy(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: InsurancePolicyVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除承保保单编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delInsurancePolicy(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('insurance/InsurancePolicy/export', {
    ...queryParams.value
  }, `InsurancePolicy_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
