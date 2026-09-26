// ─── Auth token helper ────────────────────────────────────────────────────────
export const getAuthToken = (): string => {
    if (typeof window === 'undefined') return ''
    // Fixed: capture group 3 (value), not group 2 (key)
    const match = document.cookie.match(/(^|;)\s*(token_raw|token)\s*=\s*([^;]+)/)
    if (match) return decodeURIComponent(match[3])
    return localStorage.getItem('token') || ''
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const apiFetch = (url: string, options: RequestInit = {}) => {
    const token = getAuthToken()
    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return fetch(url, { ...options, credentials: 'include', headers })
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface PosterFormData {
    name: string
    designation?: string
    party: string
    district?: string
    unionThana?: string
    occasion: string
    slogan: string
    templateId: string
    photos: File[]
}

export interface PosterRecord {
    _id?: string
    id?: string
    status: 'draft' | 'generating' | 'completed' | 'failed'
    generatedImageUrl?: string
    formData?: {
        name: string
        designation?: string
        party: string
        district?: string
        occasion: string
        slogan?: string
    }
    retryCount?: number
    createdAt?: string
    title?: string
    imageUrl?: string
    date?: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser = async (data: { name: string; email: string; password: string }) => {
    const url = process.env.NEXT_PUBLIC_API_URL_AUTH_REGISTER || `${BASE_URL}/api/auth/register`
    const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return res.json()
}

export const loginUser = async (data: { email: string; password: string }) => {
    const url = process.env.NEXT_PUBLIC_API_URL_AUTH_LOGIN || `${BASE_URL}/api/auth/login`
    const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return res.json()
}

// ─── File Upload ──────────────────────────────────────────────────────────────
export const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiFetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
    })
    const data = await res.json()
    return data.url
}

// ─── Templates ────────────────────────────────────────────────────────────────
const FALLBACK_TEMPLATES = [
    { id: '1', title: 'মহান বিজয় দিবস ২০২৪', category: 'victoryDay', thumbnail: 'https://images.unsplash.com/photo-1600015412554-94628f49890a?q=80&w=500', occasion: 'বিজয় দিবস' },
    { id: '2', title: 'নির্বাচনী প্রচারণা পোস্টার', category: 'campaign', thumbnail: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=500', occasion: 'নির্বাচন' },
    { id: '3', title: 'ঈদ মোবারক শুভেচ্ছা', category: 'eid', thumbnail: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=500', occasion: 'ঈদ' },
    { id: '4', title: 'শ্রদ্ধাঞ্জলি ও শোক দিবস', category: 'condolence', thumbnail: 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?q=80&w=500', occasion: 'শোক দিবস' },
    { id: '5', title: 'তৃণমূল কর্মী সম্মেলন', category: 'campaign', thumbnail: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=500', occasion: 'সম্মেলন' },
]

export const getTemplates = async () => {
    try {
        const res = await apiFetch(`${BASE_URL}/api/templates`)
        if (!res.ok) return FALLBACK_TEMPLATES
        return res.json()
    } catch {
        return FALLBACK_TEMPLATES
    }
}

export const getTemplateById = async (id: string) => {
    try {
        const res = await apiFetch(`${BASE_URL}/api/templates/${id}`)
        if (!res.ok) return FALLBACK_TEMPLATES.find(t => t.id === id) || null
        return res.json()
    } catch {
        return FALLBACK_TEMPLATES.find(t => t.id === id) || null
    }
}

// ─── Posters ──────────────────────────────────────────────────────────────────
export const createPoster = async (formData: PosterFormData): Promise<PosterRecord> => {
    const data = new FormData()
    data.append('name', formData.name)
    data.append('designation', formData.designation || '')
    data.append('party', formData.party)
    data.append('district', formData.district || '')
    data.append('unionThana', formData.unionThana || '')
    data.append('occasion', formData.occasion)
    data.append('slogan', formData.slogan)
    data.append('templateId', formData.templateId)
    formData.photos.forEach((photo) => data.append('photos', photo))

    const res = await apiFetch(`${BASE_URL}/api/posters`, {
        method: 'POST',
        body: data,
    })
    return res.json()
}

export const getPosterById = async (id: string): Promise<PosterRecord> => {
    const res = await apiFetch(`${BASE_URL}/api/posters/${id}`)
    return res.json()
}

export const regeneratePoster = async (id: string): Promise<PosterRecord> => {
    const res = await apiFetch(`${BASE_URL}/api/posters/${id}/regenerate`, {
        method: 'POST',
    })
    return res.json()
}

export const getUserPosters = async (): Promise<PosterRecord[]> => {
    try {
        const res = await apiFetch(`${BASE_URL}/api/posters/user/me`)
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        return Array.isArray(data) ? data : (data.posters || [])
    } catch {
        return [
            { id: 'p1', title: 'বিজয় দিবসের পোস্টার', date: '১২ ডিসেম্বর ২০২৪', imageUrl: 'https://images.unsplash.com/photo-1600015412554-94628f49890a?q=80&w=400', status: 'completed' },
            { id: 'p2', title: 'শুভেচ্ছা পোস্টার', date: '০৫ সেপ্টেম্বর ২০২৪', imageUrl: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=400', status: 'completed' },
        ]
    }
}

export const deletePoster = async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/api/posters/${id}`, { method: 'DELETE' })
    return res.json()
}
