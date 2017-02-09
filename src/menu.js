// TODO: Import some sort of state superclass?
// Maybe if we ever switch to TypeScript

export class MainMenuView{
  constructor(scene, dom_canvas){ // TODO: Load list of save games?
    this.mgr = null;
    this.scene = scene;
    this.dom_canvas = dom_canvas;
  }

  update(){
    // If anything needed to be animated, put it here.
  }

  resize(){
    // Not much to preserve here, so we just re-init the whole state
    this.exit();
    this.enter();
  }

  enter(){
    this.canvas = new BABYLON.ScreenSpaceCanvas2D(this.scene, {
      id: "menu_canvas",
      size: new BABYLON.Size(this.dom_canvas.width(),
                             this.dom_canvas.height()),
      backgroundFill: "#4040408F"
    });

		this.group = new BABYLON.Group2D({
      parent: this.canvas,
      id: 'menu_group' 
    });
		
	  this.group.pointerEventObservable.add(
      (d, s) => {
        let target = d.relatedTarget.id;
        // TODO: Do stuff with the click
      }, BABYLON.PrimitivePointerInfo.PointerUp

    );
  }

  exit(){
    this.canvas.dispose();
    // TODO: Do we need to unbind anything else or is removing the canvas
    // sufficient?
	}

}
