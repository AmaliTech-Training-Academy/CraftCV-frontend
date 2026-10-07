/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useCVState } from './useCVState'
import { $api } from '../utils/api'

export function useAutosave() {
  const {
    cvId,
    cvTitle,
    selectedTemplateId,
    personal,
    summary,
    education,
    experience,
    skills,
    certifications,
    saveState,
    lastSavedAt,
    saveErrorMessage,
  } = useCVState()

  // Track the last known saved state to avoid redundant API calls
  const lastSavedData = ref<any>(null)

  // Track if personal details exist on the backend
  const hasPersonalDetails = ref(false)

  // A flag to ensure we don't queue saves while actively loading
  const isLoading = ref(false)
  const isSaving = ref(false)
  const hasPendingSave = ref(false)

  // Update the UI timestamp
  const updateTimestamp = (isoString: string) => {
    lastSavedAt.value = isoString
  }

  // Fetch the CV when the editor opens
  const loadCV = async (id: string) => {
    isLoading.value = true
    try {
      const data = await $api<any>(`/cvs/${id}/`)

      // Populate local state
      cvId.value = data.cvId
      cvTitle.value = data.title || 'Untitled'
      summary.value = data.professionalSummary || ''
      selectedTemplateId.value = data.template || ''

      if (data.personalDetail) {
        personal.value = { ...personal.value, ...data.personalDetail }
        hasPersonalDetails.value = true
      }

      if (data.lastSavedAt) {
        updateTimestamp(data.lastSavedAt)
      }

      // Load related sections
      education.value = data.educations || []
      experience.value = data.experiences || []
      skills.value = data.skills || []
      certifications.value = data.certifications || []

      // Store clone of data for diffing directly from loaded state
      lastSavedData.value = clone({
        title: cvTitle.value,
        summary: summary.value,
        personal: personal.value,
        education: education.value,
        experience: experience.value,
        skills: skills.value,
        certifications: certifications.value,
      })
    }
    catch (err: any) {
      console.error('Failed to load CV:', err)
      saveErrorMessage.value = 'Failed to load CV.'
    }
    finally {
      isLoading.value = false
    }
  }

  // Deep clone helper
  const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

  // Capture the current state as the "last saved" baseline
  const captureSavedState = () => {
    // Only treat certifications as saved on backend if they were already saved or have required fields filled
    const savedCertifications = (certifications.value || []).filter((c: any) => {
      const wasAlreadySaved = lastSavedData.value?.certifications?.some((lc: any) => lc.id === c.id)
      return wasAlreadySaved || Boolean(c.name?.trim() && c.issuer?.trim())
    })

    lastSavedData.value = clone({
      title: cvTitle.value,
      summary: summary.value,
      personal: personal.value,
      education: education.value,
      experience: experience.value,
      skills: skills.value,
      certifications: savedCertifications,
    })
  }

  // Map local keys to backend keys for sections
  const sectionEndpoints: Record<string, string> = {
    education: 'educations',
    experience: 'experiences',
    skills: 'skills',
    certifications: 'certifications',
  }

  // The main save function
  const executeSave = async () => {
    if (isLoading.value) return

    saveState.value = 'saving'
    isSaving.value = true
    saveErrorMessage.value = null

    try {
      const stateToSave = clone({
        title: cvTitle.value,
        summary: summary.value,
        personal: personal.value,
        education: education.value,
        experience: experience.value,
        skills: skills.value,
        certifications: certifications.value,
      })

      // 1. Create CV if it doesn't exist
      if (!cvId.value) {
        const createRes = await $api<any>('/cvs/', {
          method: 'POST',
          body: {
            title: stateToSave.title || 'Untitled',
            professionalSummary: stateToSave.summary || '',
          },
        })
        cvId.value = createRes?.cvId || createRes?.id || createRes?.uuid
        if (createRes?.lastSavedAt) updateTimestamp(createRes.lastSavedAt)

        // Since we just created it, the backend has our title and summary.
        // We can skip patching them in step 2 if we want, but letting it flow through is fine too.
      }

      // 1. CV-level changes (title, summary)
      const cvPatches: any = {}
      if (stateToSave.title !== lastSavedData.value?.title) cvPatches.title = stateToSave.title
      if (stateToSave.summary !== lastSavedData.value?.summary) cvPatches.professionalSummary = stateToSave.summary

      // TODO: Section ID array comparisons for associations

      if (Object.keys(cvPatches).length > 0) {
        const res = await $api<any>(`/cvs/${cvId.value}/`, {
          method: 'PATCH',
          body: cvPatches,
        })
        if (res?.lastSavedAt) updateTimestamp(res.lastSavedAt)
      }

      // 2. Personal Details changes
      const personalPatches: Record<string, any> = {}
      const currentPersonal = stateToSave.personal || {}
      const lastPersonal = lastSavedData.value?.personal || {}

      for (const key of Object.keys(currentPersonal)) {
        if (currentPersonal[key] !== lastPersonal[key]) {
          personalPatches[key] = currentPersonal[key]
        }
      }

      if (Object.keys(personalPatches).length > 0) {
        const isCreation = !hasPersonalDetails.value

        await $api<any>(`/cvs/personal-details/`, {
          method: isCreation ? 'PUT' : 'PATCH',
          body: isCreation ? currentPersonal : personalPatches,
        })

        hasPersonalDetails.value = true

        // Fetch CV again to get the updated lastSavedAt timestamp
        const cvRes = await $api<any>(`/cvs/${cvId.value}/`)
        if (cvRes?.lastSavedAt) updateTimestamp(cvRes.lastSavedAt)
      }

      // 3. Section changes
      let sectionsChanged = false
      const currentSectionIds: Record<string, string[]> = {}

      for (const [localKey, endpoint] of Object.entries(sectionEndpoints)) {
        const currentItems = stateToSave[localKey] || []
        const lastItems = lastSavedData.value?.[localKey] || []

        const currentIds = new Set(currentItems.map((i: any) => i.id))
        const lastIds = new Set(lastItems.map((i: any) => i.id))

        const finalIds: string[] = []

        // Deletions
        const deletedIds = lastItems.filter((i: any) => !currentIds.has(i.id)).map((i: any) => i.id)
        for (const id of deletedIds) {
          try {
            if (!id.startsWith('mock-') && !id.startsWith('temp_') && !id.startsWith('cert_') && !id.startsWith('skill_')) {
              await $api<any>(`/cvs/${endpoint}/${id}/`, { method: 'DELETE' })
            }
            sectionsChanged = true
          }
          catch (e) {
            console.warn(`Failed to delete ${id} from ${endpoint}`, e)
          }
        }

        // Additions and Modifications
        for (let i = 0; i < currentItems.length; i++) {
          const item = currentItems[i]
          const isNew = !lastIds.has(item.id) || item.id.startsWith('mock-') || item.id.startsWith('temp_')
          const lastItem = lastItems.find((li: any) => li.id === item.id)

          // Only save new certifications once required fields are filled (avoids POSTing blank certifications on "Add Certification")
          if (isNew && localKey === 'certifications' && (!item.name?.trim() || !item.issuer?.trim())) {
            continue
          }

          // Always omit the frontend displayOrder, use array index, and remove local id for POST
          const { id, displayOrder, ...payload } = item
          payload.displayOrder = i

          try {
            if (isNew) {
              const res = await $api<any>(`/cvs/${endpoint}/`, {
                method: 'POST',
                body: payload,
              })

              // Mutate the reactive state directly so the UI knows the real ID
              const stateRef = (useCVState() as any)[localKey]
              const targetItem = stateRef.value?.find((s: any) => s.id === item.id)
              if (targetItem) {
                targetItem.id = res?.id || res?.uuid || id
              }
              else if (stateRef.value?.[i]) {
                stateRef.value[i].id = res?.id || res?.uuid || id
              }
              finalIds.push(res?.id || res?.uuid || id)
              sectionsChanged = true
            }
            else if (JSON.stringify(item) !== JSON.stringify(lastItem)) {
              await $api<any>(`/cvs/${endpoint}/${id}/`, {
                method: 'PATCH',
                body: payload,
              })
              finalIds.push(id)
            }
            else {
              finalIds.push(id)
            }
          }
          catch (e: any) {
            console.warn(`Failed to save ${id} in ${endpoint}`, e)
            finalIds.push(id) // keep the id so it doesn't get removed from CV
            // If it's a 400 validation error, we just keep it dirty
            throw e
          }
        }

        currentSectionIds[endpoint] = finalIds
      }

      // If sections changed, PATCH the CV to update relationships
      if (sectionsChanged && cvId.value) {
        const res = await $api<any>(`/cvs/${cvId.value}/`, {
          method: 'PATCH',
          body: currentSectionIds,
        })
        if (res?.lastSavedAt) updateTimestamp(res.lastSavedAt)
      }

      // Update our baseline
      captureSavedState()
      saveState.value = 'saved'
    }
    catch (err: any) {
      console.error('Autosave failed:', err)
      saveState.value = 'error'
      saveErrorMessage.value = err?.data?.message || 'Couldn\'t save. Retrying...'
      // TODO: Implement bounded backoff retry
    }
    finally {
      isSaving.value = false
      if (hasPendingSave.value) {
        hasPendingSave.value = false
        // Queue the next save
        setTimeout(executeSave, 1000)
      }
    }
  }

  // Trigger autosave with debounce
  const triggerAutosave = () => {
    if (isSaving.value) {
      hasPendingSave.value = true
      return
    }
    executeSave()
  }

  // Watch for ANY change in the relevant state, debounced by 1 second
  watchDebounced(
    [cvTitle, summary, personal, education, experience, skills, certifications],
    () => {
      if (isLoading.value) return // Don't trigger save while initially populating data
      triggerAutosave()
    },
    { deep: true, debounce: 1000, maxWait: 15000 },
  )

  return {
    loadCV,
    triggerAutosave,
  }
}
