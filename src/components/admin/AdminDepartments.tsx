import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, BookOpen, CheckCircle2, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Department } from '../../types';

export const AdminDepartments: React.FC = () => {
  const { triggerToast } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  
  // New Department Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [hod, setHod] = useState('');
  const [color, setColor] = useState('#15803d');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getDepartments();
        setDepartments(list);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setIsSaving(true);
    try {
      const newDept = await api.createDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        headOfDepartment: hod.trim() || 'TBD',
        color
      });

      setDepartments(prev => [...prev, newDept]);
      setModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
      setHod('');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#15803d', '#eab308']
      });

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '🏛️ Department Provisioned',
        message: `${newDept.name} (${newDept.code}) added to institutional charter.`,
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'high'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Curriculum Governance
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Triple 4C Institutional Structure
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Academic Departments
          </h1>
          <p className="text-xs text-neutral-500">
            Manage academic divisions, Heads of Department (HODs), student quotas, and faculty load
          </p>
        </div>

        <button
          id="btn-create-department"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-yellow-300 text-xs font-black shadow-sm flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => (
          <div 
            key={dept.id}
            className="bg-white rounded-3xl p-6 border border-emerald-950/10 hover:border-emerald-500 shadow-xs transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="font-mono font-bold text-xs px-3 py-1 rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: dept.color }}
                >
                  {dept.code}
                </span>
                <span className="text-xs font-bold text-neutral-500">
                  {dept.studentCount} Scholars
                </span>
              </div>

              <h3 className="text-base font-black text-neutral-900">
                {dept.name}
              </h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                {dept.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <span>Head of Department:</span>
                <span className="font-bold text-neutral-900">{dept.headOfDepartment}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Faculty Members:</span>
                <span className="font-bold text-emerald-800">{dept.facultyCount} Lecturers</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Provision Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-neutral-900">
                Provision New Academic Department
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 444-AI"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Brand Color
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-9 rounded-xl border border-neutral-300 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Department of Quantum Computing & Cryptography"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Head of Department (HOD)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Thabo Maseko"
                  value={hod}
                  onChange={(e) => setHod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Scope & Curriculum Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe core focus and learning outcomes under 444 Curriculum..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden"
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
                  {isSaving ? 'Creating...' : 'Provision Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
