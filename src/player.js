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

    this.govts = {
      orasos: {reputation: -1}
    }
  }
}
