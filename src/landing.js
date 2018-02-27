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
    widgets.push(new HeroImage("assets/misc_pd/Doha.png",
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        0,0));

    if (this.spob.text){
      widgets.push(new HeroText(
          this.spob.text,
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER,
          0,0)
      )
    }

    widgets.push(new LandingMenuBigButton(
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

class HeroImage extends menu.Image {
  setup(){
    let control = super.setup();
    control.width = "60%";
    control.height = "40%";
    return control;
  }
};

class HeroText extends menu.TextBox {
  setup(){
    let control = super.setup();
    control.textWrapping = true;
    control.color = "White";
    control.width = "60%";
    control.height = "60%";
    control.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    return control;
  }
};

class LandingMenuBigButton extends menu.TextButton {
  setup(){
    let control = super.setup();
    control.color = "White";
    control.background = "Red";
    control.height = "15%";
    control.width = "19%";
    control.paddingLeft = "3%";
    control.paddingBottom = "8%";
    return control;
  }
};

