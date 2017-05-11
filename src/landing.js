import * as menu from "menu";

export class LandingMainView extends menu.MainMenuView {
  constructor(scene, dom_canvas, spobs, player_data){
    super(scene, dom_canvas);
    this.spobs = spobs;
    this.player_data = player_data;
    this.scene = scene;
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
        }, 0, this.dom_canvas.height() - 25, 'leave_btn'),
    };
    
    // TODO: Load this from the spob type (default) then
    // custom specified image
    widgets['hero'] = new menu.Image(this.get_spob_img(), 0,
        this.dom_canvas.height() );

    if (this.spob.text){
      widgets['desc'] = new menu.TextBox(this.spob.text,
         0,this.dom_canvas.height() - (18 + 285), 'desc',
         () => {return this.dom_canvas.width()} );
    }
    return widgets;
  }

  get_spob_img(){
    
    let landing_texture = "assets/misc_pd/Doha.png";

    // TODO: Verify args here
    return new BABYLON.Texture(
        landing_texture, this.scene, true,
      false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
  }
};
