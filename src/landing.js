import { _ } from "./singletons.js";
import { missions_for_state, resolve_for_state } from "./missions.js";

import {
  BaseMenuView,
  Image,
  TextBox,
  TextButton
  } from "./menu.js";

export class LandingMenu extends BaseMenuView {
  enter(){
    this.spob = _.data.spobs[_.player.current_spob];
    this.setup_menu(this.get_widgets_for_planet());
    // TODO: offer(missions_for_state("landing")
    resolve_for_state("landing");
    _.player.save();
  }

  get_widgets_for_planet(){
    let widgets = [];

    /* Middle Widgets */
    const CENTER = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    let image = "assets/icescape.png";
    if( "img" in this.spob ){
      image = this.spob.img;
    }
    /* widgets.push(new HeroImage(image,
          CENTER,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
        0,0));
    */

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
      'Leave ' + _.player.current_spob,
      () => {
        // TODO: This is an 8 on the hacky scale
        // Reach into the missions state and clear the items.
        //
        _.player.save();
        this.parent.states.missions.items = null;
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
        'Explore ' + _.player.current_spob,
        () => {
          //this.parent.enter_state('explore');
        },
        LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "-20%")
      );
    }

    if (true){ // TODO: If missions_available()
      widgets.push(new LandingMenuBigButton(
        'Open Contracts',
        () => {
          this.parent.enter_state('missions');
        },
        LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "-30%")
      );
    }
   
    /* Righthand buttons */
    const RIGHT = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    if (this.spob.govt && _.player.can_refuel()){  // If a planet is civilized at all, they can refuel you
      let refuel_button = new LandingMenuBigButton(
        'Refuel',
        () => {
          _.player.refuel() // TODO: Get player ship type!
          console.log("refuel")
          refuel_button.hide(this);
        },
        RIGHT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "0%");
      widgets.push(refuel_button);
    }

    if (this.spob.shipyard){
      widgets.push(new LandingMenuBigButton(
        'Shipyard',
        () => {
          this.parent.enter_state('shipyard');
        },
        RIGHT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "-10%")
      );
    }
 
    if (this.spob.custom){
      widgets.push(new LandingMenuBigButton(
        'Customize',
        () => {
          this.parent.enter_state('upgrades');
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

class HeroImage extends Image {
  setup(){
    let control = super.setup();
    control.width = "60%";
    control.height = "40%";
    return control;
  }
};

class HeroText extends TextBox {
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

export class LandingMenuBigButton extends TextButton {
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
    return control;
  }
};

export class BaseLandingMenuView extends BaseMenuView {
  leave_button_press(){
    this.parent.enter_state('landing');
  }
  get_misc_widgets(){
    return  [
      new LandingMenuBigButton(
        "Return",
        () => {
          this.leave_button_press();
        },
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%","0%"
      )
    ]
  }
}
