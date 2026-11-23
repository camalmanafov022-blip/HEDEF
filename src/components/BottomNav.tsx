import { Home, Target, Repeat, BarChart3, Settings } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'rutinlər', icon: Repeat, label: 'Rutinlər' },
  { id: 'hədəflər', icon: Target, label: 'Hədəflər' },
  { id: 'home', icon: Home, label: 'Ana Səhifə' },
  { id: 'hesabatlar', icon: BarChart3, label: 'Raporlar' },
  { id: 'ayarlar', icon: Settings, label: 'Ayarlar' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center px-4 py-2 pb-6 safe-area-inset-bottom z-50">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === id ? "text-[#007AFF]" : "text-gray-400"
          }`}
        >
          <div className={`p-2 rounded-2xl ${activeTab === id ? "bg-[#E6F2FF]" : ""}`}>
            <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-medium leading-none">{label}</span>
        </button>
      ))}
    </nav>
  );
}
