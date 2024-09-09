export const OBJECT_PLAYER = "P";
export const OBJECT_BLOB = "B";
export const OBJECT_CART_HORIZONTAL = "H";
export const OBJECT_CART_VERTICAL = "V";
export const OBJECT_CHEST = "C";
export const OBJECT_DOOR = "E";
export const OBJECT_CHICKEN_DOWN = "D";
export const OBJECT_CHICKEN_RIGHT = "R";
export const OBJECT_CHICKEN_UP = "U";
export const OBJECT_CHICKEN_LEFT = "L";

export interface MapSpec {
  width: number;
  height: number;
  background: {
    data: Array<number>;
  };
  structures: {
    data: Array<number>;
  };
  objects: {
    data: string;
  };
}
