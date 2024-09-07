import { load, TileEngine, dataAssets, Scene } from "kontra";
import Player from "./Player.js";
import Tileset from "./Tileset.js";
import Chest from "./Chest.js";
import Cart from "./Cart.js";
import Door from "./Door.js";

interface TileLayer {
  type: "tilelayer";
  name: string;
  width: number;
  height: number;
  data: Array<number>;
}

interface ObjectTile {
  id: number;
  type: string;
  name: string;
  height: number;
  width: number;
  x: number;
  y: number;
}

interface ObjectLayer {
  type: "objectgroup";
  name: string;
  width: number;
  height: number;
  objects: Array<ObjectTile>;
  objectByName?: Record<string, ObjectTile | undefined>;
  objectById?: Record<number, ObjectTile | undefined>;
}

interface Props extends Omit<Parameters<typeof TileEngine>[0], "layers"> {
  layers: Array<TileLayer | ObjectLayer>;
}

type ObjectType = Cart | Chest | Door | Player;

export default class Map {
  private mapAsset: Props;
  private tileset: Tileset;
  private scene: Scene;
  private objectDefinitions: Array<ObjectTile>;
  private objects: Array<ObjectType>;
  public levelComplete: boolean = false;

  // fields initialized in init instead of constructor to allow for reinit
  private tileEngine?: TileEngine;
  private player?: Player;

  constructor(name: string, mapAsset: Props, tileset: Tileset) {
    this.mapAsset = mapAsset;
    this.tileset = tileset;
    this.scene = Scene({ id: "map" });
    this.objectDefinitions = mapAsset.layers.flatMap((layer) => {
      return layer.type === "objectgroup" ? layer.objects : [];
    });
    this.objects = [];

    this.init();
  }

  static async load(map: string, tileset: Tileset): Promise<Map> {
    return load(`assets/${map}.tmj`).then(() => {
      return new Map(map, dataAssets[`assets/${map}`], tileset);
    });
  }

  init() {
    this.scene = Scene({ id: "map" });
    this.tileEngine = TileEngine(this.mapAsset);

    this.objects = this.objectDefinitions.flatMap((object) => {
      if (object.type === "chest") {
        return this.tileset.newChest(
          this.roundCoordinates({
            x: object.x,
            y: object.y,
          }),
        );
      }

      if (object.type === "player") {
        return this.tileset.newPlayer(
          this.roundCoordinates({
            x: object.x,
            y: object.y,
          }),
        );
      }

      if (object.type === "vertical-cart") {
        return this.tileset.newCart({
          ...this.roundCoordinates({
            x: object.x,
            y: object.y,
          }),
          orientation: "vertical",
        });
      }

      if (object.type === "horizontal-cart") {
        return this.tileset.newCart({
          ...this.roundCoordinates({
            x: object.x,
            y: object.y,
          }),
          orientation: "horizontal",
        });
      }

      if (object.type === "door") {
        return this.tileset.newDoor({
          ...this.roundCoordinates({
            x: object.x,
            y: object.y,
          }),
        });
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
    } else if (object instanceof Cart) {
      const cartProposedX = object.x + Math.sign(dx) * 16;
      const cartProposedY = object.y + Math.sign(dy) * 16;
      const cartProposedCoordinate = { x: cartProposedX, y: cartProposedY };

      if (
        this.tileEngine.tileAtLayer("structures", cartProposedCoordinate) ||
        this.objectAtCoordinate(cartProposedCoordinate)
      ) {
        return;
      }

      if (!object.moveTo(cartProposedX, cartProposedY)) {
        return;
      }
    }

    if (this.tileEngine.tileAtLayer("structures", proposedCoordinate) === 0) {
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
    return row * this.mapAsset.width + col;
  }

  private indexFromCoordinate({ x, y }: { x: number; y: number }): number {
    return this.indexFromCell({
      col: Math.floor(x / this.mapAsset.tilewidth),
      row: Math.floor(y / this.mapAsset.tileheight),
    });
  }

  private roundCoordinates({ x, y }: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    return {
      x:
        Math.floor(
          (x + this.mapAsset.tilewidth / 2) / this.mapAsset.tilewidth,
        ) * this.mapAsset.tilewidth,
      y:
        Math.floor(
          (y + this.mapAsset.tileheight / 2) / this.mapAsset.tileheight,
        ) * this.mapAsset.tileheight,
    };
  }
}
