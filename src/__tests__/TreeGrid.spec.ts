import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TreeGrid from '@/components/TreeGrid.vue'

describe('TreeGrid', () => {
  it('монтируется без ошибок', () => {
    const wrapper = mount(TreeGrid)
    expect(wrapper.exists()).toBe(true)
  })

  it('содержит контейнер таблицы', () => {
    const wrapper = mount(TreeGrid)
    expect(wrapper.find('.tree-grid-container').exists()).toBe(true)
  })

  it('содержит заголовок', () => {
    const wrapper = mount(TreeGrid)
    expect(wrapper.find('h2').text()).toBe('TreeStore — AG Grid')
  })
})
