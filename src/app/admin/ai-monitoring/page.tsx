'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/api';
import { useTheme } from '../../../context/ThemeContext';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Cpu,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export default function AiMonitoring() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridStroke = isDark ? '#2A2A2A' : '#E5E7EB';
  const axisStroke = isDark ? '#A0AEC0' : '#4A5568';
  const tooltipBg = isDark ? '#111111' : '#FFFFFF';
  const tooltipBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const tooltipText = isDark ? '#FFFFFF' : '#000000';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [metrics, setMetrics] = useState<any>({
    totalRequests: 0,
    atsRequests: 0,
    interviewRequests: 0,
    roadmapRequests: 0,
    questionGenRequests: 0,
    averageResponseTime: 0,
    failedRequests: 0,
    successRate: 100,
    recentLogs: []
  });

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAiMonitoring();
      setMetrics(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI telemetry.');
    } finally {
      setLoading(false);
    }
  };

  // Format logs for the chart (add readable timestamp)
  const chartData = [...(metrics.recentLogs || [])]
    .reverse()
    .map((log: any) => ({
      name: new Date(log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      responseTime: log.responseTimeMs,
      type: log.requestType,
      status: log.status
    }));

  if (loading && (!metrics.recentLogs || metrics.recentLogs.length === 0)) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">AI Engine Telemetry</h1>
          <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Track response times, API success rates, and token transaction logs from OpenAI & Gemini engines.
          </p>
        </div>

        <button
          onClick={loadMonitoringData}
          className={`px-4 py-2 border rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
            isDark ? 'bg-slate-900 border-[#2A2A2A] text-slate-300 hover:bg-slate-800' : 'bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-100'
          }`}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold ${
          isDark ? 'bg-rose-950/20 border-rose-900/30 text-rose-450' : 'bg-rose-50 border-rose-200 text-rose-600'
        }`}>
          <span>{error}</span>
        </div>
      )}

      {/* METRIC SUMMARIES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total API Calls', val: metrics.totalRequests, icon: Cpu, color: 'text-purple-500' },
          { label: 'Avg Response Time', val: `${metrics.averageResponseTime}ms`, icon: Clock, color: 'text-cyan-500' },
          { label: 'Failed Calls', val: metrics.failedRequests, icon: AlertTriangle, color: 'text-rose-500' },
          { label: 'Engine Success Rate', val: `${metrics.successRate}%`, icon: CheckCircle2, color: 'text-emerald-500' }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={index} 
              className={`border p-5 rounded-2xl transition-all hover:scale-[1.01] ${
                isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">{item.val}</h3>
                <Icon size={20} className={item.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED BY REQUEST TYPE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ATS Requests', val: metrics.atsRequests },
          { label: 'Interview Room', val: metrics.interviewRequests },
          { label: 'Roadmap Gen', val: metrics.roadmapRequests },
          { label: 'Question Bank AI', val: metrics.questionGenRequests }
        ].map((item, index) => (
          <div 
            key={index} 
            className={`border p-4 rounded-xl text-center ${
              isDark ? 'bg-slate-950/20 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
            }`}
          >
            <span className="text-[9px] font-extrabold uppercase text-slate-500 block mb-1">
              {item.label}
            </span>
            <span className="text-sm font-black">{item.val} Calls</span>
          </div>
        ))}
      </div>

      {/* TELEMETRY CHART */}
      <div className={`border p-6 rounded-2xl ${
        isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
      }`}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
          <Activity size={14} className="text-purple-500" />
          <span>Real-time Response Latency (ms)</span>
        </h3>
        
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs font-semibold text-slate-500">
            No telemetry logs captured in the database yet.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={8} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={10} tickLine={false} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: axisStroke, fontSize: 10 } }} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }} />
                <Area type="monotone" dataKey="responseTime" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#latencyColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* RECENT REQUESTS DETAILED TABLE */}
      <div className={`border rounded-2xl overflow-hidden ${
        isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
      }`}>
        <div className="p-6 border-b border-inherit">
          <h3 className="text-xs font-extrabold uppercase tracking-wider">Recent AI Requests Logs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'bg-[#111111] text-slate-400 border-[#2A2A2A]' : 'bg-slate-50 text-slate-500 border-[#E5E7EB]'}`}>
                <th className="p-4 font-extrabold uppercase tracking-wider">Timestamp</th>
                <th className="p-4 font-extrabold uppercase tracking-wider">Request Type</th>
                <th className="p-4 font-extrabold uppercase tracking-wider">Response Time</th>
                <th className="p-4 font-extrabold uppercase tracking-wider">Status</th>
                <th className="p-4 font-extrabold uppercase tracking-wider">Error Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
              {metrics.recentLogs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-550 font-semibold">
                    No recent telemetry records found.
                  </td>
                </tr>
              ) : (
                metrics.recentLogs?.map((log: any) => (
                  <tr key={log.id} className={`transition ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-4 font-bold text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase bg-purple-500/10 text-purple-400`}>
                        {log.requestType}
                      </span>
                    </td>
                    <td className="p-4 font-bold">
                      {log.responseTimeMs}ms
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1">
                        {log.status === 'SUCCESS' ? (
                          <CheckCircle2 size={12} className="text-emerald-500" />
                        ) : (
                          <XCircle size={12} className="text-rose-500" />
                        )}
                        <span className={`font-bold ${log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {log.status}
                        </span>
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-rose-450 break-all max-w-sm">
                      {log.errorMessage || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
