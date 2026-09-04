"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type RankableStudent = {
  id: string;
  name: string;
  comment: string;
};

function SortableRow({
  student,
  rank,
  onCommentChange,
}: {
  student: RankableStudent;
  rank: number;
  onCommentChange: (id: string, comment: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: student.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-teal-900/10 bg-white/90 p-3 shadow-sm backdrop-blur-sm transition-shadow sm:p-4",
        isDragging && "z-10 shadow-lg ring-2 ring-teal-600/30"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-1 touch-none rounded-md p-1 text-teal-900/40 hover:bg-teal-50 hover:text-teal-800"
          aria-label={`Drag to reorder ${student.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-800 text-sm font-semibold text-white">
              {rank}
            </span>
            <span className="truncate font-medium text-teal-950">{student.name}</span>
          </div>
          <Textarea
            value={student.comment}
            onChange={(e) => onCommentChange(student.id, e.target.value)}
            placeholder={`Optional comment about ${student.name.split(" ")[0]}…`}
            rows={2}
            className="min-h-16 resize-y bg-white/80 text-sm"
          />
        </div>
      </div>
    </li>
  );
}

export function RankingList({
  students,
  onChange,
}: {
  students: RankableStudent[];
  onChange: (next: RankableStudent[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = students.findIndex((s) => s.id === active.id);
    const newIndex = students.findIndex((s) => s.id === over.id);
    onChange(arrayMove(students, oldIndex, newIndex));
  }

  function handleCommentChange(id: string, comment: string) {
    onChange(students.map((s) => (s.id === id ? { ...s, comment } : s)));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={students.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ol className="flex flex-col gap-3">
          {students.map((student, index) => (
            <SortableRow
              key={student.id}
              student={student}
              rank={index + 1}
              onCommentChange={handleCommentChange}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
