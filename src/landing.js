import * as menu from "menu";

export class LandingMenu extends menu.BaseMenuView {
  constructor(spobs, player_data){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
  }
  enter(){
    this.spob = this.spobs[this.player_data.current_spob];
    this.setup_menu(this.get_widgets_for_planet());
  }

  get_widgets_for_planet(){
    let widgets = [];

    /* Middle Widgets */
    const CENTER = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    // TODO: Load from planet
    widgets.push(new HeroImage("assets/misc_pd/Doha.png",
          CENTER,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        0,0));

    if (this.spob.text){
      widgets.push(new HeroText(
          this.spob.text,
          CENTER,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER,
          0,0)
      )
    }

    /* LEFT WIDGETS */
    const LEFT = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    widgets.push(new LandingMenuBigButton(
      'Leave ' + this.player_data.current_spob,
      () => {
        this.parent.enter_state('gameplay');
      },
      LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%", "0%")
    );

    if (this.spob.trade) {
      widgets.push(new LandingMenuBigButton(
        'Market',
        () => {
          this.parent.enter_state('trade');
        },
        LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%","-10%")
      );
    }

    if (this.spob.explore){
      widgets.push(new LandingMenuBigButton(
        'Explore ' + this.player_data.current_spob,
        () => {
          //this.parent.enter_state('explore');
        },
        LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "-20%")
      );
    }

    if (this.spob.missions){
      widgets.push(new LandingMenuBigButton(
        'Open Contracts',
        () => {
          //this.parent.enter_state('missions');
        },
        LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "-30%")
      );
    }
   
    /* Righthand buttons */
    const RIGHT = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    if (this.spob.govt){  // If a planet is civilized at all, they can refuel you
      widgets.push(new LandingMenuBigButton(
        'Refuel',
        () => {
          console.log("refuel")
        },
        RIGHT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "0%")
      );
    }

    if (this.spobs.shipyard){
      widgets.push(new LandingMenuBigButton(
        'Shipyard',
        () => {
          //this.parent.enter_state('shipyard');
        },
        RIGHT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "-10%")
      );
    }
 
    if (this.spob.customize){
      widgets.push(new LandingMenuBigButton(
        'Customize',
        () => {
          //this.parent.enter_state('customize');
        },
        RIGHT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "-20%")
      );
    }

    if (false){ // Exciting new option
      widgets.push(new LandingMenuBigButton(
        'Exciting New Option',
        () => {
          //this.parent.enter_state('customize');
        },
        RIGHT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "-30%")
      );
    }

    return widgets;
  }
};

export class TradeMenu extends menu.BaseMenuView {
  constructor( spobs, player_data ){
    super();
    this.spobs = spobs;
    this.player_data = player_data;
  }
  enter(){
    this.spob = this.spobs[this.player_data.current_spob];
    this.setup_menu(this.get_trade_widgets());
  }

  get_trade_widgets(){
    return [
      new LandingMenuBigButton(
        "Return",
        () => {
          this.parent.enter_state('landing');
        },
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%","0%"
      )
    ]
  }
}

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
    control.paddingRight = "3%";
    control.paddingBottom = "8%";
    control.paddingTop = "0";
    control.cornerRadius = 3;
    console.log(this);
    console.log(control);
    return control;
  }
};

