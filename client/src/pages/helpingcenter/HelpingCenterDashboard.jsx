import { useSelector } from 'react-redux';
import { Heart, Gift, Users, ArrowDownCircle } from 'lucide-react';

export default function HelpingCenterDashboard() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Helping Center Dashboard 🤝</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Donations Received', value: '1,250 kg', icon: Gift, bg: 'bg-pink-50 dark:bg-pink-950/50', color: 'text-pink-500' },
          { label: 'People Fed', value: '3,500+', icon: Users, bg: 'bg-blue-50 dark:bg-blue-950/50', color: 'text-blue-500' },
          { label: 'Active Pickups', value: '3', icon: ArrowDownCircle, bg: 'bg-orange-50 dark:bg-orange-950/50', color: 'text-orange-500' },
          { label: 'Partner Merchants', value: '12', icon: Heart, bg: 'bg-primary-50 dark:bg-primary-950/50', color: 'text-primary-500' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 text-center text-slate-500">
        <Heart className="w-12 h-12 mx-auto mb-3 opacity-30 text-pink-500" />
        <p>You have no pending donation pickups.</p>
        <p className="text-sm mt-2">When merchants donate unsold food, you will be notified here.</p>
      </div>
    </div>
  );
}
