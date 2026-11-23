
import { useState } from "react";
import { X } from "lucide-react";
import { Category, Routine } from "../types";
import { motion } from "motion/react";

interface AddRoutineModalProps {
  onClose: () => void;
  onAdd: (routine: Omit<Routine, 'id' | 'completedDates'>) => void;
}

const CATEGORIES: { label: Category; emoji: string }[] = [
  { label: 'Sağlamlıq', emoji: '💪' },
  { label: 'Ruh Sağlamlığı', emoji: '🧘' },
  { label: 'Maliyyə', emoji: '💰' },
  { label: 'Karyera', emoji: '💼' },
  { label: 'Münasibətlər', emoji: '❤️' },
  { label: 'Öyrənmə', emoji: '📚' },
  { label: 'Yaradıcılıq', emoji: '🎨' },
  { label: 'Hobi', emoji: '🎮' },
  { label: 'Fərdi İnkişaf', emoji: '🌱' },
];

export function AddRoutineModal({ onClose, onAdd }: AddRoutineModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>('Fərdi İnkişaf');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, category, days });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-lg rounded-[32px] p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Yeni Rutin</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="Rutin başlığı" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl" />
            <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full p-4 bg-gray-50 rounded-2xl">
                {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.emoji} {c.label}</option>)}
            </select>
            <button type="submit" className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold">Yadda Saxla</button>
        </form>
      </motion.div>
    </motion.div>
  );
}
