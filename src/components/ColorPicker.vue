<script setup>
import { ref, computed } from 'vue'
import ColorPickerBase from 'primevue/colorpicker'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const props = defineProps({
  modelValue: { type: String, default: null },
  usedColors: { type: Array, default: () => [] }, // [{ name, color, type }]
})
const emit = defineEmits(['update:modelValue'])

const search = ref('')

const filteredUsed = computed(() => {
  if (!props.usedColors.length) return []
  const q = search.value.trim().toLowerCase()
  const list = props.usedColors.filter(c => c.color)
  if (!q) return list
  return list.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.color?.toLowerCase().includes(q) ||
    c.type?.toLowerCase().includes(q)
  )
})

function pick(color) {
  emit('update:modelValue', color)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <ColorPickerBase
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        format="hex"
      />
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded border"
          :style="{ backgroundColor: modelValue ? '#' + modelValue : '#fff' }"
        />
        <span class="text-sm font-mono text-gray-700">
          {{ modelValue ? '#' + modelValue.toUpperCase() : 'No color selected' }}
        </span>
      </div>
    </div>

    <div v-if="usedColors.length" class="flex flex-col gap-2">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="search" placeholder="Search colors in use..." class="w-full" size="small" />
      </IconField>

      <div class="max-h-32 overflow-y-auto flex flex-col gap-1 border rounded-md p-2">
        <p v-if="!filteredUsed.length" class="text-xs text-gray-400 text-center py-2">No matching colors.</p>
        <button
          v-for="c in filteredUsed"
          :key="c.type + '-' + c.name"
          type="button"
          class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 text-left"
          @click="pick(c.color)"
        >
          <div class="w-4 h-4 rounded-full border shrink-0" :style="{ backgroundColor: '#' + c.color }" />
          <span class="text-xs text-gray-700 truncate">{{ c.name }}</span>
          <span class="text-xs text-gray-400 ml-auto font-mono">#{{ c.color.toUpperCase() }}</span>
        </button>
      </div>
    </div>
  </div>
</template>