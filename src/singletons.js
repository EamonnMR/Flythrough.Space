// I've grown weary of passing everything around all of the time.
// I'm not going to transition immediately, but we should do some
// sort of hacky singletons.

export var singleton = {
  data: null,
  scene: null,
  state_manager: null,
  player: null,
};

export function set_singletons(data, scene, state_manager, player){
  singleton.data = data;
  singleton.scene = scene;
  singleton.state_manager = state_manager;
  singleton.player = player;
};

