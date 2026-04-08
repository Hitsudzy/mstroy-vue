<script setup lang="ts">
import { ref, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import {
  RowGroupingModule,
  TreeDataModule,
} from 'ag-grid-enterprise'
import { TreeStore, type TreeItem } from '@/store/TreeStore'

ModuleRegistry.registerModules([
  AllCommunityModule,
  RowGroupingModule,
  TreeDataModule,
])

const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

const store = ref(new TreeStore(items))

function getPath(item: TreeItem): string[] {
  const path: string[] = []
  let current: TreeItem | undefined = item
  while (current) {
    path.unshift(String(current.id))
    if (current.parent === null || current.parent === undefined) break
    current = store.value.getItem(current.parent)
  }
  return path
}

interface RowData {
  id: string | number
  label: string
  category: string
  path: string[]
  [key: string]: unknown
}

const rowData = computed<RowData[]>(() =>
  store.value.getAll().map((item) => {
    const hasChildren = store.value.getChildren(item.id).length > 0
    return {
      ...item,
      id: item.id,
      label: item.label as string,
      category: hasChildren ? 'Группа' : 'Элемент',
      path: getPath(item),
    }
  }),
)

const columnDefs = ref([
  {
    headerName: '№ п\\п',
    valueGetter: (params: { node?: { rowIndex?: number | null } }) => {
      if (params.node?.rowIndex != null) {
        return params.node.rowIndex + 1
      }
      return null
    },
    width: 80,
  },
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
  },
])

const autoGroupColumnDef = ref({
  headerName: 'Категория',
  minWidth: 200,
  field: 'category',
  cellRendererParams: {
    suppressCount: true,
    innerRenderer: (params: { value?: string }) => {
      return params.value ?? ''
    },
  },
})

const getDataPath = (data: RowData) => data.path

const defaultColDef = ref({
  sortable: false,
  resizable: true,
})
</script>

<template>
  <div class="tree-grid-container">
    <ag-grid-vue
      class="ag-theme-alpine"
      style="width: 100%; height: 600px"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :autoGroupColumnDef="autoGroupColumnDef"
      :treeData="true"
      :getDataPath="getDataPath"
      :groupDefaultExpanded="-1"
      :animateRows="true"
    />
  </div>
</template>

<style scoped>
.tree-grid-container {
  padding: 20px;
}
</style>
