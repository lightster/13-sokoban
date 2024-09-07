import Player from "./Player.js";
import Chest from "./Chest.js";
import { load, imageAssets, SpriteSheet } from "kontra";
import Cart from "./Cart.js";
import Door from "./Door.js";

const TINY_TOWN_PNG = "assets/kenney-tiny-town.png";
const TINY_TOWN_TILESET = "assets/kenney-tiny-town.tsj";
const TINY_DUNGEON_PNG = "assets/kenney-tiny-dungeon.png";
const TINY_DUNGEON_TILESET = "assets/kenney-tiny-dungeon.tsj";

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
        doorClosed: {
          frames: 45,
        },
        doorOpening: {
          frames: [45, 33, 21],
          frameRate: 10,
          loop: false,
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
      orientation,
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

  newDoor({ x, y }: { x: number; y: number }): Door {
    return new Door({
      x,
      y,
      animations: {
        closed: this.dungeonSheet.animations.doorClosed,
        opening: this.dungeonSheet.animations.doorOpening,
      },
    });
  }
}
