export function ai_system(entMan){
  for (let entity of entMan.get_with(['ai'])) {
    let ai = entity.ai;
    if (ai.state === 'violent'){
      if ('target' in ai){
        engage(entity, entMan);
      }
    }
  }
};


