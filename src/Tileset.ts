import Player from "./Player.js";
import Chest from "./Chest.js";
import Map from "./Map.js";
import { load, imageAssets, dataAssets, SpriteSheet, TileEngine } from "kontra";

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
        chest: {
          frames: [89, 90, 91],
          frameRate: 20,
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

  newChest({ x, y }: { x: number; y: number }): Chest {
    return new Chest({
      x,
      y,
      animations: {
        chest: this.dungeonSheet.animations.chest,
      },
    });
  }
}
