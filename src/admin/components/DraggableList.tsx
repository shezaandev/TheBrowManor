import React, { useState } from 'react';

interface DraggableListProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => Promise<void> | void;
  renderItem: (item: T, index: number, dragProps: any) => React.ReactNode;
}

export default function DraggableList<T>({ items, onReorder, renderItem }: DraggableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Needed for older browsers to trigger dragging
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const listCopy = [...items];
    const [draggedItem] = listCopy.splice(draggedIndex, 1);
    listCopy.splice(index, 0, draggedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);

    await onReorder(listCopy);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const dragProps = {
          draggable: true,
          onDragStart: (e: React.DragEvent) => handleDragStart(e, index),
          onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
          onDragEnd: handleDragEnd,
          onDrop: () => handleDrop(index),
        };

        const isOver = dragOverIndex === index;
        const isDragged = draggedIndex === index;

        return (
          <div
            key={(item as any).id || index}
            className={`transition-all duration-200 border-2 border-transparent ${
              isOver ? 'border-dashed border-sage/55 bg-sage/5 scale-[1.01]' : ''
            } ${isDragged ? 'opacity-35 py-1 scale-95' : ''}`}
          >
            {renderItem(item, index, dragProps)}
          </div>
        );
      })}
    </div>
  );
}
