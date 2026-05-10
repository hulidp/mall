import { computed, ref, watch } from 'vue'
import { walletAPI } from '../../../api'
import { useUserAuthStore } from '../../../stores/userAuth'
import { formatMallMoney } from '../utils'

export const useMallWalletBalance = (currency: any) => {
  const userAuthStore = useUserAuthStore()
  const walletBalance = ref('')
  const walletBalanceLoaded = ref(false)
  const walletLoading = ref(false)

  const walletBalanceText = computed(() => {
    if (!walletBalanceLoaded.value) return ''
    const balance = Number(walletBalance.value)
    if (!Number.isFinite(balance) || balance <= 0) return ''
    return formatMallMoney(walletBalance.value, currency?.value || currency || 'CNY')
  })

  const balancePaymentLabel = computed(() => {
    return walletBalanceText.value ? `余额 ${walletBalanceText.value}` : '余额'
  })

  const loadWalletBalance = async () => {
    if (!userAuthStore.isAuthenticated) {
      walletBalance.value = ''
      walletBalanceLoaded.value = false
      return
    }
    walletLoading.value = true
    try {
      const response = await walletAPI.account()
      walletBalance.value = String(response.data.data?.balance || '0')
      walletBalanceLoaded.value = true
    } catch {
      walletBalance.value = ''
      walletBalanceLoaded.value = false
    } finally {
      walletLoading.value = false
    }
  }

  watch(() => userAuthStore.isAuthenticated, () => {
    loadWalletBalance()
  }, { immediate: true })

  return {
    balancePaymentLabel,
    loadWalletBalance,
    walletBalance,
    walletBalanceLoaded,
    walletBalanceText,
    walletLoading,
  }
}
