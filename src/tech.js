export function tech_filter(tech_had, tech_needed){
  /* Basis for what gets shown where. I'm a bit foggy on how
   * I'd like to implement tech 'levels' at the moment, esp. since
   * I envision a few hub worlds where each major faction's tech
   * is available.
   */
  
  // Cleverly handles both empty tech_needed and tech_had
  for (let key of Object.keys(tech_needed || [])){
    if(!(key in (tech_had || {}))){
      return false;
    } else {
      if(tech_had[key] < tech_needed[key]){
        return false;
      }
    }
  }
  return true;
}

export function test_every_item_available_somewhere(data){
  for(let type of ['ships', 'upgrades']){
    test_every_item_of_type_available_somewhere(data, type);
  }
}

function test_every_item_of_type_available_somewhere(data, type){
  for(let item of Object.keys(data[type])){
    let item_dat = data[type][item];
    if('tech' in item_dat){
      test_each_tech_is_a_thing(data, item, Object.keys(item_dat.tech));
      test_item_available_somewhere(data, item, item_dat);
    }
  }
}

function test_each_tech_is_a_thing(data, name, tech_types){
  for(let tech_type of tech_types){
    let exists = false;
    each_spob(data, (spob_techs) => {
      if(tech_type in spob_techs){
        exists = true;
      }
    });
    if (! exists){
      console.log(`Tech '${tech_type}' does not exist on any spob. (found on ${name})`);
    }
  }
}

function test_item_available_somewhere(data, item, item_dat){
  let available_nowhere = true;
  each_spob(data, (spob_tech) => {
    if(tech_filter(spob_tech, item_dat.tech)){
      available_nowhere = false;
    }
  });
  if(available_nowhere){
    console.log(`${item} can't be had anywhere due to its tech`);
  }
}
    
function each_spob(data, callback){
  Object.values(data.spobs).forEach((spob) => {
    if('tech' in spob){
      callback(spob.tech)
    }
  });
}
