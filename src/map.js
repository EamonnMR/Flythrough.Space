export class MapView {
  constructor(data, position, scene, game_canvas){

    this.data = data;

    this.scale_factor = 1;

    this.diff = {x: game_canvas.width() / 2, y: game_canvas.height() / 2};

    this.offset = { x: position.x + this.diff.x, y: position.y + this.diff.y };

    this.canvas = new BABYLON.ScreenSpaceCanvas2D(scene, {
      id: "map_canvas",
      size: new BABYLON.Size(game_canvas.width(), game_canvas.height()),
      backgroundFill: "#4040408F"
    });
    
    this.map_image = new BABYLON.Group2D({
      parent: this.canvas,
      id: 'map_image',
      x: this.offset.x,
      y: this.offset.y,
    });

    this.map_image.pointerEventObservable.add(
      (d, s) => {
        let target = d.relatedTarget.id;
        if (target.indexOf('_circle') > 0){
          console.log("Clicked: " + target);
        }
      }, BABYLON.PrimitivePointerInfo.PointerUp
    );


    let circle_size = 10;
    for ( let system of Object.keys(data.systems)) {
      let system_dat = data.systems[system];
      new BABYLON.Text2D( system, {
        parent: this.map_image,
        id: system + '_label',
        x: (circle_size + system_dat.x) * this.scale_factor,
        y: (circle_size + system_dat.y) * this.scale_factor * -1,
        fontName: '15pt Courier'
      });
      
      let sys_loc_vec = new BABYLON.Vector2(system_dat.x * this.scale_factor,
                                        -1 * system_dat.y * this.scale_factor)

      for (let other_system_id of system_dat.links ){
        if (other_system_id in data.systems) {
          let other_system = data.systems[other_system_id];
        
          new BABYLON.Lines2D(
              [sys_loc_vec,
              new BABYLON.Vector2(other_system.x * this.scale_factor,
                                  -1 * other_system.y * this.scale_factor)],
              {
                parent: this.map_image,
                id: system + '->' + other_system_id
              }
          );
        } else {
          console.log('bad link: ' + system + ' -> ' + other_system_id);
        }
      }


      new BABYLON.Ellipse2D({
        parent: this.map_image,
        id: system + '_circle',
        x: system_dat.x * this.scale_factor,
        y: -1 * system_dat.y * this.scale_factor,
        width: circle_size,
        height: circle_size,
        fill: BABYLON.Canvas2D.GetSolidColorBrushFromHex("#FFFFFFFF")

      });
    }
    this.map_sub = null;
    this.draw_position();
    this.move = {x: 0, y: 0};
    this.dragging = false;

    game_canvas.mousedown(() => {
      this.dragging = true;
    });

    game_canvas.mouseup(() => {
      this.dragging = false;
    });

    game_canvas.mousemove( (event) => {
      if ( this.dragging ) {
        this.offset.x -= this.move.x - event.pageX;
        this.offset.y += this.move.y - event.pageY;
      }

      this.move = {x: event.pageX, y: event.pageY};
      this.map_image.x = this.offset.x;
      this.map_image.y = this.offset.y;
      this.draw_position();
    });
  }

  dispose(game_canvas){
    game_canvas.unbind('mousedown');
    game_canvas.unbind('mouseup');
    game_canvas.unbind('mousemove');
    this.canvas.dispose();
    return {
      x: this.offset.x - this.diff.x,
      y: this.offset.y - this.diff.y
    }
  }

  draw_position(){
    if (this.map_sub){
      this.map_sub.dispose();
    }
    /*
    this.map_sub = new BABYLON.Text2D('' + this.offset.x + ',' + this.offset.y,
      {
        id: 'map_subtitle',
        x: 0,
        y: 20,
        fontName: '20pt Courier',
        parent: this.canvas
      }
    );
    */
  }
}
