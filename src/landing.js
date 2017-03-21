import * as states from "states";

export class LandingMainView extends states.ViewState{
  constructor(spob_data, scene, game_canvas){
    super();

    this.spob_data = spob_data;
    this.scene = scene;
    this.game_canvas = game_canvas;

    this.canvas = null;
    this.group = null;

  }

  enter(){
    input.unbindInputFunctions();

    this.canvas = new BABYLON.ScreenSpaceCanvas2D(this.scene, {
      id: "map_canvas",
      size: new BABYLON.Size(
          this.game_canvas.width(), this.game_canvas.height()),
      backgroundFill: "#4040408F"
    })

    // TODO: Draw some stuff
    
    this.group = new BABYLON.Group2D({
      parent: this.canvas,
      id: 'landing_image',
    })

    this.group.pointerEventObservable.add(
      (d, s) => {
        let clicked_id = d.relatedTarget.id;
        //TODO: Iterate over buttons to decide if one was pressed
        this.parent.enter_state('gameplay'); // "Takeoff" back into the system
      }
    ); 
  }

  exit(){
    this.canvas.dispose();
  }

}
