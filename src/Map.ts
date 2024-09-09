import { TileEngine, Scene } from "kontra";
import Player from "./Player.js";
import Blob from "./Blob.js";
import Tileset from "./Tileset.js";
import Chest from "./Chest.js";
import Cart from "./Cart.js";
import Door from "./Door.js";
import {
  MapSpec,
  OBJECT_PLAYER,
  OBJECT_BLOB,
  OBJECT_CART_HORIZONTAL,
  OBJECT_CART_VERTICAL,
  OBJECT_CHEST,
  OBJECT_DOOR,
} from "./types.js";
import map0 from "./maps/map0.js";
import InteractiveSprite from "./InteractiveSprite.js";

const maps: Array<MapSpec> = [map0] as const;

interface TileLayer {
  type: "tilelayer";
  name: string;
  data: Array<number>;
}

interface ObjectTile {
  type: string;
  row: number;
  col: number;
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

type ObjectType = Blob | Cart | Chest | Door | Player;

export default class Map {
  private mapSpec: MapSpec;
  private tileset: Tileset;
  private scene: Scene;
  private objectDefinitions: Array<ObjectTile>;
  private objects: Array<ObjectType>;
  public levelComplete: boolean = false;

  // fields initialized in init instead of constructor to allow for reinit
  private tileEngine?: TileEngine;
  private player?: Player;

  constructor(name: string, mapSpec: MapSpec, tileset: Tileset) {
    this.mapSpec = mapSpec;
    this.tileset = tileset;
    this.scene = Scene({ id: "map" });

    const objectString = this.mapSpec.objects.data.replace(/[\r\n]+/g, "");
    this.objectDefinitions = Array(15 * 15)
      .fill(0)
      .flatMap((_, index) => {
        return {
          ...this.cellFromIndex(index),
          type: objectString.charAt(index),
        };
      });
    this.objects = [];

    this.init();
  }

  static async load(name: string, tileset: Tileset): Promise<Map> {
    const mapSpec = maps[0];

    return new Map(name, mapSpec, tileset);
  }

  init() {
    this.scene = Scene({ id: "map" });
    this.tileEngine = TileEngine({
      tilewidth: this.tileset.tileWidth, // tile size in pixels
      tileheight: this.tileset.tileHeight,
      width: this.mapSpec.width, // map dimensions in tiles
      height: this.mapSpec.height,
      tilesets: [
        {
          firstgid: 1,
          image: this.tileset.image,
        },
      ],
      layers: [
        {
          type: "tilelayer",
          name: "background",
          data: this.mapSpec.background.data.map((tile) => tile),
        },
        {
          type: "tilelayer",
          name: "structures",
          data: this.mapSpec.structures.data.map((tile) => tile),
        },
      ],
    });

    this.objects = this.objectDefinitions.flatMap(({ col, row, type }) => {
      const coord = this.coordinateFromCell({ col, row });

      if (type === OBJECT_CHEST) {
        return this.tileset.newChest(coord);
      }

      if (type === OBJECT_PLAYER) {
        return this.tileset.newPlayer(coord);
      }

      if (type === OBJECT_CART_VERTICAL) {
        return this.tileset.newCart({
          ...coord,
          orientation: "vertical",
        });
      }

      if (type === OBJECT_CART_HORIZONTAL) {
        return this.tileset.newCart({
          ...coord,
          orientation: "horizontal",
        });
      }

      if (type === OBJECT_BLOB) {
        return this.tileset.newBlob({
          ...coord,
        });
      }

      if (type === OBJECT_DOOR) {
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
    return row * this.mapSpec.width + col;
  }

  private indexFromCoordinate({ x, y }: { x: number; y: number }): number {
    return this.indexFromCell({
      col: Math.floor(x / this.tileset.tileWidth),
      row: Math.floor(y / this.tileset.tileHeight),
    });
  }

  private cellFromIndex(index: number): { col: number; row: number } {
    const col = index % this.mapSpec.width;
    return {
      col,
      row: (index - col) / this.mapSpec.width,
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
