import {
  init,
  GameLoop,
  initKeys,
  load,
  TileEngine,
  dataAssets,
  initPointer,
  keyPressed,
  SpriteSheet,
  imageAssets,
} from "kontra";
import Player from "./Player.js";

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
  console.log(tileEngine);
  const dungeonSheet = SpriteSheet({
    image: imageAssets["tiled/kenney-tiny-dungeon.png"],
    frameWidth: 16,
    frameHeight: 16,
    animations: {
      player: {
        frames: 85,
        frameRate: 1,
      },
    },
  });

  const objectsLayer = dataAssets["tiled/map.tmj"].layers.find(
    (layer: { name: string }) => layer.name === "objects",
  );
  const playerObject = objectsLayer.objects.find(
    (object: { name: string }) => object.name === "player",
  );

  let playerSprite = new Player({
    x: Math.floor(playerObject.x / tileEngine.tilewidth) * tileEngine.tilewidth,
    y:
      Math.floor(playerObject.y / tileEngine.tileheight) *
      tileEngine.tileheight,
    animations: dungeonSheet.animations,
  });
  tileEngine.add(playerSprite);

  function movePlayer(x: number, y: number) {
    // console.log(x, y);
    // if (
    //   !tileEngine.layerCollidesWith("structures", {
    //     anchor: playerSprite.anchor,
    //     width: playerSprite.width,
    //     height: playerSprite.height,
    //     x,
    //     y,
    //   })
    // ) {
    playerSprite.moveTo({ x, y, tileEngine });
    // }
  }

  let loop = GameLoop({
    update: function () {
      if (keyPressed("arrowup")) {
        movePlayer(playerSprite.x, playerSprite.y - 16);
      }
      if (keyPressed("arrowdown")) {
        movePlayer(playerSprite.x, playerSprite.y + 16);
      }
      if (keyPressed("arrowleft")) {
        movePlayer(playerSprite.x - 16, playerSprite.y);
      }
      if (keyPressed("arrowright")) {
        movePlayer(playerSprite.x + 16, playerSprite.y);
      }

      playerSprite.update();
    },
    render: function () {
      tileEngine.render();
    },
  });

  loop.start();
});
