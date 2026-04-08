export interface TreeItem {
  id: string | number
  parent: string | number | null
  [key: string]: unknown
}

export class TreeStore {
  private readonly items: TreeItem[]
  private readonly itemMap: Map<string | number, TreeItem>
  private readonly childrenMap: Map<string | number, TreeItem[]>

  constructor(items: TreeItem[]) {
    this.items = items
    this.itemMap = new Map()
    this.childrenMap = new Map()

    for (const item of items) {
      this.itemMap.set(item.id, item)
    }

    for (const item of items) {
      const parentId = item.parent
      if (parentId !== null && parentId !== undefined) {
        let children = this.childrenMap.get(parentId)
        if (!children) {
          children = []
          this.childrenMap.set(parentId, children)
        }
        children.push(item)
      }
    }
  }

  getAll(): TreeItem[] {
    return this.items
  }

  getItem(id: string | number): TreeItem | undefined {
    return this.itemMap.get(id)
  }

  getChildren(id: string | number): TreeItem[] {
    return this.childrenMap.get(id) ?? []
  }

  getAllChildren(id: string | number): TreeItem[] {
    const result: TreeItem[] = []
    const stack = this.getChildren(id).slice()

    while (stack.length > 0) {
      const child = stack.pop()!
      result.push(child)
      const grandChildren = this.childrenMap.get(child.id)
      if (grandChildren) {
        for (let i = grandChildren.length - 1; i >= 0; i--) {
          stack.push(grandChildren[i]!)
        }
      }
    }

    return result
  }

  getAllParents(id: string | number): TreeItem[] {
    const result: TreeItem[] = []
    let current = this.itemMap.get(id)

    while (current) {
      result.push(current)
      if (current.parent === null || current.parent === undefined) {
        break
      }
      current = this.itemMap.get(current.parent)
    }

    return result
  }

  addItem(item: TreeItem): void {
    this.items.push(item)
    this.itemMap.set(item.id, item)

    if (item.parent !== null && item.parent !== undefined) {
      let children = this.childrenMap.get(item.parent)
      if (!children) {
        children = []
        this.childrenMap.set(item.parent, children)
      }
      children.push(item)
    }
  }

  removeItem(id: string | number): void {
    // Собираем все id для удаления (сам элемент + все потомки)
    const idsToRemove = new Set<string | number>()
    const stack: (string | number)[] = [id]

    while (stack.length > 0) {
      const currentId = stack.pop()!
      idsToRemove.add(currentId)
      const children = this.childrenMap.get(currentId)
      if (children) {
        for (const child of children) {
          stack.push(child.id)
        }
      }
    }

    // Удаляем из items массива
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (idsToRemove.has(this.items[i]!.id)) {
        this.items.splice(i, 1)
      }
    }

    // Удаляем из maps
    for (const removeId of idsToRemove) {
      const item = this.itemMap.get(removeId)
      this.itemMap.delete(removeId)
      this.childrenMap.delete(removeId)

      // Удаляем из children родителя
      if (item?.parent !== null && item?.parent !== undefined) {
        const siblings = this.childrenMap.get(item.parent)
        if (siblings) {
          const idx = siblings.indexOf(item)
          if (idx !== -1) {
            siblings.splice(idx, 1)
          }
        }
      }
    }
  }

  updateItem(updatedItem: TreeItem): void {
    const existing = this.itemMap.get(updatedItem.id)
    if (!existing) return

    const oldParent = existing.parent

    // Обновляем все поля
    Object.assign(existing, updatedItem)

    // Если parent изменился — перестраиваем связи
    if (oldParent !== updatedItem.parent) {
      // Удаляем из старого родителя
      if (oldParent !== null && oldParent !== undefined) {
        const oldSiblings = this.childrenMap.get(oldParent)
        if (oldSiblings) {
          const idx = oldSiblings.indexOf(existing)
          if (idx !== -1) {
            oldSiblings.splice(idx, 1)
          }
        }
      }

      // Добавляем к новому родителю
      if (updatedItem.parent !== null && updatedItem.parent !== undefined) {
        let newSiblings = this.childrenMap.get(updatedItem.parent)
        if (!newSiblings) {
          newSiblings = []
          this.childrenMap.set(updatedItem.parent, newSiblings)
        }
        newSiblings.push(existing)
      }
    }
  }
}
