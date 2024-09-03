import {
  angleToTarget,
  movePoint,
  SpriteClass,
  TileEngine,
  TileEngineClass,
  GameObject,
  GameObjectClass,
  keyPressed,
} from "kontra";

type SuperProps = ConstructorParameters<typeof SpriteClass>[0];

export default class Player extends SpriteClass {
  private movingTo: null | { x: number; y: number } = null;

  init(props: SuperProps) {
    super.init({
      ...props,
      width: 16,
      height: 16,
      anchor: { x: 0, y: 0 },
    });
    this.playAnimation("player");
  }

  moveTo(x: number, y: number) {
    if (this.movingTo) {
      return;
    }

    this.movingTo = { x, y };
  }

  update() {
    this.advance();

    if (this.movingTo) {
      const distancePerFrame = 2; // pixels
      const angle = angleToTarget(this, this.movingTo);
      const { x: nextX, y: nextY } = movePoint(this, angle, distancePerFrame);
      let next = { x: Math.round(nextX), y: Math.round(nextY) };

      const remainingDistance = Math.hypot(
        this.movingTo.x - next.x,
        this.movingTo.y - next.y,
      );

      if (remainingDistance <= distancePerFrame) {
        next = this.movingTo;
        this.movingTo = null;
      }

      this.x = next.x;
      this.y = next.y;
    }
  }
}
