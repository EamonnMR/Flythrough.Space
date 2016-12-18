import * as gameplay from "gameplay";

$(() => {
  let systems, spobs;
  $.when(
    $.getJSON('data/systems.json', ( data ) =>  {
      systems = data;
      console.log(data);
    }),
    $.getJSON('data/spobs.json', ( data )=> {
      spobs = data;
      console.log(data);
    })
  ).then( () => {
    if (systems && spobs) {
      console.log('reached inner callback');
      gameplay.setupGameplayRender(
        $('#gameCanvas'), systems, spobs, 'Casamance'
      );
    }
  });
});

