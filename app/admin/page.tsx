'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton';
import { api } from '@/lib/supabase';
import {
  import {
  STAGES,
  type Candidate,
  type Application,
  type Offer,
} from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  cn,
  STAGE_LABELS,
  STAGE_COLORS,
} from '@/lib/utils';
import {
  Users,
  TrendingUp,
  Headphones,
  DollarSign,
  Search,
  Download,
  ExternalLink,
  Phone,
  LogOut,
  Lock,
  Home,
} from 'lucide-react';

const ADMIN_PASSWORD = 'genesis2026';
const AUTH_KEY = 'xg_admin_auth';

type ApplicationWithDetails = Application & {
  candidates: Candidate;
  offers: Offer & { companies: { name: string; recruiter_commission: number } };
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved === ADMIN_PASSWORD) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    api
      .getApplications()
      .then((data) => {
        if (!cancelled) setApplications(data as any);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authed]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, ADMIN_PASSWORD);
      setAuthed(true);
      setAuthError('');
    } else {
      setAuthError('كلمة السر غلط');
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPassword('');
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (stageFilter !== 'all' && a.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        a.candidates?.triple_name?.toLowerCase().includes(q) ||
        a.candidates?.phone?.includes(q)
      );
    });
  }, [applications, search, stageFilter]);

  const stats = useMemo(() => {
    const totalCommission = filtered.reduce(
      (sum, a) =>
        a.stage === 'hired'
          ? sum + (a.offers?.companies?.recruiter_commission || 0)
          : sum,
      0
    );
    return {
      total: applications.length,
      hired: applications.filter((a) => a.stage === 'hired').length,
      interview: applications.filter((a) => a.stage === 'interview').length,
      screening: applications.filter((a) => a.stage === 'screening').length,
      new: applications.filter((a) => a.stage === 'new').length,
      totalCommission,
    };
  }, [applications, filtered]);

  const updateStage = async (id: string, stage: string) => {
    try {
      await api.updateApplicationStage(id, stage);
      setApplications((apps) =>
        apps.map((a) => (a.id === id ? { ...a, stage: stage as any } : a))
      );
    } catch (e) {
      alert('فشل التحديث: ' + (e as Error).message);
    }
  };

  const exportCSV = () => {
    const rows = filtered.map((a) => ({
      الاسم: a.candidates?.triple_name || '',
      الموبايل: a.candidates?.phone || '',
      العمر: a.candidates?.age || '',
      اللغة: `${a.candidates?.language || ''} ${a.candidates?.language_level || ''}`,
      الوظيفة: `${a.offers?.companies?.name || ''} - ${a.offers?.account_name || ''}`,
      المرحلة: STAGE_LABELS[a.stage] || a.stage,
      'تاريخ التقديم': formatDate(a.created_at),
    }));
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => `"${(r as any)[h] || ''}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `x-genesis-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight-950 p-6">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-500/10">
                <Lock className="h-6 w-6 text-gold-400" />
              </div>
              <h1 className="text-xl font-bold text-zinc-100">Admin Access</h1>
              <p className="mt-1 text-xs text-zinc-500">
                X-Genesis Control Panel
              </p>
            </div>
            <form onSubmit={login} className="space-y-4">
              <Input
                type="password"
                label="كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={authError}
              />
              <Button size="lg" className="w-full" type="submit">
                دخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-midnight-950" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-midnight-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-gold-400 to-gold-600 font-bold text-midnight-950">
              X
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">
                X-Genesis Admin
              </div>
              <div className="text-[11px] text-zinc-500">Control Panel</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/">
                <Home className="h-4 w-4" />
                <span>الرئيسية</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 grid gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.06] md:grid-cols-5">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="إجمالي التقديمات"
            value={stats.total.toString()}
            sub="تقديم"
          />
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="جديد"
            value={stats.new.toString()}
            sub="مرشح"
          />
          <StatCard
            icon={<Headphones className="h-4 w-4" />}
            label="في الإنترفيو"
            value={stats.interview.toString()}
            sub="مرشح"
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="تم التوظيف"
            value={stats.hired.toString()}
            sub="مرشح"
            accent
          />
          <StatCard
            icon={<DollarSign className="h-4 w-4" />}
            label="العمولات المؤكدة"
            value={formatCurrency(stats.totalCommission)}
            sub="EGP"
            accent
          />
        </section>

        <section className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الموبايل..."
              className="w-full rounded-md border border-white/10 bg-midnight-900 py-2 pl-3 pr-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-gold-500/40 focus:outline-none focus:ring-2 focus:ring-gold-500/10"
            />
          </div>
          <Select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            options={[
              { value: 'all', label: 'كل المراحل' },
              ...STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s] })),
            ]}
            className="w-40"
          />
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4" />
            <span>تصدير CSV</span>
          </Button>
        </section>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>التقديمات ({filtered.length})</CardTitle>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/[0.06] bg-midnight-900/50">
                <tr>
                  <Th>المرشح</Th>
                  <Th>الموبايل</Th>
                  <Th className="hidden md:table-cell">اللغة</Th>
                  <Th>الوظيفة</Th>
                  <Th>المرحلة</Th>
                  <Th className="hidden md:table-cell">تاريخ التقديم</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6">
                      <SkeletonTable rows={8} cols={6} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-sm text-zinc-500"
                    >
                      {applications.length === 0
                        ? 'مفيش تقديمات لسه'
                        : 'مفيش نتائج مطابقة'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                    >
                      <Td>
                        <div>
                          <div className="font-medium text-zinc-100">
                            {app.candidates?.triple_name || '—'}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {app.candidates?.age &&
                              `${app.candidates.age} سنة`}
                            {app.candidates?.grad_status &&
                              ` · ${app.candidates.grad_status}`}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <span
                            className="tabular-nums text-zinc-200"
                            dir="ltr"
                          >
                            {app.candidates?.phone || '—'}
                          </span>
                          {app.candidates?.phone && (
                            <a
                              href={`https://wa.me/2${app.candidates.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </Td>
                      <Td className="hidden text-xs text-zinc-400 md:table-cell">
                        {app.candidates?.language} ·
                        {app.candidates?.language_level}
                      </Td>
                      <Td>
                        <div>
                          <div className="text-sm text-zinc-200">
                            {app.offers?.companies?.name || '—'}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {app.offers?.account_name}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Select
                          value={app.stage}
                          onChange={(e) =>
                            updateStage(app.id, e.target.value)
                          }
                          options={STAGES.map((s) => ({
                            value: s,
                            label: STAGE_LABELS[s],
                          }))}
                          className={cn(
                            'w-32 text-xs',
                            STAGE_COLORS[app.stage]
                          )}
                        />
                      </Td>
                      <Td className="hidden text-xs text-zinc-500 md:table-cell">
                        {formatDate(app.created_at)}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-midnight-950 p-6">
      <div className="mb-3 flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <div
        className={cn(
          'text-2xl font-bold tabular-nums md:text-3xl',
          accent ? 'text-gold-400' : 'text-zinc-100'
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-zinc-500">{sub}</div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500',
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn('px-5 py-4 text-sm', className)}>{children}</td>;
}
