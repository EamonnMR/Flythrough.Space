import * as physics from "physics";
import * as weapon from "weapon";
import * as ecs from "ecs";
import * as input from "input";
import * as entities from "entities";
import * as collision from "collision";
import * as map from "map";
import * as system from "system";
import * as states from "states";


export class GameplayState extends states.ViewState {

  constructor(scene, camera, mapdata, spobs, player_data) {
    super();
    this.mapdata = mapdata;
    this.spobs = spobs;

    this.scene = scene;
    this.camera = camera;

    this.player_data = player_data;

    this.entMan = new ecs.EntityManager([
      input.inputSystem,
      physics.velocitySystem,
      physics.speedLimitSystem,
      entities.modelPositionSystem,
      entities.cameraFollowSystem,
      weapon.weaponSystem,
      weapon.decaySystem,
      collision.collisionDetectionSystem,
      ecs.deletionSystem
    ]);
    this.empty = true;
    this.world_models = [];
  }

  update(){
    this.entMan.update();
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
        if (sys_spobs[0]){
          this.player_data.current_spob = sys_spobs[0].spob_name;
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
			this.mapdata.systems[ system_name ],
   		this.spobs
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
    this.empty = true;
  }

  setup_world(){
    this.create_world_models(this.player_data.current_system);
    this.empty = false;
  }
}
