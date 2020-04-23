# Flythrough.Space: A Space Captain Game

Inspired by [Escape Velocity](http://escape-velocity.games) [and](https://www.newgrounds.com/portal/view/238585) [related](https://github.com/naev/naev) [titles](https://endless-sky.github.io/), built on the [Babylon.js](https://www.babylonjs.com/)  engine and written in vanilla ES6. No installation required, just host the files and you're good.

It's a 2.5D Space Combat/Trading RPG! Where you fly through space.

The goal here was to create something others could pick up and play with (as is tradition) so I've done my best to make a pretty open-ended system, even if the GUI got a bit off in the weeds.

The code is all front-end so you can host it on your favorite server (Nginx, Apache, etc) or just run a simple local server:

`python -m SimpleHTTPServer 8000`

# License
The code (/src) is released under the [GNU GPL 2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt). Assets (/data, /assets and, where applicable, /asset_sources) are covered by the  Creative Commons Attribution-ShareAlike 2.0 Generic ([CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/))

# The Code
The codebase is idiosyncratic. It's vanilla ES6 as written by a Python programmer. It uses snake_case for variables and function names, with the exception of Systems that go into the ECS, those get the normal camel case treatment. I might make them into classes at some point to get rid of that weirdness.

Singletons are stored in a variable called `_`. They include all important 'data' (which is the sum total of stuff loaded into the game, see `load.js`) and 'player' (which represents the save-state of the player, including all of their progression, etc.)

