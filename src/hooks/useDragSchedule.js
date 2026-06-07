/**
 * useDragSchedule.js
 * Architecture hook for drag-and-drop task/routine scheduling.
 * Uses @dnd-kit/core (already installed).
 *
 * Phase 1: Infrastructure + placeholder.
 * Phase 7: Full implementation.
 *
 * Returns everything needed to wire up a DndContext.
 */

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

export function useDragSchedule(initialItems = []) {
  const [items,       setItems]       = useState(initialItems)
  const [activeItem,  setActiveItem]  = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // 8px drag threshold
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event) => {
    const { active } = event
    setActiveItem(items.find(i => i.id === active.id) ?? null)
  }, [items])

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over || active.id === over.id) return

    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.id === active.id)
      const newIndex = prev.findIndex(i => i.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  const handleDragCancel = useCallback(() => {
    setActiveItem(null)
  }, [])

  // Sync external items (e.g. from Zustand store) into local state
  const syncItems = useCallback((newItems) => {
    setItems(newItems)
  }, [])

  return {
    // State
    items,
    activeItem,
    setItems,
    syncItems,

    // DnD props — spread onto <DndContext>
    dndContextProps: {
      sensors,
      collisionDetection: closestCenter,
      onDragStart:  handleDragStart,
      onDragEnd:    handleDragEnd,
      onDragCancel: handleDragCancel,
    },

    // Re-exports for convenience
    DndContext,
    SortableContext,
    DragOverlay,
    verticalListSortingStrategy,
  }
}