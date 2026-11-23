import {
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  Calendar,
  Clock,
  Check,
  RotateCcw,
} from "lucide-react";
import { Goal } from "../types";
import { motion } from "motion/react";
import {
  diffDays,
  formatShortDateAz,
  getDeadlineStatus,
  getTodayISO,
} from "../utils/dateUtils";

interface GoalCardProps {
  goal: Goal;
  onToggleGoal: (id: string) => void;
  onToggleStep: (goalId: string, stepId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onEditGoal: (goal: Goal) => void;
}

export function GoalCard({
  goal,
  onToggleGoal,
  onToggleStep,
  onDeleteGoal,
  onEditGoal,
}: GoalCardProps) {
  const completedSteps = goal.steps.filter((s) => s.completed).length;
  const totalSteps = goal.steps.length;
  const progress =
    totalSteps > 0
      ? (completedSteps / totalSteps) * 100
      : goal.completed
      ? 100
      : 0;

  const roundedProgress = Math.round(progress);
  const deadlineStatus = getDeadlineStatus(goal.targetDate, goal.completed);
  const today = getTodayISO();

  // Compute time-elapsed ratio if both startDate and targetDate exist
  let timeElapsedPercent: number | null = null;
  if (goal.startDate && goal.targetDate) {
    const totalSpan = Math.max(1, diffDays(goal.startDate, goal.targetDate));
    const elapsed = diffDays(goal.startDate, today);
    timeElapsedPercent = Math.min(
      100,
      Math.max(0, Math.round((elapsed / totalSpan) * 100))
    );
  }

  const badgeToneClass =
    deadlineStatus?.tone === "overdue"
      ? "bg-red-50 text-red-600"
      : deadlineStatus?.tone === "soon"
      ? "bg-amber-50 text-amber-600"
      : deadlineStatus?.tone === "done"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-blue-50 text-[#007AFF]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100/80 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-[#007AFF] uppercase tracking-wider">
              {goal.category}
            </span>
            {deadlineStatus && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg inline-flex items-center gap-1 ${badgeToneClass}`}
              >
                <Calendar size={10} />
                {deadlineStatus.label}
                {goal.targetTime && !goal.completed ? ` · ${goal.targetTime}` : ""}
              </span>
            )}
          </div>
          <h3
            className={`text-lg font-semibold leading-tight ${
              goal.completed ? "text-gray-400 line-through" : "text-gray-900"
            }`}
          >
            {goal.text}
          </h3>
          {goal.description && (
            <p className="text-xs text-gray-500 leading-relaxed">
              {goal.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEditGoal(goal)}
            className="p-2 text-gray-300 hover:text-[#007AFF] transition-colors"
            aria-label="Hədəfi redaktə et"
          >
            <Pencil size={17} />
          </button>
          <button
            onClick={() => onDeleteGoal(goal.id)}
            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            aria-label="Hədəfi sil"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      {/* Steps List */}
      {totalSteps > 0 && (
        <div className="space-y-2.5 pt-1">
          {goal.steps.map((step) => {
            const stepOverdue =
              !step.completed && step.dueDate && diffDays(today, step.dueDate) < 0;
            const stepDueToday =
              !step.completed && step.dueDate && step.dueDate === today;

            return (
              <button
                key={step.id}
                onClick={() => onToggleStep(goal.id, step.id)}
                className="flex items-start gap-3 w-full text-left group p-2 -mx-2 rounded-xl hover:bg-gray-50/80 transition-colors"
              >
                {step.completed ? (
                  <CheckCircle2
                    size={20}
                    className="text-[#007AFF] shrink-0 mt-0.5"
                  />
                ) : (
                  <Circle
                    size={20}
                    className="text-gray-300 shrink-0 mt-0.5 group-hover:text-gray-400"
                  />
                )}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-medium ${
                        step.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-800"
                      }`}
                    >
                      {step.text}
                    </span>
                    {(step.dueDate || step.dueTime) && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 inline-flex items-center gap-1 ${
                          step.completed
                            ? "bg-gray-100 text-gray-400"
                            : stepOverdue
                            ? "bg-red-50 text-red-600"
                            : stepDueToday
                            ? "bg-amber-50 text-amber-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {step.dueDate ? formatShortDateAz(step.dueDate) : ""}
                        {step.dueTime ? (
                          <>
                            {step.dueDate ? " · " : ""}
                            <Clock size={9} />
                            {step.dueTime}
                          </>
                        ) : null}
                      </span>
                    )}
                  </div>
                  {step.note && (
                    <p
                      className={`text-xs leading-snug ${
                        step.completed ? "text-gray-300" : "text-gray-400"
                      }`}
                    >
                      {step.note}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Progress Section */}
      <div className="pt-2 space-y-2">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-gray-400">
              Tərəqqi
            </span>
            {totalSteps > 0 && (
              <span className="text-[11px] font-semibold text-gray-500">
                ({completedSteps}/{totalSteps} addım)
              </span>
            )}
          </div>
          <span
            className={`text-xs font-bold ${
              roundedProgress === 100 ? "text-emerald-600" : "text-gray-800"
            }`}
          >
            {roundedProgress}%
          </span>
        </div>

        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={`h-full rounded-full ${
              roundedProgress === 100 ? "bg-emerald-500" : "bg-[#007AFF]"
            }`}
          />
        </div>

        {timeElapsedPercent !== null && !goal.completed && (
          <div className="flex justify-between items-center text-[10px] text-gray-400 pt-0.5">
            <span>
              Başlanğıc: {formatShortDateAz(goal.startDate)}
            </span>
            <span>Vaxt gedişi: {timeElapsedPercent}%</span>
          </div>
        )}
      </div>

      {/* Completion Action */}
      {!goal.completed && (progress === 100 || totalSteps === 0) && (
        <button
          onClick={() => onToggleGoal(goal.id)}
          className="mt-1 w-full py-3 bg-[#007AFF] hover:bg-[#0066D6] text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Check size={16} />
          {progress === 100 ? "Hədəfi Tamamla (100%)" : "Hədəfi Tamamla"}
        </button>
      )}

      {goal.completed && (
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 size={15} />
            Hədəf 100% Tamamlandı
          </span>
          <button
            onClick={() => onToggleGoal(goal.id)}
            className="text-xs font-semibold text-gray-400 hover:text-gray-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={12} />
            Yenidən aç
          </button>
        </div>
      )}
    </motion.div>
  );
}
