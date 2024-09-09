import { TileEngine, Scene, load } from "kontra";
import Player from "./Player.js";
import Blob from "./Blob.js";
import Tileset from "./Tileset.js";
import Chest from "./Chest.js";
import Cart from "./Cart.js";
import Door from "./Door.js";
import { MapFile } from "./types.js";
import InteractiveSprite from "./InteractiveSprite.js";
import {
  CHEST,
  PLAYER_DOWN,
  CART_VERTICAL,
  CART_HORIZONTAL,
  BLOB,
  DOOR_CLOSED,
  OUTSIDE,
} from "./sprites.js";

type ObjectType = Blob | Cart | Chest | Door | Player;

export default class Map {
  private mapFile: MapFile;
  private tileset: Tileset;
  private scene: Scene;
  private objects: Array<ObjectType>;
  public levelComplete: boolean = false;

  // fields initialized in init instead of constructor to allow for reinit
  private tileEngine?: TileEngine;
  private player?: Player;

  constructor(mapFile: MapFile, tileset: Tileset) {
    this.mapFile = mapFile;
    this.tileset = tileset;
    this.scene = Scene({ id: "map" });
    this.objects = [];

    this.init();
  }

  static async load(mapNumber: number, tileset: Tileset): Promise<Map> {
    return load(`assets/map${mapNumber}.json`).then(([mapFile]) => {
      return new Map(mapFile, tileset);
    });
  }

  init() {
    this.scene = Scene({ id: "map" });
    this.tileEngine = TileEngine({
      tilewidth: this.tileset.tileWidth, // tile size in pixels
      tileheight: this.tileset.tileHeight,
      width: this.mapFile.width, // map dimensions in tiles
      height: this.mapFile.height,
      tilesets: [
        {
          firstgid: 1,
          image: this.tileset.image,
        },
      ],
      layers: [
        {
          name: "background",
          data: Array(this.mapFile.width * this.mapFile.height).fill(OUTSIDE),
        },
        {
          name: "floor",
          data: this.mapFile.layers.floor,
        },
        {
          name: "structures",
          data: this.mapFile.layers.structures,
        },
      ],
    });

    this.objects = this.mapFile.layers.objects.flatMap((tile, index) => {
      const coord = this.coordinateFromCell(this.cellFromIndex(index));

      if (tile === CHEST) {
        return this.tileset.newChest(coord);
      }

      if (tile === PLAYER_DOWN) {
        return this.tileset.newPlayer(coord);
      }

      if (tile === CART_VERTICAL) {
        return this.tileset.newCart({
          ...coord,
          orientation: "vertical",
        });
      }

      if (tile === CART_HORIZONTAL) {
        return this.tileset.newCart({
          ...coord,
          orientation: "horizontal",
        });
      }

      if (tile === BLOB) {
        return this.tileset.newBlob({
          ...coord,
        });
      }

      if (tile === DOOR_CLOSED) {
        return this.tileset.newDoor(coord);
      }

      return [];
    });

    this.objects.forEach((object) => {
      this.tileEngine?.add(object);
      this.scene.add(object);
    });
    this.player = this.objects.find((object) => object instanceof Player);
  }

  objectAtCoordinate(coordinate: {
    x: number;
    y: number;
  }): ObjectType | undefined {
    const index = this.indexFromCoordinate(coordinate);

    return this.objects.find((object) => {
      return this.indexFromCoordinate(object) === index;
    });
  }

  movePlayer(dx: number, dy: number) {
    if (!this.player || !this.tileEngine || this.player.isMoving()) {
      return;
    }

    const proposedX = this.player.x + Math.sign(dx) * 16;
    const proposedY = this.player.y + Math.sign(dy) * 16;
    const proposedCoordinate = { x: proposedX, y: proposedY };

    if (
      proposedX < 0 ||
      proposedX >= this.tileEngine.mapwidth ||
      proposedY < 0 ||
      proposedY >= this.tileEngine.mapheight
    ) {
      return;
    }

    const object = this.objectAtCoordinate(proposedCoordinate);
    if (object instanceof Chest) {
      object.open();
      return;
    } else if (object instanceof Door) {
      if (!object.isOpen) {
        object.open();
      } else {
        this.levelComplete = true;
      }
      return;
    } else if (object instanceof InteractiveSprite) {
      const cartProposedX = object.x + Math.sign(dx) * 16;
      const cartProposedY = object.y + Math.sign(dy) * 16;
      const cartProposedCoordinate = { x: cartProposedX, y: cartProposedY };

      if (
        this.mapFile.layers.structures[
          this.indexFromCoordinate(cartProposedCoordinate)
        ] ||
        this.objectAtCoordinate(cartProposedCoordinate)
      ) {
        return;
      }

      if (!object.moveTo(cartProposedX, cartProposedY)) {
        return;
      }
    }

    if (
      !this.mapFile.layers.structures[
        this.indexFromCoordinate(proposedCoordinate)
      ]
    ) {
      this.player.moveTo(proposedX, proposedY);
    }
  }

  update() {
    this.scene.update();
  }

  render() {
    this.scene.render();
    this.tileEngine?.render();
  }

  private indexFromCell({ col, row }: { col: number; row: number }): number {
    return row * this.mapFile.width + col;
  }

  private indexFromCoordinate({ x, y }: { x: number; y: number }): number {
    return this.indexFromCell({
      col: Math.floor(x / this.tileset.tileWidth),
      row: Math.floor(y / this.tileset.tileHeight),
    });
  }

  private cellFromIndex(index: number): { col: number; row: number } {
    const col = index % this.mapFile.width;
    return {
      col,
      row: (index - col) / this.mapFile.width,
    };
  }

  private coordinateFromCell({ col, row }: { col: number; row: number }): {
    x: number;
    y: number;
  } {
    return {
      x: col * this.tileset.tileWidth,
      y: row * this.tileset.tileHeight,
    };
  }
}
