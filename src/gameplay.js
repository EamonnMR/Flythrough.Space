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
    console.log('entered gameplay state');
    if (this.empty){
      this.setup_world();
    }
    this.entMan.unpause();
    input.bindInputFunctions({
      'toggle_pause': () => {

        console.log('toggle_pause')
        // Note that different exits do different things to the state,
        // so we don't actually put the functionality into the exit() function,
        // we put it before the enter() call.
        this.entMan.pause();
        this.parent.enter_state('map');
      },

      'reset_game': () => {
        this.clear_world();
        this.setup_world();  
      },

      'hyper_jump': () => {
        console.log("HJ from" + current_system + " to " + selected_system);
			  if ( this.player_data.selected_system
            != this.player_data.selected_system
        ) {
      	  this.player_data.current_system = this.player_data.selected_system;
			  } else {
          console.log( "Tried to HJ to bad system");
          return;
        }
        this.clear_world();
        this.setup_world();
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
