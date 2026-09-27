// ─── Auth token helper ────────────────────────────────────────────────────────
export const getAuthToken = (): string => {
    if (typeof window === 'undefined') return ''
    const match = document.cookie.match(/(^|;)\s*(token_raw|token)\s*=\s*([^;]+)/)
    if (match && match[3]) return decodeURIComponent(match[3])
    return localStorage.getItem('token') || ''
}

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
    templateStyle?: string
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
    const url = process.env.NEXT_PUBLIC_API_URL_AUTH_REGISTER as string
    const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return res.json()
}

export const loginUser = async (data: { email: string; password: string }) => {
    const url = process.env.NEXT_PUBLIC_API_URL_AUTH_LOGIN as string
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
    const url = process.env.NEXT_PUBLIC_API_URL_UPLOAD as string
    const res = await apiFetch(url, {
        method: 'POST',
        body: formData,
    })
    const data = await res.json()
    return data.url
}

// ─── Templates ────────────────────────────────────────────────────────────────
const FALLBACK_TEMPLATES = [
    { id: '1', title: 'মহান বিজয় দিবস ২০২৪', category: 'victoryDay', categoryType: 'victoryDay', thumbnail: '/templates/victory-day.svg', posterUrl: '/templates/victory-day.svg', occasion: 'বিজয় দিবস' },
    { id: '2', title: 'নির্বাচনী প্রচারণা পোস্টার', category: 'campaign', categoryType: 'campaign', thumbnail: '/templates/campaign.svg', posterUrl: '/templates/campaign.svg', occasion: 'নির্বাচন' },
    { id: '3', title: 'পবিত্র ঈদ মোবারক শুভেচ্ছা', category: 'eid', categoryType: 'eid', thumbnail: '/templates/eid.svg', posterUrl: '/templates/eid.svg', occasion: 'ঈদ' },
    { id: '4', title: 'বিনম্র শ্রদ্ধাঞ্জলি ও শোক দিবস', category: 'condolence', categoryType: 'condolence', thumbnail: '/templates/condolence.svg', posterUrl: '/templates/condolence.svg', occasion: 'শোক দিবস' },
    { id: '5', title: 'শুভেচ্ছা ও অভিনন্দন পোস্টার', category: 'greetings', categoryType: 'greetings', thumbnail: '/templates/greetings.svg', posterUrl: '/templates/greetings.svg', occasion: 'শুভেচ্ছা' },
    { id: '6', title: 'তৃণমূল কর্মী সম্মেলন ও সমাবেশ', category: 'conference', categoryType: 'conference', thumbnail: '/templates/conference.svg', posterUrl: '/templates/conference.svg', occasion: 'সম্মেলন' },
]

export const getTemplates = async () => {
    try {
        const url = process.env.NEXT_PUBLIC_API_URL_TEMPLATES as string
        const res = await apiFetch(url)
        if (!res.ok) return FALLBACK_TEMPLATES
        return res.json()
    } catch {
        return FALLBACK_TEMPLATES
    }
}

export const getTemplateById = async (id: string) => {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_URL_TEMPLATES}/${id}`
        const res = await apiFetch(url)
        if (res.ok) {
            const data = await res.json()
            if (data && (data._id || data.id || data.title)) return data
        }
    } catch {
        // Fall back below
    }
    return (
        FALLBACK_TEMPLATES.find(
            (t) => t.id === id || (t as any)._id === id || t.category === id || t.categoryType === id
        ) || FALLBACK_TEMPLATES[0]
    )
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
    if (formData.templateStyle) data.append('templateStyle', formData.templateStyle)
    formData.photos.forEach((photo) => data.append('photos', photo))

    const url = process.env.NEXT_PUBLIC_API_URL_POSTERS as string
    const res = await apiFetch(url, {
        method: 'POST',
        body: data,
    })
    return res.json()
}

export const getPosterById = async (id: string): Promise<PosterRecord> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL_POSTERS}/${id}`
    const res = await apiFetch(url)
    return res.json()
}

export const regeneratePoster = async (id: string): Promise<PosterRecord> => {
    const url = `${process.env.NEXT_PUBLIC_API_URL_POSTERS}/${id}/regenerate`
    const res = await apiFetch(url, {
        method: 'POST',
    })
    return res.json()
}

export const getUserPosters = async (): Promise<PosterRecord[]> => {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_URL_POSTERS}/user/me`
        const res = await apiFetch(url)
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        return Array.isArray(data) ? data : (data.posters || [])
    } catch {
        return [
            { id: 'p1', title: 'বিজয় দিবসের পোস্টার', date: '১২ ডিসেম্বর ২০২৪', imageUrl: '/templates/victory-day.svg', status: 'completed' },
            { id: 'p2', title: 'শুভেচ্ছা পোস্টার', date: '০৫ সেপ্টেম্বর ২০২৪', imageUrl: '/templates/greetings.svg', status: 'completed' },
        ]
    }
}

export const deletePoster = async (id: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL_POSTERS}/${id}`
    const res = await apiFetch(url, { method: 'DELETE' })
    return res.json()
}

// ─── Export & Download ────────────────────────────────────────────────────────
export const getPosterPdfUrl = (id: string): string => {
    const base = process.env.NEXT_PUBLIC_API_URL_POSTERS || 'http://localhost:5000/api/posters'
    return `${base}/${id}/pdf`
}

export const downloadFile = async (url: string, filename: string) => {
    try {
        const res = await fetch(url)
        const blob = await res.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(blobUrl)
    } catch {
        // Fallback
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }
}

// ─── Admin APIs ───────────────────────────────────────────────────────────────
const ADMIN_API_BASE = 'http://localhost:5000/api/admin'

export const getAdminStats = async () => {
    try {
        const res = await apiFetch(`${ADMIN_API_BASE}/stats`)
        if (!res.ok) throw new Error('Failed to fetch stats')
        return res.json()
    } catch {
        return null
    }
}

export const getAdminTemplates = async () => {
    try {
        const res = await apiFetch(`${ADMIN_API_BASE}/templates`)
        if (!res.ok) throw new Error('Failed to fetch admin templates')
        return res.json()
    } catch {
        return []
    }
}

export const createAdminTemplate = async (templateData: any) => {
    const res = await apiFetch(`${ADMIN_API_BASE}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
    })
    return res.json()
}

export const updateAdminTemplate = async (id: string, updates: any) => {
    const res = await apiFetch(`${ADMIN_API_BASE}/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    })
    return res.json()
}

export const deleteAdminTemplate = async (id: string) => {
    const res = await apiFetch(`${ADMIN_API_BASE}/templates/${id}`, {
        method: 'DELETE',
    })
    return res.json()
}

export const getAdminPosters = async () => {
    try {
        const res = await apiFetch(`${ADMIN_API_BASE}/posters`)
        if (!res.ok) throw new Error('Failed to fetch admin posters')
        return res.json()
    } catch {
        return []
    }
}

export const toggleFlagAdminPoster = async (id: string, flagged: boolean) => {
    const res = await apiFetch(`${ADMIN_API_BASE}/posters/${id}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagged }),
    })
    return res.json()
}
