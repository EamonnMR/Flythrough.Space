export class ViewState{

  constructor(){
    this.parent = null;
  }

  update(){
    // This will be called to progress gameplay, animation, etc.
  }

  resize(){
    // This will be called if the window is resized.
  }

  enter(){
    // Initial setup.
    //
    // Since states persist beyond entering and exiting, you can cache
    // what you'd like to and use enter/exit to explicitly create and
    // destroy needed resources.
	}

  exit(){
    // Cleanup
  }
}

