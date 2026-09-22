import SingleColumnTemplate from './SingleColumnTemplate.vue'
import TwoColumnTemplate from './TwoColumnTemplate.vue'
import type { Component } from 'vue'

// Local registry mapping template identifiers to Vue components.
// The exact keys ('single-column', 'two-column') will need to match
// whatever identifier we extract from the backend's /api/templates/ response.
export const TEMPLATE_COMPONENTS: Record<string, Component> = {
  'single-column': SingleColumnTemplate,
  'two-column': TwoColumnTemplate,
}
