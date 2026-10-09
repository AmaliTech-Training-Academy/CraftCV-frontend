<script setup lang="ts">
import {
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  GripVertical,
  Check,
  ExternalLink,
} from '@lucide/vue'
import { useCVState, type CertificationItem } from '~/composables/useCVState'
import { isValidDateString, useCVSectionEditor } from '~/composables/useCVSectionEditor'
import draggable from 'vuedraggable'

definePageMeta({
  layout: 'editor',
  middleware: ['auth'],
})

const { certifications, hasActiveCV, saveErrorFor } = useCVState()

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `cert_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}

const createEmptyCertification = (): CertificationItem => ({
  id: generateId(),
  name: '',
  issuer: '',
  date: '',
  expirationDate: '',
  doesNotExpire: true,
  credentialId: '',
  credentialUrl: '',
  description: '',
})

const validateCertification = (item: CertificationItem) =>
  Boolean(
    item.name.trim()
    && item.issuer.trim()
    && isValidDateString(item.date),
  )

const {
  activeId,
  itemToDeleteId,
  showErrors,
  handleAddEntry,
  promptDelete,
  confirmDelete,
} = useCVSectionEditor(
  certifications,
  createEmptyCertification,
  validateCertification,
)

/**
 * The message a rejected save put on one of this entry's fields, or ''. Scoped
 * to the record by id, so a message the backend sent about another certification
 * cannot appear here.
 */
const backendError = (id: string, key: string) => saveErrorFor(id, key)

// Name and issuer are hand-rolled markup rather than `EditorFormField`, so each
// resolves its message once and reuses it across the aria wiring, the border and
// the message itself.
const nameError = (item: CertificationItem) =>
  backendError(item.id, 'name') || (showErrors.value && !item.name.trim() ? 'Certification name is required' : '')

const issuerError = (item: CertificationItem) =>
  backendError(item.id, 'issuer') || (showErrors.value && !item.issuer.trim() ? 'Issuing organization is required' : '')

const handleFinish = async () => {
  // Discard only entries that are completely untouched/blank
  certifications.value = certifications.value.filter(
    item => Boolean(item.name.trim() || item.issuer.trim() || item.date.trim() || item.description?.trim() || item.credentialId?.trim() || item.credentialUrl?.trim()),
  )

  const allValid = certifications.value.every(validateCertification)
  if (!allValid) {
    showErrors.value = true
    const firstInvalid = certifications.value.find(item => !validateCertification(item))
    if (firstInvalid) {
      activeId.value = firstInvalid.id
    }
    return
  }

  hasActiveCV.value = true
  await navigateTo('/dashboard')
}
</script>

<template>
  <div class="px-4 sm:px-8 lg:px-20 py-10 max-w-4xl mx-auto w-full">
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink
        to="/editor/skills"
        class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#C54A22] hover:text-[#A83D1B] mb-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/30 rounded"
      >
        <ArrowLeft
          class="w-3.5 h-3.5"
          aria-hidden="true"
        />
        Back to Skills
      </NuxtLink>

      <h1 class="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
        Certifications
      </h1>
      <p class="text-gray-500 text-[15px] leading-relaxed">
        Add your relevant certifications, licenses, and verified credentials.<br class="hidden sm:inline">
        Start with your most recent or prominent certification.
      </p>
    </div>

    <!-- Certifications Stack -->
    <div class="space-y-5">
      <draggable
        v-model="certifications"
        item-key="id"
        filter="button, input, select, textarea, a"
        :prevent-on-filter="false"
        ghost-class="opacity-50"
      >
        <template #item="{ element: item, index }">
          <div class="mb-5">
        <!-- 1. Expanded Form Card (Active Item) -->
        <div
          v-if="activeId === item.id"
          class="border-2 border-[#C54A22] rounded-2xl bg-white p-6 sm:p-7 shadow-sm transition-all"
        >
          <!-- Card Header Bar -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-100">
            <div class="flex items-center gap-3 min-w-0 pr-4">
              <GripVertical
                class="w-4 h-4 text-gray-400 shrink-0 cursor-grab"
                aria-hidden="true"
              />
              <h2 class="text-base font-bold text-gray-900 truncate">
                {{ item.name.trim() || `New Certification #${index + 1}` }}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Delete entry"
              :title="'Delete ' + (item.name.trim() || 'certification')"
              class="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              @click="promptDelete(item.id)"
            >
              <Trash2
                class="w-4 h-4"
                aria-hidden="true"
              />
            </button>
          </div>

          <!-- Form Fields Grid -->
          <div class="space-y-5 pt-5">
            <!-- Row 1: Name & Issuer -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  :for="'cert-name-' + item.id"
                  class="block text-[13px] font-semibold text-gray-800 mb-2"
                >
                  Certification Name <span
                    class="text-[#C54A22]"
                    aria-hidden="true"
                  >*</span>
                  <span class="sr-only">(required)</span>
                </label>
                <input
                  :id="'cert-name-' + item.id"
                  v-model="item.name"
                  type="text"
                  placeholder="e.g. UX Master Certified (UXMC)"
                  :aria-required="true"
                  :aria-invalid="Boolean(nameError(item))"
                  :aria-describedby="nameError(item) ? 'cert-name-error-' + item.id : undefined"
                  class="w-full h-11 px-4 rounded-xl border text-sm transition-all focus:outline-none"
                  :class="[
                    nameError(item)
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-gray-200 focus:ring-2 focus:ring-[#C54A22]/20',
                  ]"
                >
                <span
                  v-if="nameError(item)"
                  :id="'cert-name-error-' + item.id"
                  role="alert"
                  class="text-xs font-semibold text-red-500 mt-1 block"
                >
                  {{ nameError(item) }}
                </span>
              </div>

              <div>
                <label
                  :for="'cert-issuer-' + item.id"
                  class="block text-[13px] font-semibold text-gray-800 mb-2"
                >
                  Issuing Organization <span
                    class="text-[#C54A22]"
                    aria-hidden="true"
                  >*</span>
                  <span class="sr-only">(required)</span>
                </label>
                <input
                  :id="'cert-issuer-' + item.id"
                  v-model="item.issuer"
                  type="text"
                  placeholder="e.g. Nielsen Norman Group"
                  :aria-required="true"
                  :aria-invalid="Boolean(issuerError(item))"
                  :aria-describedby="issuerError(item) ? 'cert-issuer-error-' + item.id : undefined"
                  class="w-full h-11 px-4 rounded-xl border text-sm transition-all focus:outline-none"
                  :class="[
                    issuerError(item)
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-gray-200 focus:ring-2 focus:ring-[#C54A22]/20',
                  ]"
                >
                <span
                  v-if="issuerError(item)"
                  :id="'cert-issuer-error-' + item.id"
                  role="alert"
                  class="text-xs font-semibold text-red-500 mt-1 block"
                >
                  {{ issuerError(item) }}
                </span>
              </div>
            </div>

            <!-- Row 2: Issue Date & Expiration Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <EditorMonthYearPicker
                  v-model="item.date"
                  disable-future
                  required
                  label="Issue Date"
                  :error="backendError(item.id, 'date') || (showErrors && !isValidDateString(item.date) ? 'Issue date is required' : '')"
                />
              </div>

              <div>
                <EditorMonthYearPicker
                  v-model="item.expirationDate"
                  :disabled="item.doesNotExpire !== false"
                  :placeholder="item.doesNotExpire !== false ? 'Does not expire' : 'Select date'"
                  label="Expiration Date"
                  :error="backendError(item.id, 'expirationDate')"
                />
                <div class="mt-2.5 flex items-center gap-2">
                  <input
                    :id="'no-expire-' + item.id"
                    v-model="item.doesNotExpire"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 accent-[#C54A22] text-[#C54A22] focus:ring-2 focus:ring-[#C54A22]/20 cursor-pointer"
                  >
                  <label
                    :for="'no-expire-' + item.id"
                    class="text-xs text-gray-600 font-medium cursor-pointer select-none"
                  >
                    This credential does not expire
                  </label>
                </div>
              </div>
            </div>

            <!-- Row 3: Credential ID & URL -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  :for="'cert-id-' + item.id"
                  class="block text-[13px] font-semibold text-gray-800 mb-2"
                >
                  Credential ID
                </label>
                <input
                  :id="'cert-id-' + item.id"
                  v-model="item.credentialId"
                  type="text"
                  placeholder="e.g. NNG-1049281"
                  class="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C54A22]/20 transition-all"
                >
              </div>

              <div>
                <label
                  :for="'cert-url-' + item.id"
                  class="block text-[13px] font-semibold text-gray-800 mb-2"
                >
                  Credential URL
                </label>
                <div class="relative">
                  <input
                    :id="'cert-url-' + item.id"
                    v-model="item.credentialUrl"
                    type="url"
                    aria-label="Credential verification URL"
                    placeholder="https://www.nngroup.com/verify/1049281"
                    :aria-invalid="Boolean(backendError(item.id, 'credentialUrl'))"
                    :aria-describedby="backendError(item.id, 'credentialUrl') ? 'cert-url-error-' + item.id : undefined"
                    class="w-full h-11 pl-4 pr-10 rounded-xl border bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all"
                    :class="[
                      backendError(item.id, 'credentialUrl')
                        ? 'border-red-400 focus:ring-red-400/20'
                        : 'border-gray-200 focus:ring-[#C54A22]/20',
                    ]"
                  >
                  <ExternalLink
                    class="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
                <!-- The backend validates this one as a URL, so it is the field
                     here that can come back rejected. -->
                <span
                  v-if="backendError(item.id, 'credentialUrl')"
                  :id="'cert-url-error-' + item.id"
                  role="alert"
                  class="text-xs font-semibold text-red-500 mt-1 block"
                >
                  {{ backendError(item.id, 'credentialUrl') }}
                </span>
              </div>
            </div>

            <!-- Row 4: Description & Key Competencies -->
            <div>
              <label
                :for="'cert-desc-' + item.id"
                class="block text-[13px] font-semibold text-gray-800 mb-2"
              >
                Description & Key Competencies
              </label>
              <textarea
                :id="'cert-desc-' + item.id"
                v-model="item.description"
                rows="4"
                aria-label="Description & Key Competencies"
                placeholder="• Key skills, domains, or competencies demonstrated by this credential..."
                class="w-full p-3.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#C54A22]/20 transition resize-y min-h-27.5"
              />
            </div>
          </div>

          <!-- Bottom Card Buttons -->
          <div class="flex items-center justify-between pt-6 mt-4 border-t border-gray-100">
            <button
              type="button"
              class="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
              @click="activeId = null"
            >
              Cancel
            </button>
            <button
              type="button"
              class="px-6 py-2.5 bg-[#C54A22] hover:bg-[#A83D1B] active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/40"
              @click="activeId = null"
            >
              <Check
                class="w-4 h-4"
                aria-hidden="true"
              />
              Done
            </button>
          </div>
        </div>

        <!-- 2. Collapsed Card Row -->
        <div
          v-else
          role="button"
          tabindex="0"
          :aria-expanded="false"
          :aria-label="'Expand ' + (item.name.trim() || 'certification') + ' details'"
          class="border border-gray-200 bg-white rounded-xl p-4 sm:px-5 flex items-center justify-between shadow-xs hover:border-gray-300 transition-all cursor-grab group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/30"
          :class="[
            showErrors && !validateCertification(item)
              ? 'border-red-300 bg-red-50/20'
              : 'border-gray-200 hover:border-gray-300',
          ]"
          @click="activeId = item.id"
          @keydown.enter.prevent="activeId = item.id"
          @keydown.space.prevent="activeId = item.id"
        >
          <!-- Left: Grip & Name -->
          <div class="flex items-center gap-3.5 min-w-0 pr-3">
            <GripVertical
              class="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0"
              aria-hidden="true"
            />
            <span class="text-sm font-bold text-gray-900 truncate">
              {{ item.name.trim() || `Certification ${index + 1}` }}
            </span>
            <span
              v-if="showErrors && !validateCertification(item)"
              class="text-xs font-semibold text-red-500 shrink-0"
            >
              (Incomplete)
            </span>
          </div>

          <!-- Right: Edit & Delete Icons -->
          <div
            class="flex items-center gap-1 shrink-0"
            @click.stop
          >
            <button
              type="button"
              aria-label="Edit entry"
              :title="'Edit ' + (item.name.trim() || 'certification')"
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/30"
              @click="activeId = item.id"
            >
              <Edit
                class="w-4 h-4"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              aria-label="Delete entry"
              :title="'Delete ' + (item.name.trim() || 'certification')"
              class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              @click="promptDelete(item.id)"
            >
              <Trash2
                class="w-4 h-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
        </template>
      </draggable>

      <!-- Add Entry Button -->
      <Button
        class="w-full py-5 border-2 border-dashed border-gray-200 hover:border-[#C54A22]/50 hover:bg-[#C54A22]/5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-[#C54A22] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/40"
        type="button"
        variant="outline"
        @click="handleAddEntry"
      >
        <Plus
          class="w-4 h-4"
          aria-hidden="true"
        />
        Add Certification
      </Button>
    </div>

    <!-- Bottom Action Bar -->
    <div class="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between pb-12">
      <NuxtLink
        class="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
        to="/dashboard"
      >
        Skip for now
        <ChevronRight
          class="w-4 h-4"
          aria-hidden="true"
        />
      </NuxtLink>
      <Button
        class="inline-flex items-center gap-2 px-8 py-3 bg-[#111827] hover:bg-black active:scale-95 cursor-pointer text-white rounded-[10px] text-sm font-bold transition-all shadow-xs h-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
        type="button"
        @click="handleFinish"
      >
        Finish & Go to Dashboard
        <ArrowRight
          class="w-4 h-4"
          aria-hidden="true"
        />
      </Button>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      :open="itemToDeleteId !== null"
      @update:open="(val: boolean) => { if (!val) itemToDeleteId = null }"
    >
      <DialogContent
        :show-close-button="false"
        class="sm:max-w-95 p-6 sm:p-7 rounded-2xl flex flex-col items-center text-center gap-0 border-0 shadow-2xl"
      >
        <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Trash2 class="w-5 h-5 text-red-500" />
        </div>
        <DialogHeader class="gap-0 flex flex-col items-center text-center">
          <DialogTitle class="text-xl font-bold text-gray-900 mb-2">
            Delete certification?
          </DialogTitle>
          <DialogDescription class="text-sm text-gray-500 text-center max-w-65 leading-relaxed mb-6">
            Are you sure you want to permanently remove this certification?
          </DialogDescription>
        </DialogHeader>
        <div class="grid grid-cols-2 gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            class="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm h-auto cursor-pointer"
            @click="itemToDeleteId = null"
          >
            Cancel
          </Button>
          <Button
            class="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-xs h-auto cursor-pointer"
            type="button"
            @click="confirmDelete"
          >
            Delete certification
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
