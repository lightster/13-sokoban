import Player from "./Player.js";
import Blob from "./Blob.js";
import Chest from "./Chest.js";
import { SpriteSheet } from "kontra";
import Cart from "./Cart.js";
import Door from "./Door.js";
import * as sprites from "./sprites.js";

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
        playerDown: { frames: sprites.PLAYER_DOWN - 1 },
        playerGoDown: { frames: sprites.PLAYER_GO_DOWN, frameRate: 10 },
        playerGoRight: { frames: sprites.PLAYER_GO_RIGHT, frameRate: 10 },
        playerGoUp: { frames: sprites.PLAYER_GO_UP, frameRate: 10 },
        playerGoLeft: { frames: sprites.PLAYER_GO_RIGHT, frameRate: 10 },
        chickenDown: { frames: sprites.CHICKEN_DOWN - 1 },
        chickenGoDown: { frames: sprites.CHICKEN_GO_DOWN, frameRate: 10 },
        chickenRight: { frames: sprites.CHICKEN_RIGHT - 1 },
        chickenGoRight: { frames: sprites.CHICKEN_GO_RIGHT, frameRate: 10 },
        chickenUp: { frames: sprites.CHICKEN_UP - 1 },
        chickenGoUp: { frames: sprites.CHICKEN_GO_UP, frameRate: 10 },
        chickenLeft: { frames: sprites.CHICKEN_RIGHT - 1 },
        chickenGoLeft: { frames: sprites.CHICKEN_GO_RIGHT, frameRate: 10 },
        blob: { frames: sprites.BLOB - 1 },
        blobGo: { frames: sprites.BLOB_GO, frameRate: 10 },
        chestClosed: { frames: sprites.CHEST - 1 },
        chestOpening: { frames: sprites.CHEST_OPENING, frameRate: 10 },
        chestOpeningSilly: {
          frames: sprites.CHEST_OPENING_SILLY,
          frameRate: 10,
        },
        cartHorizontal: { frames: sprites.CART_HORIZONTAL - 1 },
        cartVertical: { frames: sprites.CART_VERTICAL - 1 },
        doorClosed: { frames: sprites.DOOR_CLOSED - 1 },
        doorOpen: { frames: sprites.DOOR_OPEN - 1, loop: false },
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
        ...(orientation === "vertical"
          ? {
              atRest: this.sprites.animations.cartVertical,
              up: this.sprites.animations.cartVertical,
              down: this.sprites.animations.cartVertical,
            }
          : {
              atRest: this.sprites.animations.cartHorizontal,
              right: this.sprites.animations.cartHorizontal,
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
