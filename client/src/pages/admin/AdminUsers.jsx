import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { Shield, Trash2, Check, X, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    adminService.getUsers({ role: 'user', search }).then((res) => {
      setUsers(res.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await adminService.toggleUser(id);
      toast.success(`User ${action}ed`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Customers Management 👥</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 w-64"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email / Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id}>
                  <td className="font-medium text-slate-900 dark:text-white">{u.name}</td>
                  <td>
                    <div className="text-sm text-slate-600 dark:text-slate-300">{u.email}</div>
                    <div className="text-xs text-slate-400">{u.phone}</div>
                  </td>
                  <td>
                    <span className={`badge text-xs ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(u._id, u.isActive ? 'suspend' : 'activate')} className="btn-ghost btn-sm text-xs">
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
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
