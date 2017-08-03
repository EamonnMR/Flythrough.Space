import * as physics from "physics";
import * as weapon from "weapon";
import * as ecs from "ecs";
import * as input from "input";
import * as entities from "entities";
import * as collision from "collision";
import * as map from "map";
import * as system from "system";
import * as states from "states";
import * as hud from "hud";


export class GameplayState extends states.ViewState {

  constructor(scene, camera, data, player_data,
      dom_canvas) {
    super();

    this.data = data;
    this.scene = scene;
    this.camera = camera;

    this.player_data = player_data;
    this.dom_canvas = dom_canvas;

    this.entMan = new ecs.EntityManager([
      input.inputSystem,
      physics.velocitySystem,
      physics.speedLimitSystem,
      entities.modelPositionSystem,
      entities.cameraFollowSystem,
      weapon.weaponSystem,
      weapon.decaySystem,
      collision.collisionDetectionSystem,
      hud.selectionFollowSystem,
      hud.radarFollowSystem,
      ecs.deletionSystem
    ]);
    this.empty = true;
    this.world_models = [];
  }

  update(){
    this.entMan.update();
    if (this.hud){
      this.hud.update();
    }
  }

  enter(){
    if (this.empty){
      this.setup_world();
    }
    this.entMan.unpause();
    input.bindInputFunctions({
      toggle_pause: () => {

        // Note that different exits do different things to the state,
        // so we don't actually put the functionality into the exit() function,
        // we put it before the enter() call.
        this.entMan.pause();
        this.parent.enter_state('map');
      },

      reset_game: () => {
        this.clear_world();
        this.setup_world();  
      },

      hyper_jump: () => {
			  if ( this.player_data.current_system
            != this.player_data.selected_system
        ) {
      	  this.player_data.current_system = 
                this.player_data.selected_system;
          this.clear_world();
          this.setup_world();
			  } else {
          console.log( "Tried to HJ to bad system");
        }
      },

      try_land: () => {
        let sys_spobs = this.entMan.get_with(['spob_name']);
        let landable = this.find_closest_landable_to_player(sys_spobs);
        if (landable){
          this.player_data.current_spob = landable.spob_name;
          this.clear_world();
          this.parent.enter_state('landing');
        } else {
          // TODO: Alert the player that they can't land because there are no spobs
        }
      }
    });
  }

  create_world_models( system_name ){
    this.world_models = system.setup_system(
  		this.scene,
			this.camera,
			this.entMan,
   		system_name,
      this.hud,
      this.data
  	);
  }

	dispose_world_models(){
		for (let world_model of this.world_models){
       world_model.dispose();
    }

		this.world_models = [];
  }

  exit(){
    input.unbindInputFunctions();
  }

  clear_world(){
    this.entMan.clear();
    this.dispose_world_models();
    this.hud.dispose();
    this.hud = null;
    this.empty = true;
  }

  setup_world(){
    this.hud = new hud.HUD(this.scene, this.dom_canvas, this.entMan);
    this.create_world_models(this.player_data.current_system);
    this.empty = false;
  }

  get_player_ent(){
    return this.entMan.get_with(['input'])[0];
  }

  find_closest_landable_to_player(spobs){
    let min_distance = null;
    let player = this.get_player_ent();
    let choice = null;
    for(let spob of spobs){
      let distance = collision.distance(
          spob.position, player.position);
      if (!min_distance || min_distance > distance){
        min_distance = distance;
        choice = spob;
      }
    }
    return choice;
  }
}
