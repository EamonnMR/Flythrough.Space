import * as menu from "menu";

export class LandingMainView extends menu.MainMenuView {
  constructor(scene, dom_canvas, spobs, player_data){
    super(scene, dom_canvas);
    this.spobs = spobs;
    this.player_data = player_data;
  }
  enter(){
    this.widgets = this.get_widgets_for_planet();
    this.setup_2d_canvas();
  }

  get_widgets_for_planet(){
    return {
      'leave_btn': new menu.TextButton('leave ' + this.player_data.current_spob,
        () => {
          this.parent.enter_state('gameplay');
        }, 0, 0, 'leave_btn'),
    };  
  }
};
