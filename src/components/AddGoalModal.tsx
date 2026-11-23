import { useState } from "react";
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  ChevronDown,
  Plus,
  Trash2,
  CalendarClock,
  AlignLeft,
} from "lucide-react";
import { Category, Goal, Step } from "../types";
import { optimizeGoalSteps } from "../services/geminiService";
import { motion, AnimatePresence } from "motion/react";
import {
  addDaysISO,
  diffDays,
  distributeDates,
  getTodayISO,
} from "../utils/dateUtils";

const CATEGORIES: { label: Category; emoji: string }[] = [
  { label: "Sağlamlıq", emoji: "💪" },
  { label: "Ruh Sağlamlığı", emoji: "🧘" },
  { label: "Maliyyə", emoji: "💰" },
  { label: "Karyera", emoji: "💼" },
  { label: "Münasibətlər", emoji: "❤️" },
  { label: "Öyrənmə", emoji: "📚" },
  { label: "Yaradıcılıq", emoji: "🎨" },
  { label: "Hobi", emoji: "🎮" },
  { label: "Fərdi İnkişaf", emoji: "🌱" },
];

interface AddGoalModalProps {
  onClose: () => void;
  onSave: (
    goal: Omit<Goal, "id" | "createdAt" | "completed">,
    existingId?: string
  ) => void;
  initialGoal?: Goal;
}

export function AddGoalModal({
  onClose,
  onSave,
  initialGoal,
}: AddGoalModalProps) {
  const today = getTodayISO();

  const [text, setText] = useState(initialGoal?.text ?? "");
  const [category, setCategory] = useState<Category>(
    initialGoal?.category ?? "Fərdi İnkişaf"
  );
  const [description, setDescription] = useState(
    initialGoal?.description ?? ""
  );
  const [startDate, setStartDate] = useState(initialGoal?.startDate ?? today);
  const [targetDate, setTargetDate] = useState(initialGoal?.targetDate ?? "");
  const [targetTime, setTargetTime] = useState(initialGoal?.targetTime ?? "");
  const [steps, setSteps] = useState<Step[]>(initialGoal?.steps ?? []);

  // Draft inputs for manually adding a new step/detail
  const [newStepText, setNewStepText] = useState("");
  const [newStepNote, setNewStepNote] = useState("");
  const [newStepDueDate, setNewStepDueDate] = useState("");
  const [newStepDueTime, setNewStepDueTime] = useState("");

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const handleQuickDuration = (days: number) => {
    const base = startDate || today;
    setTargetDate(addDaysISO(base, days));
  };

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    const step: Step = {
      id: crypto.randomUUID(),
      text: newStepText.trim(),
      note: newStepNote.trim() || undefined,
      dueDate: newStepDueDate || targetDate || undefined,
      dueTime: newStepDueTime || undefined,
      completed: false,
    };
    setSteps((prev) => [...prev, step]);
    setNewStepText("");
    setNewStepNote("");
    setNewStepDueDate("");
    setNewStepDueTime("");
  };

  const handleUpdateStep = (id: string, patch: Partial<Step>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const handleRemoveStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDistributeDates = () => {
    if (!targetDate || steps.length === 0) return;
    const base = startDate || today;
    const dates = distributeDates(base, targetDate, steps.length);
    setSteps((prev) =>
      prev.map((s, idx) => ({
        ...s,
        dueDate: dates[idx],
      }))
    );
  };

  const handleAI = async () => {
    if (!text.trim()) return;
    setIsOptimizing(true);
    setAiMessage(null);
    const suggested = await optimizeGoalSteps(
      text,
      category,
      description,
      targetDate || undefined
    );

    if (suggested && suggested.length > 0) {
      const dates = targetDate
        ? distributeDates(startDate || today, targetDate, suggested.length)
        : [];
      const generatedSteps: Step[] = suggested.map((item, idx) => ({
        id: crypto.randomUUID(),
        text: item.text,
        note: item.note,
        dueDate: dates[idx] || undefined,
        completed: false,
      }));
      setSteps((prev) => [...prev, ...generatedSteps]);
    } else {
      setAiMessage(
        "AI addımları yarada bilmədi. Aşağıdan addımları özünüz əlavə edə bilərsiniz."
      );
    }
    setIsOptimizing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    let finalSteps = [...steps];
    if (newStepText.trim()) {
      finalSteps.push({
        id: crypto.randomUUID(),
        text: newStepText.trim(),
        note: newStepNote.trim() || undefined,
        dueDate: newStepDueDate || targetDate || undefined,
        dueTime: newStepDueTime || undefined,
        completed: false,
      });
    }

    onSave(
      {
        text: text.trim(),
        category,
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        targetDate: targetDate || undefined,
        targetTime: targetTime || undefined,
        steps: finalSteps,
      },
      initialGoal?.id
    );
    onClose();
  };

  const totalDays =
    startDate && targetDate ? diffDays(startDate, targetDate) : null;
  const perStepPercent =
    steps.length > 0 ? Math.round(100 / steps.length) : 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {initialGoal ? "Hədəfi Redaktə Et" : "Yeni Hədəf Əlavə Et"}
          </h2>
          <div className="w-10" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 pb-10 overflow-y-auto no-scrollbar space-y-6"
        >
          {/* Goal Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">
              Hədəf Başlığı
            </label>
            <input
              autoFocus
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Məs: İngilis dilində B2 səviyyəsinə çatmaq"
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all text-gray-900 placeholder:text-gray-300 font-medium"
            />
          </div>

          {/* Category */}
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">
              Kateqoriya Seç
            </label>
            <button
              type="button"
              onClick={() => setShowCategories(!showCategories)}
              className="w-full p-4 bg-gray-50 rounded-2xl flex justify-between items-center text-gray-900"
            >
              <span>
                {CATEGORIES.find((c) => c.label === category)?.emoji}{" "}
                {category}
              </span>
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${
                  showCategories ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 grid grid-cols-2 gap-1 overflow-hidden"
                >
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => {
                        setCategory(c.label);
                        setShowCategories(false);
                      }}
                      className={`p-3 rounded-xl text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                        category === c.label
                          ? "bg-blue-50 text-[#007AFF] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span>{c.emoji}</span> {c.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timeframe / Dates */}
          <div className="space-y-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <Calendar size={14} className="text-[#007AFF]" />
                Hədəf Vaxtı və Müddəti
              </label>
              {totalDays !== null && totalDays >= 0 && (
                <span className="text-[11px] font-bold text-[#007AFF] bg-blue-50 px-2.5 py-1 rounded-lg">
                  {totalDays === 0 ? "Bu gün" : `${totalDays} gün`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-gray-400 ml-1">
                  Başlanğıc
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 bg-white rounded-xl border border-gray-100 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-gray-400 ml-1">
                  Son Tarix
                </span>
                <input
                  type="date"
                  value={targetDate}
                  min={startDate || undefined}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-3 bg-white rounded-xl border border-gray-100 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex gap-1.5">
                {[
                  { label: "7 gün", days: 7 },
                  { label: "14 gün", days: 14 },
                  { label: "1 ay", days: 30 },
                  { label: "3 ay", days: 90 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => handleQuickDuration(preset.days)}
                    className="flex-1 py-2 px-2 bg-white border border-gray-100 hover:border-[#007AFF]/40 hover:text-[#007AFF] rounded-xl text-[11px] font-semibold text-gray-600 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="w-28 relative">
                <input
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  title="Son saat (istəyə bağlı)"
                  className="w-full py-2 px-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                />
              </div>
            </div>
          </div>

          {/* Description / Details */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
              <AlignLeft size={13} />
              Ətraflı Məlumat və Motivasiya
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hədəfin detalları, niyə istədiyin və əsas qeydlər..."
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all text-sm text-gray-900 resize-none placeholder:text-gray-300"
            />
          </div>

          {/* Steps / Milestones Section */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block">
                  Hədəf Ayrıntıları / Addımlar ({steps.length})
                </label>
                {steps.length > 0 && (
                  <p className="text-[11px] text-gray-400 ml-1 mt-0.5">
                    Hər addım ~{perStepPercent}% tamamlayır · Sonunda 100% olur
                  </p>
                )}
              </div>

              {steps.length > 1 && targetDate && (
                <button
                  type="button"
                  onClick={handleDistributeDates}
                  className="text-[11px] font-bold text-[#007AFF] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                >
                  <CalendarClock size={13} />
                  Vaxtları Böl
                </button>
              )}
            </div>

            {/* Manual Add Step Form */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
              <input
                type="text"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
                placeholder="Addım adı (məs: 1-ci bölməni bitir)"
                className="w-full p-3 bg-white rounded-xl border border-gray-100 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-[#007AFF]/20"
              />
              <input
                type="text"
                value={newStepNote}
                onChange={(e) => setNewStepNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
                placeholder="Addım ayrıntısı / qeyd (istəyə bağlı)"
                className="w-full p-2.5 bg-white rounded-xl border border-gray-100 text-xs text-gray-700 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-[#007AFF]/20"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Calendar
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="date"
                    value={newStepDueDate}
                    min={startDate || undefined}
                    max={targetDate || undefined}
                    onChange={(e) => setNewStepDueDate(e.target.value)}
                    className="w-full pl-8 pr-2 py-2.5 bg-white rounded-xl border border-gray-100 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  />
                </div>
                <div className="relative">
                  <Clock
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="time"
                    value={newStepDueTime}
                    onChange={(e) => setNewStepDueTime(e.target.value)}
                    className="w-full pl-8 pr-2 py-2.5 bg-white rounded-xl border border-gray-100 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                disabled={!newStepText.trim()}
                className="w-full py-2.5 bg-white border border-gray-200 hover:border-[#007AFF] hover:text-[#007AFF] text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Plus size={15} />
                Addımı Siyahıya Əlavə Et
              </button>
            </div>

            {/* AI Auto-generate button */}
            <button
              type="button"
              onClick={handleAI}
              disabled={isOptimizing || !text.trim()}
              className="w-full py-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-center gap-2 text-[#007AFF] text-sm font-bold hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              <Sparkles
                size={18}
                className={isOptimizing ? "animate-pulse" : ""}
              />
              {isOptimizing
                ? "Addımlar hazırlanır..."
                : "AI ilə Ayrıntılı Addımlar Yarat"}
            </button>

            {aiMessage && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
                {aiMessage}
              </p>
            )}

            {/* Existing / Added Steps List */}
            {steps.length > 0 && (
              <div className="space-y-2.5">
                {steps.map((step, i) => (
                  <div
                    key={step.id}
                    className="p-3.5 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#007AFF] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <input
                          type="text"
                          value={step.text}
                          onChange={(e) =>
                            handleUpdateStep(step.id, { text: e.target.value })
                          }
                          className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none focus:bg-gray-50 rounded-lg px-1.5 py-0.5"
                        />
                        <input
                          type="text"
                          value={step.note ?? ""}
                          onChange={(e) =>
                            handleUpdateStep(step.id, {
                              note: e.target.value || undefined,
                            })
                          }
                          placeholder="Əlavə ayrıntı / qeyd..."
                          className="w-full text-xs text-gray-500 bg-transparent outline-none focus:bg-gray-50 rounded-lg px-1.5 py-0.5 placeholder:text-gray-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(step.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                        aria-label="Addımı sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pl-8">
                      <input
                        type="date"
                        value={step.dueDate ?? ""}
                        min={startDate || undefined}
                        max={targetDate || undefined}
                        onChange={(e) =>
                          handleUpdateStep(step.id, {
                            dueDate: e.target.value || undefined,
                          })
                        }
                        className="flex-1 py-1.5 px-2.5 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-600 outline-none"
                      />
                      <input
                        type="time"
                        value={step.dueTime ?? ""}
                        onChange={(e) =>
                          handleUpdateStep(step.id, {
                            dueTime: e.target.value || undefined,
                          })
                        }
                        className="w-24 py-1.5 px-2 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-600 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {initialGoal ? "Dəyişiklikləri Yadda Saxla" : "Hədəfi Yadda Saxla"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
