import { _ } from "./singletons.js";
import { choose } from "./util.js";

const DEFAULT_HAIL_QUOTES = [
  "< No Response >",
  "< Call Disconnected >",
  "< Channel Closed >",
  "< Hung Up >",
  "< Connection Timeout >",
]

export function comm_quote( ship){
  return `${get_comm_quote(ship)} -- ${ship.short_name}`;
}

function hail_trade_info(){
  // TODO: Tell the player about high or low prices
  return [];
}

function hail_mining_info(){
  // TODO: Tell the player about good places to find asteroids
  return [];
}

function get_comm_quote( ship ){
  let quotes = DEFAULT_HAIL_QUOTES;
  if( ship.govt in _.data.govts ){
    if( "hail_quotes" in _.data.govts[ship.govt] ){
      quotes = _.data.govts[ship.govt].hail_quotes;
    }
    if( "gives_trade_advice" in _.data.govts[ship.govt]){
      quotes = quotes.concat(hail_trade_info());
    }
    if( "gives_mining_advice" in _.data.govts[ship.govt]){
      quotes = quotes.concat(hail_mining_info());
    }
  }

  return choose(quotes);
}
