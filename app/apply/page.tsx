'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/supabase';
import {
  LANGUAGES,
  LEVELS,
  GRAD_STATUS,
  MILITARY_STATUS,
  experienceLabel,
  type Offer,
} from '@/lib/types';
import {
  isValidEgyptianPhone,
  isValidVocarooUrl,
  filterOffersForCandidate,
  generateTrackingCode,
  cn,
} from '@/lib/utils';
import { Check, Mic, ArrowRight, Loader2, Copy, MessageCircle, Star } from 'lucide-react';

const STORAGE_KEY = 'xg_apply_draft';
const ADMIN_WHATSAPP = '01207706309';

const gradLabels: Record<string, string> = {
  undergrad: 'طالب',
  grad: 'خريج',
  gap_year: 'Gap Year',
  dropout: 'انسحبت من الدراسة',
};

const militaryLabels: Record<string, string> = {
  exempted: 'معفى',
  done: 'أديت الخدمة',
  postponed: 'تأجيل',
  in_service: 'في الخدمة حالياً',
};

const experienceOptions = [
  { value: '0', label: 'بدون خبرة' },
  { value: '1', label: 'سنة' },
  { value: '2', label: 'سنتين' },
  { value: '3', label: '3+ سنين' },
];

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [preferredId, setPreferredId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const prefApplied = useRef(false);

  const [form, setForm] = useState({
    triple_name: '',
    phone: '',
    email: '',
    age: '',
    site: 'cairo',
    language: 'English',
    language_level: '',
    college: '',
    grad_status: '',
    military_status: '',
    applied_last_3_months: false,
    experience: '0',
    voice_url: '',
    voice_confirmed: false,
  });

  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oid = params.get('offer_id');
    if (oid) setPreferredId(oid);

    api
      .getActiveOffers()
      .then(setOffers)
      .catch(() => {})
      .finally(() => setLoadingOffers(false));

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setForm((f) => ({ ...f, ...data.form }));
        setPicked(data.picked || []);
        setRestored(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, picked }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [form, picked]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const matches = useMemo(() => {
    if (!form.age || !form.language_level || !form.grad_status) return [];
    return filterOffersForCandidate(offers, {
      age: parseInt(form.age, 10),
      language: form.language,
      level: form.language_level,
      gradStatus: form.grad_status,
      experience: parseInt(form.experience || '0', 10),
    });
  }, [offers, form]);

  useEffect(() => {
    if (!preferredId || prefApplied.current) return;
    if (matches.some((m) => m.id === preferredId)) {
      setPicked((p) => (p.includes(preferredId) ? p : [...p, preferredId]));
      prefApplied.current = true;
    }
  }, [matches, preferredId]);

  const preferredOffer = useMemo(
    () => offers.find((o) => o.id === preferredId) || null,
    [offers, preferredId]
  );

  const s1Valid =
    form.triple_name.trim().length >= 5 &&
    isValidEgyptianPhone(form.phone) &&
    form.age &&
    parseInt(form.age, 10) >= 16 &&
    parseInt(form.age, 10) <= 60 &&
    form.language_level &&
    form.grad_status &&
    form.military_status;

  const s2Valid = isValidVocarooUrl(form.voice_url) && form.voice_confirmed;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const [candidate] = await api.insertCandidate({
        triple_name: form.triple_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        age: parseInt(form.age, 10),
        site: form.site,
        language: form.language,
        language_level: form.language_level,
        college: form.college.trim() || null,
        grad_status: form.grad_status,
        military_status: form.military_status,
        applied_last_3_months: form.applied_last_3_months,
        experience_years: parseInt(form.experience || '0', 10),
        voice_url: form.voice_url,
        voice_confirmed: form.voice_confirmed,
      });

      await Promise.all(
        picked.map((offer_id) =>
          api.insertApplication({
            candidate_id: candidate.id,
            offer_id,
            stage: 'new',
            is_preferred: offer_id === preferredId,
          })
        )
      );

      localStorage.removeItem(STORAGE_KEY);
      setTrackingCode(generateTrackingCode());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = useMemo(() => {
    if (!trackingCode) return '';
    const pickedNames = offers
      .filter((o) => picked.includes(o.id))
      .map((o) => `${o.companies?.name} - ${o.account_name}`)
      .join(' | ');
    return [
      'مرحباً X-Genesis 👋',
      `الاسم: ${form.triple_name}`,
      `الموبايل: ${form.phone}`,
      `كود المتابعة: ${trackingCode}`,
      `الوظائف المقدم عليها: ${pickedNames || '—'}`,
      preferredOffer && picked.includes(preferredOffer.id)
        ? `الوظيفة المفضلة: ${preferredOffer.companies?.name} - ${preferredOffer.account_name} ⭐`
        : '',
      `اللغة: ${form.language} ${form.language_level}`,
      `الخبرة: ${experienceLabel(parseInt(form.experience || '0', 10))}`,
    ]
      .filter(Boolean)
      .join('\n');
  }, [trackingCode, offers, picked, form, preferredOffer]);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (trackingCode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight-950 p-4 sm:p-6">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 pt-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">تم استلام تقديمك!</h1>
            <p className="text-sm text-zinc-400">كود المتابعة بتاعك — احتفظ بيه:</p>
            <div className="rounded-lg border border-gold-500/20 bg-gold-500/5 py-4 text-2xl font-bold tracking-widest text-gold-400 tabular-nums">
              {trackingCode}
            </div>

            <div className="rounded-lg border border-white/10 bg-midnight-900 p-3 text-right">
              <div className="mb-2 text-xs font-medium text-zinc-400">
                رسالة الواتساب الجاهزة للأدمن:
              </div>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-6 text-zinc-300">
                {whatsappMessage}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="primary" size="lg" className="w-full" onClick={copyMessage}>
                <Copy className="h-4 w-4" />
                {copied ? 'تم النسخ ✅' : 'نسخ الرسالة'}
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <a
                  href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  فتح واتساب وإرسال
                </a>
              </Button>
            </div>

            <p className="text-xs leading-6 text-zinc-500">
              هنكلمك واتساب خلال 48 ساعة لو اتقبلت في المراجعة الأولية.
              <br />
              بالتوفيق! 🍀
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-midnight-950" dir="rtl">
      <header className="border-b border-white/[0.06] bg-midnight-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-gold-400 to-gold-600 font-bold text-midnight-950">
              X
            </div>
            <div className="text-sm font-semibold tracking-tight text-zinc-100">
              X-Genesis
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/">← الرئيسية</a>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        {restored && step === 0 && (form.triple_name || form.phone) && (
          <div className="mb-6 flex items-center justify-between gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-300">
            <span>👋 أهلًا بيك رجعت — بياناتك محفوظة، كمّل من وقفت.</span>
            <button
              type="button"
              className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[11px] text-zinc-300 hover:bg-midnight-800"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setForm({
                  triple_name: '', phone: '', email: '', age: '', site: 'cairo',
                  language: 'English', language_level: '', college: '', grad_status: '',
                  military_status: '', applied_last_3_months: false, experience: '0',
                  voice_url: '', voice_confirmed: false,
                });
                setPicked([]);
                setRestored(false);
              }}
            >
              بدء من جديد
            </button>
          </div>
        )}

        {preferredOffer && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-gold-500/20 bg-gold-500/5 p-3 text-xs text-gold-300">
            <Star className="h-4 w-4 shrink-0" />
            <span>
              جيت من وظيفة: {preferredOffer.companies?.name} — {preferredOffer.account_name}. هتتسجل كوظيفة مفضلة ليك.
            </span>
          </div>
        )}

        <div className="mb-8 flex items-center justify-center gap-2">
          {['بياناتك', 'صوتك', 'وظائفك'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-colors',
                  step >= i
                    ? 'bg-gold-500 text-midnight-950'
                    : 'bg-white/5 text-zinc-600'
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'text-xs transition-colors',
                  step >= i ? 'text-zinc-200' : 'text-zinc-600'
                )}
              >
                {label}
              </span>
              {i < 2 && <div className="h-px w-4 bg-white/10 sm:w-6" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Input
                label="الاسم الثلاثي *"
                value={form.triple_name}
                onChange={(e) => set('triple_name', e.target.value)}
                placeholder="مثال: يوسف علاء سعيد"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="رقم الموبايل *"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  hint="رقم واتساب نشط"
                />
                <Input
                  label="السن *"
                  type="number"
                  value={form.age}
                  onChange={(e) => set('age', e.target.value)}
                  placeholder="21"
                />
                <Input
                  label="الإيميل"
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@gmail.com"
                  dir="ltr"
                />
                <Select
                  label="المحافظة"
                  value={form.site}
                  onChange={(e) => set('site', e.target.value)}
                  options={[
                    { value: 'cairo', label: 'القاهرة' },
                    { value: 'alex', label: 'الإسكندرية' },
                  ]}
                />
                <Select
                  label="اللغة"
                  value={form.language}
                  onChange={(e) => set('language', e.target.value)}
                  options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                />
                <Select
                  label="مستوى اللغة *"
                  value={form.language_level}
                  onChange={(e) => set('language_level', e.target.value)}
                  placeholder="اختر المستوى..."
                  options={LEVELS.map((l) => ({ value: l, label: l }))}
                />
                <Select
                  label="سنين الخبرة"
                  value={form.experience}
                  onChange={(e) => set('experience', e.target.value)}
                  options={experienceOptions}
                />
                <Input
                  label="الكلية"
                  value={form.college}
                  onChange={(e) => set('college', e.target.value)}
                  placeholder="مثال: هندسة عين شمس"
                />
                <Select
                  label="الحالة الدراسية *"
                  value={form.grad_status}
                  onChange={(e) => set('grad_status', e.target.value)}
                  placeholder="اختر..."
                  options={GRAD_STATUS.map((g) => ({
                    value: g,
                    label: gradLabels[g],
                  }))}
                />
                <Select
                  label="الموقف العسكري *"
                  value={form.military_status}
                  onChange={(e) => set('military_status', e.target.value)}
                  placeholder="اختر..."
                  options={MILITARY_STATUS.map((m) => ({
                    value: m,
                    label: militaryLabels[m],
                  }))}
                />
                <Select
                  label="قدمت معانا آخر 3 شهور؟"
                  value={form.applied_last_3_months ? 'yes' : 'no'}
                  onChange={(e) =>
                    set('applied_last_3_months', e.target.value === 'yes')
                  }
                  options={[
                    { value: 'no', label: 'لا' },
                    { value: 'yes', label: 'نعم' },
                  ]}
                />
              </div>
              <Button
                size="lg"
                className="w-full"
                disabled={!s1Valid}
                onClick={() => setStep(1)}
              >
                متابعة ← سجّل صوتك
                <Mic className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-500/10">
                  <Mic className="h-6 w-6 text-gold-400" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  سجّل صوتك بالإنجليزي
                </h2>
                <p className="mt-1 text-xs leading-6 text-zinc-400">
                  قدّم عن نفسك في تسجيل مدته{' '}
                  <span className="font-semibold text-gold-400">
                    دقيقتين على الأقل
                  </span>{' '}
                  — في مكان هادي.
                </p>
              </div>

              <Button variant="outline" size="lg" className="w-full" asChild>
                <a
                  href="https://voca.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔴 افتح استوديو التسجيل (تاب جديد)
                </a>
              </Button>

              <Input
                label="الصق لينك التسجيل هنا *"
                value={form.voice_url}
                onChange={(e) => set('voice_url', e.target.value)}
                placeholder="https://voca.ro/xxxxxx"
                dir="ltr"
                hint="اللينك لازم يبدأ بـ voca.ro"
              />

              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.voice_confirmed}
                  onChange={(e) => set('voice_confirmed', e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-midnight-900 text-gold-500 focus:ring-gold-500/30"
                />
                أؤكد إن مدة التسجيل دقيقتين على الأقل
              </label>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setStep(0)}
                  className="flex-1"
                >
                  <ArrowRight className="h-4 w-4" />
                  رجوع
                </Button>
                <Button
                  size="lg"
                  disabled={!s2Valid}
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  شوف وظائفك ←
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-zinc-100">
                ⭐ الوظائف المناسبة ليك
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {matches.length} وظيفة · اختر اللي يناسبك
              </p>
            </div>

            {loadingOffers ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                </CardContent>
              </Card>
            ) : matches.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-zinc-400">
                    مفيش أوفر مطابق دلوقتي — بياناتك اتحفظت وهنكلمك أول ما يفتح أوفر يناسبك ❤️
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {matches.map((offer) => {
                  const isPicked = picked.includes(offer.id);
                  const isPref = offer.id === preferredId;
                  return (
                    <Card
                      key={offer.id}
                      className={cn(
                        'cursor-pointer transition-all',
                        isPicked
                          ? 'border-gold-500/40 bg-gold-500/5'
                          : 'hover:border-white/10'
                      )}
                      onClick={() =>
                        setPicked((p) =>
                          isPicked
                            ? p.filter((x) => x !== offer.id)
                            : [...p, offer.id]
                        )
                      }
                    >
                      <CardContent className="pt-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-zinc-100">
                                {offer.companies?.name}
                              </span>
                              {isPref && (
                                <Badge variant="gold">
                                  <Star className="h-3 w-3" />
                                  مفضلة
                                </Badge>
                              )}
                              {isPicked && !isPref && (
                                <Badge variant="gold">
                                  <Check className="h-3 w-3" />
                                  مختارة
                                </Badge>
                              )}
                            </div>
                            <div className="mt-0.5 text-xs text-zinc-400">
                              {offer.account_name}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <div>
                            <span className="text-zinc-500">المكان: </span>
                            <span className="text-zinc-300">
                              {offer.location || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500">الشيفت: </span>
                            <span className="text-zinc-300">
                              {offer.shift_type || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500">الخبرة: </span>
                            <span className="text-zinc-300">
                              {experienceLabel(offer.min_experience_years || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm font-semibold text-gold-400">
                          💰 {offer.salary || 'عند المقابلة'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}

            {error && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-center text-xs text-rose-300">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                <ArrowRight className="h-4 w-4" />
                رجوع
              </Button>
              <Button
                size="lg"
                disabled={submitting || picked.length === 0}
                loading={submitting}
                onClick={submit}
                className="flex-1"
              >
                {submitting
                  ? 'جاري الإرسال...'
                  : `إرسال التقديم (${picked.length})`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
