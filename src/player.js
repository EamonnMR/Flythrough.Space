/* Player State - this is what's shared between game states. */

export class PlayerSave {
  constructor() {
    // TODO: Load this from some sort of backing store / DB / etc
    this.map_pos = {x: 0, y: 0};
    this.selected_system = "Cartwright";
    this.selected_spob = null;
    this.current_system = "Cartwright";
    this.current_spob = null;
    this.initial_position = {x: 0, y: 0};
    this.ship_type = "shuttle";
    this.fuel = 3; // They start out with a full tank of gas (for a shuttle)

    this.bulk_cargo = {};
    this.mission_cargo = {};

    this.govts = {
      // TODO: Default rep?
      orasos: {reputation: -1}
    }
  }

  total_cargo(){
    // Total cargo space used up on the player's ship
    let total = 0;
    [this.bulk_cargo, this.mission_cargo].forEach( (cargo_type) =>{
      Object.keys(cargo_type).forEach( (key) => {
        total += cargo_type[key];
      })
    });
    return total;
  }

}
