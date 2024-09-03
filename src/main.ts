import { init, GameLoop, initKeys, initPointer, keyPressed } from "kontra";
import Map from "./Map.js";
import Tileset from "./Tileset.js";

init();
initPointer();
initKeys();

Tileset.load().then((tileset) => {
  let map: Map | undefined;
  let mapLoading: boolean = false;

  let loop = GameLoop({
    update: function () {
      if (mapLoading) {
        return;
      }

      if (!map) {
        mapLoading = true;
        Map.load("map", tileset).then((m) => {
          map = m;
          mapLoading = false;
        });
        return;
      }

      if (keyPressed("arrowup")) {
        map.movePlayer(0, -1);
      }
      if (keyPressed("arrowdown")) {
        map.movePlayer(0, 1);
      }
      if (keyPressed("arrowleft")) {
        map.movePlayer(-1, 0);
      }
      if (keyPressed("arrowright")) {
        map.movePlayer(1, 0);
      }

      map.update();
    },
    render: function () {
      if (!map) {
        return;
      }

      map.render();
    },
  });

  loop.start();
});
