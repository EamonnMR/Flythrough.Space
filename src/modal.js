/*
 * Modals
 *
 * Modals have a slightly different lifecycle from other states.
 * Rather than swapping values inside them around, they are
 * created and destroyed ad-hoc to enable stacking and queues.
 *
 * They are multi-inherited (in get_modal) from a data object
 * which defines how they look. Data objects should define:
 * - text
 * - on_accept
 *
 * - may define
 * - accept_text
 * - reject_text
 * - on_reject
 *
 *  If an 'on_reject' callback is defined, accept text will
 *  default to DEFAULT_ACCEPT_TEXT, otherwise it will default
 *  to the DEFAULT_CONTINUE_TEXT
 */

import { _ } from "./singletons.js"; 
import { BaseMenuView, TextBox, TextButton } from "./menu.js";
import { multiInherit } from "./util.js";
import { LandingMenuBigButton } from "./landing.js";

const DEFAULT_ACCPET_TEXT = "ok";
const DEFAULT_CONTINUE_TEXT = "ok"
const DEFAULT_REJECT_TEXT = "no";

class ModalButton extends TextButton {
  setup(){
    // TODO: This is copypasta'd everywhere
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
}

class Modal extends BaseMenuView{

  enter(){
    this.setup_menu(this.get_widgets());
  }

  accept_callback(){
    // Just get rid of the modal!
    _.state_manager.exit_modal();
    if(this.on_accept){
      this.on_accept();
    }
  }

  get_widgets(){
    let widgets = [
      new TextBox(
        this.text,
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER,
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER,
        0,0
      ),
    ];
    // TODO: Is the wrapping required?
    let accept_callback = () => { this.accept_callback() };
    let reject_callback = () => { this.reject_callback() };

    if(this.on_reject){
      widgets.push(
        new ModalButton(
          this.accept_text || DEFAULT_ACCEPT_TEXT,
          accept_callback,
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
          0, 0
        )
      )
      widgets.push(
        new ModalButton(
          this.reject_text || DEFAULT_REJECT_TEXT,
          reject_callback,
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
          0, 0
        )
      )
    } else {
      widgets.push(
        new ModalButton(
          this.accept_text || DEFAULT_CONTINUE_TEXT,
          accept_callback,
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
          0,0,
        )
      )
    }

    return widgets;
  }
}

export function get_modal(prototype){
  return multiInherit(new Modal(), prototype);
}

