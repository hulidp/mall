import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userAuthAPI } from '../api'
import { userAuthInvalidEvent } from '../utils/authEvents'

const tokenStorageKey = 'user_token'
const profileStorageKey = 'user_profile'

const getStoredToken = () => localStorage.getItem(tokenStorageKey) || sessionStorage.getItem(tokenStorageKey) || ''

const getStoredProfile = () => {
    const storage = localStorage.getItem(tokenStorageKey) ? localStorage : sessionStorage
    return storage.getItem(profileStorageKey)
}

const clearStoredAuth = () => {
    localStorage.removeItem(tokenStorageKey)
    localStorage.removeItem(profileStorageKey)
    sessionStorage.removeItem(tokenStorageKey)
    sessionStorage.removeItem(profileStorageKey)
}

const currentRememberMe = () => Boolean(localStorage.getItem(tokenStorageKey))

export const useUserAuthStore = defineStore('user-auth', () => {
    const router = useRouter()

    const token = ref<string>(getStoredToken())
    const storedUser = getStoredProfile()
    let parsedUser = null
    try {
        if (storedUser && storedUser !== 'undefined') {
            parsedUser = JSON.parse(storedUser)
        }
    } catch (e) {
        console.error('Failed to parse user profile from storage', e)
        clearStoredAuth()
    }
    const user = ref<any>(parsedUser)
    const loading = ref(false)

    // 2FA 挑战中间状态（不持久化到 localStorage）
    const challengeToken = ref<string>('')
    const challengeExpiresAt = ref<string>('')
    const pendingRememberMe = ref(true)

    const isAuthenticated = computed(() => !!token.value)

    const setToken = (newToken: string, rememberMe = true) => {
        token.value = newToken
        const targetStorage = rememberMe ? localStorage : sessionStorage
        const staleStorage = rememberMe ? sessionStorage : localStorage
        staleStorage.removeItem(tokenStorageKey)
        targetStorage.setItem(tokenStorageKey, newToken)
    }

    const setUser = (newUser: any, rememberMe = currentRememberMe()) => {
        user.value = newUser
        const targetStorage = rememberMe ? localStorage : sessionStorage
        const staleStorage = rememberMe ? sessionStorage : localStorage
        staleStorage.removeItem(profileStorageKey)
        targetStorage.setItem(profileStorageKey, JSON.stringify(newUser))
    }

    const clearAuth = () => {
        token.value = ''
        user.value = null
        clearStoredAuth()
    }

    if (typeof window !== 'undefined') {
        window.addEventListener(userAuthInvalidEvent, clearAuth)
    }

    const sendVerifyCode = async (payload: any) => {
        loading.value = true
        try {
            await userAuthAPI.sendVerifyCode(payload)
            return true
        } finally {
            loading.value = false
        }
    }

    const register = async (payload: any) => {
        loading.value = true
        try {
            const response = await userAuthAPI.register(payload)
            const { token: accessToken, user: userData } = response.data.data
            if (accessToken) {
                setToken(accessToken)
            }
            if (userData) {
                setUser(userData)
            }
            return true
        } finally {
            loading.value = false
        }
    }

    const clearChallenge = () => {
        challengeToken.value = ''
        challengeExpiresAt.value = ''
    }

    const login = async (payload: any) => {
        loading.value = true
        try {
            const response = await userAuthAPI.login(payload)
            const rememberMe = payload?.remember_me !== false
            return handleLoginResponse(response.data.data, rememberMe)
        } finally {
            loading.value = false
        }
    }

    const verify2FA = async (payload: { code?: string; recovery_code?: string }) => {
        if (!challengeToken.value) {
            throw new Error('challenge_token_missing')
        }
        loading.value = true
        try {
            const response = await userAuthAPI.verify2FA({
                challenge_token: challengeToken.value,
                ...payload,
            })
            const data = response.data.data || {}
            const { token: accessToken, user: userData } = data
            if (accessToken) {
                setToken(accessToken, pendingRememberMe.value)
            }
            if (userData) {
                setUser(userData, pendingRememberMe.value)
            }
            clearChallenge()
            return true
        } finally {
            loading.value = false
        }
    }

    const handleLoginResponse = (data: any, rememberMe = true): { requiresTotp: boolean } => {
        if (data?.requires_totp) {
            pendingRememberMe.value = rememberMe
            challengeToken.value = data.challenge_token || ''
            challengeExpiresAt.value = data.challenge_expires_at || ''
            return { requiresTotp: true }
        }
        clearChallenge()
        const { token: accessToken, user: userData } = data || {}
        if (accessToken) {
            setToken(accessToken, rememberMe)
        }
        if (userData) {
            setUser(userData, rememberMe)
        }
        return { requiresTotp: false }
    }

    const telegramLogin = async (payload: any) => {
        loading.value = true
        try {
            const response = await userAuthAPI.telegramLogin(payload)
            return handleLoginResponse(response.data.data, true)
        } finally {
            loading.value = false
        }
    }

    const telegramMiniAppLogin = async (initData: string) => {
        loading.value = true
        try {
            const response = await userAuthAPI.telegramMiniAppLogin({ init_data: initData })
            return handleLoginResponse(response.data.data, true)
        } finally {
            loading.value = false
        }
    }

    const forgotPassword = async (payload: any) => {
        loading.value = true
        try {
            await userAuthAPI.forgotPassword(payload)
            return true
        } finally {
            loading.value = false
        }
    }

    const syncUserProfile = (profile: {
        id?: number
        email?: string
        nickname?: string
        locale?: string
        email_verified_at?: string | null
        email_change_mode?: 'bind_only' | 'change_with_old_and_new'
        password_change_mode?: 'set_without_old' | 'change_with_old'
    }) => {
        const nextUser = { ...(user.value || {}), ...profile }
        setUser(nextUser)
    }

    const logout = async (redirect = '/auth/login') => {
        clearAuth()
        await router.push(redirect)
    }

    return {
        token,
        user,
        loading,
        challengeToken,
        challengeExpiresAt,
        isAuthenticated,
        sendVerifyCode,
        register,
        login,
        verify2FA,
        clearChallenge,
        telegramLogin,
        telegramMiniAppLogin,
        forgotPassword,
        syncUserProfile,
        logout,
    }
})
