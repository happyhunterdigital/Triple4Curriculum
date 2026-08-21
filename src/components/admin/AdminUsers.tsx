import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Shield, CheckCircle2, Search, Mail, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { User, UserRole, Department } from '../../types';

export const AdminUsers: React.FC = () => {
  const { triggerToast } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [departmentId, setDepartmentId] = useState('dept_cs');
  const [studentOrEmployeeId, setStudentOrEmployeeId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [uList, dList] = await Promise.all([
          api.getUsers(),
          api.getDepartments()
        ]);
        setUsers(uList);
        setDepartments(dList);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSaving(true);
    const selectedDept = departments.find(d => d.id === departmentId);

    try {
      const newUser = await api.createUser({
        name: name.trim(),
        email: email.trim(),
        role,
        departmentId,
        departmentName: selectedDept?.name || 'Computer Science',
        ...(role === 'student' ? { studentId: studentOrEmployeeId || `444-STU-${Math.floor(1000 + Math.random() * 9000)}` } : {}),
        ...(role === 'lecturer' ? { employeeId: studentOrEmployeeId || `444-FAC-${Math.floor(100 + Math.random() * 900)}` } : {})
      });

      setUsers(prev => [newUser, ...prev]);
      setModalOpen(false);
      setName('');
      setEmail('');
      setStudentOrEmployeeId('');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#15803d', '#eab308']
      });

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '👤 Account Provisioned',
        message: `${newUser.name} created as ${newUser.role.toUpperCase()} in ${newUser.departmentName}.`,
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'normal'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              RBAC & Identity Governance
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Role-Based Access Control
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Create an Account & User Directory
          </h1>
          <p className="text-xs text-neutral-500">
            Provision faculty lecturers, students, and system administrators with granular POPIA permissions
          </p>
        </div>

        <button
          id="btn-open-create-user"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-yellow-300 text-xs font-black shadow-sm flex items-center gap-2 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <span className="text-xs font-bold text-neutral-500">
            Total Provisioned Accounts: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Academic ID</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-neutral-50/80 transition">
                  <td className="py-3 font-bold text-neutral-900">{user.name}</td>
                  <td className="py-3 font-mono text-neutral-600">{user.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      user.role === 'admin' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                      user.role === 'lecturer' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      'bg-yellow-100 text-yellow-900 border border-yellow-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 text-neutral-700">{user.departmentName || 'Computer Science'}</td>
                  <td className="py-3 font-mono text-neutral-500 text-[11px]">
                    {user.studentId || user.employeeId || '444-SYS-001'}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-neutral-900">
                Create an Account (RBAC Provisioning)
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Lesedi Khanyile"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. l.khanyile@triple4c.ac.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Faculty Lecturer</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Institutional Identification Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 444-STU-9912 or 444-FAC-201"
                  value={studentOrEmployeeId}
                  onChange={(e) => setStudentOrEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] font-mono focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black text-xs shadow-md transition"
                >
                  {isSaving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
