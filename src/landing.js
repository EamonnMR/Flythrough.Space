import * as menu from "menu";

export class LandingMainView extends menu.MainMenuView {
  constructor(scene, dom_canvas){
    super(scene, dom_canvas);
    this.widgets = {
      'leave_btn': new menu.TextButton('leave',
        () => {
          this.parent.enter_state('gameplay');
        }, 0, 0, 'leave_btn'),
    };
  }
}
