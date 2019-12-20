/* This is the nexus of the action portion of the game, so there will be
 * a lot of imports here. Anything ending with System gets run every
 * frame and will update some subset of entities.
 */


import { _ } from "./singletons.js";
import {
  distance,
  is_cheat_enabled,
  get_direction,
  closest,
} from "./util.js";
import { speedLimitSystem, velocitySystem, spaceFrictionSystem} from "./physics.js";
import { weaponSystem, decaySystem} from "./weapon.js";
import {
  SinglePlayerEntityManager,
  deletionSystem
} from "./ecs.js";
import { inputSystem, bindInputFunctions, unbindInputFunctions} from "./input.js";
import { npcSpawnerSystem } from "./entities.js";
import {
  modelPositionSystem,
  cameraFollowSystem,
  shipAnimationSystem,
  flashSystem
} from "./graphics.js";
import { collisionDetectionSystem } from "./collision.js";
import { setup_system } from "./system.js";
import { ViewState } from "./view_state.js";
import { radarFollowSystem, hudUpdateSystem, HUD } from  "./hud.js";
import { ai_system, turretPointSystem  } from "./ai.js";
import {
  has_sufficient_distance,
  has_sufficient_fuel,
  warpSystemFactory,
} from "./hyperspace.js"
let MIN_LAND_DISTANCE = 50

export class GamePlayState extends ViewState {

  constructor() {
    super();
    this.entMan = new SinglePlayerEntityManager([
      npcSpawnerSystem,
      inputSystem,
      ai_system,
      speedLimitSystem,
      spaceFrictionSystem,
      weaponSystem,
      velocitySystem,
      modelPositionSystem,
      cameraFollowSystem,
      shipAnimationSystem,
      turretPointSystem,
      decaySystem,
      flashSystem,
      collisionDetectionSystem,
      radarFollowSystem,
      deletionSystem,
      hudUpdateSystem,
      warpSystemFactory(this),
      entMan => this.playerLifecycleSystem(),
    ]);
    this.empty = true;
    this.world_models = [];
    this.starfields = [];
  }

  update(){
    this.entMan.update();
  }
  
  playerLifecycleSystem(){
    if(this.player_is_dead()){
      this.player_dead_timer -= this.entMan.delta_time;
      if(this.player_dead_timer < 0){
        this.clear_world();
        this.parent.enter_state('main');
        // TODO: del _.player;
      }
    }
  }

  enter(){
    this.player_dead_timer = 6000;
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

      /* I haven't actually used this for a while
      reset_game: () => {
        this.clear_world();
        this.setup_world();  
      },
      */
      hyper_jump: () => {
			  if ( _.player.current_system
            != _.player.selected_system
        ) {
          let player_ent = this.entMan.get_player_ent();
          if (has_sufficient_fuel(player_ent) || is_cheat_enabled("infinite_fuel")){ 
            if(has_sufficient_distance(player_ent || is_cheat_enabled("jump_anywhere"))){
              player_ent.warping_out = true;
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
        _.player.selected_spob = null;
      },
      */
      try_land: () => {
        if (_.player.selected_spob == null){
          let sys_spobs = this.entMan.get_with(['spob_name']);
          let landable = this.find_closest_landable_to_player(sys_spobs);
          if (landable){
            _.player.selected_spob = landable.spob_name;
          }
        }
        else {
          if(this.spob_is_landable(_.player.selected_spob)){
            _.player.initial_position =
              this.entMan.get_with_exact(
                "spob_name",
                _.player.selected_spob,
              )[0].position;
            this.clear_world();
            _.player.current_spob = _.player.selected_spob;
            _.player.selected_spob = null;
            
            this.parent.enter_state('landing');
          } else {
            console.log("Player tried to land somewhere wrong");
          }
        }
      },
      select_closest: () => {
        let player = this.entMan.get_player_ent();
        let target = this.find_closest_target(player);
        if(target){
          _.hud.deselect(this.entMan.get(player.target));
          player.target = target.id;
        }
      },

      select_spob: (index) => {
        let indexed_spob = this.entMan.get_with_exact("spob_index", index)[0]; 
        if (indexed_spob){
          _.player.selected_spob = indexed_spob.spob_name;
        }
      },
    });
  }

  create_world_models( system_name ){
    [this.world_models, this.starfields] = setup_system(
			this.entMan,
   		system_name,
  	);
  }

	dispose_world_models(){
    for(let model_group of ["starfields", "world_models"] ){
      for (let world_model of this[model_group]){
         world_model.dispose();
      }

      this[model_group] = [];
    }
  }

  exit(){
    unbindInputFunctions();
    console.log("Unbound input");
  }

  clear_world(){
    _.camera.lockedTarget = null;
    this.entMan.clear();
    this.dispose_world_models();
    if(_.hud){
      _.hud.dispose();
    }
    _.hud = null;
    this.empty = true;
  }

  setup_world(){
    _.hud = new HUD(
        this.entMan,
    );
    _.player.explore_system(_.player.current_system);
    this.create_world_models(_.player.current_system);
    this.empty = false;
  }

  player_is_dead(){
    return this.empty === false && this.entMan.get_player_ent() === undefined;
  }

  spob_is_landable(spob_name){
    let player = this.entMan.get_player_ent();
    let spob = this.entMan.get_with_exact("spob_name", spob_name)[0];
    return (
      spob && (
        ( 
          (distance(player.position, spob.position) < MIN_LAND_DISTANCE)
          && ! _.player.is_govt_hostile(spob.govt)
        ) 
        || is_cheat_enabled('land_anywhere')
      )
    );
  }

  find_closest_landable_to_player(spobs){
    let player = this.entMan.get_player_ent();

    return closest(player, spobs)
  }

  find_closest_target(targeter){
    return closest(targeter, this.entMan.get_with(["ai"]));
  }

  get_stars(){
    if(this.starfields.length){
      return this.starfields.map((sprite_manager) => {
        return sprite_manager.sprites
      }).flat(1);
    } else {
      return [];
    }
  }

  change_system(){
    _.player.current_system = _.player.selected_system;
    _.player.selected_spob = null;  // Can't have people landing on spobs out of the system
    this.clear_world();
    _.player.fuel -= 1;
    this.setup_world();
  }

}

