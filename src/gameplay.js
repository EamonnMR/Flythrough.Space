import { distance } from "./util.js";
import { speedLimitSystem, velocitySystem} from "./physics.js";
import { weaponSystem, decaySystem} from "./weapon.js";
import { EntityManager, deletionSystem} from "./ecs.js";
import { inputSystem, bindInputFunctions, unbindInputFunctions} from "./input.js";
import {
	npcSpawnerSystem,
	modelPositionSystem,
	cameraFollowSystem
} from "./entities.js";
import { collisionDetectionSystem } from "./collision.js";
import { setup_system } from "./system.js";
import { ViewState } from "./states.js";
import { radarFollowSystem, HUD } from  "./hud.js";
import { ai_system } from "./ai.js";


export class GamePlayState extends ViewState {

  constructor(scene, camera, data, player_data) {
    super();

    this.data = data;
    this.scene = scene;
    this.camera = camera;

    this.player_data = player_data;

    this.entMan = new EntityManager(player_data, data, [
      npcSpawnerSystem,
      inputSystem,
      ai_system,
      speedLimitSystem,
      velocitySystem,
      modelPositionSystem,
      cameraFollowSystem,
      weaponSystem,
      decaySystem,
      collisionDetectionSystem,
      // hud.selectionFollowSystem,
      radarFollowSystem,
      deletionSystem
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
    bindInputFunctions({
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
          if (this.player_data.fuel >= 1){ 
            this.player_data.current_system = 
                  this.player_data.selected_system;
            this.clear_world();
            // TODO: Violate all laws of the universe, travel faster than light between high-mass objects
            this.player_data.fuel -= 1;
            this.setup_world();
          } else {
            console.log("Tried to hyperjump with insufficient fuel");
          }
			  } else {
          console.log( "Tried to HJ to bad system");
        }
      },
      /*
      clear_nav: () => {
        this.player_data.selected_spob = null;
      },
      */
      try_land: () => {
        let sys_spobs = this.entMan.get_with(['spob_name']);
        let landable = this.find_closest_landable_to_player(sys_spobs);
        if (this.player_data.selected_spob == null){
          if (landable){
            this.player_data.selected_spob = landable.spob_name;
          }
        }
        else {
          if(this.spob_is_landable(this.player_data.selected_spob)){

            this.clear_world();
            this.player_data.current_spob = this.player_data.selected_spob;
            this.player_data.selected_spob = null;
            let spob_dat = this.data.spobs[this.player_data.current_spob];
            let position = this.player_data.initial_position;

            position.x = spob_dat.x;
            position.y = spob_dat.y;
            this.player_data.initial_position.x 
            this.parent.enter_state('landing');
          } else {
            console.log("Player tried to land somewhere wrong");
          }
        }
      }
    });
  }

  create_world_models( system_name ){
    this.world_models = setup_system(
  		this.scene,
			this.camera,
			this.entMan,
   		system_name,
      this.hud,
      this.data,
      this.player_data,
  	);
  }

	dispose_world_models(){
		for (let world_model of this.world_models){
       world_model.dispose();
    }

		this.world_models = [];
  }

  exit(){
    unbindInputFunctions();
  }

  clear_world(){
    this.entMan.clear();
    this.dispose_world_models();
    this.hud.dispose();
    this.hud = null;
    this.empty = true;
  }

  setup_world(){
    this.hud = new HUD(
        this.scene,
        this.entMan,
        this.player_data
    );
    this.create_world_models(this.player_data.current_system);
    this.empty = false;
  }

  get_player_ent(){
    return this.entMan.get_with(['input'])[0];
  }

  spob_is_landable(spob){
    return true;
  }

  find_closest_landable_to_player(spobs){
    let min_distance = null;
    let player = this.get_player_ent();
    let choice = null;
    for(let spob of spobs){
      let dist = distance(
          spob.position, player.position);
      if (!min_distance || min_distance > dist
          && this.spob_is_landable(spob)){
        min_distance = dist;
        choice = spob;
      }
    }
    return choice;
  }
}
