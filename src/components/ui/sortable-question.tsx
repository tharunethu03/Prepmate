// Either in InterviewPreview.tsx or a separate file
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type Question = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

type SortableQuestionProps = {
  question: Question;
};

export function SortableQuestion({ question }: SortableQuestionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border rounded-[12px] p-3 cursor-grab hover:border-secondary transition"
    >
      <p className="font-medium">{question.question}</p>
    </div>
  );
}
