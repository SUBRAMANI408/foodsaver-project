import { useSelector } from 'react-redux';
import { Truck, MapPin, CheckCircle, Package } from 'lucide-react';

export default function DeliveryDashboard() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Delivery Partner Dashboard 🚚</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Deliveries', value: '2', icon: Truck, bg: 'bg-blue-50 dark:bg-blue-950/50', color: 'text-blue-500' },
          { label: 'Total Completed', value: '45', icon: CheckCircle, bg: 'bg-green-50 dark:bg-green-950/50', color: 'text-green-500' },
          { label: 'Earnings Today', value: '₹450', icon: MapPin, bg: 'bg-primary-50 dark:bg-primary-950/50', color: 'text-primary-500' },
          { label: 'Distance Covered', value: '18 km', icon: Package, bg: 'bg-purple-50 dark:bg-purple-950/50', color: 'text-purple-500' },
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
        <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No new delivery requests nearby.</p>
        <button className="btn-primary mt-4">Go Online to Receive Requests</button>
      </div>
    </div>
  );
}
