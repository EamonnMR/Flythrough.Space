/* Player State - this is what's shared between game states. */

export class PlayerSave {
  constructor() {
    // TODO: Load this from some sort of backing store / DB / etc
    this.map_pos = {x: 0, y: 0};
    this.selected_system = "Casamance";
    this.current_system = "Casamance";
    this.current_spob = null;
  }
}
