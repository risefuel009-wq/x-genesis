'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Lock, ChevronDown, Menu, X, MapPin, Clock, Briefcase } from 'lucide-react';
import { api } from '@/lib/supabase';
import { experienceLabel, type Offer } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'hold'>('all');

  useEffect(() => {
    let cancelled = false;
    api
      .getAllOffers()
      .then((o) => {
        if (!cancelled)
          setOffers(
            [...o].sort((a, b) =>
              a.status === b.status ? 0 : a.status === 'active' ? -1 : 1
            )
          );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const active = offers.filter((o) => o.status === 'active').length;
    const hold = offers.filter((o) => o.status === 'hold').length;
    return { total: offers.length, active, hold };
  }, [offers]);

  const filtered = useMemo(() => {
    if (filter === 'all') return offers;
    return offers.filter((o) => o.status === filter);
  }, [offers, filter]);

  return (
    <div className="min-h-screen bg-midnight-950">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-midnight-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-bold text-midnight-950">
              X
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight sm:text-base">
                X-Genesis
              </div>
              <div className="hidden text-[11px] text-zinc-500 sm:block">
                Career Portal
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live
            </div>
            <Button variant="primary" size="sm" asChild>
              <a href="/apply">قدّم دلوقتي</a>
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <Lock className="h-3 w-3" />
                <span>دخول الفريق</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-md border border-white/10 bg-midnight-900 shadow-xl">
                    <a
                      href="/admin"
                      className="block px-4 py-2.5 text-xs text-zinc-200 transition-colors hover:bg-midnight-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      لوحة الأدمن
                    </a>
                  </div>
                </>
              )}
            </div>
          </nav>

          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-zinc-300 md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/[0.06] bg-midnight-950 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              <Button variant="primary" size="md" className="w-full" asChild>
                <a href="/apply">قدّم دلوقتي</a>
              </Button>
              <Button variant="outline" size="md" className="w-full" asChild>
                <a href="/admin">
                  <Lock className="h-3 w-3" />
                  لوحة الأدمن
                </a>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <section className="mb-8 sm:mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl md:text-5xl">
            ابدأ مسيرتك المهنية.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            {stats.active} فرصة عمل متاحة دلوقتي في أقوى الشركات. قدّم في دقيقة واحدة.
          </p>
          <div className="mt-5">
            <Button variant="primary" size="lg" asChild>
              <a href="/apply">قدّم لجميع الوظائف</a>
            </Button>
          </div>
        </section>

        <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">كل الوظائف</h2>
            <p className="text-xs text-zinc-500">
              {stats.total} وظيفة · {stats.active} متاحة · {stats.hold} موقوفة
            </p>
          </div>
          <div className="flex gap-2">
            <FilterChip
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label={`الكل (${stats.total})`}
            />
            <FilterChip
              active={filter === 'active'}
              onClick={() => setFilter('active')}
              label={`متاحة (${stats.active})`}
            />
            <FilterChip
              active={filter === 'hold'}
              onClick={() => setFilter('hold')}
              label={`موقوفة (${stats.hold})`}
            />
          </div>
        </section>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/[0.06] bg-midnight-900 p-5"
              >
                <Skeleton className="mb-3 h-5 w-1/3" />
                <Skeleton className="mb-2 h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-zinc-400">مفيش وظائف في الفئة دي.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((offer) => {
              const isActive = offer.status === 'active';
              return (
                <Card
                  key={offer.id}
                  className={cn(
                    'flex flex-col transition-colors',
                    isActive ? 'hover:border-white/10' : 'opacity-75'
                  )}
                >
                  <CardContent className="flex flex-1 flex-col space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-zinc-100">
                          {offer.companies?.name}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-zinc-400">
                          {offer.account_name}
                        </div>
                      </div>
                      {isActive ? (
                        <Badge variant="success">متاحة</Badge>
                      ) : (
                        <Badge variant="warning">موقوفة</Badge>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Briefcase className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                        <span className="font-medium text-gold-400">
                          {offer.salary || 'عند المقابلة'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="grid h-3.5 w-3.5 shrink-0 place-items-center text-[10px] font-bold text-zinc-500">
                          🌐
                        </span>
                        <span>
                          {offer.language} · {offer.min_language_level}+
                        </span>
                      </div>
                      {offer.location && (
                        <div className="flex items-center gap-2 text-zinc-300">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          <span className="truncate">{offer.location}</span>
                        </div>
                      )}
                      {offer.shift_type && (
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          <span className="truncate">{offer.shift_type}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="grid h-3.5 w-3.5 shrink-0 place-items-center text-[10px] font-bold text-zinc-500">
                          ⏱
                        </span>
                        <span>
                          {experienceLabel(offer.min_experience_years || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-2">
                      {isActive ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          asChild
                        >
                          <a href={`/apply?offer_id=${offer.id}`}>
                            قدّم دلوقتي
                          </a>
                        </Button>
                      ) : (
                        <div className="w-full rounded-md border border-white/5 bg-midnight-800/50 py-2 text-center text-xs text-zinc-500">
                          التقديم متوقف مؤقتاً
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <footer className="mt-16 border-t border-white/[0.06] pt-6 pb-8 text-center sm:mt-20 sm:pt-8 sm:pb-12">
          <p className="text-xs text-zinc-600">
            X-Genesis © 2026 · Where Talent Meets Opportunity
          </p>
        </footer>
      </main>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs transition-colors',
        active
          ? 'border-gold-500/40 bg-gold-500/10 text-gold-400'
          : 'border-white/10 bg-transparent text-zinc-400 hover:border-white/20 hover:text-zinc-200'
      )}
    >
      {label}
    </button>
  );
}
