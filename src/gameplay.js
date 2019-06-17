/* This is the nexus of the action portion of the game, so there will be
 * a lot of imports here. Anything ending with System gets run every
 * frame and will update some subset of entities.
 */

import { distance, is_cheat_enabled } from "./util.js";
import { speedLimitSystem, velocitySystem} from "./physics.js";
import { weaponSystem, decaySystem} from "./weapon.js";
import { EntityManager, deletionSystem} from "./ecs.js";
import { inputSystem, bindInputFunctions, unbindInputFunctions} from "./input.js";
import { npcSpawnerSystem } from "./entities.js";
import { modelPositionSystem, cameraFollowSystem } from "./graphics.js";
import { collisionDetectionSystem } from "./collision.js";
import { setup_system } from "./system.js";
import { ViewState } from "./states.js";
import { radarFollowSystem, HUD } from  "./hud.js";
import { ai_system, turretPointSystem  } from "./ai.js";
import { get_game_camera } from "./graphics.js";
import { has_sufficient_distance, has_sufficient_fuel } from "./hyperspace.js"

let MIN_LAND_DISTANCE = 50

export class GamePlayState extends ViewState {

  constructor(scene, data, player_data) {
    super();

    this.data = data;
    this.scene = scene;
    //this.camera = null;
    this.player_data = player_data;

    this.entMan = new EntityManager(player_data, data, [
      npcSpawnerSystem,
      inputSystem,
      ai_system,
      weaponSystem,
      speedLimitSystem,
      velocitySystem,
      this.matterSystem,
      modelPositionSystem,
      cameraFollowSystem,
      turretPointSystem,
      decaySystem,
      collisionDetectionSystem,
      radarFollowSystem,
      deletionSystem,
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
    if(! this.camera){
      this.camera = get_game_camera(this.scene);
    }
    if (this.empty){
      this.setup_world();
      Matter.Engine.run(this.physics_engine);
    } else {
      this.physics_engine.timing.timescale = 1;
    }
    this.entMan.unpause();
    bindInputFunctions({
      toggle_pause: () => {

        // Note that different exits do different things to the state,
        // so we don't actually put the functionality into the exit() function,
        // we put it before the enter() call.
        this.entMan.pause();
        this.physics_engine.timing.timescale = 0;
        this.parent.enter_state('map');
      },

      /* I haven't actually used this for a while
      reset_game: () => {
        this.clear_world();
        this.setup_world();  
      },
      */

      hyper_jump: () => {
			  if ( this.player_data.current_system
            != this.player_data.selected_system
        ) {
          let player_ent = this.get_player_ent();
          if (has_sufficient_fuel(player_ent) || is_cheat_enabled("infinite_fuel")){ 
            if(has_sufficient_distance(player_ent || is_cheat_enabled("jump_anywhere"))){
              // TODO: Remove control, add hyperjump AI, play some sort of light show ala 2001 space odyssey
              this.player_data.current_system = this.player_data.selected_system;
              this.player_data.selected_spob = null;  // Can't have people landing on spobs out of the system
              this.clear_world();
              this.player_data.fuel -= 1;
              this.setup_world();
            } else {
              // TODO: Add visible warnings for these so players aren't confused
              console.log("Tried to hyperjump too close to a star");
            }
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
        if (this.player_data.selected_spob == null){
          let sys_spobs = this.entMan.get_with(['spob_name']);
          let landable = this.find_closest_landable_to_player(sys_spobs);
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
      },
      select_closest: () => {
        let player = this.get_player_ent();
        let target = this.find_closest_target(player);
        if(target){
          this.hud.deselect(this.entMan.get(player.target));
          player.target = target.id;
        }
      },

      select_spob: (index) => {
        let indexed_spob = this.entMan.get_with_exact("spob_index", index)[0]; 
        if (indexed_spob){
          this.player_data.selected_spob = indexed_spob.spob_name;
        }
      },
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
    this.camera.lockedTarget = null;
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
        this.player_data,
        this.data.govts,
    );
    this.create_world_models(this.player_data.current_system);
    this.physics_engine = Matter.engine.create();
    this.empty = false;
  }

  this.matterSystem(entMan){
    Matter.engine.update(this.physics_engine, entMan.delta_time);
    // Cheating a bit here. TODO: extract this, make it stateless
  }

  get_player_ent(){
    return this.entMan.get_with(['input'])[0];
  }

  spob_is_landable(spob_name){
    let player = this.get_player_ent();
    let spob = this.entMan.get_with_exact("spob_name", spob_name)[0];
    return (
      spob && (
        ( 
          (distance(player.position, spob.position) < MIN_LAND_DISTANCE)
          && ! this.player_data.is_govt_hostile(spob.govt)
        ) 
        || is_cheat_enabled('land_anywhere')
      )
    );
  }

  get_closest_thing(middle_thing, other_things){
    let min_distance = Number.POSITIVE_INFINITY;
    let choice = null;
    for( let other of other_things){
      let dist = distance(middle_thing.position, other.position);
      if(min_distance > dist){
        min_distance = dist;
        choice = other;
      }
    }
    return choice;
  }

  find_closest_landable_to_player(spobs){
    let player = this.get_player_ent();

    return this.get_closest_thing(player, spobs)
  }

  find_closest_target(targeter){
    return this.get_closest_thing(targeter, this.entMan.get_with(["ai"]));
  }
}
