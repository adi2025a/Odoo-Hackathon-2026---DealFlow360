import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Search, Filter, Plus, Calendar, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, X, Building2, User, Flag, MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TaskManagerView() {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Follow-up',
    relatedDeal: 'DEAL-1042',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTasksAndDeals();
  }, []);

  const fetchTasksAndDeals = async () => {
    try {
      setLoading(true);
      const [taskRes, dealRes] = await Promise.allSettled([
        axios.get('/api/tasks'),
        axios.get('/api/deals')
      ]);

      if (taskRes.status === 'fulfilled' && taskRes.value.data?.length > 0) {
        setTasks(taskRes.value.data);
      } else {
        setTasks(defaultTasks);
      }

      if (dealRes.status === 'fulfilled' && dealRes.value.data?.length > 0) {
        setDeals(dealRes.value.data);
      }
    } catch (err) {
      console.warn('Tasks fetch warning:', err.message);
      setTasks(defaultTasks);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/tasks', formData);
      showToast(`Task "${formData.title}" created successfully!`, 'success');
      setTasks([res.data, ...tasks]);
      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'Follow-up',
        relatedDeal: 'DEAL-1042',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
      });
    } catch (err) {
      const newTask = {
        _id: `task-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        relatedDeal: { dealNumber: 'DEAL-1042', title: 'Acme Industries - 100x Controllers' },
        priority: formData.priority,
        dueDate: formData.dueDate,
        status: 'TODO',
        createdAt: new Date().toISOString()
      };
      setTasks([newTask, ...tasks]);
      showToast(`Task "${formData.title}" added!`, 'success');
      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'Follow-up',
        relatedDeal: 'DEAL-1042',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
      });
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: nextStatus });
    } catch (err) {
      // Local optimistic update fallback
    }
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: nextStatus } : t));
    showToast(`Task marked as ${nextStatus === 'COMPLETED' ? 'Completed ✅' : 'To Do ⏳'}`, 'info');
  };

  const filteredTasks = tasks.filter(t => {
    const titleMatch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === 'ALL' || t.status === statusFilter;
    const priorityMatch = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return titleMatch && statusMatch && priorityMatch;
  });

  const dueTodayCount = tasks.filter(t => t.status !== 'COMPLETED').length;
  const highPriorityCount = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
              Sales Productivity Engine
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              {dueTodayCount} Active Tasks Pending
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-2">
            Sales Representative Task Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track client follow-ups, quotation deadlines, manager approval reminders, and deal milestones.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center inline-flex"
        >
          <Plus size={16} className="mr-1.5" /> Create New Sales Task
        </button>
      </div>

      {/* KPI Metrics Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Active Tasks</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{tasks.length}</span>
          <span className="text-xs text-blue-600 font-bold">● Assigned to Rep</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">High Priority Follow-ups</span>
          <span className="text-xl font-black text-red-600 mt-1 block">{highPriorityCount} Urgent</span>
          <span className="text-xs text-red-700 font-medium">Requires Action</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quotation Reviews</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">2 Pending</span>
          <span className="text-xs text-amber-700 font-bold">Manager & Finance Queue</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Today</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">{completedCount} Tasks</span>
          <span className="text-xs text-emerald-700 font-bold">● Closed Milestones</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 card-shadow flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title, category, or deal reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center flex-shrink-0">
            <Filter size={14} className="mr-1" /> Status:
          </span>
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {filteredTasks.map(task => {
          const isCompleted = task.status === 'COMPLETED';

          return (
            <div
              key={task._id}
              className={`bg-white border rounded-2xl p-5 card-shadow transition-all space-y-3 ${
                isCompleted ? 'border-slate-200 bg-slate-50/50 opacity-75' : 'border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleToggleTaskStatus(task._id, task.status)}
                    className={`mt-0.5 p-1 rounded-lg transition-colors ${
                      isCompleted ? 'text-emerald-600 bg-emerald-100' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 size={22} className={isCompleted ? 'fill-emerald-600 text-white' : ''} />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                        task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority || 'MEDIUM'} PRIORITY
                      </span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {task.category || 'Follow-up'}
                      </span>
                    </div>

                    <h3 className={`font-extrabold text-base ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center text-slate-500 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Calendar size={14} className="mr-1.5 text-slate-400" />
                    <span>Due: {new Date(task.dueDate || Date.now()).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => navigate('/deals/DEAL-1042')}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-all flex items-center"
                  >
                    DEAL-1042 →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE TASK */}
      {/* ---------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 card-shadow space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Create New Sales Task</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Task Title / Follow-up *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule technical demo call with Acme Industries"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Follow-up">Client Follow-up</option>
                    <option value="Quotation Review">Quotation Review</option>
                    <option value="Manager Approval">Manager Approval</option>
                    <option value="Contract Sign">Contract Signing</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HIGH">HIGH PRIORITY</option>
                    <option value="MEDIUM">MEDIUM PRIORITY</option>
                    <option value="LOW">LOW PRIORITY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const defaultTasks = [
  {
    _id: 't-1',
    title: 'Follow up with Acme Procurement on 16% discount counter offer',
    category: 'Quotation Review',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'TODO'
  },
  {
    _id: 't-2',
    title: 'Request Manager Approval for margin exception on DEAL-1042',
    category: 'Manager Approval',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    status: 'TODO'
  },
  {
    _id: 't-3',
    title: 'Send updated product spec sheets to Beta Manufacturing',
    category: 'Follow-up',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 259200000).toISOString(),
    status: 'COMPLETED'
  }
];
