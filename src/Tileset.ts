import Player from "./Player.js";
import Chest from "./Chest.js";
import Map from "./Map.js";
import { load, imageAssets, dataAssets, SpriteSheet, TileEngine } from "kontra";
import Cart from "./Cart.js";

const TINY_TOWN_PNG = "tiled/kenney-tiny-town.png";
const TINY_TOWN_TILESET = "tiled/kenney-tiny-town.tsj";
const TINY_DUNGEON_PNG = "tiled/kenney-tiny-dungeon.png";
const TINY_DUNGEON_TILESET = "tiled/kenney-tiny-dungeon.tsj";

export default class Tileset {
  private dungeonSheet: SpriteSheet;

  constructor({ images }: { images: typeof imageAssets }) {
    this.dungeonSheet = SpriteSheet({
      image: images[TINY_DUNGEON_PNG],
      frameWidth: 16,
      frameHeight: 16,
      animations: {
        player: {
          frames: 85,
          frameRate: 1,
        },
        chestClosed: {
          frames: 89,
        },
        chestOpening: {
          frames: [89, 90, 91],
          frameRate: 10,
          loop: false,
        },
        cartHorizontal: {
          frames: 54,
        },
        cartVertical: {
          frames: 55,
        },
      },
    });
  }

  static async load() {
    return load(
      TINY_TOWN_PNG,
      TINY_TOWN_TILESET,
      TINY_DUNGEON_PNG,
      TINY_DUNGEON_TILESET,
    ).then(() => {
      return new Tileset({ images: imageAssets });
    });
  }

  newPlayer({ x, y }: { x: number; y: number }): Player {
    return new Player({
      x,
      y,
      animations: {
        player: this.dungeonSheet.animations.player,
      },
    });
  }

  newCart({
    x,
    y,
    orientation,
  }: {
    x: number;
    y: number;
    orientation: "vertical" | "horizontal";
  }): Cart {
    return new Cart({
      x,
      y,
      animations: {
        cart: this.dungeonSheet.animations[
          orientation === "vertical" ? "cartVertical" : "cartHorizontal"
        ],
      },
    });
  }

  newChest({ x, y }: { x: number; y: number }): Chest {
    return new Chest({
      x,
      y,
      animations: {
        closed: this.dungeonSheet.animations.chestClosed,
        opening: this.dungeonSheet.animations.chestOpening,
      },
    });
  }
}
