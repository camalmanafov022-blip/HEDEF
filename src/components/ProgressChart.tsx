import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Goal } from "../types";

interface ProgressChartProps {
  goals: Goal[];
}

export function ProgressChart({ goals }: ProgressChartProps) {
  const data = goals.map((g) => {
    const completedSteps = g.steps.filter((s) => s.completed).length;
    const percent =
      g.steps.length > 0
        ? Math.round((completedSteps / g.steps.length) * 100)
        : g.completed
        ? 100
        : 0;
    return {
      name: g.text.length > 10 ? `${g.text.slice(0, 10)}…` : g.text,
      faiz: percent,
    };
  });

  if (goals.length === 0) {
    return (
      <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm text-center space-y-2">
        <h3 className="font-bold text-gray-900">Hədəf İrəliləyişi</h3>
        <p className="text-xs text-gray-400">
          Statistika görmək üçün ən azı bir hədəf əlavə edin.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Hədəf İrəliləyişi (%)</h3>
        <span className="text-xs font-semibold text-[#007AFF]">
          {goals.filter((g) => g.completed).length}/{goals.length} tamamlandı
        </span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} unit="%" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => [`${value}%`, "Tərəqqi"]} />
            <Bar dataKey="faiz" fill="#007AFF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
