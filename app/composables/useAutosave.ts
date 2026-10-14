import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useCVState } from './useCVState'
import { useCVs } from './useCVs'
import { useTemplates } from './useTemplates'
import { $api, extractErrorMessage, extractFieldErrors } from '../utils/api'
import { formatMonthYear, normalizeDate } from '../utils/cvText'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useAutosave() {
  const {
    cvId,
    cvTitle,
    hasActiveCV,
    selectedTemplateId,
    selectedTemplateSlug,
    personal,
    summary,
    education,
    experience,
    skills,
    certifications,
    saveState,
    lastSavedAt,
    saveErrorMessage,
    saveErrorDetail,
  } = useCVState()

  // Track the last known saved state to avoid redundant API calls
  const lastSavedData = ref<any>(null)

  /**
   * The CV name we last derived from the professional title. Holding onto it is
   * what lets the rename follow the user's typing: without it, the first save to
   * fire during a pause would latch a half-typed word ("Senior") as if the user
   * had chosen it, and every later save would leave it alone.
   */
  const autoTitle = ref<string | null>(null)

  /**
   * The personal-details fields the backend models, keyed by what the editor
   * calls them. The backend says `websiteUrl` where the editor says `website`.
   *
   * Everything else the editor collects — title — has no backend field and stays local.
   * they are never sent and a PATCH leaves whatever is there untouched.
   */
  const personalDetailKeys: Record<string, string> = {
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    phone: 'phone',
    location: 'location',
    website: 'websiteUrl',
    linkedin: 'linkedinUrl',
    github: 'githubUrl',
    twitter: 'twitterUrl',
  }

  /**
   * The personal-details fields the editor collects that the backend does not
   * model. Previously `title` lived here before being mapped to the CV entity's
   * `professionalTitle` endpoint.
   */
  const localOnlyPersonalKeys = [] as const

  /**
   * Whether the backend already holds a personal-details record for the open CV.
   *
   * It does not create one alongside the CV: `/cvs/personal-details/` exposes
   * GET, PUT and PATCH but no POST, and a PATCH against a CV that has none comes
   * back 404 "cv resource not found". So the record's first write has to be a
   * PUT, and everything after it a PATCH.
   */
  const hasPersonalDetails = ref(false)

  // A flag to ensure we don't queue saves while actively loading
  const isLoading = ref(false)
  const isSaving = ref(false)
  const hasPendingSave = ref(false)

  // Update the UI timestamp
  const updateTimestamp = (isoString: string) => {
    lastSavedAt.value = isoString
  }

  /**
   * The header badge is one small pill, so it names the field the backend
   * objected to rather than listing every message; the messages themselves are
   * rendered beside their fields by the editor pages.
   *
   * Without this the badge shows whatever `extractErrorMessage` settled on,
   * which for a validation response is DRF's generic summary — "Invalid CV
   * data." — and says nothing about what to fix.
   */
  const summariseFieldErrors = (fieldErrors: Record<string, string>) => {
    const [field, message] = Object.entries(fieldErrors)[0] ?? []
    if (!field || !message) return ''

    // `firstName` reads as "First name" in a sentence.
    const spaced = field.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    const label = spaced.charAt(0).toUpperCase() + spaced.slice(1)

    const others = Object.keys(fieldErrors).length - 1
    return `${label}: ${message}${others > 0 ? ` (+${others} more)` : ''}`
  }

  /**
   * The CV carries whatever identifies its template, but the live preview is
   * keyed by slug. If the stored value is already a slug we keep it; otherwise
   * we look the id up in the template list, so a CV reopened after a refresh —
   * or a different CV opened from My Resumes — renders in the template it was
   * saved with rather than whatever the slug cookie happened to hold.
   */
  const resolveTemplateSlug = async (template: unknown) => {
    const value = typeof template === 'string' ? template.trim() : ''
    if (!value) return

    const { templates, fetchTemplates } = useTemplates()
    if (templates.value.length === 0) {
      try {
        await fetchTemplates()
      }
      catch {
        // The template id is still worth keeping even if the list won't load.
      }
    }

    const bySlug = templates.value.find(t => t.slug === value.toLowerCase())
    if (bySlug) {
      selectedTemplateSlug.value = bySlug.slug
      return
    }

    const byId = templates.value.find(t => t.templateId === value)
    if (byId) selectedTemplateSlug.value = byId.slug
  }

  // Fetch the CV when the editor opens
  const loadCV = async (id: string) => {
    isLoading.value = true
    try {
      const data = await $api<any>(`/cvs/${id}/`)
      const incomingId = data.cvId || data.id || data.uuid || id

      // Sections are read before anything on screen is touched. A collection
      // that cannot be read fails the load outright, and a half-loaded editor
      // still showing the previous CV's sections would save them onto this one.
      const sections = await fetchSections(data)

      // Opening a CV other than the one already open replaces the editor's
      // fields wholesale. The sections below are assigned outright, but the
      // personal record is merged, and its local-only fields have no backend
      // field to come back from — left alone they would carry the CV being
      // left into the one being opened, professional title included, which is
      // what the CV's own name is derived from.
      if (cvId.value && cvId.value !== incomingId) {
        personal.value.title = ''
        for (const key of localOnlyPersonalKeys) (personal.value as any)[key] = ''
      }

      // Populate local state
      cvId.value = incomingId
      cvTitle.value = data.title || 'Untitled'
      summary.value = data.professionalSummary || ''
      if (data.professionalTitle !== undefined) {
        personal.value.title = data.professionalTitle || ''
      }
      selectedTemplateId.value = data.template || ''
      hasActiveCV.value = true
      await resolveTemplateSlug(data.template)

      // Whether the record came back decides PUT-or-PATCH for the next write.
      hasPersonalDetails.value = Boolean(data.personalDetail)

      if (data.personalDetail) {
        // Read back through the same map the save uses, in reverse: the backend
        // returns `websiteUrl` where the Website control is bound to `website`,
        // so merging the record verbatim would leave that field blank on
        // refresh. Keys the editor has no control for are deliberately skipped
        // rather than carried around as stray state.
        const incoming: Record<string, any> = {}
        for (const [localKey, backendKey] of Object.entries(personalDetailKeys)) {
          if (data.personalDetail[backendKey] !== undefined) {
            incoming[localKey] = data.personalDetail[backendKey]
          }
          else if (data.personalDetail[localKey] !== undefined) {
            incoming[localKey] = data.personalDetail[localKey]
          }
        }
        personal.value = { ...personal.value, ...incoming }
      }

      if (data.lastSavedAt) {
        updateTimestamp(data.lastSavedAt)
      }

      // Load related sections, mapping backend fields back to frontend fields.
      // Guard: if the CV serializer returned raw UUID strings instead of nested
      // objects (PrimaryKeyRelatedField), skip those items — they have no
      // displayable fields and would crash the template on .trim().
      education.value = (data.educations || []).filter((e: any) => e && typeof e === 'object').map((e: any) => ({
        ...e,
        id: e.educationId || e.education_id || e.id,
        school: e.school || e.institution || '',
        degree: e.degree || '',
        fieldOfStudy: e.fieldOfStudy || e.field_of_study || '',
        location: e.location || '',
        startDate: formatMonthYear(e.startDate || e.start_date),
        endDate: (e.endDate || e.end_date) ? formatMonthYear(e.endDate || e.end_date) : null,
        isCurrent: Boolean(e.isCurrent ?? e.is_current ?? false),
        description: e.description || '',
      }))
      experience.value = (data.experiences || []).filter((e: any) => e && typeof e === 'object').map((e: any) => ({
        ...e,
        id: e.experienceId || e.experience_id || e.id,
        title: e.title || e.role || '',
        company: e.company || '',
        location: e.location || '',
        startDate: formatMonthYear(e.startDate || e.start_date),
        endDate: (e.endDate || e.end_date) ? formatMonthYear(e.endDate || e.end_date) : null,
        isCurrent: Boolean(e.isCurrent ?? e.is_current ?? false),
        description: e.description || '',
      }))
      skills.value = (data.skills || []).filter((s: any) => s && typeof s === 'object').map((s: any) => ({
        ...s,
        id: s.skillId || s.skill_id || s.id,
        name: s.name || '',
        level: s.level || s.proficiency || 'Intermediate',
      }))
      certifications.value = (data.certifications || []).filter((c: any) => c && typeof c === 'object').map((c: any) => ({
        ...c,
        id: c.certificationId || c.certification_id || c.id,
        name: c.name || '',
        issuer: c.issuer || '',
        date: formatMonthYear(c.date || c.issueDate || c.issue_date),
        expirationDate: formatMonthYear(c.expirationDate || c.expiration_date),
        doesNotExpire: c.doesNotExpire ?? false,
        credentialId: c.credentialId || '',
        credentialUrl: c.credentialUrl || '',
        description: c.description || '',
      }))

      // Store clone of data for diffing directly from loaded state
      lastSavedData.value = clone({
        title: cvTitle.value,
        summary: summary.value,
        template: selectedTemplateId.value,
        personal: personal.value,
        education: education.value,
        experience: experience.value,
        skills: skills.value,
        certifications: certifications.value,
      })
    }
    catch (err: any) {
      console.error('Failed to load CV:', err)
      saveErrorMessage.value = extractErrorMessage(err, 'Failed to load CV.')
    }
    finally {
      isLoading.value = false
    }
  }

  // Deep clone helper
  const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

  /**
   * Whether a brand-new entry carries everything the backend requires of it.
   *
   * "Add Entry" pushes a blank row straight into state, so without this the row
   * is POSTed as soon as it appears, the backend rejects it, and the throw
   * stops every section after it in the save.
   */
  const isEntryComplete = (localKey: string, item: any): boolean => {
    // `issueDate` is required by the backend, so a certification without one
    // is refused outright rather than saved.
    if (localKey === 'certifications') return Boolean(item.name?.trim() && item.issuer?.trim() && item.date?.trim())
    if (localKey === 'skills') return Boolean(item.name?.trim())
    if (localKey === 'education') {
      return Boolean(
        item.school?.trim() && item.degree?.trim() && item.fieldOfStudy?.trim() && item.startDate?.trim()
        && (item.isCurrent || item.endDate?.trim()),
      )
    }
    if (localKey === 'experience') {
      return Boolean(
        item.company?.trim() && item.title?.trim() && item.startDate?.trim()
        && (item.isCurrent || item.endDate?.trim()),
      )
    }
    return true
  }

  // Capture the current state as the "last saved" baseline
  const captureSavedState = () => {
    // An entry that was never written is not on the backend, so recording it as
    // saved would make the next cycle PATCH an id that does not exist.
    const saved = (localKey: string, items: any[]) => (items || []).filter((item: any) =>
      lastSavedData.value?.[localKey]?.some((last: any) => last.id === item.id) || isEntryComplete(localKey, item),
    )

    lastSavedData.value = clone({
      title: cvTitle.value,
      summary: summary.value,
      template: selectedTemplateId.value,
      personal: personal.value,
      education: saved('education', education.value),
      experience: saved('experience', experience.value),
      skills: saved('skills', skills.value),
      certifications: saved('certifications', certifications.value),
    })
  }

  /**
   * Record a section entry as saved the moment its write succeeds.
   *
   * The baseline is otherwise only rewritten by `captureSavedState` once a save
   * reaches the end. When a later write fails, the save stops before that, so an
   * entry whose POST already succeeded still looks new on the next cycle and is
   * created a second time — which is how the same details kept multiplying with
   * a fresh id on every attempt.
   */
  const markSaved = (localKey: string, item: any, savedId: string) => {
    if (!lastSavedData.value) lastSavedData.value = {}
    const saved = lastSavedData.value[localKey] || (lastSavedData.value[localKey] = [])
    const record = { ...item, id: savedId }
    const at = saved.findIndex((entry: any) => entry.id === item.id || entry.id === savedId)
    if (at === -1) saved.push(record)
    else saved[at] = record
  }

  /**
   * Creating a CV lives in `useCVs` — this composable watches the CV state, so
   * owning the create here would mean the watcher could race its own author.
   */
  const { createCV } = useCVs()

  // Map local keys to backend keys for sections
  const sectionEndpoints: Record<string, string> = {
    education: 'educations',
    experience: 'experiences',
    skills: 'skills',
    certifications: 'certifications',
  }

  /**
   * Fields the editor and the backend disagree on the name of, per section.
   * Experience calls the job `role` and education calls the school
   * `institution`; sent under the editor's names, DRF silently drops both and
   * the record saves without them.
   */
  const sectionFieldNames: Record<string, Record<string, string>> = {
    experiences: { title: 'role' },
    educations: { school: 'institution' },
    certifications: { date: 'issueDate' },
  }

  /** A section record's own id, whichever name its serializer gives it. */
  const recordId = (record: any): string =>
    record?.skillId || record?.educationId || record?.experienceId || record?.certificationId || record?.id || ''

  /**
   * A collection endpoint answers with a plain array; DRF's paginated envelope
   * is unwrapped too, so either shape reads.
   */
  const asList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload
    if (!payload || typeof payload !== 'object') return []
    for (const key of ['results', 'data', 'items']) {
      if (Array.isArray(payload[key])) return payload[key]
    }
    return []
  }

  /**
   * The editor's own shape for a section record, filled from the backend's.
   *
   * The backend models `institution`, `role` and `issueDate` where the forms
   * bind `school`, `title` and `date` — the names `sectionFieldNames` translates
   * on the way out — so merging a record in verbatim would leave those inputs
   * blank on reload.
   */
  const sectionMappers: Record<string, (record: any) => any> = {
    educations: (e: any) => ({
      ...e,
      id: e.educationId || e.id,
      school: e.institution || e.school || '',
      degree: e.degree || '',
      fieldOfStudy: e.fieldOfStudy || e.field_of_study || '',
      startDate: formatMonthYear(e.startDate),
      endDate: e.endDate ? formatMonthYear(e.endDate) : null,
    }),
    experiences: (e: any) => ({
      ...e,
      id: e.experienceId || e.id,
      title: e.role || e.title || '',
      company: e.company || '',
      startDate: formatMonthYear(e.startDate),
      endDate: e.endDate ? formatMonthYear(e.endDate) : null,
    }),
    skills: (s: any) => ({
      ...s,
      id: s.skillId || s.id,
      level: s.level || s.proficiency || 'Intermediate',
    }),
    certifications: (c: any) => ({
      ...c,
      id: c.certificationId || c.id,
      date: formatMonthYear(c.issueDate || c.date || c.issue_date),
      expirationDate: formatMonthYear(c.expirationDate || c.expiration_date),
      doesNotExpire: c.doesNotExpire ?? false,
      credentialId: c.credentialId || '',
      credentialUrl: c.credentialUrl || '',
      description: c.description || '',
    }),
  }

  /**
   * Read every section the open CV selects.
   *
   * The CV response carries ids, not records — "The section properties contain
   * IDs, not full section objects. To populate section forms, fetch the user's
   * section collection and select the records whose IDs appear on the CV"
   * (Autosave Contract §3). Each section is therefore read from its own
   * collection, and the CV's id array picks which records belong to it, in the
   * order it lists them.
   *
   * Reading those ids as if they were records is what filled the editor with
   * "Education 1" cards and blank forms: spreading a uuid string yields its
   * characters, so every field mapped to undefined and fell back to ''. It is
   * also what made autosave recreate records the CV already had — nothing was
   * ever loaded, so nothing was ever recognised as already saved.
   *
   * A collection that cannot be read throws rather than resolving to an empty
   * section. Empty is what the next save writes back as the CV's selection, so
   * a silent failure here would detach every record the CV still holds.
   */
  const fetchSections = async (cv: any): Promise<Record<string, any[]>> => {
    const fetched = await Promise.all(
      Object.entries(sectionEndpoints).map(async ([localKey, endpoint]) => {
        const selectedIds: string[] = Array.isArray(cv?.[endpoint]) ? cv[endpoint] : []
        if (selectedIds.length === 0) return [localKey, []] as const

        const records = asList(await $api<any>(`/cvs/${endpoint}/`))
        const byId = new Map(records.map((record: any) => [recordId(record), record]))
        const items = selectedIds
          .map(selected => byId.get(selected))
          .filter((record): record is any => Boolean(record))
          .map(record => sectionMappers[endpoint]!(record))

        return [localKey, items] as const
      }),
    )

    return Object.fromEntries(fetched)
  }

  // The main save function
  const executeSave = async () => {
    if (isLoading.value) return

    saveState.value = 'saving'
    isSaving.value = true
    saveErrorMessage.value = null
    // Cleared up front so the messages beside the fields clear as soon as the
    // save they belong to is superseded, rather than lingering until the next
    // one is rejected too.
    saveErrorDetail.value = { target: null, fields: {} }

    /**
     * Which record the request in flight is writing — a section item's id, or
     * 'personal' — so the messages a rejection comes back with can be shown on
     * that record and no other. Set immediately before each write, because the
     * failure that ends the save is the write it was set for.
     */
    let errorTarget: string | null = null

    try {
      // A CV that has no name of its own takes the user's professional title, so
      // the card in My Resumes reads "Senior Product Designer" rather than
      // "Untitled" (integration guide, Figure 6).
      //
      // `autoTitle` is the name this code last wrote. While the header still
      // holds that value the rename keeps following the professional title, so
      // typing "Senior", pausing, then finishing the word does not freeze the CV
      // as "Senior". The moment the user types their own name in the header the
      // value stops matching and we never touch it again.
      const profession = personal.value.title?.trim()
      const titleIsStillOurs = cvTitle.value === autoTitle.value
      if (profession && (titleIsStillOurs || !cvTitle.value.trim() || cvTitle.value === 'Untitled')) {
        cvTitle.value = profession
        autoTitle.value = profession
      }

      const stateToSave = clone({
        title: cvTitle.value,
        summary: summary.value,
        template: selectedTemplateId.value,
        personal: personal.value,
        education: education.value,
        experience: experience.value,
        skills: skills.value,
        certifications: certifications.value,
      })

      // 1. Create CV if it doesn't exist
      //
      // The new id is kept locally instead of being re-read from `cvId` below.
      // `useCookie` hands every caller its own ref — unlike `useState`, which is
      // shared by key — so this composable's `cvId` still reads null after
      // another instance has created the CV, and every write further down would
      // address `/cvs/null/`. `createCV` returns the id it adopted, which is the
      // CV that actually exists.
      let activeId = cvId.value
      if (!activeId) {
        activeId = await createCV(selectedTemplateId.value || undefined)

        // A CV that did not exist a moment ago cannot have personal details yet.
        // Leaving this flag as the previous CV left it would send the next write
        // down the PATCH path, where there is nothing to patch — a 404, and the
        // save never gets past it.
        hasPersonalDetails.value = false

        // Since we just created it, the backend has our title and summary.
        // We can skip patching them in step 2 if we want, but letting it flow through is fine too.
      }

      // 1. CV-level changes (title, summary, template, professionalTitle)
      const cvPatches: any = {}
      if (stateToSave.title !== lastSavedData.value?.title) cvPatches.title = stateToSave.title
      if (stateToSave.summary !== lastSavedData.value?.summary) cvPatches.professionalSummary = stateToSave.summary
      if (stateToSave.personal?.title !== lastSavedData.value?.personal?.title) cvPatches.professionalTitle = stateToSave.personal?.title || ''
      // Guarded on truthiness as well as difference: a CV with no template yet
      // would otherwise PATCH an empty string over whatever the backend holds.
      if (stateToSave.template && stateToSave.template !== lastSavedData.value?.template) cvPatches.template = stateToSave.template

      // TODO: Section ID array comparisons for associations

      if (Object.keys(cvPatches).length > 0) {
        // The CV itself holds the summary, which is a field the editor shows, so
        // a rejection of this write belongs to 'cv' rather than to no record.
        errorTarget = 'cv'

        const res = await $api<any>(`/cvs/${activeId}/`, {
          method: 'PATCH',
          body: cvPatches,
        })
        if (res?.lastSavedAt) updateTimestamp(res.lastSavedAt)
      }

      // 2. Personal Details changes
      //
      // The first write creates the record and every write after it updates:
      // this endpoint has no POST and the backend does not make the row with the
      // CV, so a PATCH on a fresh CV 404s with "cv resource not found".
      //
      // A PUT is a full replace that validates every field, which is what 400'd
      // before — so creating waits until the fields the backend requires are
      // filled. Until then the CV itself and the sections still save; a blank
      // required field must not take the whole save down with it.
      const personalPatches: Record<string, any> = {}
      const currentPersonal = stateToSave.personal || {}
      const lastPersonal = lastSavedData.value?.personal || {}

      for (const [localKey, backendKey] of Object.entries(personalDetailKeys)) {
        if (currentPersonal[localKey] !== lastPersonal[localKey]) {
          personalPatches[backendKey] = currentPersonal[localKey]
        }
      }

      const isCreation = !hasPersonalDetails.value
      // The backend's own required set. It answers any of these blank with
      // "This field may not be blank" — phone and location included, which is
      // what made the first PUT 400 — so the record is only created once all
      // five carry something.
      const requiredFilled = Boolean(
        currentPersonal.firstName?.trim()
        && currentPersonal.lastName?.trim()
        && currentPersonal.email?.trim()
        && currentPersonal.phone?.trim()
        && currentPersonal.location?.trim(),
      )

      if (Object.keys(personalPatches).length > 0 && (!isCreation || requiredFilled)) {
        // A PUT has to carry the whole record, so the full set the editor knows
        // about goes — under the names the backend models.
        const fullPersonal: Record<string, any> = {}
        for (const [localKey, backendKey] of Object.entries(personalDetailKeys)) {
          fullPersonal[backendKey] = currentPersonal[localKey] ?? ''
        }

        errorTarget = 'personal'

        await $api<any>(`/cvs/personal-details/`, {
          method: isCreation ? 'PUT' : 'PATCH',
          body: isCreation ? fullPersonal : personalPatches,
        })

        hasPersonalDetails.value = true

        // Fetch CV again to get the updated lastSavedAt timestamp
        const cvRes = await $api<any>(`/cvs/${activeId}/`)
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

        // Check for reordering — if order changed, PATCH each moved item with its new displayOrder
        const lastFinalIds = lastItems.map((i: any) => i.id).filter((id: string) => !deletedIds.includes(id))
        const currentFinalIds = currentItems.map((i: any) => i.id)
        const orderChanged = JSON.stringify(lastFinalIds) !== JSON.stringify(currentFinalIds)
        if (orderChanged) {
          sectionsChanged = true
          for (let i = 0; i < currentItems.length; i++) {
            const item = currentItems[i]
            const lastIndex = lastFinalIds.indexOf(item.id)
            if (lastIndex !== -1 && lastIndex !== i && !item.id.startsWith('mock-') && !item.id.startsWith('temp_')) {
              try {
                await $api<any>(`/cvs/${endpoint}/${item.id}/`, {
                  method: 'PATCH',
                  body: { displayOrder: i },
                })
              }
              catch (e) {
                console.warn(`Failed to update displayOrder for ${item.id} in ${endpoint}`, e)
              }
            }
          }
        }

        // Additions and Modifications
        for (let i = 0; i < currentItems.length; i++) {
          const item = currentItems[i]
          const isNew = !lastIds.has(item.id) || item.id.startsWith('mock-') || item.id.startsWith('temp_')
          const lastItem = lastItems.find((li: any) => li.id === item.id)

          // Only save a new entry once its required fields are filled — see
          // isEntryComplete.
          if (isNew && !isEntryComplete(localKey, item)) {
            continue
          }

          // Always omit the frontend displayOrder, use array index, and remove local id for POST
          const { id, displayOrder, ...fields } = item
          fields.displayOrder = i

          // Hand the backend the field names it models (see sectionFieldNames).
          // Built as a new object rather than renamed in place: the rename is a
          // map, so the editor's key can only be named dynamically, and it has
          // to be gone rather than left alongside the backend's.
          const rename = sectionFieldNames[endpoint]
          const payload: Record<string, any> = {}
          for (const [key, value] of Object.entries(fields)) {
            const apiKey = rename?.[key] ?? key
            payload[apiKey] = value
          }

          // Education and experience dates arrive from the picker as "May 2024"
          // and are stored as YYYY-MM-DD; a current role has no end date.
          if (localKey === 'education' || localKey === 'experience') {
            payload.startDate = normalizeDate(payload.startDate)
            payload.endDate = payload.isCurrent ? null : normalizeDate(payload.endDate)
          }

          // Special formatting for certifications payload according to ReDoc schema
          if (localKey === 'certifications') {
            payload.issueDate = normalizeDate(payload.issueDate)
            payload.expirationDate = normalizeDate(payload.expirationDate)
            payload.doesNotExpire = Boolean(payload.doesNotExpire)
            // A cleared URL has to be sent, not left out: a PATCH that omits the
            // key keeps the stored link, which then comes back on reload. The
            // backend field is `URLField(blank=True)`, so '' is accepted — only
            // null is rejected.
            if (!payload.credentialUrl?.trim()) payload.credentialUrl = ''
            if (!payload.credentialId?.trim()) payload.credentialId = ''
            if (!payload.description?.trim()) payload.description = ''
          }

          try {
            // Whichever of these two writes goes out is the one a rejection
            // will be about, so the messages land on this entry.
            errorTarget = item.id

            if (isNew) {
              const res = await $api<any>(`/cvs/${endpoint}/`, {
                method: 'POST',
                body: payload,
              })

              // Mutate the reactive state directly so the UI knows the real ID
              const stateRef = (useCVState() as any)[localKey]
              const targetItem = stateRef.value?.find((s: any) => s.id === item.id)
              const realId = res?.skillId || res?.educationId || res?.experienceId || res?.certificationId || res?.id || res?.uuid || id
              if (targetItem) {
                targetItem.id = realId
              }
              else if (stateRef.value?.[i]) {
                stateRef.value[i].id = realId
              }
              finalIds.push(realId)
              sectionsChanged = true
              // The record exists now, so it must not look new to the next
              // attempt (see markSaved).
              markSaved(localKey, item, realId)
            }
            else if (JSON.stringify(item) !== JSON.stringify(lastItem)) {
              await $api<any>(`/cvs/${endpoint}/${id}/`, {
                method: 'PATCH',
                body: payload,
              })
              markSaved(localKey, item, id)
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
      if (sectionsChanged && activeId) {
        // The CV itself is not a record any field message is shown against, so
        // this write names no target.
        errorTarget = null

        const res = await $api<any>(`/cvs/${activeId}/`, {
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

      // The fields the backend names, for the editor to show beside them — filed
      // under the record the failing write was addressing, so they only render
      // on that one.
      const fieldErrors = extractFieldErrors(err)
      saveErrorDetail.value = { target: errorTarget, fields: fieldErrors }

      // extractErrorMessage understands DRF's shapes (detail, field arrays) and
      // tells a dead connection apart from a 5xx, so the banner can say which
      // rather than reporting a generic failure. When the response names
      // fields, though, it has told us exactly what is wrong and its own
      // summary is the least useful half of it.
      saveErrorMessage.value = summariseFieldErrors(fieldErrors)
        || extractErrorMessage(err, 'Couldn\'t save. Retrying...')
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
