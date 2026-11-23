import { useState, useEffect } from "react";
import { Goal, Routine } from "./types";
import { BottomNav } from "./components/BottomNav";
import { GoalCard } from "./components/GoalCard";
import { RoutineList } from "./components/RoutineList";
import { AddGoalModal } from "./components/AddGoalModal";
import { AddRoutineModal } from "./components/AddRoutineModal";
import { ProgressChart } from "./components/ProgressChart";
import { motion, AnimatePresence } from "motion/react";
import { Plus, TrendingUp, Target, Trash2, CheckCircle2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [goalFilter, setGoalFilter] = useState<"active" | "completed">("active");
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem("goals_v2");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const saved = localStorage.getItem("routines_v2");
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback to defaults
    }
    return [
      {
        id: "1",
        title: "İdman et",
        category: "Sağlamlıq",
        days: [1, 2, 3, 4, 5],
        completedDates: [],
      },
      {
        id: "2",
        title: "Kitab oxu",
        category: "Öyrənmə",
        days: [0, 1, 2, 3, 4, 5, 6],
        completedDates: [],
      },
    ];
  });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [confirmClearCompleted, setConfirmClearCompleted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("goals_v2", JSON.stringify(goals));
    } catch {
      // Ignore storage quota errors
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem("routines_v2", JSON.stringify(routines));
    } catch {
      // Ignore storage quota errors
    }
  }, [routines]);

  const saveGoal = (
    goalData: Omit<Goal, "id" | "createdAt" | "completed">,
    existingId?: string
  ) => {
    if (existingId) {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== existingId) return g;
          const allStepsDone =
            goalData.steps.length > 0 &&
            goalData.steps.every((s) => s.completed);
          return {
            ...g,
            ...goalData,
            completed: goalData.steps.length > 0 ? g.completed && allStepsDone : g.completed,
          };
        })
      );
      setEditingGoal(undefined);
      return;
    }

    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      completed: false,
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const nextCompleted = !g.completed;
        return {
          ...g,
          completed: nextCompleted,
          steps: nextCompleted
            ? g.steps.map((s) => ({ ...s, completed: true }))
            : g.steps,
        };
      })
    );
  };

  const toggleStep = (goalId: string, stepId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updatedSteps = g.steps.map((s) =>
          s.id === stepId ? { ...s, completed: !s.completed } : s
        );
        const allDone =
          updatedSteps.length > 0 && updatedSteps.every((s) => s.completed);
        return {
          ...g,
          steps: updatedSteps,
          completed: allDone ? g.completed : false,
        };
      })
    );
  };

  const deleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const toggleRoutine = (id: string, date: string) => {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              completedDates: r.completedDates.includes(date)
                ? r.completedDates.filter((d) => d !== date)
                : [...r.completedDates, date],
            }
          : r
      )
    );
  };

  const addRoutine = (routineData: Omit<Routine, "id" | "completedDates">) => {
    setRoutines((prev) => [
      ...prev,
      { ...routineData, id: crypto.randomUUID(), completedDates: [] },
    ]);
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const filteredGoals = goalFilter === "active" ? activeGoals : completedGoals;

  return (
    <div className="max-w-md mx-auto min-h-screen pb-32">
      <AnimatePresence mode="wait">
        {activeTab === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-6 space-y-8"
          >
            <header className="flex justify-between items-center pt-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  Axşamınız xeyir, <br />
                  Camal Manafov
                </h1>
                <p className="text-sm text-gray-400 font-medium tracking-wide">
                  Bu gün necə keçir?
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-[#007AFF] rounded-2xl flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                CM
              </div>
            </header>

            <div className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#007AFF] text-white rounded-full flex items-center justify-center shrink-0">
                <TrendingUp size={24} />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-bold text-gray-900">
                  Həftəlik xülasə
                </h4>
                <p className="text-[11px] text-gray-400 font-medium">
                  {activeGoals.length} aktiv hədəf · {completedGoals.length}{" "}
                  tamamlanmış hədəf
                </p>
              </div>
            </div>

            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Hədəflərin</h2>
                <button
                  onClick={() => setActiveTab("hədəflər")}
                  className="text-xs font-bold text-[#007AFF] uppercase tracking-wider"
                >
                  Hamısı
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="bg-white p-8 rounded-[32px] border border-gray-50 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                    <Target size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900">
                      Hələlik hədəf yoxdur
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-[200px] mx-auto">
                      İlk hədəfini yaradın və ilini daha planlı, fokuslu hala
                      gətirin.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingGoal(undefined);
                      setShowAddGoal(true);
                    }}
                    className="w-full py-4 bg-[#007AFF] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-50"
                  >
                    Hədəf Yaradın
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeGoals.length > 0 ? activeGoals : goals)
                    .slice(0, 2)
                    .map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onToggleGoal={toggleGoal}
                        onToggleStep={toggleStep}
                        onDeleteGoal={deleteGoal}
                        onEditGoal={(g) => {
                          setEditingGoal(g);
                          setShowAddGoal(true);
                        }}
                      />
                    ))}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {activeTab === "hədəflər" && (
          <motion.div
            key="hədəflər"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 space-y-8"
          >
            <header className="flex justify-between items-center pt-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-900">Hədəflərim</h1>
                <p className="text-sm text-gray-400 font-medium">
                  Uğur yolçuluğun
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingGoal(undefined);
                  setShowAddGoal(true);
                }}
                className="p-3 bg-[#007AFF] rounded-2xl text-white shadow-sm shadow-blue-100 active:scale-95 transition-transform"
                aria-label="Yeni hədəf"
              >
                <Plus size={22} />
              </button>
            </header>

            <div className="flex gap-2 p-1 bg-gray-100/80 rounded-2xl">
              <button
                onClick={() => setGoalFilter("active")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  goalFilter === "active"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                Aktiv ({activeGoals.length})
              </button>
              <button
                onClick={() => setGoalFilter("completed")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  goalFilter === "completed"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                Tamamlanan ({completedGoals.length})
              </button>
            </div>

            <div className="space-y-4">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggleGoal={toggleGoal}
                  onToggleStep={toggleStep}
                  onDeleteGoal={deleteGoal}
                  onEditGoal={(g) => {
                    setEditingGoal(g);
                    setShowAddGoal(true);
                  }}
                />
              ))}

              {filteredGoals.length === 0 && (
                <div className="py-16 text-center space-y-4">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#007AFF]">
                    {goalFilter === "active" ? (
                      <Target size={36} />
                    ) : (
                      <CheckCircle2 size={36} />
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {goalFilter === "active"
                      ? "Aktiv hədəf yoxdur"
                      : "Hələ tamamlanmış hədəf yoxdur"}
                  </h2>
                  <p className="text-sm text-gray-400 max-w-[240px] mx-auto">
                    {goalFilter === "active"
                      ? "Yeni bir hədəf əlavə edərək uğur yolçuluğuna başla."
                      : "Hədəflərin bütün addımlarını 100% tamamlayanda burada görünəcək."}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setEditingGoal(undefined);
                setShowAddGoal(true);
              }}
              className="fixed bottom-24 right-6 w-14 h-14 bg-[#007AFF] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 active:scale-90 transition-transform z-40"
            >
              <Plus size={32} />
            </button>
          </motion.div>
        )}

        {activeTab === "rutinlər" && (
          <motion.div
            key="rutinlər"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 space-y-8"
          >
            <header className="flex justify-between items-center pt-4">
              <h1 className="text-3xl font-bold text-gray-900">Rutinlərim</h1>
            </header>
            <RoutineList
              routines={routines}
              onToggleRoutine={toggleRoutine}
              onDeleteRoutine={deleteRoutine}
            />
            <button
              onClick={() => setShowAddRoutine(true)}
              className="w-full py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-[#007AFF] hover:text-[#007AFF] transition-colors"
            >
              + Yeni Rutin Əlavə Et
            </button>
          </motion.div>
        )}

        {activeTab === "hesabatlar" && (
          <motion.div
            key="hesabatlar"
            className="p-6 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="text-3xl font-bold pt-4">Raporlar</h1>
            <ProgressChart goals={goals} />
          </motion.div>
        )}

        {activeTab === "ayarlar" && (
          <motion.div
            key="ayarlar"
            className="p-6 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="text-3xl font-bold pt-4">Ayarlar</h1>
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 text-[#007AFF] rounded-2xl flex items-center justify-center font-bold">
                  CM
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Camal Manafov</h3>
                  <p className="text-xs text-gray-400">
                    {goals.length} hədəf · {routines.length} rutin
                  </p>
                </div>
              </div>
            </div>

            {completedGoals.length > 0 && (
              <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-gray-900">
                  Tamamlanan Hədəfləri Təmizlə
                </h4>
                <p className="text-xs text-gray-400">
                  Tamamlanmış {completedGoals.length} hədəfi siyahıdan silə
                  bilərsiniz.
                </p>
                {!confirmClearCompleted ? (
                  <button
                    onClick={() => setConfirmClearCompleted(true)}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Tamamlananları Sil
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmClearCompleted(false)}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold"
                    >
                      Ləğv et
                    </button>
                    <button
                      onClick={() => {
                        setGoals((prev) => prev.filter((g) => !g.completed));
                        setConfirmClearCompleted(false);
                      }}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold"
                    >
                      Təsdiqlə
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence>
        {showAddGoal && (
          <AddGoalModal
            initialGoal={editingGoal}
            onClose={() => {
              setShowAddGoal(false);
              setEditingGoal(undefined);
            }}
            onSave={saveGoal}
          />
        )}
        {showAddRoutine && (
          <AddRoutineModal
            onClose={() => setShowAddRoutine(false)}
            onAdd={addRoutine}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
