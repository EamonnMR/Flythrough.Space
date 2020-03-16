/* Singletons. There's no code to enforce it, just don't set these unless you
 * mean to. Can be imported for use anywhere so we don't need to pass data, scene,
 * etc all over a bunch of unrelated functions.
 */

export var _ = {
  data: null,
  scene: null,
  state_manager: null,
  player: null,
  canvas: null,
  hud: null,
  camera: null,
  settings: {},
  entities: null,
  shadows: [],
};

