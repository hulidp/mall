<template>
  <div class="mx-auto max-w-[1536px] overflow-x-hidden px-0 pb-24 pt-0 sm:px-6 sm:pt-2 lg:pb-4 lg:px-8">

    <div
      v-if="!loading && loadError"
      class="theme-alert-danger flex min-h-[260px] flex-col items-center justify-center rounded-xl border px-6 py-10 text-center"
    >
      <h2 class="text-base font-semibold">{{ t('emptyState.error') }}</h2>
      <p class="mt-2 max-w-md text-sm leading-relaxed opacity-80">{{ loadError }}</p>
      <button
        type="button"
        class="theme-btn-primary theme-btn-inline-md mt-5 rounded-lg border text-sm font-medium"
        @click="loadProduct"
      >
        {{ t('emptyState.retry') }}
      </button>
    </div>

    <MallEmptyState
      v-else-if="!loading && !product"
      :title="t('productDetail.notFound')"
      action-to="/"
      :action-label="t('emptyState.goProducts')"
    />

    <div v-else-if="loading" class="grid items-start gap-3 lg:grid-cols-[minmax(0,720px)_minmax(420px,640px)] lg:gap-5 xl:gap-6">
      <div class="grid gap-4 lg:grid-cols-[74px_minmax(0,620px)]">
        <div class="hidden space-y-3 lg:block">
          <div v-for="index in 5" :key="index" class="h-[70px] w-[70px] rounded-lg" style="background-color: var(--ui-bg-muted);"></div>
        </div>
        <div class="aspect-square max-w-[620px] rounded-xl" style="background-color: var(--ui-bg-muted);"></div>
      </div>
      <div class="space-y-5">
        <div class="h-8 w-5/6 rounded" style="background-color: var(--ui-bg-muted);"></div>
        <div class="h-20 rounded-lg" style="background-color: var(--ui-bg-muted);"></div>
        <div class="space-y-3">
          <div class="h-10 rounded" style="background-color: var(--ui-bg-muted);"></div>
          <div class="h-10 rounded" style="background-color: var(--ui-bg-muted);"></div>
          <div class="h-12 rounded" style="background-color: var(--ui-bg-muted);"></div>
        </div>
      </div>
    </div>

    <div v-else-if="product" class="grid gap-3 lg:grid-cols-[minmax(0,720px)_minmax(420px,640px)] lg:gap-5 xl:gap-6">
      <main class="order-1 min-w-0">
        <section class="pb-2 lg:grid lg:gap-4 lg:pb-0 lg:grid-cols-[74px_minmax(0,620px)]" style="background-color: var(--ui-bg-elevated);">
          <div class="order-2 mt-2 flex gap-2 overflow-x-auto px-3 lg:order-1 lg:mt-0 lg:block lg:space-y-3 lg:overflow-visible lg:px-0">
            <button
              v-for="image in images"
              :key="image"
              type="button"
              class="h-12 w-12 shrink-0 overflow-hidden rounded-lg border transition sm:h-[70px] sm:w-[70px]"
              :style="image === currentImage ? 'border-color: var(--ui-accent); box-shadow: 0 0 0 1px var(--ui-accent);' : 'border-color: var(--ui-border);'"
              style="background-color: var(--ui-bg-soft);"
              @click="currentImage = image"
            >
              <img :src="image" :alt="title" class="h-full w-full object-contain p-1" />
            </button>
          </div>

          <div class="order-1 lg:order-2">
            <div class="mx-auto h-[48vw] max-h-48 min-h-[150px] w-full overflow-hidden border sm:aspect-square sm:h-auto sm:max-h-none sm:max-w-[520px] sm:rounded-xl lg:mx-0 lg:aspect-square lg:max-w-[620px]" style="background-color: var(--ui-bg-soft); border-color: var(--ui-border);">
              <img v-if="currentImage" :src="currentImage" :alt="title" class="h-full w-full object-contain p-2 lg:p-0" />
            </div>
          </div>
        </section>

        <section class="mt-1.5 border-y px-3 py-2 lg:hidden" style="background-color: var(--ui-bg-elevated); border-color: var(--ui-border);">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            style="color: var(--ui-text-muted);"
            @click="goBack"
          >
            <ArrowLeftIcon class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('productDetail.backToProducts') }}</span>
          </button>
          <h1 class="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug [overflow-wrap:anywhere] sm:text-base" style="color: var(--ui-text-primary);">{{ title }}</h1>
          <div class="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs" style="color: var(--ui-text-muted);">
            <span v-if="categoryName" class="max-w-full [overflow-wrap:anywhere]">{{ categoryName }}</span>
            <span v-for="row in serviceRows" :key="row.text" class="inline-flex min-w-0 items-center gap-1.5">
              <component :is="row.icon" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span class="min-w-0 [overflow-wrap:anywhere]">{{ row.text }}</span>
            </span>
          </div>
          <div class="mt-1.5 flex items-end justify-between gap-3 rounded-xl border px-2.5 py-2" style="background-color: var(--ui-bg-soft); border-color: var(--ui-border);">
            <div class="flex min-w-0 flex-wrap items-end gap-2">
            <span class="text-sm font-medium" style="color: var(--ui-text-muted);">{{ t('products.price') }}</span>
            <span class="text-[23px] font-bold leading-none [overflow-wrap:anywhere]" style="color: var(--ui-accent);">{{ priceText }}</span>
            <span v-if="showOriginalPrice" class="text-sm line-through" style="color: var(--ui-text-muted);">
              {{ originalPriceText }}
            </span>
            </div>
            <span v-if="selectedSkuSummary" class="min-w-0 truncate text-right text-xs font-medium" style="color: var(--ui-text-muted);">{{ selectedSkuSummary }}</span>
          </div>
          <div v-if="selectedWholesaleRules.length" class="theme-alert-success mt-2 rounded-lg border px-3 py-1.5">
            <div class="text-xs font-semibold">{{ t('products.wholesaleRulesTitle') }}</div>
            <div class="mt-1 flex flex-wrap gap-1.5">
              <span
                v-for="rule in selectedWholesaleRules"
                :key="rule.id || rule.min_quantity"
                class="theme-badge theme-badge-xs theme-badge-success"
              >
                {{ formatWholesaleRule(rule) }}
              </span>
            </div>
          </div>
        </section>

        <section v-if="descriptionText" class="mt-5 hidden overflow-hidden rounded-xl lg:block lg:max-w-[720px]" style="background-color: var(--ui-bg-soft);">
          <div class="border-b px-5 py-3" style="border-color: var(--ui-border);">
            <h2 class="text-base font-semibold" style="color: var(--ui-accent);">{{ t('productDetail.description') }}</h2>
          </div>
          <div class="p-4 sm:p-5">
            <p class="text-sm leading-7 [overflow-wrap:anywhere]" style="color: var(--ui-text-secondary);">{{ descriptionText }}</p>
          </div>
        </section>

        <section v-if="safeContent" class="mt-5 hidden overflow-hidden rounded-xl lg:block lg:max-w-[720px]" style="background-color: var(--ui-bg-soft);">
          <div class="border-b px-5 py-3" style="border-color: var(--ui-border);">
            <h2 class="text-base font-semibold" style="color: var(--ui-accent);">{{ detailDescriptionLabel }}</h2>
          </div>

          <div class="p-4 sm:p-5">
            <div class="mall-rich-text prose max-w-none [overflow-wrap:anywhere] dark:prose-invert prose-img:mx-auto prose-img:max-w-full prose-img:rounded-lg" v-html="safeContent"></div>
          </div>
        </section>
      </main>

      <aside ref="purchasePanelRef" class="order-2 hidden min-w-0 lg:sticky lg:top-2 lg:block lg:self-start">
        <div
          class="flex flex-col overflow-visible rounded-2xl border lg:overflow-hidden"
          style="background-color: var(--ui-bg-elevated); border-color: var(--ui-border); box-shadow: var(--ui-shadow-card);"
          :class="purchasePanelClass"
        >
          <div class="flex min-h-0 flex-1 flex-col overflow-visible p-4">
            <div class="shrink-0 space-y-3">
              <div>
                <button
                  type="button"
                  class="mb-2 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                  style="color: var(--ui-text-muted);"
                  @click="goBack"
                >
                  <ArrowLeftIcon class="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{{ t('productDetail.backToProducts') }}</span>
                </button>
                <h1 class="break-words text-[21px] font-semibold leading-snug [overflow-wrap:anywhere] lg:text-[22px]" style="color: var(--ui-text-primary);">{{ title }}</h1>
                <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style="color: var(--ui-text-muted);">
                  <span v-if="categoryName">{{ categoryName }}</span>
                  <span v-for="row in serviceRows" :key="row.text" class="inline-flex items-center gap-1.5">
                    <component :is="row.icon" class="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{{ row.text }}</span>
                  </span>
                </div>
              </div>

              <div class="py-1">
                <div class="flex flex-wrap items-end gap-3">
                  <span class="pb-1 text-sm font-medium" style="color: var(--ui-text-muted);">{{ t('products.price') }}</span>
                  <div class="flex min-w-0 items-baseline gap-1" style="color: var(--ui-accent);">
                    <span class="min-w-0 truncate text-[28px] font-bold leading-none">{{ priceText }}</span>
                  </div>
                  <span v-if="showOriginalPrice" class="pb-1 text-sm line-through" style="color: var(--ui-text-muted);">
                    {{ originalPriceText }}
                  </span>
                </div>
              </div>

              <div v-if="selectedWholesaleRules.length" class="theme-alert-success rounded-lg border px-3 py-2">
                <div class="text-xs font-semibold">{{ t('products.wholesaleRulesTitle') }}</div>
                <div class="mt-1 flex flex-wrap gap-1.5">
                  <span
                    v-for="rule in selectedWholesaleRules"
                    :key="rule.id || rule.min_quantity"
                    class="theme-badge theme-badge-xs theme-badge-success"
                  >
                    {{ formatWholesaleRule(rule) }}
                  </span>
                </div>
              </div>

              <div class="border-b" style="border-color: var(--ui-border);"></div>
            </div>

            <div v-if="activeSkuRows.length > 1" class="mt-3 shrink-0 space-y-2">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-medium" style="color: var(--ui-text-muted);">{{ t('productDetail.skuTitle') }}</div>
                  <div class="mt-1 text-xs" style="color: var(--ui-text-muted);">
                    {{ t('productDetail.selectedSkuLabel') }}: {{ selectedSkuSummary }}
                  </div>
                </div>
                <button
                  v-if="showSkuToggle"
                  type="button"
                  class="theme-btn-ghost inline-flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors"
                  @click="skuExpanded = !skuExpanded"
                >
                  {{ skuExpanded ? t('productDetail.collapseSkuList') : t('productDetail.expandSkuList') }}
                </button>
              </div>
              <div class="rounded-xl border p-2.5" style="border-color: var(--ui-border);">
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  <button
                    v-for="sku in visibleSkuRows"
                    :key="sku.id"
                    type="button"
                    class="min-h-11 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors"
                    :style="normalizeSkuId(sku.id) === selectedSkuId ? 'border-color: var(--ui-accent); background-color: var(--ui-accent-soft); color: var(--ui-accent);' : 'border-color: var(--ui-border); background-color: var(--ui-bg-elevated); color: var(--ui-text-primary);'"
                    :class="[
                      isSkuPurchasable(product, sku) ? '' : 'cursor-not-allowed opacity-50',
                      isLongSkuText(sku) ? 'col-span-full' : '',
                    ]"
                    :disabled="!isSkuPurchasable(product, sku)"
                    @click="selectedSkuId = normalizeSkuId(sku.id)"
                    >
                      <div class="flex min-w-0 items-center justify-between gap-2">
                        <span class="min-w-0 truncate font-medium leading-snug">{{ skuText(sku) }}</span>
                        <span class="shrink-0 text-[11px]" style="color: var(--ui-text-muted);">{{ skuStockText(sku) }}</span>
                      </div>
                    </button>
                </div>
              </div>
            </div>

            <div class="mt-3 shrink-0 space-y-3">
              <div class="flex flex-wrap items-center gap-3">
                <span class="text-sm font-medium" style="color: var(--ui-text-muted);">{{ t('productDetail.quantity') }}</span>
                <MallQuantityInput v-model="quantity" :min="minQuantity" :max="quantityLimit" />
                <span v-if="quantityLimit !== null" class="text-xs" style="color: var(--ui-text-muted);">{{ t('products.stockStatus.stockCount', { count: quantityLimit }) }}</span>
              </div>

              <div v-if="!requiresLogin && selectableCardFields.length" class="space-y-3">
                <MallManualCardPicker
                  v-for="field in selectableCardFields"
                  :key="field.key"
                  v-model="manualFormData[field.key]"
                  :product-slug="String(product?.slug || '')"
                  :sku-id="selectedSku?.id"
                  :field="field"
                  :disabled="submitting"
                />
              </div>

              <div v-if="!requiresLogin && deliveryManualFields.length" class="space-y-3">
                <div>
                  <h3 class="text-sm font-medium" style="color: var(--ui-text-secondary);">{{ t('checkout.manualFormTitle') }}</h3>
                  <p class="mt-1 text-xs" style="color: var(--ui-text-muted);">{{ t('checkout.manualFormTip') }}</p>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div v-for="field in deliveryManualFields" :key="field.key" class="space-y-1.5">
                    <label class="text-xs font-medium" style="color: var(--ui-text-muted);">
                      {{ manualFieldLabel(field) }}
                      <span v-if="field.required" style="color: var(--ui-danger);">*</span>
                    </label>
                    <textarea
                      v-if="field.type === 'textarea'"
                      v-model="manualFormData[field.key]"
                      rows="3"
                      class="form-input w-full rounded-lg text-sm"
                      :placeholder="manualFieldPlaceholder(field)"
                    ></textarea>
                    <select
                      v-else-if="field.type === 'select'"
                      v-model="manualFormData[field.key]"
                      class="form-input h-10 w-full rounded-lg text-sm"
                    >
                      <option value="">{{ t('checkout.manualFormSelectPlaceholder') }}</option>
                      <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
                    </select>
                    <div v-else-if="field.type === 'radio'" class="space-y-2 rounded-lg border p-3" style="border-color: var(--ui-border);">
                      <label v-for="option in field.options" :key="option" class="flex items-center gap-2 text-sm" style="color: var(--ui-text-secondary);">
                        <input v-model="manualFormData[field.key]" type="radio" :name="`mall-manual-${field.key}`" :value="option" class="h-4 w-4 theme-accent-checkbox" />
                        <span>{{ option }}</span>
                      </label>
                    </div>
                    <div v-else-if="field.type === 'checkbox'" class="space-y-2 rounded-lg border p-3" style="border-color: var(--ui-border);">
                      <label v-for="option in field.options" :key="option" class="flex items-center gap-2 text-sm" style="color: var(--ui-text-secondary);">
                        <input :checked="isManualCheckboxChecked(field.key, option)" type="checkbox" :value="option" class="h-4 w-4 theme-accent-checkbox" @change="toggleManualCheckbox(field.key, option, ($event.target as HTMLInputElement).checked)" />
                        <span>{{ option }}</span>
                      </label>
                    </div>
                    <input
                      v-else
                      v-model="manualFormData[field.key]"
                      :type="field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'"
                      class="form-input h-10 w-full rounded-lg text-sm"
                      :placeholder="manualFieldPlaceholder(field)"
                    />
                  </div>
                </div>
              </div>

              <div v-if="showGuestOrderForm" class="space-y-2">
                <div class="grid gap-2 sm:grid-cols-[78px_minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
                  <h3 class="text-sm font-medium" style="color: var(--ui-text-secondary);">{{ t('checkout.guestPurchase') }}</h3>
                  <input
                    v-model="guestEmail"
                    type="email"
                    class="form-input-compact h-9 rounded-lg"
                    :placeholder="t('guestOrders.emailPlaceholder')"
                  />
                  <input
                    v-model="guestPassword"
                    type="password"
                    class="form-input-compact h-9 rounded-lg"
                    :placeholder="t('guestOrders.passwordPlaceholder')"
                  />
                </div>
                <div v-if="guestCaptchaEnabled" class="theme-alert-warning rounded-lg border px-3 py-2">
                  <div class="flex flex-wrap items-center gap-3">
                    <div class="shrink-0 text-xs font-semibold">{{ t('auth.common.captchaLabel') }}</div>
                    <div class="min-w-0 flex-1">
                      <ImageCaptcha
                        v-if="captchaProvider === 'image'"
                        ref="imageCaptchaRef"
                        v-model="guestCaptchaPayload"
                        :disabled="submitting"
                        @config-stale="handleCaptchaConfigStale"
                      />
                      <div v-else-if="captchaProvider === 'turnstile'" class="w-[300px] max-w-full overflow-hidden">
                        <TurnstileCaptcha
                          ref="turnstileRef"
                          v-model="turnstileToken"
                          :site-key="turnstileSiteKey"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <MallCouponPanel
                v-if="!requiresLogin"
                v-model="couponCode"
                :loading="couponPanelLoading"
                :refreshing="couponPanelRefreshing"
                :status-text="previewStatusText"
                :error="couponPanelError"
                :show-summary="showPreviewSummary"
                :original-text="previewMoneyText(previewOriginal)"
                :coupon-text="discountMoneyText(previewCoupon)"
                :promotion-text="discountMoneyText(previewPromotion)"
                :member-text="discountMoneyText(previewMemberDiscount)"
                :total-text="previewMoneyText(previewTotal)"
                :show-coupon-row="showCouponPreviewRow"
                :show-promotion-row="showPromotionPreviewRow"
                :show-member-row="showMemberPreviewRow"
              />

              <div v-if="!requiresLogin" class="space-y-2">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ t('payment.channelTitle') }}</h3>
                <div v-if="channels.length === 0 && !userAuthStore.isAuthenticated" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                  {{ t('payment.channelEmpty') }}
                </div>
                <div v-else class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <button
                    v-if="userAuthStore.isAuthenticated"
                    type="button"
                    class="inline-flex min-h-10 min-w-0 items-center justify-center rounded-lg border px-2.5 py-2 text-center text-sm font-semibold transition sm:justify-start sm:px-3"
                    :class="useBalance ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-500/10' : 'border-gray-200 bg-white text-gray-800 hover:border-orange-400 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-100'"
                    @click="selectBalancePayment"
                  >
                    {{ balancePaymentLabel }}
                  </button>
                  <button
                    v-for="channel in channels"
                    :key="channel.id"
                    type="button"
                    class="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg border px-2.5 py-2 text-center text-sm font-semibold transition sm:justify-start sm:px-3"
                    :class="Number(selectedChannelId) === Number(channel.id) ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-500/10' : 'border-gray-200 bg-white text-gray-800 hover:border-orange-400 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-100'"
                    @click="selectPaymentChannel(channel.id)"
                  >
                    <img v-if="paymentChannelIcon(channel)" :src="paymentChannelIcon(channel)" :alt="channelName(channel)" loading="lazy" class="h-5 w-5 shrink-0 rounded object-contain" />
                    <span class="min-w-0 truncate">{{ channelName(channel) }}</span>
                  </button>
                </div>
              </div>

              <div v-if="warning" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {{ warning }}
              </div>
            </div>
          </div>

          <div class="fixed bottom-0 left-0 right-0 z-40 shrink-0 border-t border-gray-200 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-neutral-950 lg:static lg:border-gray-100 lg:bg-transparent lg:p-0 lg:pb-0 lg:shadow-none lg:dark:bg-transparent">
            <div class="mb-3 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04] lg:hidden">
              <div class="min-w-0">
                <div class="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">{{ t('checkout.previewTotal') }}</div>
                <div class="mt-1 text-lg font-black text-[#ff5000]">{{ previewMoneyText(previewTotal) }}</div>
              </div>
              <div class="min-w-0 text-right">
                <div class="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">{{ t('productDetail.selectedSkuLabel') }}</div>
                <div class="mt-1 truncate text-sm font-semibold text-gray-700 dark:text-gray-200">{{ selectedSkuSummary }}</div>
              </div>
            </div>
            <div class="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] overflow-hidden rounded-xl sm:grid-cols-[150px_minmax(0,1fr)]">
              <button
                type="button"
                class="inline-flex h-12 min-w-0 items-center justify-center gap-1.5 bg-amber-400 px-2.5 text-sm font-black text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4"
                :disabled="!canPurchase"
                @click="handleAddToCart"
              >
                <ShoppingCartIcon class="h-5 w-5" aria-hidden="true" />
                <span class="truncate">{{ t('productDetail.addToCart') }}</span>
              </button>
              <button
                type="button"
                class="h-12 min-w-0 truncate bg-gradient-to-r from-orange-500 to-rose-600 px-2.5 text-sm font-black text-white hover:from-orange-600 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                :disabled="!canPurchase || submitting"
                @click="handleBuyNow"
              >
                {{ submitting ? t('checkout.submitting') : requiresLogin ? t('productDetail.loginToBuy') : t('productDetail.buyNow') }}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <section v-if="descriptionText || safeContent" class="order-3 space-y-1.5 lg:hidden">
        <section v-if="descriptionText" class="overflow-hidden border-y border-gray-200 bg-white dark:border-white/10 dark:bg-neutral-950">
          <div class="border-b border-gray-200 px-3 py-2 dark:border-white/10">
            <h2 class="text-sm font-bold text-orange-600">{{ t('productDetail.description') }}</h2>
          </div>
          <div class="px-3 py-2">
            <p class="text-sm leading-6 text-gray-700 [overflow-wrap:anywhere] dark:text-gray-200">{{ descriptionText }}</p>
          </div>
        </section>

        <section v-if="safeContent" class="overflow-hidden border-y border-gray-200 bg-white dark:border-white/10 dark:bg-neutral-950">
          <div class="border-b border-gray-200 px-3 py-2 dark:border-white/10">
            <h2 class="text-sm font-bold text-orange-600">{{ detailDescriptionLabel }}</h2>
          </div>
          <div class="px-3 py-2">
            <div class="mall-rich-text prose max-w-none [overflow-wrap:anywhere] dark:prose-invert prose-img:mx-auto prose-img:max-w-full prose-img:rounded-lg" v-html="safeContent"></div>
          </div>
        </section>
      </section>

      <div class="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-neutral-950 lg:hidden">
        <div class="mx-auto grid max-w-[560px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-xl">
          <button
            type="button"
            class="inline-flex h-11 min-w-0 items-center justify-center gap-1.5 bg-amber-400 px-3 text-sm font-black text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canPurchase"
            @click="openMobileQuickBuy('cart')"
          >
            <ShoppingCartIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
            <span class="truncate">{{ t('productDetail.addToCart') }}</span>
          </button>
          <button
            type="button"
            class="h-11 min-w-0 truncate bg-gradient-to-r from-orange-500 to-rose-600 px-3 text-sm font-black text-white transition hover:from-orange-600 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canPurchase"
            @click="openMobileQuickBuy('buy')"
          >
            {{ requiresLogin ? t('productDetail.loginToBuy') : t('productDetail.buyNow') }}
          </button>
        </div>
      </div>
    </div>

    <MallQuickBuy
      v-if="product"
      v-model:visible="quickBuyVisible"
      :product="product"
      :initial-action="quickBuyIntent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { ArrowLeftIcon, BoltIcon, CubeIcon, ShoppingCartIcon } from '@heroicons/vue/24/outline'
import { productAPI } from '../../../api'
import { useAppStore } from '../../../stores/app'
import { useCartStore } from '../../../stores/cart'
import { useUserAuthStore } from '../../../stores/userAuth'
import { useLocalized } from '../../../composables/useProduct'
import { toast } from '../../../composables/useToast'
import { buildSkuDisplayText, normalizeSkuId } from '../../../utils/sku'
import { fulfillmentTypeLabel } from '../../../utils/fulfillment'
import { amountToCents, centsToAmount } from '../../../utils/money'
import ImageCaptcha from '../../../components/captcha/ImageCaptcha.vue'
import TurnstileCaptcha from '../../../components/captcha/TurnstileCaptcha.vue'
import {
  activeSkus,
  buildMallCartItem,
  formatMallMoney,
  isProductSoldOut,
  isSkuPurchasable,
  mallProductStockCount,
  normalizeLimit,
  openMallAuthModal,
  paymentChannelIcon,
  productImages,
  resolveMallUnitPrice,
  resolveSelectedSku,
  sanitizeMallHtml,
  skuWholesaleRules,
  skuAvailableStock,
} from '../utils'
import MallEmptyState from '../components/MallEmptyState.vue'
import MallQuantityInput from '../components/MallQuantityInput.vue'
import MallCouponPanel from '../components/MallCouponPanel.vue'
import MallManualCardPicker from '../components/MallManualCardPicker.vue'
import MallQuickBuy from '../components/MallQuickBuy.vue'
import {
  buildMallGuestCaptchaPayload,
  buildMallOrderPayload,
  buildMallPayPath,
  buildMallSingleItemPayload,
  buildMallSingleManualFormDataPayload,
  createAndPayMallOrder,
  isMallGuestEmailValid,
  isMallManualCheckboxChecked,
  isMallManualFieldValid,
  mallManualFieldLabel,
  mallManualFieldPlaceholder,
  mallManualDeliveryFields,
  mallSelectableCardFields,
  normalizeMallManualFormSchema,
  refreshMallCaptchaConfig,
  syncMallSingleManualFormData,
  toggleMallManualCheckbox,
  useMallOrderPreview,
  useMallPaymentSelection,
  type MallManualFormField,
} from '../composables/useMallCheckoutFlow'
import { useMallWalletBalance } from '../composables/useMallWalletBalance'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const cartStore = useCartStore()
const userAuthStore = useUserAuthStore()
const { getLocalizedText, siteCurrency } = useLocalized()

const product = ref<any>(null)
const loading = ref(true)
const loadError = ref('')
const currentImage = ref('')
const selectedSkuId = ref(0)
const quantity = ref(1)
const warning = ref('')
const submitting = ref(false)
const skuExpanded = ref(false)
const guestEmail = ref('')
const guestPassword = ref('')
const couponCode = ref('')
const normalizedCouponCode = computed(() => couponCode.value.trim())
const manualFormData = ref<Record<string, any>>({})
const guestCaptchaPayload = ref<any>({})
const turnstileToken = ref('')
const imageCaptchaRef = ref<InstanceType<typeof ImageCaptcha> | null>(null)
const turnstileRef = ref<InstanceType<typeof TurnstileCaptcha> | null>(null)
const purchasePanelRef = ref<HTMLElement | null>(null)
const quickBuyVisible = ref(false)
const quickBuyIntent = ref<'cart' | 'buy' | null>(null)
const { selectedChannelId, useBalance, selectPaymentChannel, selectBalancePayment } = useMallPaymentSelection()

const formatMallPrice = (value: unknown) => {
  const text = String(value ?? '').trim()
  const numeric = Number(text)
  if (!Number.isFinite(numeric)) return text
  return numeric.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}

const activeSkuRows = computed(() => activeSkus(product.value))
const collapsedSkuVisibleCount = 8
const displaySkuRows = computed(() => [...activeSkuRows.value].sort((left, right) => {
  const leftText = skuText(left)
  const rightText = skuText(right)
  if (leftText.length !== rightText.length) return leftText.length - rightText.length
  return normalizeSkuId(left?.id) - normalizeSkuId(right?.id)
}))
const showSkuToggle = computed(() => displaySkuRows.value.length > collapsedSkuVisibleCount)
const visibleSkuRows = computed(() => {
  if (!showSkuToggle.value || skuExpanded.value) return displaySkuRows.value
  return displaySkuRows.value.slice(0, collapsedSkuVisibleCount)
})
const selectedSku = computed(() => resolveSelectedSku(product.value, selectedSkuId.value))
const title = computed(() => getLocalizedText(product.value?.title))
const descriptionText = computed(() => getLocalizedText(product.value?.description))
const detailDescriptionLabel = computed(() => t('productDetail.detailDescription'))
const categoryName = computed(() => getLocalizedText(product.value?.category?.name))
const images = computed(() => productImages(product.value))
const canonicalUrl = computed(() => {
  if (!product.value?.slug || typeof window === 'undefined') return ''
  return `${window.location.origin}/products/${product.value.slug}`
})
const currency = computed(() => product.value?.currency || siteCurrency.value)
const { balancePaymentLabel } = useMallWalletBalance(currency)
const userMemberLevelId = computed(() => Number(userAuthStore.user?.member_level_id || 0))
const selectedPrice = computed(() => resolveMallUnitPrice(product.value, selectedSku.value, quantity.value, userMemberLevelId.value))
const orderSubtotal = computed(() => {
  const unit = amountToCents(selectedPrice.value)
  if (unit === null) return selectedPrice.value
  return centsToAmount(unit * quantity.value)
})
const priceAmount = computed(() => formatMallPrice(selectedPrice.value))
const priceText = computed(() => formatMallMoney(priceAmount.value, currency.value))
const previewCurrency = computed(() => String(preview.value?.currency || currency.value || 'CNY'))
const previewMoneyText = (amount: unknown) => formatMallMoney(amount, previewCurrency.value)
const hasPositiveAmount = (amount: unknown) => {
  const cents = amountToCents(amount)
  return cents !== null && cents > 0
}
const discountMoneyText = (amount: unknown) => hasPositiveAmount(amount) ? `-${previewMoneyText(amount)}` : previewMoneyText('0.00')
const previewOriginal = computed(() => preview.value?.original_amount ?? orderSubtotal.value)
const previewCoupon = computed(() => preview.value?.discount_amount ?? '0')
const previewPromotion = computed(() => preview.value?.promotion_discount_amount ?? '0')
const previewMemberDiscount = computed(() => preview.value?.member_discount_amount ?? '0')
const previewTotal = computed(() => preview.value?.total_amount ?? orderSubtotal.value)
const previewStatusText = computed(() => couponRefreshing.value ? t('checkout.couponRefreshing') : t('checkout.previewLoading'))
const showPreviewSummary = computed(() => Boolean(
  preview.value
  && (normalizedCouponCode.value
    || hasPositiveAmount(previewCoupon.value)
    || hasPositiveAmount(previewPromotion.value)
    || hasPositiveAmount(previewMemberDiscount.value)),
))
const couponPanelActive = computed(() => Boolean(
  normalizedCouponCode.value
  || showPreviewSummary.value
  || previewError.value,
))
const couponPanelLoading = computed(() => couponPanelActive.value && previewLoading.value)
const couponPanelRefreshing = computed(() => couponPanelActive.value && couponRefreshing.value)
const couponPanelError = computed(() => couponPanelActive.value ? previewError.value : '')
const showCouponPreviewRow = computed(() => Boolean(normalizedCouponCode.value || hasPositiveAmount(previewCoupon.value)))
const showPromotionPreviewRow = computed(() => hasPositiveAmount(previewPromotion.value))
const showMemberPreviewRow = computed(() => hasPositiveAmount(previewMemberDiscount.value))
const selectedWholesaleRules = computed(() => skuWholesaleRules(selectedSku.value))
const selectedSkuSummary = computed(() => selectedSku.value ? skuText(selectedSku.value) : t('productDetail.skuRequired'))
const formatWholesaleRule = (rule: any) => t('products.wholesaleRuleHint', {
  quantity: Number(rule?.min_quantity || 0),
  price: formatMallMoney(rule?.unit_price_amount, currency.value),
})
const fulfillmentLabel = computed(() => fulfillmentTypeLabel(t, product.value?.fulfillment_type, 'orderDetail'))
const productStockLabel = computed(() => {
  const stock = mallProductStockCount(product.value)
  if (stock === null) return t('products.stockStatus.unlimited')
  if (stock <= 0) return t('products.stockStatus.outOfStock')
  return t('products.stockStatus.stockCount', { count: stock })
})
const selectedSkuStockLabel = computed(() => {
  if (!selectedSku.value) return productStockLabel.value
  const stock = skuAvailableStock(product.value, selectedSku.value)
  if (stock === null) return t('productDetail.skuStockUnlimited')
  if (stock <= 0) return t('productDetail.skuStockOut')
  return t('products.stockStatus.stockCount', { count: stock })
})
const originalPriceText = computed(() => {
  const amount = selectedSku.value?.price_amount || product.value?.price_amount || ''
  return amount ? formatMallMoney(amount, currency.value) : ''
})
const showOriginalPrice = computed(() => {
  const original = Number(selectedSku.value?.price_amount || product.value?.price_amount || 0)
  const current = Number(selectedPrice.value || 0)
  return Number.isFinite(original) && Number.isFinite(current) && original > current
})
const minQuantity = computed(() => normalizeLimit(product.value?.min_purchase_quantity) || 1)
const purchaseType = computed(() => String(product.value?.purchase_type || 'member'))
const requiresLogin = computed(() => purchaseType.value === 'member' && !userAuthStore.isAuthenticated)
const showGuestOrderForm = computed(() => !userAuthStore.isAuthenticated && !requiresLogin.value)
const captchaConfig = computed(() => appStore.config?.captcha || null)
const captchaProvider = computed(() => String(captchaConfig.value?.provider || 'none'))
const guestCaptchaEnabled = computed(() => showGuestOrderForm.value && !!captchaConfig.value?.scenes?.guest_create_order && captchaProvider.value !== 'none')
const turnstileSiteKey = computed(() => String(captchaConfig.value?.turnstile?.site_key || ''))
const channels = computed(() => {
  const rows = Array.isArray(appStore.config?.payment_channels) ? appStore.config.payment_channels : []
  const allowedIds = Array.isArray(product.value?.payment_channel_ids) ? product.value.payment_channel_ids : []
  if (allowedIds.length === 0) return rows
  const allowed = new Set(allowedIds.map(Number))
  return rows.filter((channel: any) => allowed.has(Number(channel?.id)))
})
const quantityLimit = computed(() => {
  const productLimit = normalizeLimit(product.value?.max_purchase_quantity) || null
  const stock = skuAvailableStock(product.value, selectedSku.value)
  if (stock === null) return productLimit
  return productLimit === null ? stock : Math.min(productLimit, stock)
})
const safeContent = computed(() => {
  const html = getLocalizedText(product.value?.content)
  return sanitizeMallHtml(html)
})
const canPurchase = computed(() => {
  if (!product.value) return false
  if (isProductSoldOut(product.value)) return false
  if (quantityLimit.value !== null && quantityLimit.value < minQuantity.value) return false
  if (activeSkuRows.value.length > 0 && !selectedSku.value) return false
  if (selectedSku.value && !isSkuPurchasable(product.value, selectedSku.value)) return false
  return true
})

useHead({
  title: () => title.value || undefined,
  link: () => canonicalUrl.value ? [{ rel: 'canonical', href: canonicalUrl.value }] : [],
  meta: () => {
    if (!product.value) return []
    const seoMeta = product.value.seo_meta || {}
    const seoKeywords = getLocalizedText(seoMeta.keywords) || (typeof seoMeta.keywords === 'string' ? seoMeta.keywords : '')
    const seoDescription = getLocalizedText(seoMeta.description) || (typeof seoMeta.description === 'string' ? seoMeta.description : '')
    const tags = []

    if (seoKeywords) tags.push({ name: 'keywords', content: seoKeywords })
    if (seoDescription) tags.push({ name: 'description', content: seoDescription })

    tags.push({ property: 'og:type', content: 'product' })
    if (title.value) {
      tags.push({ property: 'og:title', content: title.value })
    }
    if (seoDescription) {
      tags.push({ property: 'og:description', content: seoDescription })
    }
    if (images.value.length > 0) {
      tags.push({ property: 'og:image', content: images.value[0] })
    }
    if (canonicalUrl.value) {
      tags.push({ property: 'og:url', content: canonicalUrl.value })
    }

    tags.push({ name: 'twitter:card', content: 'summary_large_image' })
    if (title.value) {
      tags.push({ name: 'twitter:title', content: title.value })
    }
    if (seoDescription) {
      tags.push({ name: 'twitter:description', content: seoDescription })
    }
    if (images.value.length > 0) {
      tags.push({ name: 'twitter:image', content: images.value[0] })
    }

    return tags
  },
  script: () => {
    if (!product.value) return []
    const seoMeta = product.value.seo_meta || {}
    const description = getLocalizedText(seoMeta.description) || (typeof seoMeta.description === 'string' ? seoMeta.description : '')
    const price = product.value.price_amount || '0'
    const priceCurrency = currency.value || 'CNY'
    const jsonLd: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title.value,
      url: canonicalUrl.value || (typeof window !== 'undefined' ? window.location.href : ''),
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency,
        availability: product.value.stock_status === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      },
    }
    if (description) jsonLd.description = description
    if (images.value.length > 0) jsonLd.image = images.value
    if (product.value.category?.name) {
      jsonLd.category = getLocalizedText(product.value.category.name)
    }

    return [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd),
    }]
  },
})
const manualFormFields = computed<MallManualFormField[]>(() => normalizeMallManualFormSchema(product.value?.manual_form_schema))
const selectableCardFields = computed(() => mallSelectableCardFields(manualFormFields.value))
const deliveryManualFields = computed(() => mallManualDeliveryFields(manualFormFields.value))

const skuText = (sku: any) => buildSkuDisplayText({
  skuCode: sku?.sku_code,
  specValues: sku?.spec_values,
  fallback: t('productDetail.skuFallback'),
  locale: appStore.locale,
})

const skuStockText = (sku: any) => {
  const stock = skuAvailableStock(product.value, sku)
  if (stock === null) return t('productDetail.skuStockUnlimited')
  if (stock <= 0) return t('productDetail.skuStockOut')
  return t('products.stockStatus.stockCount', { count: stock })
}
const isLongSkuText = (sku: any) => skuText(sku).length > 12
const channelName = (channel: any) => String(channel?.name || channel?.channel_name || channel?.channel_type || channel?.provider_type || '-')

const serviceRows = computed(() => [
  { icon: BoltIcon, text: fulfillmentLabel.value },
  { icon: CubeIcon, text: selectedSkuStockLabel.value },
].filter((row) => row.text))
const purchasePanelClass = computed(() => 'lg:max-h-none')

const scrollPurchasePanelIntoView = async () => {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(min-width: 1024px)').matches) return
  await nextTick()
  window.requestAnimationFrame(() => {
    purchasePanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const warnAndFocusPurchase = (message: string) => {
  warning.value = message
  void scrollPurchasePanelIntoView()
  return false
}

const openMobileQuickBuy = (intent: 'cart' | 'buy') => {
  if (!product.value || !canPurchase.value) return
  quickBuyIntent.value = intent
  quickBuyVisible.value = true
}

const goBack = () => {
  const returnPath = typeof window !== 'undefined'
    ? window.sessionStorage.getItem('dujiao.mall.productReturnPath')
    : null
  const normalizedReturnPath = returnPath || ''
  const isListPath = normalizedReturnPath === '/'
    || normalizedReturnPath === '/products'
    || normalizedReturnPath.startsWith('/products?')
    || normalizedReturnPath.startsWith('/categories/')
  if (normalizedReturnPath && isListPath) {
    router.replace(normalizedReturnPath)
    return
  }
  router.replace('/')
}

const requireLoginOrContinue = () => {
  if (!requiresLogin.value) return true
  if (userAuthStore.isAuthenticated) return true
  openMallAuthModal('login')
  return false
}

const selectedCartQuantity = () => {
  const productID = Number(product.value?.id || 0)
  const skuID = normalizeSkuId(selectedSku.value?.id)
  if (!productID || !skuID) return 0
  const item = cartStore.items.find((row) => row.productId === productID && normalizeSkuId(row.skuId) === skuID)
  return Number(item?.quantity || 0)
}

const validateQuantity = (includeCart = false) => {
  warning.value = ''
  if (!canPurchase.value) {
    return warnAndFocusPurchase(t('productDetail.stockUnavailable'))
  }
  const cartQuantity = includeCart ? selectedCartQuantity() : 0
  const nextQuantity = quantity.value + cartQuantity
  if (quantityLimit.value !== null && nextQuantity > quantityLimit.value) {
    return warnAndFocusPurchase(includeCart && cartQuantity > 0
      ? t('productDetail.addCartLimitExceededWithCart', { count: quantityLimit.value, cartCount: cartQuantity })
      : t('productDetail.addCartLimitExceeded', { count: quantityLimit.value }))
  }
  return true
}

const manualFieldLabel = (field: MallManualFormField) => mallManualFieldLabel(field, getLocalizedText)
const manualFieldPlaceholder = (field: MallManualFormField) => mallManualFieldPlaceholder(field, getLocalizedText)
const manualFieldValid = (field: MallManualFormField) => isMallManualFieldValid(field, manualFormData.value[field.key])
const manualFormValid = computed(() => manualFormFields.value.every((field) => manualFieldValid(field)))
const isManualCheckboxChecked = (fieldKey: string, option: string) => isMallManualCheckboxChecked(manualFormData.value, fieldKey, option)
const toggleManualCheckbox = (fieldKey: string, option: string, checked: boolean) => toggleMallManualCheckbox(manualFormData, fieldKey, option, checked)
const buildManualFormDataPayload = () => buildMallSingleManualFormDataPayload(product.value?.id, manualFormFields.value, manualFormData.value)
const getGuestCaptchaPayload = () => buildMallGuestCaptchaPayload(guestCaptchaEnabled.value, captchaProvider.value, guestCaptchaPayload.value, turnstileToken.value)
const handleCaptchaConfigStale = async () => refreshMallCaptchaConfig((force?: boolean) => appStore.loadConfig(force), guestCaptchaPayload, turnstileToken)
const validateDirectOrder = () => {
  if (!validateQuantity()) return false
  if (!requireLoginOrContinue()) return false
  const missingManualField = manualFormFields.value.find((field) => !manualFieldValid(field))
  if (missingManualField) {
    return warnAndFocusPurchase(t('checkout.manualFormFieldRequired', { name: manualFieldLabel(missingManualField) }))
  }
  if (showGuestOrderForm.value) {
    if (!guestEmail.value.trim() || !guestPassword.value.trim()) {
      return warnAndFocusPurchase(t('checkout.errors.missingGuest'))
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.value.trim())) {
      return warnAndFocusPurchase(t('error.email_invalid'))
    }
    if (guestCaptchaEnabled.value && captchaProvider.value === 'image' && (!guestCaptchaPayload.value.captcha_id || !guestCaptchaPayload.value.captcha_code)) {
      return warnAndFocusPurchase(t('auth.common.captchaRequired'))
    }
    if (guestCaptchaEnabled.value && captchaProvider.value === 'turnstile' && !turnstileToken.value) {
      return warnAndFocusPurchase(t('auth.common.captchaRequired'))
    }
  }
  if ((channels.value.length > 0 || userAuthStore.isAuthenticated) && !selectedChannelId.value && !useBalance.value) {
    return warnAndFocusPurchase(t('checkout.errors.selectPayment'))
  }
  return true
}
const buildItemsPayload = () => buildMallSingleItemPayload(product.value, selectedSku.value, quantity.value)
const buildOrderPayload = () => buildMallOrderPayload({
  couponCode: normalizedCouponCode.value,
  items: buildItemsPayload(),
  manualFormData: buildManualFormDataPayload(),
})
const guestEmailValid = computed(() => isMallGuestEmailValid(guestEmail.value))
const {
  preview,
  previewLoading,
  previewError,
  couponRefreshing,
  debouncedLoadPreview,
  loadPreviewNow,
} = useMallOrderPreview({
  canPreview: () => {
    if (!product.value || requiresLogin.value || !canPurchase.value || !manualFormValid.value) return false
    if (showGuestOrderForm.value && (!guestEmail.value.trim() || !guestPassword.value.trim() || !guestEmailValid.value)) return false
    return true
  },
  isAuthenticated: () => userAuthStore.isAuthenticated,
  buildOrderPayload,
  guestEmail,
  guestPassword,
  fallbackErrorMessage: () => t('checkout.previewFailed'),
})

const handleAddToCart = () => {
  if (!product.value || !validateQuantity(true) || !requireLoginOrContinue()) return
  cartStore.addItem(buildMallCartItem(product.value, selectedSku.value, quantity.value, userMemberLevelId.value), quantity.value)
  toast.success(t('toast.addedToCart'))
}

const handleBuyNow = async () => {
  if (!product.value || !validateDirectOrder()) return
  submitting.value = true
  warning.value = ''
  try {
    await loadPreviewNow()
    if (previewError.value) {
      warnAndFocusPurchase(previewError.value)
      return
    }
    const responseData = await createAndPayMallOrder({
      isAuthenticated: userAuthStore.isAuthenticated,
      orderPayload: buildOrderPayload(),
      selectedChannelId: selectedChannelId.value,
      useBalance: useBalance.value,
      guestEmail: guestEmail.value,
      guestPassword: guestPassword.value,
      captchaPayload: getGuestCaptchaPayload(),
      submitFailedMessage: t('checkout.errors.submitFailed'),
    })
    router.push(buildMallPayPath(responseData.order_no, userAuthStore.isAuthenticated))
  } catch (err: any) {
    warnAndFocusPurchase(err.message || t('checkout.errors.submitFailed'))
    imageCaptchaRef.value?.refresh()
    turnstileRef.value?.reset()
    turnstileToken.value = ''
  } finally {
    submitting.value = false
  }
}

const syncSku = () => {
  const sku = resolveSelectedSku(product.value, selectedSkuId.value)
  selectedSkuId.value = normalizeSkuId(sku?.id)
  quantity.value = minQuantity.value
  skuExpanded.value = false
}

const loadProduct = async () => {
  loading.value = true
  loadError.value = ''
  product.value = null
  try {
    const slug = String(route.params.slug || '').trim()
    const response = await productAPI.detail(slug)
    product.value = response.data.data
    currentImage.value = productImages(product.value)[0] || ''
    syncSku()
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    console.error('Failed to load product:', error)
    loadError.value = message || t('emptyState.error')
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.slug,
  () => {
    void loadProduct()
  },
)

watch(selectedSkuId, () => {
  warning.value = ''
  quantity.value = minQuantity.value
})

watch(channels, (rows) => {
  if (!selectedChannelId.value) return
  if (rows.some((channel: any) => Number(channel.id) === Number(selectedChannelId.value))) return
  selectedChannelId.value = null
}, { immediate: true })

watch(manualFormFields, (fields) => {
  manualFormData.value = syncMallSingleManualFormData(fields, manualFormData.value)
}, { immediate: true })

watch(
  () => [
    product.value?.id,
    selectedSkuId.value,
    quantity.value,
    normalizedCouponCode.value,
    JSON.stringify(manualFormData.value),
    guestEmail.value,
    guestPassword.value,
    userAuthStore.isAuthenticated,
  ],
  () => {
    debouncedLoadPreview()
  },
  { deep: true },
)

watch(normalizedCouponCode, (value, previous) => {
  if (value === previous) return
  couponRefreshing.value = true
  warning.value = ''
  previewError.value = ''
})

watch(quantityLimit, (limit) => {
  if (limit !== null && quantity.value > limit) {
    quantity.value = Math.max(minQuantity.value, limit)
  }
})

onMounted(() => {
  void loadProduct()
})

onUnmounted(() => {
  debouncedLoadPreview.cancel()
})
</script>

<style scoped>
.mall-rich-text :deep(*) {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.mall-rich-text :deep(pre) {
  overflow-x: auto;
  white-space: pre-wrap;
}

.mall-rich-text :deep(img),
.mall-rich-text :deep(video),
.mall-rich-text :deep(iframe) {
  height: auto;
  max-width: 100%;
}
</style>
