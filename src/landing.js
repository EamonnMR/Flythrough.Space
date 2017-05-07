import * as menu from "menu";

export class LandingMainView extends menu.MainMenuView {
  constructor(scene, dom_canvas, spobs, player_data){
    super(scene, dom_canvas);
    this.spobs = spobs;
    this.player_data = player_data;
  }
  enter(){
    console.log(this.player_data.current_spob);
    console.log(this.spobs[this.player_data.current_spob]);
    this.spob = this.spobs[this.player_data.current_spob];
    console.log(this.spob);
    this.widgets = this.get_widgets_for_planet();
    this.setup_2d_canvas();
  }

  get_widgets_for_planet(){
    let widgets = {
      'leave_btn': new menu.TextButton(
          'leave ' + this.player_data.current_spob,
        () => {
          this.parent.enter_state('gameplay');
        }, 0, 0, 'leave_btn'),
    };

    if (this.spob.text){
      console.log(this.dom_canvas.width());
      widgets['desc'] = new menu.TextBox(this.spob.text,
         0,this.dom_canvas.height() - 18, 'desc',
         () => {return this.dom_canvas.width()} );
    }
    return widgets;
  }
};
