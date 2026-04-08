import { describe, it, expect, beforeEach } from 'vitest'
import { TreeStore, type TreeItem } from '@/store/TreeStore'

const createItems = (): TreeItem[] => [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

describe('TreeStore', () => {
  let store: TreeStore

  beforeEach(() => {
    store = new TreeStore(createItems())
  })

  describe('getAll', () => {
    it('возвращает все элементы', () => {
      expect(store.getAll()).toHaveLength(8)
    })
  })

  describe('getItem', () => {
    it('возвращает элемент по числовому id', () => {
      const item = store.getItem(1)
      expect(item).toBeDefined()
      expect(item!.label).toBe('Айтем 1')
    })

    it('возвращает элемент по строковому id', () => {
      const item = store.getItem('91064cee')
      expect(item).toBeDefined()
      expect(item!.label).toBe('Айтем 2')
    })

    it('возвращает undefined для несуществующего id', () => {
      expect(store.getItem(999)).toBeUndefined()
    })
  })

  describe('getChildren', () => {
    it('возвращает прямых потомков', () => {
      const children = store.getChildren(1)
      expect(children).toHaveLength(2)
      expect(children.map((c) => c.id)).toEqual(
        expect.arrayContaining(['91064cee', 3]),
      )
    })

    it('возвращает пустой массив для листового элемента', () => {
      expect(store.getChildren(7)).toEqual([])
    })

    it('возвращает пустой массив для несуществующего id', () => {
      expect(store.getChildren(999)).toEqual([])
    })
  })

  describe('getAllChildren', () => {
    it('возвращает всех потомков рекурсивно', () => {
      const allChildren = store.getAllChildren(1)
      expect(allChildren).toHaveLength(7)
    })

    it('возвращает всех потомков для промежуточного узла', () => {
      const allChildren = store.getAllChildren('91064cee')
      expect(allChildren).toHaveLength(5)
      expect(allChildren.map((c) => c.id)).toEqual(
        expect.arrayContaining([4, 5, 6, 7, 8]),
      )
    })

    it('возвращает пустой массив для листового элемента', () => {
      expect(store.getAllChildren(7)).toEqual([])
    })
  })

  describe('getAllParents', () => {
    it('возвращает цепочку родителей от элемента до корня', () => {
      const parents = store.getAllParents(7)
      expect(parents.map((p) => p.id)).toEqual([7, 4, '91064cee', 1])
    })

    it('возвращает только сам элемент для корня', () => {
      const parents = store.getAllParents(1)
      expect(parents).toHaveLength(1)
      expect(parents[0]!.id).toBe(1)
    })
  })

  describe('addItem', () => {
    it('добавляет новый элемент', () => {
      store.addItem({ id: 9, parent: 3, label: 'Айтем 9' })
      expect(store.getAll()).toHaveLength(9)
      expect(store.getItem(9)).toBeDefined()
      expect(store.getChildren(3)).toHaveLength(1)
    })
  })

  describe('removeItem', () => {
    it('удаляет элемент и всех его потомков', () => {
      store.removeItem('91064cee')
      expect(store.getAll()).toHaveLength(2) // остались только id=1 и id=3
      expect(store.getItem('91064cee')).toBeUndefined()
      expect(store.getItem(4)).toBeUndefined()
      expect(store.getItem(7)).toBeUndefined()
    })

    it('удаляет листовой элемент', () => {
      store.removeItem(7)
      expect(store.getAll()).toHaveLength(7)
      expect(store.getChildren(4)).toHaveLength(1)
    })
  })

  describe('updateItem', () => {
    it('обновляет поля элемента', () => {
      store.updateItem({ id: 1, parent: null, label: 'Обновлённый Айтем 1' })
      expect(store.getItem(1)!.label).toBe('Обновлённый Айтем 1')
    })

    it('обновляет parent и перестраивает связи', () => {
      store.updateItem({ id: 3, parent: '91064cee', label: 'Айтем 3' })
      expect(store.getChildren(1)).toHaveLength(1) // только 91064cee
      expect(store.getChildren('91064cee')).toHaveLength(4) // + id=3
    })

    it('ничего не делает для несуществующего элемента', () => {
      store.updateItem({ id: 999, parent: null, label: 'Не существует' })
      expect(store.getAll()).toHaveLength(8)
    })
  })

  describe('edge cases', () => {
    it('работает с пустым массивом', () => {
      const emptyStore = new TreeStore([])
      expect(emptyStore.getAll()).toEqual([])
      expect(emptyStore.getItem(1)).toBeUndefined()
      expect(emptyStore.getChildren(1)).toEqual([])
      expect(emptyStore.getAllChildren(1)).toEqual([])
      expect(emptyStore.getAllParents(1)).toEqual([])
    })

    it('addItem после removeItem корректно работает', () => {
      store.removeItem(7)
      store.addItem({ id: 7, parent: 4, label: 'Новый Айтем 7' })
      expect(store.getItem(7)!.label).toBe('Новый Айтем 7')
      expect(store.getChildren(4)).toHaveLength(2)
    })

    it('getAllParents возвращает корректный порядок для глубокого элемента', () => {
      const parents = store.getAllParents(8)
      const ids = parents.map((p) => p.id)
      expect(ids).toEqual([8, 4, '91064cee', 1])
    })

    it('getAll возвращает ту же ссылку на массив', () => {
      const all1 = store.getAll()
      const all2 = store.getAll()
      expect(all1).toBe(all2)
    })

    it('removeItem корневого элемента удаляет всё дерево', () => {
      store.removeItem(1)
      expect(store.getAll()).toEqual([])
    })
  })
})
