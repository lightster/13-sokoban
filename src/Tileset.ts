import Player from "./Player.js";
import Blob from "./Blob.js";
import Chest from "./Chest.js";
import { SpriteSheet } from "kontra";
import Cart from "./Cart.js";
import Door from "./Door.js";

const CHICKEN_FRAME_COUNT = 10;
const BLOB_FRAME_COUNT = 7;
const PLAYER_FRAME_COUNT = 5;
const CHEST_FRAME_COUNT = 3;

export const CHICKEN_DOWN = 1;
export const CHICKEN_RIGHT = CHICKEN_DOWN + CHICKEN_FRAME_COUNT;
export const CHICKEN_UP = CHICKEN_RIGHT + CHICKEN_FRAME_COUNT;
export const OUTSIDE_TOP_LEFT = CHICKEN_UP + CHICKEN_FRAME_COUNT;
export const OUTSIDE_TOP = OUTSIDE_TOP_LEFT + 1;
export const OUTSIDE_TOP_RIGHT = OUTSIDE_TOP + 1;
export const SHADOW_TOP_LEFT = OUTSIDE_TOP_RIGHT + 1;
export const FLOOR = SHADOW_TOP_LEFT + 1;
export const OUTSIDE_LEFT = FLOOR + 1;
export const WALL = OUTSIDE_LEFT + 1;
export const OUTSIDE_RIGHT = WALL + 1;
export const SHADOW_LEFT = OUTSIDE_RIGHT + 1;
export const INSIDE_BOTTOM_RIGHT = SHADOW_LEFT + 1;
export const SHADOW_TOP = INSIDE_BOTTOM_RIGHT + 1;
export const SHADOW_TOP_RIGHT = SHADOW_TOP + 1;
export const INSIDE_BOTTOM_LEFT = SHADOW_TOP_RIGHT + 1;
export const OUTSIDE_BOTTOM_LEFT = INSIDE_BOTTOM_LEFT + 1;
export const OUTSIDE_BOTTOM = OUTSIDE_BOTTOM_LEFT + 1;
export const OUTSIDE_BOTTOM_RIGHT = OUTSIDE_BOTTOM + 1;
export const INSIDE_TOP_RIGHT = OUTSIDE_BOTTOM_RIGHT + 1;
export const INSIDE_TOP_LEFT = INSIDE_TOP_RIGHT + 1;
export const DOOR_CLOSED = INSIDE_TOP_LEFT + 1;
export const DOOR_OPEN = DOOR_CLOSED + 1;
export const SHADOW_HALL_BOTTOM = DOOR_OPEN + 1;
export const SHADOW_OBJECT_RIGHT = SHADOW_HALL_BOTTOM + 1;
export const SHADOW_OBJECT_BOTTOM = SHADOW_OBJECT_RIGHT + 1;
export const OUTSIDE = SHADOW_OBJECT_BOTTOM + 1;
export const BLOB = OUTSIDE + 1;
export const PLAYER_DOWN = BLOB + BLOB_FRAME_COUNT;
export const PLAYER_RIGHT = PLAYER_DOWN + PLAYER_FRAME_COUNT;
export const PLAYER_UP = PLAYER_RIGHT + PLAYER_FRAME_COUNT;
export const PLAYER_LAYING_DOWN = PLAYER_UP + PLAYER_FRAME_COUNT;
export const CART_HORIZONTAL = PLAYER_LAYING_DOWN + 1;
export const CART_VERTICAL = CART_HORIZONTAL + 1;
export const CHEST = CART_VERTICAL + 1;
export const CHEST_SILLY = CHEST + CHEST_FRAME_COUNT;

export const CHICKEN_GO_DOWN = `${CHICKEN_DOWN - 1}..${CHICKEN_DOWN - 1 + CHICKEN_FRAME_COUNT - 1}`;
export const CHICKEN_GO_RIGHT = `${CHICKEN_RIGHT - 1}..${CHICKEN_RIGHT - 1 + CHICKEN_FRAME_COUNT - 1}`;
export const CHICKEN_GO_UP = `${CHICKEN_UP - 1}..${CHICKEN_UP - 1 + CHICKEN_FRAME_COUNT - 1}`;
export const PLAYER_GO_DOWN = `${PLAYER_DOWN - 1}..${PLAYER_DOWN - 1 + PLAYER_FRAME_COUNT - 1}`;
export const PLAYER_GO_RIGHT = `${PLAYER_RIGHT - 1}..${PLAYER_RIGHT - 1 + PLAYER_FRAME_COUNT - 1}`;
export const PLAYER_GO_UP = `${PLAYER_UP - 1}..${PLAYER_UP - 1 + PLAYER_FRAME_COUNT - 1}`;
export const BLOB_GO = `${BLOB - 1}..${BLOB - 1 + BLOB_FRAME_COUNT - 1}`;
export const CHEST_OPENING = `${CHEST - 1}..${CHEST - 1 + CHEST_FRAME_COUNT - 1}`;
export const CHEST_OPENING_SILLY = [CHEST, CHEST + 1, CHEST_SILLY];

export default class Tileset {
  public image: HTMLImageElement;
  public readonly tileWidth: number;
  public readonly tileHeight: number;
  private sprites: SpriteSheet;

  constructor({ image }: { image: HTMLImageElement }) {
    this.image = image;
    this.tileWidth = 16;
    this.tileHeight = 16;
    this.sprites = SpriteSheet({
      image,
      frameWidth: this.tileWidth,
      frameHeight: this.tileHeight,
      animations: {
        playerDown: { frames: PLAYER_DOWN - 1 },
        playerGoDown: { frames: PLAYER_GO_DOWN, frameRate: 10 },
        playerGoRight: { frames: PLAYER_GO_RIGHT, frameRate: 10 },
        playerGoUp: { frames: PLAYER_GO_UP, frameRate: 10 },
        playerGoLeft: { frames: PLAYER_GO_RIGHT, frameRate: 10 },
        chickenDown: { frames: CHICKEN_DOWN - 1 },
        chickenGoDown: { frames: CHICKEN_GO_DOWN, frameRate: 10 },
        chickenRight: { frames: CHICKEN_RIGHT - 1 },
        chickenGoRight: { frames: CHICKEN_GO_RIGHT, frameRate: 10 },
        chickenUp: { frames: CHICKEN_UP - 1 },
        chickenGoUp: { frames: CHICKEN_GO_UP, frameRate: 10 },
        chickenLeft: { frames: CHICKEN_RIGHT - 1 },
        chickenGoLeft: { frames: CHICKEN_GO_RIGHT, frameRate: 10 },
        blob: { frames: BLOB - 1 },
        blobGo: { frames: BLOB_GO, frameRate: 10 },
        chestClosed: { frames: CHEST - 1 },
        chestOpening: { frames: CHEST_OPENING, frameRate: 10 },
        chestOpeningSilly: { frames: CHEST_OPENING_SILLY, frameRate: 10 },
        cartHorizontal: { frames: CART_HORIZONTAL - 1 },
        cartVertical: { frames: CART_VERTICAL - 1 },
        doorClosed: { frames: DOOR_CLOSED - 1 },
        doorOpen: { frames: DOOR_OPEN - 1 },
      },
    });
  }

  static async load(): Promise<Tileset> {
    const image = new Image();
    image.src = "assets/sprites.png";

    return new Promise((resolve) => {
      image.onload = function () {
        resolve(new Tileset({ image }));
      };
    });
  }

  newPlayer({ x, y }: { x: number; y: number }): Player {
    return new Player({
      x,
      y,
      animations: {
        atRest: this.sprites.animations.playerDown,
        up: this.sprites.animations.playerGoUp,
        down: this.sprites.animations.playerGoDown,
        right: this.sprites.animations.playerGoRight,
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
        atRest: this.sprites.animations.playerDown,
        ...(orientation === "vertical"
          ? {
              up: this.sprites.animations.cartHorizontal,
              down: this.sprites.animations.cartHorizontal,
            }
          : {
              right: this.sprites.animations.cartVertical,
            }),
      },
    });
  }

  newBlob({ x, y }: { x: number; y: number }): Blob {
    return new Blob({
      x,
      y,
      animations: {
        atRest: this.sprites.animations.blob,
        up: this.sprites.animations.blobGo,
        down: this.sprites.animations.blobGo,
        right: this.sprites.animations.blobGo,
      },
    });
  }

  newChest({ x, y }: { x: number; y: number }): Chest {
    return new Chest({
      x,
      y,
      animations: this.sprites.animations,
    });
  }

  newDoor({ x, y }: { x: number; y: number }): Door {
    return new Door({
      x,
      y,
      animations: this.sprites.animations,
    });
  }
}
