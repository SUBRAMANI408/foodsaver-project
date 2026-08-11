import React, { useState } from 'react';
import { MessageSquare, Search, Filter, AlertCircle, CheckCircle2, MoreVertical, ShieldAlert } from 'lucide-react';

export default function AdminComplaints() {
  // Mock data since Complaint model is not yet implemented in backend
  const [complaints, setComplaints] = useState([
    { id: 1, user: 'Alex Johnson', type: 'Quality Issue', merchant: 'Downtown Bakery', status: 'pending', date: '2023-11-10T14:30:00Z', desc: 'The bread was completely stale and hard as a rock.' },
    { id: 2, user: 'Maria Garcia', type: 'Merchant Behavior', merchant: 'Spice Route', status: 'investigating', date: '2023-11-09T09:15:00Z', desc: 'Merchant refused to hand over the food despite me showing the valid token.' },
    { id: 3, user: 'David Kim', type: 'App Issue', merchant: null, status: 'resolved', date: '2023-11-08T18:45:00Z', desc: 'Could not mark the order as picked up, the button was grayed out.' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-500" /> Complaints Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and resolve user complaints and reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-purple-500">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{complaints.length}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Total Complaints</p>
        </div>
        <div className="card p-5 border-l-4 border-l-red-500">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{complaints.filter(c => c.status === 'pending').length}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Pending Review</p>
        </div>
        <div className="card p-5 border-l-4 border-l-orange-500">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{complaints.filter(c => c.status === 'investigating').length}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Under Investigation</p>
        </div>
        <div className="card p-5 border-l-4 border-l-green-500">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{complaints.filter(c => c.status === 'resolved').length}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Resolved</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-dark-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search complaints..." className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button className="p-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-dark-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Reporter / Date</th>
                <th className="px-6 py-4 font-medium">Issue Category</th>
                <th className="px-6 py-4 font-medium">Complaint Details</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{complaint.user}</div>
                    <div className="text-slate-500 text-xs">{new Date(complaint.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300 font-medium text-xs">
                      {complaint.type}
                    </span>
                    {complaint.merchant && (
                      <div className="text-xs text-slate-500 mt-1">Against: {complaint.merchant}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-slate-600 dark:text-slate-400 truncate" title={complaint.desc}>{complaint.desc}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${complaint.status === 'pending' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        complaint.status === 'investigating' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {complaint.status === 'pending' && <AlertCircle className="w-3.5 h-3.5" />}
                      {complaint.status === 'investigating' && <ShieldAlert className="w-3.5 h-3.5" />}
                      {complaint.status === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span className="capitalize">{complaint.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
