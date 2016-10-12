export class MapView {
  constructor(data, position, scene, size, game_canvas){
    this.data = data;
    
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
      children:[
        new BABYLON.Text2D('Map goes here', {
          id: 'map_text',
          fontName: '20pT Courier'
        })
      ]
    });


    this.map_image.position = [this.offset.x, this.offset.y];
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
        this.offset.y -= this.move.y - event.pageY;
      }

      this.move = {x: event.pageX, y: event.pageY};
      this.map_image.position = [this.offset.x, this.offset.y];
    });
  }

  dispose(game_canvas){
    game_canvas.unbind('mousedown');
    game_canvas.unbind('mouseup');
    game_canvas.unbind('mousemove');
    this.canvas.dispose();
  }
}
