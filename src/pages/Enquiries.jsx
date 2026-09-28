import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Inbox, Search, Filter, Phone, MessageSquare, Calendar, 
  Trash2, Edit3, CheckCircle, Clock, XCircle, RefreshCw,
  Eye, AlertCircle, Sparkles, User, Tag, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { Toast, confirmModal } from '../utils/alerts';

export default function Enquiries() {
  const { token, API_URL } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('New');
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, completed: 0 });
  const [saving, setSaving] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const fetchEnquiries = async (page = currentPage) => {
    setLoading(true);
    try {
      let url = `${API_URL}/enquiries?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'All') url += `&status=${statusFilter}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.data);
        if (data.pagination) {
          setCurrentPage(data.pagination.page);
          setTotalPages(data.pagination.pages || 1);
          setTotalCount(data.pagination.total || 0);
        }
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchEnquiries(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEnquiries(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchEnquiries(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdate = async (id, newStatus, newNotes) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/enquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, notes: newNotes })
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) => prev.map((item) => (item._id === id ? data.data : item)));
        setSelectedEnquiry(null);
        fetchEnquiries(currentPage);
        Toast.fire({
          icon: 'success',
          title: 'Enquiry updated successfully'
        });
      } else {
        Toast.fire({
          icon: 'error',
          title: data.message || 'Failed to update enquiry'
        });
      }
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: 'Failed to update enquiry: ' + err.message
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const resConfirm = await confirmModal({
      title: 'Delete Enquiry Record?',
      text: 'Are you sure you want to permanently delete this enquiry record?',
      confirmButtonText: 'Yes, Delete',
      icon: 'warning'
    });

    if (!resConfirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/enquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) => prev.filter((item) => item._id !== id));
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry(null);
        }
        fetchEnquiries(currentPage);
        Toast.fire({
          icon: 'success',
          title: 'Enquiry deleted successfully'
        });
      } else {
        Toast.fire({
          icon: 'error',
          title: data.message || 'Failed to delete enquiry'
        });
      }
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: 'Failed to delete enquiry: ' + err.message
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3" /> New</span>;
      case 'Contacted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200"><Phone className="w-3 h-3" /> Contacted</span>;
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200"><RefreshCw className="w-3 h-3" /> In Progress</span>;
      case 'Completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3 h-3" /> Completed</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Total Enquiries</span>
          <div className="text-3xl font-extrabold text-[#0A1931]">{stats.total}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">New / Pending</span>
          <div className="text-3xl font-extrabold text-amber-600">{stats.new}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">Contacted</span>
          <div className="text-3xl font-extrabold text-blue-600">{stats.contacted}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">Completed</span>
          <div className="text-3xl font-extrabold text-emerald-600">{stats.completed}</div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search by client name, phone or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#0A1931] text-[#DFBF7A] rounded-xl text-xs font-bold hover:bg-[#152A4A] transition"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['All', 'New', 'Contacted', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-[#0A1931] text-[#DFBF7A] shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
          <button
            onClick={() => fetchEnquiries(currentPage)}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#0A1931] transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Enquiries Table & Detail View */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#C5A059]" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading Enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Inbox className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700">No Enquiries Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Any new quote requests submitted on the website or contact form will appear right here in real time.
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="p-4 pl-6 whitespace-nowrap">Client Name</th>
                    <th className="p-4 whitespace-nowrap">Contact Details</th>
                    <th className="p-4 whitespace-nowrap">Service Required</th>
                    <th className="p-4 whitespace-nowrap">Status</th>
                    <th className="p-4 whitespace-nowrap">Date &amp; Time</th>
                    <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enquiries.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Name */}
                      <td className="p-4 pl-6 font-bold text-[#0A1931]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full gold-gradient text-[#0A1931] font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                            {item.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 whitespace-nowrap">{item.name}</div>
                            {item.notes && <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Has Notes</span>}
                          </div>
                        </div>
                      </td>

                      {/* Phone & Direct channels */}
                      <td className="p-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="font-bold">{item.phone}</span>
                          <a
                            href={`tel:${item.phone.replace(/\s+/g, '')}`}
                            className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                            title="Direct Phone Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(item.name)},%20Thank%20you%20for%20contacting%20Noble%20Housekeeping%20Qatar.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                            title="WhatsApp Reply"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200/80 whitespace-nowrap">
                          {item.service}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Actions in one neat horizontal flex line */}
                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedEnquiry(item);
                              setEditStatus(item.status);
                              setEditNotes(item.notes || '');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#0A1931] text-[#DFBF7A] hover:bg-[#152A4A] font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View / Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 transition inline-flex items-center justify-center cursor-pointer shadow-sm"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-800">{enquiries.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * limit, totalCount)}</span> of <span className="font-bold text-slate-800">{totalCount}</span> total enquiries
              </div>

              <div className="inline-flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Detail / Edit Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-fadeIn">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059]">Enquiry Details</span>
                <h3 className="text-xl font-extrabold text-[#0A1931] mt-0.5">{selectedEnquiry.name}</h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#F8F6F0] rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 font-bold block">Phone:</span>
                <span className="text-slate-900 font-extrabold text-sm">{selectedEnquiry.phone}</span>
              </div>
              <div className="p-3.5 bg-[#F8F6F0] rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 font-bold block">Service Requested:</span>
                <span className="text-slate-900 font-extrabold text-sm">{selectedEnquiry.service}</span>
              </div>
            </div>

            {selectedEnquiry.message && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Client Message / Requirement:</span>
                <p className="text-slate-600 leading-relaxed italic">"{selectedEnquiry.message}"</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={`tel:${selectedEnquiry.phone.replace(/\s+/g, '')}`}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0A1931] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#152A4A] transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#DFBF7A]" />
                <span>Call Client</span>
              </a>
              <a
                href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedEnquiry.name)},%20Thank%20you%20for%20contacting%20Noble%20Housekeeping%20Trading%20%26%20Contracting%20Qatar.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#20ba59] transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Client</span>
              </a>
            </div>

            {/* Update Status & Notes */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Update Enquiry Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="New">New (Pending)</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Internal Coordinator Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Add notes e.g. 'Client prefers 4 hours cleaning on Fridays'..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C5A059]"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleUpdate(selectedEnquiry._id, editStatus, editNotes)}
                disabled={saving}
                className="gold-gradient text-[#0A1931] px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
