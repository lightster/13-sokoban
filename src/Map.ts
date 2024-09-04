import {
  load,
  TileEngine,
  dataAssets,
  TileEngineClass,
  keyPressed,
  Scene,
} from "kontra";
import Player from "./Player.js";
import Tileset from "./Tileset.js";
import Chest from "./Chest.js";

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

export default class Map {
  private name: string;
  private mapAsset: Props;
  private tileset: Tileset;
  private scene: Scene;
  private objectsByName: Record<string, ObjectTile | undefined>;
  private objectsById: Record<number, ObjectTile | undefined>;
  private objectsByCell: Record<number, ObjectTile | undefined>;
  private layerMap: Record<
    string,
    TileLayer | Required<ObjectLayer> | undefined
  >;

  // fields initialized in init instead of constructor to allow for reinit
  public tileEngine?: TileEngine;
  public player?: Player;
  public chest?: Chest;

  constructor(name: string, mapAsset: Props, tileset: Tileset) {
    this.name = name;
    this.mapAsset = mapAsset;
    this.tileset = tileset;
    this.scene = Scene({ id: "map" });
    this.objectsByName = {};
    this.objectsById = {};
    this.objectsByCell = {};
    this.layerMap = mapAsset.layers.reduce((allLayers, layer) => {
      if (layer.type === "objectgroup") {
        layer.objects.forEach((object) => {
          this.objectsByName[object.name] = object;
          this.objectsById[object.id] = object;
          this.objectsByCell[this.getIndexFromCoordinate(object)] = object;
        });
      }

      return {
        ...allLayers,
        [layer.name]: layer,
      };
    }, {});

    this.init();
  }

  static async load(map: string, tileset: Tileset): Promise<Map> {
    return load(`tiled/${map}.tmj`).then(() => {
      return new Map(map, dataAssets[`tiled/${map}`], tileset);
    });
  }

  init() {
    this.scene = Scene({ id: "map" });
    this.tileEngine = TileEngine(this.mapAsset);

    const chestObject = this.objectsByName["chest"];
    if (chestObject) {
      this.chest = this.tileset.newChest({
        x: chestObject.x,
        y: chestObject.y,
      });
      this.tileEngine.add(this.chest);
      this.scene.add(this.chest);
    }

    const playerObject = this.objectsByName["player"];
    if (playerObject) {
      this.player = this.tileset.newPlayer({
        x: playerObject.x,
        y: playerObject.y,
      });
      this.tileEngine.add(this.player);
      this.scene.add(this.player);
    }
  }

  objectAtCoordinate(coordinate: {
    x: number;
    y: number;
  }): ObjectTile | undefined {
    const index = this.getIndexFromCoordinate(coordinate);

    return this.objectsByCell[index];
  }

  movePlayer(dx: number, dy: number) {
    if (!this.player || !this.tileEngine) {
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
    if (object && object.type === "chest") {
      this.chest?.playAnimation("opening");
      return;
    }

    if (this.tileEngine.tileAtLayer("structures", proposedCoordinate) === 0) {
      this.player.moveTo(proposedX, proposedY);
    }
  }

  update() {
    if (!this.player) {
      return;
    }

    this.scene.update();
  }

  render() {
    this.scene.render();
    this.tileEngine?.render();
  }

  private getIndexFromCell({ col, row }: { col: number; row: number }): number {
    return row * this.mapAsset.width + col;
  }

  private getIndexFromCoordinate({ x, y }: { x: number; y: number }): number {
    return this.getIndexFromCell({
      col: Math.floor(x / this.mapAsset.tilewidth),
      row: Math.floor(y / this.mapAsset.tileheight),
    });
  }
}
