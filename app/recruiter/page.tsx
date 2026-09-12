'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, LogOut, Home, Search } from 'lucide-react';
import { api } from '@/lib/supabase';
import { formatCurrency, guaranteeLabel, cn } from '@/lib/utils';
import type { Company } from '@/lib/types';

const RECRUITER_PASSWORD = 'genesis2026';
const AUTH_KEY = 'xg_recruiter_auth';

export default function RecruiterPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === RECRUITER_PASSWORD) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    api.getCompanies()
      .then((c) => { if (!cancelled) setCompanies(c); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authed]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === RECRUITER_PASSWORD) {
      localStorage.setItem(AUTH_KEY, RECRUITER_PASSWORD);
      setAuthed(true);
      setError('');
    } else {
      setError('كلمة السر غلط');
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, search]);

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight-950 p-6">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-500/10">
                <Lock className="h-6 w-6 text-gold-400" />
              </div>
              <h1 className="text-xl font-bold text-zinc-100">بوابة الريكراتر</h1>
              <p className="mt-1 text-xs text-zinc-500">الصفحة دي مخصصة للريكروترز بس</p>
            </div>
            <form onSubmit={login} className="space-y-4">
              <Input
                type="password"
                label="كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={error}
              />
              <Button size="lg" className="w-full" type="submit">دخول</Button>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <a href="/">← الرجوع للصفحة الرئيسية</a>
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
              <div className="text-sm font-semibold tracking-tight">X-Genesis Recruiter</div>
              <div className="text-[11px] text-zinc-500">جدول العمولات</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/"><Home className="h-4 w-4" /></a>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">جدول عمولات الشركاء</h2>
            <p className="text-xs text-zinc-500">{filtered.length} شركة · مرتبة حسب عمولتك</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن شركة..."
              className="w-full rounded-md border border-white/10 bg-midnight-900 py-2 pl-3 pr-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-gold-500/40 focus:outline-none focus:ring-2 focus:ring-gold-500/10"
            />
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/[0.06] bg-midnight-900/50">
                <tr>
                  <Th>#</Th>
                  <Th>الشركة</Th>
                  <Th>عمولتك</Th>
                  <Th className="hidden md:table-cell">قائد الفريق</Th>
                  <Th className="hidden md:table-cell">مدير الوحدة</Th>
                  <Th>الضمان</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-6"><SkeletonTable rows={10} cols={6} /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-sm text-zinc-500">لا توجد نتائج</td></tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <Td className="tabular-nums text-zinc-500">{i + 1}</Td>
                      <Td className="font-medium text-zinc-100">{c.name}</Td>
                      <Td>
                        <span className="font-semibold tabular-nums text-gold-400">
                          {formatCurrency(c.recruiter_commission)}
                        </span>
                      </Td>
                      <Td className="hidden tabular-nums text-zinc-400 md:table-cell">
                        {formatCurrency(c.team_leader_commission)}
                      </Td>
                      <Td className="hidden tabular-nums text-zinc-400 md:table-cell">
                        {formatCurrency(c.unit_manager_commission)}
                      </Td>
                      <Td><Badge variant="default">{guaranteeLabel(c.guarantee_days)}</Badge></Td>
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

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500', className)}>
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-5 py-4 text-sm', className)}>{children}</td>;
}
