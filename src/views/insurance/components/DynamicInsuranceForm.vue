<template>
  <el-form ref="dynamicFormRef" :model="model" :label-width="labelWidth">
    <template v-for="group in groupedFields" :key="group.name">
      <el-divider v-if="showGroupTitle(group.name)" content-position="left">{{ group.name }}</el-divider>
      <el-row :gutter="16">
        <el-col v-for="field in group.fields" :key="field.key" :xs="24" :md="getColSpan(field)">
          <el-form-item :label="field.label" :prop="field.key" :rules="buildRules(field)">
            <el-input
              v-if="field.type === 'text'"
              v-model="model[field.key]"
              :placeholder="field.placeholder || `请输入${field.label}`"
            />
            <div v-else-if="field.type === 'address'" class="address-field">
              <el-cascader
                :model-value="getAreaPath(model[field.key])"
                :options="areaOptions"
                :props="areaCascaderProps"
                placeholder="请选择省市区"
                clearable
                filterable
                class="address-area"
                @change="(value) => onAreaChange(field.key, value)"
              />
              <el-input
                :model-value="getAddressDetail(model[field.key])"
                :placeholder="field.placeholder || `请输入${field.label}详细地址`"
                @input="(value) => onAddressDetailChange(field.key, value)"
              />
            </div>
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="model[field.key]"
              type="textarea"
              :rows="3"
              :placeholder="field.placeholder || `请输入${field.label}`"
            />
            <el-input-number
              v-else-if="field.type === 'number' || field.type === 'money'"
              v-model="model[field.key]"
              :min="0"
              :precision="field.type === 'money' ? 2 : undefined"
              :step="field.type === 'money' ? 0.01 : 1"
              class="w-full"
            />
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="model[field.key]"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="field.placeholder || `请选择${field.label}`"
              class="w-full"
            />
            <el-select
              v-else-if="field.type === 'select'"
              v-model="model[field.key]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              clearable
              class="w-full"
            >
              <el-option v-for="option in field.options || []" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
            <el-radio-group v-else-if="field.type === 'radio'" v-model="model[field.key]">
              <el-radio v-for="option in field.options || []" :key="option.value" :value="option.value">{{ option.label }}</el-radio>
            </el-radio-group>
            <el-checkbox-group v-else-if="field.type === 'checkbox'" v-model="model[field.key]">
              <el-checkbox v-for="option in field.options || []" :key="option.value" :value="option.value">{{ option.label }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
  </el-form>
</template>

<script setup lang="ts">
import type { ElFormInstance, FormItemRule } from 'element-plus';
import { areaList } from '@vant/area-data';
import type { InsuranceDynamicField } from '@/api/insurance/dynamicForm/types';

interface AreaOption {
  label: string;
  value: string;
  children?: AreaOption[];
}

const props = withDefaults(
  defineProps<{
    fields: InsuranceDynamicField[];
    modelValue: Record<string, any>;
    labelWidth?: string;
  }>(),
  {
    labelWidth: '120px'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void;
}>();

const dynamicFormRef = ref<ElFormInstance>();

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const normalizedFields = computed(() => {
  return [...(props.fields || [])]
    .filter((field) => field?.key && field?.label && field?.type)
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
});

const areaCascaderProps = {
  value: 'label',
  label: 'label',
  children: 'children',
  emitPath: true
};

const areaOptions = computed<AreaOption[]>(() => {
  const provinceList = areaList.province_list || {};
  const cityList = areaList.city_list || {};
  const countyList = areaList.county_list || {};

  return Object.entries(provinceList).map(([provinceCode, provinceName]) => {
    const provincePrefix = provinceCode.slice(0, 2);
    const cities = Object.entries(cityList)
      .filter(([cityCode]) => cityCode.startsWith(provincePrefix))
      .map(([cityCode, cityName]) => {
        const cityPrefix = cityCode.slice(0, 4);
        const counties = Object.entries(countyList)
          .filter(([countyCode]) => countyCode.startsWith(cityPrefix))
          .map(([, countyName]) => ({
            label: countyName,
            value: countyName
          }));
        return {
          label: cityName,
          value: cityName,
          children: counties
        };
      });

    return {
      label: provinceName,
      value: provinceName,
      children: cities
    };
  });
});

const getAreaPath = (value: unknown) => {
  if (Array.isArray(value)) return value.slice(0, 3);
  return String(value || '')
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
};

const getAddressDetail = (value: unknown) => {
  if (Array.isArray(value)) return '';
  return String(value || '')
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(3)
    .join(' ');
};

const buildAddress = (areaPath: unknown[], detail: string) => {
  return [...areaPath.map((item) => String(item || '').trim()).filter(Boolean), detail.trim()].filter(Boolean).join(' ');
};

const onAreaChange = (key: string, value: unknown) => {
  model.value[key] = buildAddress(Array.isArray(value) ? value : [], getAddressDetail(model.value[key]));
};

const onAddressDetailChange = (key: string, value: string) => {
  model.value[key] = buildAddress(getAreaPath(model.value[key]), value);
};

const groupedFields = computed(() => {
  const groups: Array<{ name: string; fields: InsuranceDynamicField[] }> = [];
  normalizedFields.value.forEach((field) => {
    const name = field.groupName || '扩展信息';
    let group = groups.find((item) => item.name === name);
    if (!group) {
      group = { name, fields: [] };
      groups.push(group);
    }
    group.fields.push(field);
    if (field.type === 'checkbox' && !Array.isArray(model.value[field.key])) {
      model.value[field.key] = [];
    }
  });
  return groups;
});

const showGroupTitle = (groupName: string) => {
  return groupedFields.value.length > 1 || groupName !== '扩展信息';
};

const getColSpan = (field: InsuranceDynamicField) => {
  return field.type === 'textarea' || field.type === 'address' ? 24 : 12;
};

const buildRules = (field: InsuranceDynamicField): FormItemRule[] => {
  if (!field.required) return [];
  if (field.type === 'address') {
    return [
      {
        validator: (_rule, value, callback) => {
          if (getAreaPath(value).length === 3 && getAddressDetail(value)) {
            callback();
          } else {
            callback(new Error(`${field.label}不能为空`));
          }
        },
        trigger: 'change'
      }
    ];
  }
  return [{ required: true, message: `${field.label}不能为空`, trigger: field.type === 'text' || field.type === 'textarea' ? 'blur' : 'change' }];
};

const validate = async () => {
  if (!dynamicFormRef.value || normalizedFields.value.length === 0) return true;
  return dynamicFormRef.value.validate();
};

defineExpose({ validate });
</script>

<style scoped>
.w-full {
  width: 100%;
}

.address-field {
  display: flex;
  width: 100%;
  gap: 12px;
}

.address-area {
  width: 320px;
  flex: 0 0 320px;
}

@media (max-width: 768px) {
  .address-field {
    flex-direction: column;
    gap: 8px;
  }

  .address-area {
    width: 100%;
    flex: none;
  }
}
</style>
