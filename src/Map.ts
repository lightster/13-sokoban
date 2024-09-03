import {
  load,
  TileEngine,
  dataAssets,
  TileEngineClass,
  keyPressed,
} from "kontra";
import Player from "./Player.js";
import Tileset from "./Tileset.js";

interface TileLayer {
  type: "tilelayer";
  name: string;
  width: number;
  height: number;
  data: Array<number>;
}

interface TileObject {
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
  objects: Array<TileObject>;
  objectMap?: Record<string, TileObject | undefined>;
}

interface Props extends Omit<Parameters<typeof TileEngine>[0], "layers"> {
  layers: Array<TileLayer | ObjectLayer>;
}

export default class Map {
  private name: string;
  private mapAsset: Props;
  private tileset: Tileset;
  private layerMap: Record<
    string,
    TileLayer | Required<ObjectLayer> | undefined
  >;

  // fields initialized in init instead of constructor to allow for reinit
  public tileEngine?: TileEngine;
  public player?: Player;

  constructor(name: string, mapAsset: Props, tileset: Tileset) {
    this.name = name;
    this.mapAsset = mapAsset;
    this.tileset = tileset;
    this.layerMap = mapAsset.layers.reduce((allLayers, layer) => {
      if (layer.type === "objectgroup") {
        return {
          ...allLayers,
          [layer.name]: {
            ...layer,
            objectMap: layer.objects.reduce((allObjects, object) => {
              return {
                ...allObjects,
                [object.name]: object,
              };
            }, {}),
          },
        };
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
    this.tileEngine = TileEngine(this.mapAsset);

    if (this.layerMap["objects"]?.type === "objectgroup") {
      const objects = this.layerMap["objects"];

      const chestObject = objects.objectMap["chest"];
      if (chestObject) {
        const chest = this.tileset.newChest({
          x: chestObject.x,
          y: chestObject.y,
        });
        this.tileEngine.add(chest);
      }

      const playerObject = objects.objectMap["player"];
      if (playerObject) {
        this.player = this.tileset.newPlayer({
          x: playerObject.x,
          y: playerObject.y,
        });
        this.tileEngine.add(this.player);
      }
    } else {
      console.error(
        `no 'objects' layer with type 'objectgroup' detected in map ${this.name}`,
      );
    }
  }

  movePlayer(dx: number, dy: number) {
    this.player?.move(dx, dy);
  }

  update() {
    if (!this.player) {
      return;
    }

    this.player.update();
  }

  render() {
    this.tileEngine?.render();
  }
}
