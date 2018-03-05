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
import * as ai from "ai";


export class GameplayState extends states.ViewState {

  constructor(scene, camera, data, player_data,
      dom_canvas) {
    super();

    this.data = data;
    this.scene = scene;
    this.camera = camera;

    this.player_data = player_data;
    this.dom_canvas = dom_canvas;

    this.entMan = new ecs.EntityManager(player_data, data, [
      entities.npcSpawnerSystem,
      input.inputSystem,
      ai.ai_system,
      physics.speedLimitSystem,
      physics.velocitySystem,
      entities.modelPositionSystem,
      entities.cameraFollowSystem,
      weapon.weaponSystem,
      weapon.decaySystem,
      collision.collisionDetectionSystem,
      // hud.selectionFollowSystem,
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
    this.world_models = system.setup_system(
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
    this.hud = new hud.HUD(
        this.scene,
        this.dom_canvas,
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
      let distance = util.distance(
          spob.position, player.position);
      if (!min_distance || min_distance > distance
          && this.spob_is_landable(spob)){
        min_distance = distance;
        choice = spob;
      }
    }
    return choice;
  }
}
