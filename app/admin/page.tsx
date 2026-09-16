'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton';
import { api, supabase } from '@/lib/supabase';
import {
  STAGES,
  LANGUAGES,
  LEVELS,
  experienceLabel,
  type Application,
  type Candidate,
  type Offer,
  type Company,
} from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  guaranteeLabel,
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
  Phone,
  LogOut,
  Lock,
  Star,
  MessageSquare,
  Copy,
  Plus,
  Pencil,
  Trash2,
  X,
  Wallet,
  Briefcase,
} from 'lucide-react';

const ADMIN_PASSWORD = 'genesis2026';
const AUTH_KEY = 'xg_admin_auth';

type AppRow = Application & {
  candidates: Candidate;
  offers: Offer & { companies?: Company };
};

const gradLabels: Record<string, string> = {
  undergrad: 'طالب',
  grad: 'خريج',
  gap_year: 'Gap Year',
  dropout: 'منسحب',
};

const emptyOffer = {
  company_id: '',
  account_name: '',
  status: 'active',
  language: 'English',
  min_language_level: 'B1',
  salary: '',
  shift_type: '',
  location: '',
  min_age: '18',
  max_age: '45',
  accepts_students: 'yes',
  min_experience_years: '0',
};

const expOptions = [
  { value: '0', label: 'بدون خبرة' },
  { value: '1', label: 'سنة' },
  { value: '2', label: 'سنتين' },
  { value: '3', label: '3+ سنين' },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [tab, setTab] = useState<'pipeline' | 'offers' | 'commissions'>('pipeline');

  const [apps, setApps] = useState<AppRow[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [offerSearch, setOfferSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');

  const [leaderMsg, setLeaderMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [offerForm, setOfferForm] = useState<typeof emptyOffer | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === ADMIN_PASSWORD) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    Promise.all([api.getApplications(), api.getAllOffers(), api.getCompanies()])
      .then(([a, o, c]) => {
        if (!cancelled) {
          setApps(a as any);
          setOffers(o as any);
          setCompanies(c);
        }
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

  const refreshOffers = () =>
    api.getAllOffers().then((o) => setOffers(o as any)).catch(() => {});

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps.filter((a) => {
      if (stageFilter !== 'all' && a.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        a.candidates?.triple_name?.toLowerCase().includes(q) ||
        a.candidates?.phone?.includes(q) ||
        (a.candidates?.tracking_code || '').toLowerCase().includes(q)
      );
    });
  }, [apps, search, stageFilter]);

  const stats = useMemo(() => {
    const hired = apps.filter((a) => a.stage === 'hired');
    return {
      total: apps.length,
      fresh: apps.filter((a) => a.stage === 'new').length,
      interview: apps.filter((a) => a.stage === 'interview').length,
      hired: hired.length,
      commission: hired.reduce(
        (s, a) => s + (a.offers?.companies?.recruiter_commission || 0),
        0
      ),
    };
  }, [apps]);

  const filteredOffers = useMemo(() => {
    const q = offerSearch.trim().toLowerCase();
    if (!q) return offers;
    return offers.filter(
      (o) =>
        (o.companies?.name || '').toLowerCase().includes(q) ||
        o.account_name.toLowerCase().includes(q)
    );
  }, [offers, offerSearch]);

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, companySearch]);

  const leaderMessage = (a: AppRow) =>
    [
      'صباح الفل يا فندم 🌟 مرشح جديد يستاهل الفرصة:',
      `الاسم: ${a.candidates?.triple_name || '—'}`,
      `السن: ${a.candidates?.age || '—'} · ${gradLabels[a.candidates?.grad_status || ''] || '—'}`,
      `اللغة: ${a.candidates?.language || '—'} ${a.candidates?.language_level || ''} · الخبرة: ${experienceLabel(a.candidates?.experience_years || 0)}`,
      `الوظيفة: ${a.offers?.companies?.name || '—'} - ${a.offers?.account_name || '—'}`,
      `المكان: ${a.offers?.location || '—'} · الشيفت: ${a.offers?.shift_type || '—'}`,
      `الراتب: ${a.offers?.salary || 'عند المقابلة'}`,
      `لينك الصوت: ${a.candidates?.voice_url || '—'}`,
      `كود المتابعة: ${a.candidates?.tracking_code || '—'}`,
    ].join('\n');

  const updateStage = async (id: string, stage: string) => {
    try {
      await api.updateApplicationStage(id, stage);
      setApps((list) =>
        list.map((a) => (a.id === id ? { ...a, stage: stage as any } : a))
      );
    } catch (e) {
      alert('فشل التحديث: ' + (e as Error).message);
    }
  };

  const saveOffer = async () => {
    if (!offerForm) return;
    if (!offerForm.company_id || !offerForm.account_name.trim()) {
      alert('اختار الشركة واكتب اسم الوظيفة');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        company_id: offerForm.company_id,
        account_name: offerForm.account_name.trim(),
        status: offerForm.status,
        language: offerForm.language,
        min_language_level: offerForm.min_language_level,
        salary: offerForm.salary.trim() || null,
        shift_type: offerForm.shift_type.trim() || null,
        location: offerForm.location.trim() || null,
        min_age: parseInt(offerForm.min_age, 10) || 18,
        max_age: parseInt(offerForm.max_age, 10) || 45,
        accepts_students: offerForm.accepts_students === 'yes',
        min_experience_years: parseInt(offerForm.min_experience_years, 10) || 0,
      };
      if (editingId) {
        await supabase.update('offers', `id=eq.${editingId}`, payload);
      } else {
        await supabase.insert('offers', payload);
      }
      setOfferForm(null);
      setEditingId(null);
      await refreshOffers();
    } catch (e) {
      alert('فشل الحفظ: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (o: Offer) => {
    const next = o.status === 'active' ? 'hold' : 'active';
    try {
      await supabase.update('offers', `id=eq.${o.id}`, { status: next });
      await refreshOffers();
    } catch (e) {
      alert('فشل التغيير: ' + (e as Error).message);
    }
  };

  const deleteOffer = async (id: string) => {
    if (!window.confirm('متأكد إنك عايز تحذف الوظيفة دي؟')) return;
    try {
      await supabase.delete('offers', `id=eq.${id}`);
      await refreshOffers();
    } catch (e) {
      alert('مش ممكن حذفها — ممكن يكون فيها تقديمات مرتبطة بيها.');
    }
  };

  const openEdit = (o: Offer) => {
    setEditingId(o.id);
    setOfferForm({
      company_id: o.company_id,
      account_name: o.account_name,
      status: o.status,
      language: o.language,
      min_language_level: o.min_language_level,
      salary: o.salary || '',
      shift_type: o.shift_type || '',
      location: o.location || '',
      min_age: String(o.min_age),
      max_age: String(o.max_age),
      accepts_students: o.accepts_students ? 'yes' : 'no',
      min_experience_years: String(o.min_experience_years || 0),
    });
  };

  const exportCSV = () => {
    const rows = filteredApps.map((a) => ({
      الكود: a.candidates?.tracking_code || '',
      الاسم: a.candidates?.triple_name || '',
      الموبايل: a.candidates?.phone || '',
      العمر: a.candidates?.age || '',
      الخبرة: experienceLabel(a.candidates?.experience_years || 0),
      اللغة: `${a.candidates?.language || ''} ${a.candidates?.language_level || ''}`,
      الوظيفة: `${a.offers?.companies?.name || ''} - ${a.offers?.account_name || ''}`,
      مفضلة: a.is_preferred ? '⭐' : '',
      المرحلة: STAGE_LABELS[a.stage] || a.stage,
      التاريخ: formatDate(a.created_at),
    }));
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => `"${(r as any)[h] || ''}"`).join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `x-genesis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight-950 p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-500/10">
                <Lock className="h-6 w-6 text-gold-400" />
              </div>
              <h1 className="text-xl font-bold text-zinc-100">لوحة التحكم</h1>
              <p className="mt-1 text-xs text-zinc-500">X-Genesis Admin CRM</p>
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
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <a href="/">← الرجوع للرئيسية</a>
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-midnight-950" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-midnight-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-gold-400 to-gold-600 font-bold text-midnight-950">
              X
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100">X-Genesis Admin</div>
              <div className="text-[11px] text-zinc-500">CRM كامل</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/">الرئيسية</a>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          <TabBtn active={tab === 'pipeline'} onClick={() => setTab('pipeline')}>
            <Users className="h-3.5 w-3.5" />
            التقديمات ({apps.length})
          </TabBtn>
          <TabBtn active={tab === 'offers'} onClick={() => setTab('offers')}>
            <Briefcase className="h-3.5 w-3.5" />
            الوظائف ({offers.length})
          </TabBtn>
          <TabBtn active={tab === 'commissions'} onClick={() => setTab('commissions')}>
            <Wallet className="h-3.5 w-3.5" />
            العمولات ({companies.length})
          </TabBtn>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {tab === 'pipeline' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.06] md:grid-cols-5">
              <MiniStat icon={<Users className="h-4 w-4" />} label="إجمالي التقديمات" value={String(stats.total)} />
              <MiniStat icon={<Users className="h-4 w-4" />} label="جديد" value={String(stats.fresh)} />
              <MiniStat icon={<Headphones className="h-4 w-4" />} label="إنترفيو" value={String(stats.interview)} />
              <MiniStat icon={<TrendingUp className="h-4 w-4" />} label="تم التوظيف" value={String(stats.hired)} accent />
              <MiniStat icon={<DollarSign className="h-4 w-4" />} label="عمولات مؤكدة" value={formatCurrency(stats.commission)} accent />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث بالاسم أو الموبايل أو الكود..."
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
                className="sm:w-40"
              />
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4" />
                تصدير CSV
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/[0.06] bg-midnight-900/50">
                    <tr>
                      <Th>المرشح</Th>
                      <Th>الموبايل</Th>
                      <Th>الوظيفة</Th>
                      <Th className="hidden lg:table-cell">اللغة / الخبرة</Th>
                      <Th>المرحلة</Th>
                      <Th className="hidden lg:table-cell">التاريخ</Th>
                      <Th>رسالة</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-6">
                          <SkeletonTable rows={6} cols={7} />
                        </td>
                      </tr>
                    ) : filteredApps.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-sm text-zinc-500">
                          {apps.length === 0 ? 'مفيش تقديمات لسه' : 'مفيش نتائج مطابقة'}
                        </td>
                      </tr>
                    ) : (
                      filteredApps.map((a) => (
                        <tr key={a.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                          <Td>
                            <div className="font-medium text-zinc-100">{a.candidates?.triple_name || '—'}</div>
                            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500">
                              <span>{a.candidates?.age} سنة · {gradLabels[a.candidates?.grad_status || ''] || '—'}</span>
                            </div>
                            <span className="mt-1 inline-block rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400 tabular-nums" dir="ltr">
                              {a.candidates?.tracking_code || '—'}
                            </span>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-200 tabular-nums" dir="ltr">
                                {a.candidates?.phone || '—'}
                              </span>
                              {a.candidates?.phone && (
                                <a
                                  href={`https://wa.me/2${a.candidates.phone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </Td>
                          <Td>
                            <div className="text-xs text-zinc-200">{a.offers?.companies?.name || '—'}</div>
                            <div className="text-[10px] text-zinc-500">{a.offers?.account_name}</div>
                            {a.is_preferred && (
                              <Badge variant="gold" className="mt-1">
                                <Star className="h-3 w-3" />
                                مفضلة
                              </Badge>
                            )}
                          </Td>
                          <Td className="hidden text-xs text-zinc-400 lg:table-cell">
                            {a.candidates?.language} {a.candidates?.language_level}
                            <div className="text-[10px] text-zinc-500">
                              {experienceLabel(a.candidates?.experience_years || 0)}
                            </div>
                          </Td>
                          <Td>
                            <Select
                              value={a.stage}
                              onChange={(e) => updateStage(a.id, e.target.value)}
                              options={STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s] }))}
                              className={cn('w-28 text-xs', STAGE_COLORS[a.stage])}
                            />
                          </Td>
                          <Td className="hidden text-[10px] text-zinc-500 lg:table-cell">
                            {formatDate(a.created_at)}
                          </Td>
                          <Td>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLeaderMsg(leaderMessage(a));
                                setCopied(false);
                              }}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </Button>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'offers' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={offerSearch}
                  onChange={(e) => setOfferSearch(e.target.value)}
                  placeholder="بحث بشركة أو وظيفة..."
                  className="w-full rounded-md border border-white/10 bg-midnight-900 py-2 pl-3 pr-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-gold-500/40 focus:outline-none focus:ring-2 focus:ring-gold-500/10"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingId(null);
                  setOfferForm({ ...emptyOffer });
                }}
              >
                <Plus className="h-4 w-4" />
                إضافة وظيفة
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/[0.06] bg-midnight-900/50">
                    <tr>
                      <Th>الوظيفة</Th>
                      <Th className="hidden md:table-cell">اللغة</Th>
                      <Th className="hidden md:table-cell">الراتب</Th>
                      <Th className="hidden lg:table-cell">الخبرة</Th>
                      <Th>الحالة</Th>
                      <Th>إجراءات</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-6">
                          <SkeletonTable rows={6} cols={6} />
                        </td>
                      </tr>
                    ) : filteredOffers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-sm text-zinc-500">
                          مفيش وظائف مطابقة
                        </td>
                      </tr>
                    ) : (
                      filteredOffers.map((o) => (
                        <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                          <Td>
                            <div className="text-xs font-medium text-zinc-100">{o.companies?.name}</div>
                            <div className="text-[10px] text-zinc-500">{o.account_name}</div>
                          </Td>
                          <Td className="hidden text-xs text-zinc-400 md:table-cell">
                            {o.language} · {o.min_language_level}+
                          </Td>
                          <Td className="hidden text-xs text-gold-400 md:table-cell">
                            {o.salary || 'عند المقابلة'}
                          </Td>
                          <Td className="hidden text-xs text-zinc-400 lg:table-cell">
                            {experienceLabel(o.min_experience_years || 0)}
                          </Td>
                          <Td>
                            {o.status === 'active' ? (
                              <Badge variant="success">متاحة</Badge>
                            ) : (
                              <Badge variant="warning">موقوفة</Badge>
                            )}
                          </Td>
                          <Td>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="sm" onClick={() => toggleStatus(o)}>
                                {o.status === 'active' ? 'إيقاف' : 'تفعيل'}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openEdit(o)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => deleteOffer(o.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'commissions' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                placeholder="ابحث عن شركة..."
                className="w-full rounded-md border border-white/10 bg-midnight-900 py-2 pl-3 pr-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-gold-500/40 focus:outline-none focus:ring-2 focus:ring-gold-500/10"
              />
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
                      <tr>
                        <td colSpan={6} className="p-6">
                          <SkeletonTable rows={8} cols={6} />
                        </td>
                      </tr>
                    ) : (
                      filteredCompanies.map((c, i) => (
                        <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                          <Td className="text-xs text-zinc-500 tabular-nums">{i + 1}</Td>
                          <Td className="text-xs font-medium text-zinc-100">{c.name}</Td>
                          <Td className="text-xs font-semibold text-gold-400 tabular-nums">
                            {formatCurrency(c.recruiter_commission)}
                          </Td>
                          <Td className="hidden text-xs text-zinc-400 tabular-nums md:table-cell">
                            {formatCurrency(c.team_leader_commission)}
                          </Td>
                          <Td className="hidden text-xs text-zinc-400 tabular-nums md:table-cell">
                            {formatCurrency(c.unit_manager_commission)}
                          </Td>
                          <Td>
                            <Badge variant="default">{guaranteeLabel(c.guarantee_days)}</Badge>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {leaderMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="max-h-[80vh] w-full max-w-md overflow-y-auto">
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">رسالة الليدر 📋</h3>
                <button onClick={() => setLeaderMsg(null)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-md border border-white/10 bg-midnight-900 p-3 text-xs leading-6 text-zinc-300">
                {leaderMsg}
              </pre>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(leaderMsg);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch {}
                }}
              >
                <Copy className="h-4 w-4" />
                {copied ? 'تم النسخ ✅' : 'نسخ الرسالة'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {offerForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="max-h-[85vh] w-full max-w-lg overflow-y-auto">
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {editingId ? 'تعديل وظيفة' : 'إضافة وظيفة جديدة'}
                </h3>
                <button
                  onClick={() => {
                    setOfferForm(null);
                    setEditingId(null);
                  }}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Select
                label="الشركة *"
                value={offerForm.company_id}
                onChange={(e) => setOfferForm({ ...offerForm, company_id: e.target.value })}
                placeholder="اختار الشركة..."
                options={companies.map((c) => ({ value: c.id, label: c.name }))}
              />
              <Input
                label="اسم الوظيفة *"
                value={offerForm.account_name}
                onChange={(e) => setOfferForm({ ...offerForm, account_name: e.target.value })}
                placeholder="مثال: Telesales US"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="الحالة"
                  value={offerForm.status}
                  onChange={(e) => setOfferForm({ ...offerForm, status: e.target.value })}
                  options={[
                    { value: 'active', label: 'متاحة' },
                    { value: 'hold', label: 'موقوفة' },
                  ]}
                />
                <Select
                  label="اللغة"
                  value={offerForm.language}
                  onChange={(e) => setOfferForm({ ...offerForm, language: e.target.value })}
                  options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                />
                <Select
                  label="أقل مستوى لغة"
                  value={offerForm.min_language_level}
                  onChange={(e) => setOfferForm({ ...offerForm, min_language_level: e.target.value })}
                  options={LEVELS.map((l) => ({ value: l, label: l }))}
                />
                <Select
                  label="الخبرة المطلوبة"
                  value={offerForm.min_experience_years}
                  onChange={(e) => setOfferForm({ ...offerForm, min_experience_years: e.target.value })}
                  options={expOptions}
                />
                <Input
                  label="الراتب"
                  value={offerForm.salary}
                  onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                  placeholder="مثال: 12K + KPI"
                />
                <Input
                  label="الشيفت"
                  value={offerForm.shift_type}
                  onChange={(e) => setOfferForm({ ...offerForm, shift_type: e.target.value })}
                  placeholder="مثال: Fixed 4PM-12AM"
                />
                <Input
                  label="المكان"
                  value={offerForm.location}
                  onChange={(e) => setOfferForm({ ...offerForm, location: e.target.value })}
                  placeholder="مثال: Maadi"
                />
                <Select
                  label="بيقبل طلبة؟"
                  value={offerForm.accepts_students}
                  onChange={(e) => setOfferForm({ ...offerForm, accepts_students: e.target.value })}
                  options={[
                    { value: 'yes', label: 'نعم' },
                    { value: 'no', label: 'لا' },
                  ]}
                />
                <Input
                  label="أقل سن"
                  type="number"
                  value={offerForm.min_age}
                  onChange={(e) => setOfferForm({ ...offerForm, min_age: e.target.value })}
                />
                <Input
                  label="أقصى سن"
                  type="number"
                  value={offerForm.max_age}
                  onChange={(e) => setOfferForm({ ...offerForm, max_age: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setOfferForm(null);
                    setEditingId(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button variant="primary" className="flex-1" loading={saving} onClick={saveOffer}>
                  حفظ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-xs font-medium transition-colors',
        active
          ? 'border-gold-500/40 bg-gold-500/10 text-gold-400'
          : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
      )}
    >
      {children}
    </button>
  );
}

function MiniStat({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-midnight-950 p-4">
      <div className="mb-2 flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn('text-xl font-bold tabular-nums', accent ? 'text-gold-400' : 'text-zinc-100')}>
        {value}
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-500', className)}>
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-sm', className)}>{children}</td>;
}
