# Achernar: Space Captain Game

Achernar is written in ES6. Most of it should run in modern browsers, but sadly one major feature that makes coding in this project bearable, the es6 module system (ie import, export) isn't supported by Chrome or Firefox. I haven't had the occasion to test it
uncompiled in safari (it might work.) To install the tooling:

`npm install babel-cli babel-preset-es2015  babel-plugin-transform-es2015-modules-umd`

To compile:

`babel src -d js`

The code is all front-end so you can host it on your favorite server (Nginx, Apache, etc) or just run a simple local server:

`python -m SimpleHTTPServer 8000`

