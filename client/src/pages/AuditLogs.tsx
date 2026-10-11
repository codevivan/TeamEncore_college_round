import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

export default function AuditLogsPage() {
  const { auditLogs } = usePatchworkStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch =
      searchTerm === '' ||
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.patchId && log.patchId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.projectName && log.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <DashboardLayout
      title="Audit Trail & Compliance"
      subtitle="Immutable event log recording every authentication, patch mutation, review, and deployment."
    >
      <div className="space-y-6">
        {/* Search & Filters */}
        <div className="glass-card p-4 border border-white/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by user, patch ID, action, project..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 bg-white text-xs focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-black/10 bg-white text-xs font-medium"
            >
              <option value="ALL">All Actions ({auditLogs.length})</option>
              <option value="PATCH_CREATED">PATCH_CREATED</option>
              <option value="PATCH_APPROVED">PATCH_APPROVED</option>
              <option value="DEPLOYMENT_COMPLETED">DEPLOYMENT_COMPLETED</option>
              <option value="ROLLBACK_TRIGGERED">ROLLBACK_TRIGGERED</option>
              <option value="EXTENSION_PAIRED">EXTENSION_PAIRED</option>
              <option value="GITHUB_CONNECTED">GITHUB_CONNECTED</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="glass-card border border-white/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/5 text-[#1B133C]/70 uppercase tracking-wider font-semibold border-b border-black/5">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Project / Target</th>
                  <th className="py-3 px-4">Client & IP</th>
                  <th className="py-3 px-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-[#1B133C]">No Audit Events Yet</p>
                        <p className="text-xs">Security, extension pairing, commits, and deployment events will appear here in realtime.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="py-3 px-4 text-muted-foreground font-mono">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1B133C]">
                      {log.user.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.projectName && <span className="font-medium text-[#1B133C]">{log.projectName} </span>}
                      {log.patchId && <span className="font-mono text-indigo-600 font-bold">({log.patchId})</span>}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <span>{log.userAgent}</span>
                      <span className="block font-mono text-[10px] text-muted-foreground/70">{log.ip}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> {log.result}
                      </span>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
