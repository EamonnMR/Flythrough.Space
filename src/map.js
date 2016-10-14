export class MapView {
  constructor(data, position, scene, size, game_canvas){
    this.data = data;

    this.scale_factor = 1;
    
    this.offset = position = {x: size.x / 2, y: size.y / 2}

    this.canvas = new BABYLON.ScreenSpaceCanvas2D(scene, {
      id: "map_canvas",
      size: new BABYLON.Size(size.x, size.y),
      backgroundFill: "#4040408F"
    });
    
    this.map_image = new BABYLON.Group2D({
      parent: this.canvas,
      id: 'map_image',
      x: this.offset.x,
      y: this.offset.y,
    });


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
    //this.map_image.position = [this.offset.x, this.offset.y];
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
  }

  draw_position(){
    if (this.map_sub){
      this.map_sub.dispose();
    }
    this.map_sub = new BABYLON.Text2D('' + this.offset.x + ',' + this.offset.y,
      {
        id: 'map_subtitle',
        x: 0,
        y: 20,
        fontName: '20pt Courier',
        parent: this.canvas
      }
    );
  }
}
