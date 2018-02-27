import * as menu from "menu";

export class LandingMenu extends menu.BaseMenuView {
  constructor(spobs, player_data){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
  }
  enter(){
    console.log(this.player_data);
    console.log(this.spobs[this.player_data.current_spob]);
    this.spob = this.spobs[this.player_data.current_spob];
    console.log(this.spob);
    this.setup_menu(this.get_widgets_for_planet());
  }

  get_widgets_for_planet(){
    let widgets = [];

    // TODO: Load from planet then planet type--?
    widgets.push(new menu.Image("assets/misc_pd/Doha.png",
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        0,0));

    if (this.spob.text){
      widgets.push(new menu.TextBox(
          this.spob.text,
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER,
          0,0)
      )
    }

    widgets.push(new menu.TextButton(
          'leave ' + this.player_data.current_spob,
          () => {
            this.parent.enter_state('gameplay');
          }, 
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
          0, 0
      )
    );
    return widgets;
  }
};
