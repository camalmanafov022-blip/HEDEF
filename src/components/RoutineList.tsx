import { Routine } from "../types";
import { RoutineCard } from "./RoutineCard";

interface RoutineListProps {
  routines: Routine[];
  onToggleRoutine: (id: string, date: string) => void;
  onDeleteRoutine: (id: string) => void;
}

export function RoutineList({ routines, onToggleRoutine, onDeleteRoutine }: RoutineListProps) {
  return (
    <div className="space-y-4">
      {routines.map(routine => (
        <RoutineCard 
          key={routine.id} 
          routine={routine} 
          onToggle={onToggleRoutine} 
          onDelete={onDeleteRoutine} 
        />
      ))}
    </div>
  );
}
