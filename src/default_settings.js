// Local storage does not like boolean values,
// but we need them to be truthy or falsey (for now)
// Thus... this hack

const TRUE = "true"

const FALSE = ""

export const DEFAULT_SETTINGS = {
  // starfield: TRUE,
  // parallax_starfield: FALSE,
  light_effects: TRUE,
  // pervasive_particles: FALSE,
  ai_leading: TRUE,
  perspective: TRUE,
  star_stretching: TRUE,
  parallax_starfield: TRUE,
  glow_effect: TRUE,
  // mobile_controls: FALSE,
}

