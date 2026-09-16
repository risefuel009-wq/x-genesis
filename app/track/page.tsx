'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { STAGE_LABELS, STAGE_COLORS, formatDate, cn } from '@/lib/utils';
import { Search, Home } from 'lucide-react';

type TrackApp = {
  id: string;
  stage: string;
  created_at: string;
  offers: { account_name: string; companies: { name: string } };
};

type TrackCandidate = {
  id: string;
  triple_name: string;
  tracking_code: string;
  applications: TrackApp[];
};

export default function TrackPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackCandidate | null>(null);
  const [notFound, setNotFound] = useState(false);

  const search = async () => {
    const q = code.trim().toUpperCase();
    if (!q) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const rows = await supabase.from<TrackCandidate>(
        'candidates',
        `?tracking_code=eq.${encodeURIComponent(q)}&select=id,triple_name,tracking_code,applications(id,stage,created_at,offers(account_name,companies(name)))`
      );
      if (rows.length === 0) setNotFound(true);
      else setResult(rows[0]);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-midnight-950 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardContent className="space-y-4 pt-8">
            <div className="text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-500/10">
                <Search className="h-6 w-6 text-gold-400" />
              </div>
              <h1 className="text-xl font-bold text-zinc-100">تابع تقديمك</h1>
              <p className="mt-1 text-xs text-zinc-500">
                اكتب كود المتابعة اللي استلمته وقت التقديم
              </p>
            </div>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="XG-XXXX"
                dir="ltr"
                className="flex-1 rounded-md border border-white/10 bg-midnight-900 px-3 py-2.5 text-center text-sm tracking-widest text-zinc-100 placeholder:text-zinc-600 focus:border-gold-500/40 focus:outline-none focus:ring-2 focus:ring-gold-500/10"
              />
              <Button variant="primary" loading={loading} onClick={search}>
                بحث
              </Button>
            </div>
            {notFound && (
              <p className="rounded-md border border-rose-500/20 bg-rose-500/5 p-3 text-center text-xs text-rose-300">
                ملقيناش تقديم بالكود ده — تأكد من الكود وحاول تاني.
              </p>
            )}
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <a href="/">
                <Home className="h-3 w-3" />
                الرئيسية
              </a>
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="text-center">
                <div className="text-sm font-semibold text-zinc-100">
                  {result.triple_name}
                </div>
                <div className="text-[11px] text-zinc-500" dir="ltr">
                  {result.tracking_code}
                </div>
              </div>
              {result.applications?.length === 0 ? (
                <p className="text-center text-xs text-zinc-500">مفيش تقديمات مرتبطة بالكود ده.</p>
              ) : (
                result.applications?.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-md border border-white/[0.06] bg-midnight-900 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium text-zinc-100">
                          {a.offers?.companies?.name}
                        </div>
                        <div className="truncate text-[10px] text-zinc-500">
                          {a.offers?.account_name}
                        </div>
                      </div>
                      <Badge className={cn(STAGE_COLORS[a.stage])}>
                        {STAGE_LABELS[a.stage] || a.stage}
                      </Badge>
                    </div>
                    <div className="mt-2 text-[10px] text-zinc-500">
                      تاريخ التقديم: {formatDate(a.created_at)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
