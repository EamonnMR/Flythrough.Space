/*
 * Modals
 *
 * Modals have a slightly different lifecycle from other states.
 * Rather than swapping values inside them around, they are
 * created and destroyed ad-hoc to enable stacking and queues.
 *
 * They are multi-inherited (in get_modal) from a data object
 * which defines how they look.
 */

import { _ } from "./singletons.js"; 
import { BaseMenuView } from "./menu.js";
import { multiInherit } from "./util.js";

class Modal extends BaseMenuView{

}

export function get_modal(prototype){
  return multiInherit(new Modal(), prototype);
}

