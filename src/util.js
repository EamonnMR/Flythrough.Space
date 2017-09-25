export function distance(l_pos, r_pos){
  return Math.sqrt(
      Math.pow(l_pos.x - r_pos.x, 2) +
      Math.pow(l_pos.y - r_pos.y, 2)
  );
};
