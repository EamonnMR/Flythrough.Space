import * as main from "main";

// TODO: Implement a proper loading scheme

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
      main.init(
        $('#gameCanvas'), systems, spobs, 'Casamance'
      );
    }
  });
});

