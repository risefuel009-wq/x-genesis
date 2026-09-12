'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Building2, Zap, TrendingUp, Users, ExternalLink, Lock } from 'lucide-react';
import { api } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import type { Offer } from '@/lib/types';

export default function HomePage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [c, o] = await Promise.all([
          api.getCompanies(),
          api.getActiveOffers(),
        ]);
        if (!cancelled) {
          setCompaniesCount(c.length);
          setOffers(o);
        }
      } catch (e) {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-midnight-950">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-midnight-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-gold-400 to-gold-600 font-bold text-midnight-950">
              X
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">X-Genesis</div>
              <div className="text-[11px] text-zinc-500">Career Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live
            </div>
            <Button variant="primary" size="sm" asChild>
              <a href="/apply">قدّم دلوقتي</a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/recruiter">
                <Lock className="h-3 w-3" />
                <span>ريكراتر</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-50 md:text-5xl">
            ابدأ مسيرتك المهنية.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
            أكثر من {offers.length} فرصة عمل متاحة دلوقتي في أقوى الشركات. قدّم في دقيقة واحدة — مفيش فورمات خارجية، مفيش تعقيد.
          </p>
          <div className="mt-5 flex gap-3">
            <Button variant="primary" size="lg" asChild>
              <a href="/apply">قدّم لجميع الوظائف</a>
            </Button>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-zinc-100">الفرص المتاحة الآن</h2>
          <p className="text-xs text-zinc-500">{offers.length} فرصة نشطة · تُحدّث لحظياً</p>
        </section>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-white/[0.06] bg-midnight-900 p-5">
                <Skeleton className="h-5 w-1/3 mb-3" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-zinc-400">مفيش فرص متاحة حالياً — عد تاني قريب!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <Card key={offer.id} className="transition-colors hover:border-white/10">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-zinc-100">
                        {offer.companies?.name}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-zinc-400">
                        {offer.account_name}
                      </div>
                    </div>
                    <Badge variant="success">متاحة</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-zinc-500">الراتب</div>
                      <div className="mt-0.5 font-medium text-gold-400">
                        {offer.salary || 'عند المقابلة'}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500">اللغة</div>
                      <div className="mt-0.5 font-medium text-zinc-200">
                        {offer.language} · {offer.min_language_level}+
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500">المكان</div>
                      <div className="mt-0.5 truncate font-medium text-zinc-200">
                        {offer.location || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500">الشيفت</div>
                      <div className="mt-0.5 truncate font-medium text-zinc-200">
                        {offer.shift_type || '—'}
                      </div>
                    </div>
                  </div>

                  <Button variant="primary" size="sm" className="w-full" asChild>
                    <a href={`/apply?offer_id=${offer.id}`}>
                      قدّم دلوقتي
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <footer className="mt-20 border-t border-white/[0.06] pt-8 pb-12 text-center">
          <p className="text-xs text-zinc-600">
            X-Genesis © 2026 · Where Talent Meets Opportunity
          </p>
        </footer>
      </main>
    </div>
  );
}      totalPartners: companies.length,
      activeOffers: offers.length,
      topCommission,
      avgCommission,
    };
  }, [companies, offers]);

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-midnight-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-gold-400 to-gold-600 font-bold text-midnight-950">
              X
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">
                X-Genesis
              </div>
              <div className="text-[11px] text-zinc-500">
                Recruitment Intelligence
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href="/apply">تقديم</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin">الأدمن</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-50 md:text-5xl">
            Unleash the Dragons.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
            منصة التوظيف الأذكى في مصر. بيانات لحظية من {stats.totalPartners}+
            شريك، عمولات شفافة، وفرص حقيقية تُحدّث تلقائياً.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-12 grid gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.06] md:grid-cols-4">
          {loading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-midnight-950 p-6">
                  <Skeleton className="mb-3 h-3 w-20" />
                  <Skeleton className="mb-2 h-8 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </>
          ) : (
            <>
              <StatCard
                icon={<Building2 className="h-4 w-4" />}
                label="الشركاء النشطون"
                value={stats.totalPartners.toString()}
                sub="شركة"
              />
              <StatCard
                icon={<Zap className="h-4 w-4" />}
                label="الفرص المتاحة"
                value={stats.activeOffers.toString()}
                sub="أوفر نشط"
                accent
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="أعلى عمولة"
                value={formatCurrency(stats.topCommission)}
                sub="EGP · Intouch Spanish"
                accent
              />
              <StatCard
                icon={<Users className="h-4 w-4" />}
                label="متوسط العمولة"
                value={formatCurrency(stats.avgCommission)}
                sub="EGP لكل توظيف"
              />
            </>
          )}
        </section>

        {/* Commission Table */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                جدول عمولات الشركاء
              </h2>
              <p className="text-xs text-zinc-500">
                {filtered.length} شركة مرتبة حسب عمولتك
              </p>
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
                    <tr>
                      <td colSpan={6} className="p-6">
                        <SkeletonTable rows={8} cols={6} />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <p className="text-sm text-rose-400">خطأ: {error}</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-sm text-zinc-500"
                      >
                        لا توجد نتائج
                      </td>
                    </tr>
                  ) : (
                    filtered.map((company, i) => (
                      <tr
                        key={company.id}
                        className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                      >
                        <Td className="tabular-nums text-zinc-500">
                          {i + 1}
                        </Td>
                        <Td className="font-medium text-zinc-100">
                          {company.name}
                        </Td>
                        <Td>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold tabular-nums text-gold-400">
                              {formatCurrency(company.recruiter_commission)}
                            </span>
                            <div className="hidden h-1 w-16 overflow-hidden rounded-full bg-white/5 sm:block">
                              <div
                                className="h-full bg-gradient-to-l from-gold-400 to-gold-600"
                                style={{
                                  width: `${(company.recruiter_commission / MAX_COMMISSION) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </Td>
                        <Td className="hidden tabular-nums text-zinc-400 md:table-cell">
                          {formatCurrency(company.team_leader_commission)}
                        </Td>
                        <Td className="hidden tabular-nums text-zinc-400 md:table-cell">
                          {formatCurrency(company.unit_manager_commission)}
                        </Td>
                        <Td>
                          <Badge variant="default">
                            {guaranteeLabel(company.guarantee_days)}
                          </Badge>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Active Offers */}
        {offers.length > 0 && (
          <section className="mt-16">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">
                الفرص المتاحة الآن
              </h2>
              <p className="text-xs text-zinc-500">
                {offers.length} فرصة نشطة · تُحدّث لحظياً
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-20 border-t border-white/[0.06] pt-8 pb-12 text-center">
          <p className="text-xs text-zinc-600">
            X-Genesis © 2026 · Where Talent Meets Opportunity
          </p>
        </footer>
      </main>
    </div>
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

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <Card className="transition-colors hover:border-white/10">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-zinc-100">
              {offer.companies?.name}
            </div>
            <div className="mt-0.5 truncate text-xs text-zinc-400">
              {offer.account_name}
            </div>
          </div>
          <Badge variant="success">Active</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-zinc-500">الراتب</div>
            <div className="mt-0.5 font-medium text-gold-400">
              {offer.salary || 'عند المقابلة'}
            </div>
          </div>
          <div>
            <div className="text-zinc-500">اللغة</div>
            <div className="mt-0.5 font-medium text-zinc-200">
              {offer.language} · {offer.min_language_level}+
            </div>
          </div>
          <div>
            <div className="text-zinc-500">المكان</div>
            <div className="mt-0.5 truncate font-medium text-zinc-200">
              {offer.location || '—'}
            </div>
          </div>
          <div>
            <div className="text-zinc-500">الشيفت</div>
            <div className="mt-0.5 truncate font-medium text-zinc-200">
              {offer.shift_type || '—'}
            </div>
          </div>
        </div>

        {offer.form_url && (
          <Button variant="primary" size="sm" className="w-full" asChild>
            <a
              href={offer.form_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>التقديم على الوظيفة</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
