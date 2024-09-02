import {
  init,
  GameLoop,
  initKeys,
  load,
  TileEngine,
  dataAssets,
  initPointer,
  SpriteSheet,
  imageAssets,
  keyPressed,
} from "kontra";
import Player from "./Player.js";
import Chest from "./Chest.js";

let { canvas } = init();

init();
initPointer();
initKeys();

load(
  "tiled/kenney-tiny-town.png",
  "tiled/kenney-tiny-town.tsj",
  "tiled/kenney-tiny-dungeon.png",
  "tiled/kenney-tiny-dungeon.tsj",
  "tiled/map.tmj",
).then(() => {
  let tileEngine = TileEngine(dataAssets["tiled/map"]);
  const dungeonSheet = SpriteSheet({
    image: imageAssets["tiled/kenney-tiny-dungeon.png"],
    frameWidth: 16,
    frameHeight: 16,
    animations: {
      player: {
        frames: 85,
        frameRate: 1,
      },
      chest: {
        frames: [89, 90, 91],
        frameRate: 20,
      },
    },
  });

  const objectsLayer = dataAssets["tiled/map.tmj"].layers.find(
    (layer: { name: string }) => layer.name === "objects",
  );
  const playerObject = objectsLayer.objects.find(
    (object: { name: string }) => object.name === "player",
  );
  const chestObject = objectsLayer.objects.find(
    (object: { name: string }) => object.name === "chest",
  );

  let chestSprite = new Chest({
    x: Math.floor(chestObject.x / tileEngine.tilewidth) * tileEngine.tilewidth,
    y:
      Math.floor(chestObject.y / tileEngine.tileheight) * tileEngine.tileheight,
    animations: {
      chest: dungeonSheet.animations.chest,
    },
  });
  tileEngine.add(chestSprite);

  let playerSprite = new Player({
    x: Math.floor(playerObject.x / tileEngine.tilewidth) * tileEngine.tilewidth,
    y:
      Math.floor(playerObject.y / tileEngine.tileheight) *
      tileEngine.tileheight,
    animations: {
      player: dungeonSheet.animations.player,
    },
  });
  tileEngine.add(playerSprite);

  let loop = GameLoop({
    update: function () {
      if (keyPressed("arrowup")) {
        playerSprite.move(0, -1);
      }
      if (keyPressed("arrowdown")) {
        playerSprite.move(0, 1);
      }
      if (keyPressed("arrowleft")) {
        playerSprite.move(-1, 0);
      }
      if (keyPressed("arrowright")) {
        playerSprite.move(1, 0);
      }

      playerSprite.update();
    },
    render: function () {
      tileEngine.render();
    },
  });

  loop.start();
});
