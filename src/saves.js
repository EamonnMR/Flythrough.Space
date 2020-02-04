import { _ } from "./singletons.js";
import { LandingMenuBigButton } from "./landing.js";
import {
  BaseMenuView,
  simple_grid,
} from "./menu.js";

import {
  list_saves,
  restore,
  restore_from_object,
} from "./player.js";

export class SavesMenu extends BaseMenuView {
  enter(){
    super.enter();
    this.setup_menu(this.get_widgets());
  }
  get_widgets(){
    let widgets = simple_grid(
      (key, left, top) => {
        return new LandingMenuBigButton(
          key,
          () => {
            console.log("restoring:");
            console.log(key);
            _.player = restore(key);
            this.parent.enter_state('main');
          },
          BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
          BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
          left,
          top,
        );
      },
      list_saves()
    );
    widgets.push( new LandingMenuBigButton(
      'Back',
      () => {
        this.parent.enter_state('main');
      },
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      '0%',
      '0%',
    ));
    widgets.push( new LandingMenuBigButton(
      'Load From File',
      () => {
				// StackOverflow pasta for a file dialogue
				// https://stackoverflow.com/a/43174934
				function openFileDialog (accept, callback) {  // this function must be called from  a user
																										// activation event (ie an onclick event)
					// Create an input element
					var inputElement = document.createElement("input");
					// Set its type to file
					inputElement.type = "file";
					// Set accept to the file types you want the user to select. 
					// Include both the file extension and the mime type
					inputElement.accept = accept;
					// set onchange event to call callback when user has selected file
					inputElement.addEventListener("change", callback)
					// dispatch a click event to open the file dialog
					inputElement.dispatchEvent(new MouseEvent("click")); 
				}
        openFileDialog("text/javascript", (stuff) =>{
          console.log(stuff);
          let file_reader = new FileReader();
          file_reader.onload = (file) => {
            _.player = restore_from_object(
              JSON.parse(file.srcElement.result)
            );
            this.parent.enter_state('main');
          }
          for(let file of stuff.target.files){
            file_reader.readAsText(file);
          }
        });
      },
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      '50%',
      '0%',
    ));
    widgets.push( new LandingMenuBigButton(
      'Save To File',
      () => {
				function download_json (storageObj){
					// https://stackoverflow.com/a/30800715
					var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj));

					let dlAnchorElem = document.createElement("a");
					dlAnchorElem.setAttribute("href",     dataStr     );
					dlAnchorElem.setAttribute("download", "scene.json");
					dlAnchorElem.click();
        }
				download_json(_.player);	
      },
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
      '75%',
      '0%',
    ));

    return widgets;
 
  }
}

