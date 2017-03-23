import * as menu from "menu";

export class LandingMainView extends menu.MainMenuView {
  enter(){
    this.setup_2d_canvas();
    new BABYLON.Text2D("Planet name here", {
      id: 'planet_name',
      x: 0,
      y: 20,
      fontName: '20pt Courier',
      parent: this.group
    })
  }

  respond_to_click(target_id){
    this.parent.enter_state('gameplay'); // "Takeoff" back into the system
  }
};
