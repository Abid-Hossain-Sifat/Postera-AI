// ─── Auth token helper ────────────────────────────────────────────────────────
export const getAuthToken = (): string => {
    if (typeof window === 'undefined') return ''
    const match = document.cookie.match(/(^|;)\s*(token_raw|token)\s*=\s*([^;]+)/)
    if (match && match[3]) return decodeURIComponent(match[3])
    return localStorage.getItem('token') || ''
}

// ─── Dynamic API URL Resolution ──────────────────────────────────────────────
export const getBaseApiUrl = (): string => {
    const raw = (
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        ''
    ).trim()

    if (raw) {
        const clean = raw.replace(/\/+$/, '')
        return clean.endsWith('/api') ? clean : `${clean}/api`
    }
    return 'http://localhost:5000/api'
}

export const getApiEndpoint = (path: string, specificEnv?: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    if (specificEnv && specificEnv.trim()) {
        const clean = specificEnv.trim().replace(/\/+$/, '')
        // If the variable already includes a full path with /api/
        if (clean.includes('/api/')) {
            return clean
        }
        // If it was just a domain like "https://myapp.com"
        const base = clean.endsWith('/api') ? clean : `${clean}/api`
        return `${base}${cleanPath}`
    }

    return `${getBaseApiUrl()}${cleanPath}`
}

const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken()
    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
        const res = await fetch(url, { ...options, credentials: 'include', headers })
        return res
    } catch (networkErr: any) {
        console.error('Fetch network error:', networkErr, 'for URL:', url)
        throw new Error(
            `সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি (${networkErr?.message || 'Network Error'})। ব্যাকএন্ড সার্ভার চালু আছে কি না এবং URL সঠিক কি না যাচাই করুন।`
        )
    }
}

export const parseApiResponse = async (res: Response) => {
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
        let data: any
        try {
            data = await res.json()
        } catch {
            data = null
        }

        if (!res.ok) {
            const errorMsg =
                data?.message ||
                data?.error ||
                `সার্ভার এরর (স্ট্যাটাস: ${res.status})`
            const err = new Error(errorMsg)
            ;(err as any).data = data
            throw err
        }
        return data
    }

    // Response is HTML or non-JSON (e.g. 404, 502 Bad Gateway from Render/Vercel)
    await res.text() // consume stream
    if (res.status === 404) {
        throw new Error(`সার্ভার এন্ডপয়েন্ট পাওয়া যায়নি (404 Not Found)। দয়া করে Backend URL সঠিক কিনা যাচাই করুন।`)
    } else if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(`ব্যাকএন্ড সার্ভার স্লিপে আছে বা রিস্টার্ট হচ্ছে (${res.status} Bad Gateway)। অনুগ্রহ করে ৩০-৪০ সেকেন্ড পর আবার চেষ্টা করুন।`)
    } else {
        throw new Error(`সার্ভার থেকে অপ্রত্যাশিত রেসপন্স এসেছে (স্ট্যাটাস: ${res.status})।`)
    }
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
    const url = getApiEndpoint('/auth/register', process.env.NEXT_PUBLIC_API_URL_AUTH_REGISTER)
    const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return parseApiResponse(res)
}

export const loginUser = async (data: { email: string; password: string }) => {
    const url = getApiEndpoint('/auth/login', process.env.NEXT_PUBLIC_API_URL_AUTH_LOGIN)
    const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return parseApiResponse(res)
}

// ─── File Upload ──────────────────────────────────────────────────────────────
export const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const url = getApiEndpoint('/upload', process.env.NEXT_PUBLIC_API_URL_UPLOAD)
    const res = await apiFetch(url, {
        method: 'POST',
        body: formData,
    })
    const data = await parseApiResponse(res)
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
        const url = getApiEndpoint('/templates', process.env.NEXT_PUBLIC_API_URL_TEMPLATES)
        const res = await apiFetch(url)
        if (!res.ok) return FALLBACK_TEMPLATES
        const data = await parseApiResponse(res)
        return Array.isArray(data) && data.length > 0 ? data : FALLBACK_TEMPLATES
    } catch {
        return FALLBACK_TEMPLATES
    }
}

export const getTemplateById = async (id: string) => {
    try {
        const base = getApiEndpoint('/templates', process.env.NEXT_PUBLIC_API_URL_TEMPLATES)
        const url = `${base}/${id}`
        const res = await apiFetch(url)
        if (res.ok) {
            const data = await parseApiResponse(res)
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

    const url = getApiEndpoint('/posters', process.env.NEXT_PUBLIC_API_URL_POSTERS)
    const res = await apiFetch(url, {
        method: 'POST',
        body: data,
    })
    return parseApiResponse(res)
}

export const getPosterById = async (id: string): Promise<PosterRecord> => {
    const base = getApiEndpoint('/posters', process.env.NEXT_PUBLIC_API_URL_POSTERS)
    const res = await apiFetch(`${base}/${id}`)
    return parseApiResponse(res)
}

export const regeneratePoster = async (id: string): Promise<PosterRecord> => {
    const base = getApiEndpoint('/posters', process.env.NEXT_PUBLIC_API_URL_POSTERS)
    const res = await apiFetch(`${base}/${id}/regenerate`, {
        method: 'POST',
    })
    return parseApiResponse(res)
}

export const getUserPosters = async (): Promise<PosterRecord[]> => {
    try {
        const base = getApiEndpoint('/posters', process.env.NEXT_PUBLIC_API_URL_POSTERS)
        const res = await apiFetch(`${base}/user/me`)
        if (!res.ok) throw new Error('API error')
        const data = await parseApiResponse(res)
        return Array.isArray(data) ? data : (data.posters || [])
    } catch {
        return [
            { id: 'p1', title: 'বিজয় দিবসের পোস্টার', date: '১২ ডিসেম্বর ২০২৪', imageUrl: '/templates/victory-day.svg', status: 'completed' },
            { id: 'p2', title: 'শুভেচ্ছা পোস্টার', date: '০৫ সেপ্টেম্বর ২০২৪', imageUrl: '/templates/greetings.svg', status: 'completed' },
        ]
    }
}

export const deletePoster = async (id: string) => {
    const base = getApiEndpoint('/posters', process.env.NEXT_PUBLIC_API_URL_POSTERS)
    const res = await apiFetch(`${base}/${id}`, { method: 'DELETE' })
    return parseApiResponse(res)
}

// ─── Export & Download ────────────────────────────────────────────────────────
export const getPosterPdfUrl = (id: string): string => {
    const base = getApiEndpoint('/posters', process.env.NEXT_PUBLIC_API_URL_POSTERS)
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
const getAdminBase = () => getApiEndpoint('/admin', process.env.NEXT_PUBLIC_API_URL_ADMIN)

export const getAdminStats = async () => {
    try {
        const res = await apiFetch(`${getAdminBase()}/stats`)
        if (!res.ok) throw new Error('Failed to fetch stats')
        return parseApiResponse(res)
    } catch {
        return null
    }
}

export const getAdminTemplates = async () => {
    try {
        const res = await apiFetch(`${getAdminBase()}/templates`)
        if (!res.ok) throw new Error('Failed to fetch admin templates')
        return parseApiResponse(res)
    } catch {
        return []
    }
}

export const createAdminTemplate = async (templateData: any) => {
    const res = await apiFetch(`${getAdminBase()}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
    })
    return parseApiResponse(res)
}

export const updateAdminTemplate = async (id: string, updates: any) => {
    const res = await apiFetch(`${getAdminBase()}/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    })
    return parseApiResponse(res)
}

export const deleteAdminTemplate = async (id: string) => {
    const res = await apiFetch(`${getAdminBase()}/templates/${id}`, {
        method: 'DELETE',
    })
    return parseApiResponse(res)
}

export const getAdminPosters = async () => {
    try {
        const res = await apiFetch(`${getAdminBase()}/posters`)
        if (!res.ok) throw new Error('Failed to fetch admin posters')
        return parseApiResponse(res)
    } catch {
        return []
    }
}

export const toggleFlagAdminPoster = async (id: string, flagged: boolean) => {
    const res = await apiFetch(`${getAdminBase()}/posters/${id}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagged }),
    })
    return parseApiResponse(res)
}
