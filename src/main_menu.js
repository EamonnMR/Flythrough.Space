import {_} from "./singletons.js";
import {LandingMenuBigButton} from "./landing.js";
import {PlayerSave} from "./player.js";

import {
  BaseMenuView,
  Image,
  TextBox,
  TextButton
} from "./menu.js"

const MENU_COPY = `Welcome to FLYTHROUGH.SPACE, the Space Captain game!
  Arrow Keys to move. Be careful of inertia. L to select the nearest planet,
  then press L again when you're close enough to land. Press [M] to
  open the map* and select an adjacent system to jump to with your mouse.
  . Close the map with [esc], fly away from the center of the system,
  and press [J] jump. Press [TAB] to select the closest target (to see its health
  and press [LCTRL] to fire your weapon - but be careful, angry ships
  will shoot back!
  If you manage to get some fighters, launch with Q and recall with E. F to command them to attack your target.
  Disabled ships (lights off) can be boarded with B for loot
  `;

function pop_tab(url){
  window.open(url, '_blank').focus();
}

function get_pilot_copy(pilot){
  if( pilot ){
    return `
      Captain: ${pilot.name}
      Credcoin: ${pilot.money}
      Ship: ${pilot.ship_dat.short_name}
      System: ${pilot.current_system}
      Total damage done (in credcoins): ${pilot.total_accumulated_damage}

      Active Missions: ${Object.keys(pilot.active_missions).join(', ')}
    `;
  } else {
    return '<No Captain Loaded>'
  }
}


export class MainMenu extends BaseMenuView {
  enter(){
    this.setup_menu(this.get_widgets());
  }

  get_widgets(){
    let widgets = [];

    /* Middle Widgets */
    const CENTER = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

    widgets.push(new HeroText(
        MENU_COPY + "\n" + get_pilot_copy(_.player),
        CENTER,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER,
        0,0)
    )

    /* LEFT WIDGETS */
    const LEFT = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    if(_.player){
      widgets.push(new LandingMenuBigButton(
        'Continue',
        () => {
          this.parent.enter_state('gameplay');
        },
        LEFT,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
        "0%", "0%")
      );
    }

    widgets.push(new LandingMenuBigButton(
      'Load',
      () => {
        this.parent.enter_state('saves');
      },
      LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%","-10%")
    );
    widgets.push(new LandingMenuBigButton(
      'New Captain',
      () => {
        // TODO: Add player config options
        _.player = new PlayerSave();
        this.parent.enter_state('gameplay');
      },
      LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%", "-20%")
    );

    // TODO: More stuff?
    /*
    widgets.push(new LandingMenuBigButton(
      'Open Contracts',
      () => {
        this.parent.enter_state('missions');
      },
      LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%", "-30%")
    );
    */
   
    /* Righthand buttons */
    const RIGHT = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

    widgets.push(new LandingMenuBigButton(
      'Source Code',
      () => {
        pop_tab("https://github.com/eamonnmr/Flythrough.Space", "_blank");
      },
      RIGHT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%", "0%")
    );

    widgets.push(new LandingMenuBigButton(
      'About',
      () => {
        pop_tab("http://blog.eamonnmr.com/2019/10/flythrough-space-alpha-release/", "_blank");
      },
      RIGHT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%", "-10%")
    );

    widgets.push(new LandingMenuBigButton(
      'Settings',
      () => {
        this.parent.enter_state('settings');
      },
      RIGHT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%", "-20%")
    );
    widgets.push(new LandingMenuBigButton(
      'Discord',
      () => {
        pop_tab("https://discord.gg/4a2G9G7", "_blank");
      },
      RIGHT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      "0%", "-30%")
    );
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

