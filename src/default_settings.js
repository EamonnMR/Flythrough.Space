// Local storage does not like boolean values,
// but we need them to be truthy or falsey (for now)
// Thus... this hack

const TRUE = "true"

const FALSE = ""

export const DEFAULT_SETTINGS = {
  starfield: TRUE,
  // parallax_starfield: FALSE,
  // light_effects: TRUE,
  // pervasive_particles: FALSE,
  ai_leading: TRUE,
  // no_offset: FALSE,
  // mobile_controls: FALSE,
}

