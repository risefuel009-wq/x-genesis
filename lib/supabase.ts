const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  prefer?: string;
};

class SupabaseClient {
  private baseUrl: string;
  private key: string;

  constructor() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    this.baseUrl = `${SUPABASE_URL}/rest/v1`;
    this.key = SUPABASE_KEY;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, prefer } = options;

    const requestHeaders: Record<string, string> = {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      ...headers,
    };

    if (prefer) {
      requestHeaders.Prefer = prefer;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase error ${response.status}: ${errorText}`);
    }

    const text = await response.text();
    if (!text) return [] as unknown as T;
    return JSON.parse(text) as T;
  }

  async from<T>(table: string, query: string = ''): Promise<T[]> {
    return this.request<T[]>(`/${table}${query}`);
  }

  async insert<T>(
    table: string,
    data: any,
    options?: { onConflict?: string; prefer?: string }
  ): Promise<T[]> {
    const endpoint = options?.onConflict
      ? `/${table}?on_conflict=${options.onConflict}`
      : `/${table}`;

    return this.request<T[]>(endpoint, {
      method: 'POST',
      body: data,
      prefer: options?.prefer || 'return=representation',
    });
  }

  async update<T>(table: string, filter: string, data: any): Promise<T[]> {
    return this.request<T[]>(`/${table}?${filter}`, {
      method: 'PATCH',
      body: data,
      prefer: 'return=representation',
    });
  }

  async delete(table: string, filter: string): Promise<void> {
    await this.request(`/${table}?${filter}`, { method: 'DELETE' });
  }
}

export const supabase = new SupabaseClient();

export const api = {
  getCompanies: () =>
    supabase.from<any>(
      'companies',
      '?select=*&order=recruiter_commission.desc'
    ),

  getActiveOffers: () =>
    supabase.from<any>(
      'offers',
      '?status=eq.active&select=*,companies(name,recruiter_commission)&order=created_at.desc'
    ),

  getAllOffers: () =>
    supabase.from<any>(
      'offers',
      '?select=*,companies(name,recruiter_commission)&order=created_at.desc'
    ),

  getCandidates: () =>
    supabase.from<any>(
      'candidates',
      '?select=*,applications(offer_id,stage,created_at,offers(account_name,companies(name,recruiter_commission)))&order=created_at.desc'
    ),

  getApplications: () =>
    supabase.from<any>(
      'applications',
      '?select=*,candidates(*),offers(account_name,companies(name,recruiter_commission))&order=created_at.desc'
    ),

  insertCandidate: (data: any) =>
    supabase.insert<any>('candidates', data, {
      onConflict: 'phone',
      prefer: 'return=representation,resolution=merge-duplicates',
    }),

  insertApplication: (data: any) =>
    supabase.insert<any>('applications', data, {
      prefer: 'return=representation',
    }),

  updateApplicationStage: (id: string, stage: string) =>
    supabase.update<any>('applications', `id=eq.${id}`, { stage }),
};