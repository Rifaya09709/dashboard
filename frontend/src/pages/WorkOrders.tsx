import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, X, Mail } from 'lucide-react';
import Badge from '../components/Badge';
import {
  fetchWorkOrders, createWorkOrder, updateWorkOrder,
  deleteWorkOrder, WorkOrder
} from '../api';
import { CATEGORIES, STATUS_OPTIONS, PRIORITY_OPTIONS, STATUS_COLORS, PRIORITY_COLORS } from '../constants';

const MONTHS = [
  'Jan-25','Feb-25','Mar-25','Apr-25','May-25','Jun-25',
  'Jul-25','Aug-25','Sep-25','Oct-25','Nov-25','Dec-25',
  'Jan-26','Feb-26','Mar-26','Apr-26','May-26','Jun-26'
];

const emptyForm = {
  title: '', category: 'AV', status: 'open' as 'open' | 'in-progress' | 'closed',
  priority: 'medium' as 'low' | 'medium' | 'high',
  assignedTo: '', location: '', description: '',
  month: 'Jun-26',
  customerName: '',   // ✅ new
  customerEmail: '',  // ✅ new
  dueDate: '',        // ✅ new
};

const InlineModal: React.FC<{ open: boolean; title: string; onClose: () => void; children: React.ReactNode }> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity:0; transform:translateY(40px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes overlayFade {
          from { opacity:0; }
          to   { opacity:1; }
        }
        .modal-overlay {
          position:fixed; inset:0; z-index:9999;
          display:flex; align-items:center; justify-content:center; padding:16px;
          animation: overlayFade 0.2s ease;
        }
        .modal-overlay::before {
          content:''; position:absolute; inset:0;
          background: rgba(8,12,28,0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .modal-card {
          position:relative; z-index:1;
          width:100%; max-width:560px; max-height:90vh; overflow-y:auto;
          background:#ffffff; border-radius:24px;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.15), 0 32px 80px rgba(0,0,0,0.4);
          animation: modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .modal-header {
          display:flex; align-items:center; justify-content:space-between;
          padding:20px 24px;
          background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%);
          border-radius:24px 24px 0 0;
          position:relative; overflow:hidden;
        }
        .modal-header::after {
          content:''; position:absolute; top:-40px; right:-40px;
          width:120px; height:120px;
          background:rgba(255,255,255,0.06); border-radius:50%;
        }
        .modal-close-btn {
          background:rgba(255,255,255,0.15);
          border:1px solid rgba(255,255,255,0.2);
          border-radius:8px; cursor:pointer; color:#fff;
          padding:6px; display:flex; align-items:center;
          transition:background 0.2s; position:relative; z-index:1;
        }
        .modal-close-btn:hover { background:rgba(255,255,255,0.25); }
      `}</style>

      <div className="modal-overlay"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-card">
          <div className="modal-header">
            <div style={{ position:'relative', zIndex:1 }}>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'11px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' as const, margin:'0 0 4px' }}>
                Facilities Management
              </p>
              <h3 style={{ fontSize:'18px', fontWeight:700, color:'#ffffff', margin:0 }}>
                {title}
              </h3>
            </div>
            <button type="button" className="modal-close-btn" onClick={onClose}>
              <X size={18}/>
            </button>
          </div>
          <div style={{ padding:'24px' }}>{children}</div>
        </div>
      </div>
    </>
  );
};

const WorkOrders: React.FC = () => {
  const [orders, setOrders]           = useState<WorkOrder[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage]               = useState(1);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<WorkOrder | null>(null);
  const [form, setForm]               = useState({ ...emptyForm });
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState('');
  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (filterStatus)   params.status   = filterStatus;
      if (filterCategory) params.category = filterCategory;
      const res = await fetchWorkOrders(params);
      setOrders(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterCategory]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setSaveError(''); setModalOpen(true); };
  const openEdit   = (o: WorkOrder) => {
    setEditing(o);
    setForm({
      title: o.title, category: o.category, status: o.status, priority: o.priority,
      assignedTo: o.assignedTo || '', location: o.location || '', description: o.description || '',
      month: o.month,
      customerName:  (o as any).customerName  || '',
      customerEmail: (o as any).customerEmail || '',
      dueDate:       (o as any).dueDate ? new Date((o as any).dueDate).toISOString().split('T')[0] : '',
    });
    setSaveError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaveError('');
    if (!form.title.trim()) { setSaveError('Title is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || undefined };
      if (editing) await updateWorkOrder(editing._id, payload);
      else         await createWorkOrder(payload);
      setModalOpen(false);
      setForm({ ...emptyForm });
      await load();
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteWorkOrder(deleteId); setDeleteId(null); await load(); }
    catch (err) { console.error(err); }
  };

  const filtered = orders.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  const inp: React.CSSProperties = {
    width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px',
    padding:'8px 12px', fontSize:'14px', outline:'none',
    fontFamily:'inherit', boxSizing:'border-box' as const,
  };
  const lbl: React.CSSProperties = {
    display:'block', fontSize:'12px', fontWeight:600, color:'#64748B', marginBottom:'6px',
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Work Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total records</p>
        </div>
        <button type="button" onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16}/> New Work Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 w-48"/>
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Title','Category','Status','Priority','Customer','Due Date','Month','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">No work orders found. Click "+ New Work Order" to create one.</td></tr>
                  ) : filtered.map(o => (
                    <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 max-w-[160px] truncate">{o.title}</td>
                      <td className="px-4 py-3 text-slate-600">{o.category}</td>
                      <td className="px-4 py-3"><Badge label={o.status} className={STATUS_COLORS[o.status]}/></td>
                      <td className="px-4 py-3"><Badge label={o.priority} className={PRIORITY_COLORS[o.priority]}/></td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-slate-700 text-xs font-medium">{(o as any).customerName || '-'}</p>
                          {(o as any).customerEmail && (
                            <p className="text-blue-500 text-xs flex items-center gap-1">
                              <Mail size={10}/> {(o as any).customerEmail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {(o as any).dueDate ? (
                          <span className={`font-semibold ${new Date((o as any).dueDate) < new Date() ? 'text-red-500' : 'text-amber-600'}`}>
                            {new Date((o as any).dueDate).toLocaleDateString('en-GB')}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{o.month}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => openEdit(o)} className="text-blue-500 hover:text-blue-700"><Pencil size={15}/></button>
                          <button type="button" onClick={() => setDeleteId(o._id)} className="text-red-400 hover:text-red-600"><Trash2 size={15}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">Page {page} of {Math.max(totalPages,1)}</span>
              <div className="flex gap-2">
                <button type="button" disabled={page===1} onClick={() => setPage(p=>p-1)}
                  className="px-3 py-1 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Prev</button>
                <button type="button" disabled={page>=totalPages} onClick={() => setPage(p=>p+1)}
                  className="px-3 py-1 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <InlineModal open={modalOpen} title={editing ? 'Edit Work Order' : 'New Work Order'} onClose={() => { setModalOpen(false); setSaveError(''); }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

          {saveError && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'8px', padding:'10px 14px', color:'#DC2626', fontSize:'13px' }}>
              {saveError}
            </div>
          )}

          {/* Title */}
          <div>
            <label style={lbl}>Title <span style={{color:'#EF4444'}}>*</span></label>
            <input type="text" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Enter work order title" style={inp}/>
          </div>

          {/* Customer Name + Email */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={lbl}>Customer Name</label>
              <input type="text" value={form.customerName} onChange={e => setForm(f=>({...f,customerName:e.target.value}))} placeholder="Customer name" style={inp}/>
            </div>
            <div>
              <label style={lbl}><Mail size={11} style={{display:'inline',marginRight:'4px'}}/>Customer Email</label>
              <input type="email" value={form.customerEmail} onChange={e => setForm(f=>({...f,customerEmail:e.target.value}))} placeholder="email@example.com" style={inp}/>
            </div>
          </div>

          {/* Assigned To + Location */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={lbl}>Assigned To</label>
              <input type="text" value={form.assignedTo} onChange={e => setForm(f=>({...f,assignedTo:e.target.value}))} placeholder="Assignee name" style={inp}/>
            </div>
            <div>
              <label style={lbl}>Location</label>
              <input type="text" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} placeholder="Location" style={inp}/>
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={lbl}>Category</label>
            <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} style={inp}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Status + Priority */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={lbl}>Status</label>
              <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value as typeof form.status}))} style={inp}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value as typeof form.priority}))} style={inp}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Month + Due Date */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={lbl}>Month</label>
              <select value={form.month} onChange={e => setForm(f=>({...f,month:e.target.value}))} style={inp}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} style={inp}/>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={lbl}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
              placeholder="Enter description" rows={3} style={{...inp,resize:'none'}}/>
          </div>

          {/* Email note */}
          <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#1D4ED8' }}>
            📧 <strong>Auto Email:</strong> Customer will receive email when status changes to <strong>Closed</strong>, and reminder before due date.
          </div>

          {/* Buttons */}
          <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', paddingTop:'8px' }}>
            <button type="button" onClick={() => { setModalOpen(false); setSaveError(''); }}
              style={{ padding:'8px 20px', fontSize:'14px', borderRadius:'10px', border:'1px solid #E2E8F0', background:'#fff', color:'#64748B', cursor:'pointer', fontWeight:500 }}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              style={{ padding:'8px 20px', fontSize:'14px', borderRadius:'10px', border:'none', background:saving?'#93C5FD':'#2563EB', color:'#fff', cursor:saving?'not-allowed':'pointer', fontWeight:600 }}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </InlineModal>

      {/* Delete Modal */}
      <InlineModal open={!!deleteId} title="Confirm Delete" onClose={() => setDeleteId(null)}>
        <p style={{ color:'#64748B', fontSize:'14px', marginBottom:'24px' }}>Are you sure you want to delete this work order?</p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
          <button type="button" onClick={() => setDeleteId(null)}
            style={{ padding:'8px 20px', fontSize:'14px', borderRadius:'10px', border:'1px solid #E2E8F0', background:'#fff', color:'#64748B', cursor:'pointer' }}>Cancel</button>
          <button type="button" onClick={handleDelete}
            style={{ padding:'8px 20px', fontSize:'14px', borderRadius:'10px', border:'none', background:'#EF4444', color:'#fff', cursor:'pointer', fontWeight:600 }}>Delete</button>
        </div>
      </InlineModal>
    </div>
  );
};

export default WorkOrders;