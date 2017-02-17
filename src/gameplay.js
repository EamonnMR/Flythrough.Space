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

    this.world_models = [];
  }

  update(){
    this.entMan.update();
  }

  enter(){
    console.log('entered gameplay state');
		this.create_world_models(this.player_data.current_system);

    input.bindInputFunctions({
      'toggle_pause': () => {
        if ( this.entMan.paused ){
          this.entMan.unpause();
          // TODO: Refactor w/ destructuring
          // let disposed = map_view.dispose(gameCanvas);
          // map_view = null;
          // selected_system = disposed.selection;
          // map_pos = disposed.position;
        } else {
          // Note that different exits do different things to the state,
          // so we don't actually put the functionality into the exit() function,
          // we put it before the enter() call.
          this.entMan.pause();
          this.parent.enter_state('map');
        }
      },

      'reset_game': () => {
         this.entMan.clear();
         this.dispose_world_models();
         this.create_world_models(this.player_data.current_system);
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

        this.entMan.clear();
				this.dispose_world_models();
				this.create_world_models(this.player_data.current_system);
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
}
