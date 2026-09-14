'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { api } from '@/lib/supabase';
import type { Offer } from '@/lib/types';

export default function HomePage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getActiveOffers()
      .then((o) => {
        if (!cancelled) setOffers(o);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
          <div className="mt-5">
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
                <Skeleton className="mb-3 h-5 w-1/3" />
                <Skeleton className="mb-2 h-3 w-1/2" />
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
                    <a href={`/apply?offer_id=${offer.id}`}>قدّم دلوقتي</a>
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
}
