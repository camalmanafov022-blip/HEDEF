import { Check, Trash2 } from "lucide-react";
import { Routine } from "../types";
import { format } from "date-fns"; // Wait, date-fns might not be installed. Use standard JS Date.

interface RoutineCardProps {
  routine: Routine;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
}

export function RoutineCard({ routine, onToggle, onDelete }: RoutineCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = routine.completedDates.includes(today);

  return (
    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-50 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onToggle(routine.id, today)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            isCompletedToday ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
          }`}
        >
          <Check size={24} />
        </button>
        <div>
          <h3 className="font-semibold text-gray-900">{routine.title}</h3>
          <p className="text-xs text-gray-400">{routine.category}</p>
        </div>
      </div>
      <button onClick={() => onDelete(routine.id)} className="p-2 text-gray-300 hover:text-red-500">
        <Trash2 size={18} />
      </button>
    </div>
  );
}
