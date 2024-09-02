import { angleToTarget, movePoint, SpriteClass, TileEngine } from "kontra";

export default class Player extends SpriteClass {
  private movingTo: null | { x: number; y: number } = null;

  init(properties: Parameters<InstanceType<typeof SpriteClass>["init"]>) {
    super.init({
      ...properties,
      width: 16,
      height: 16,
      anchor: { x: 0, y: 0 },
    });
    this.playAnimation("player");
  }

  moveTo({
    x,
    y,
    tileEngine,
  }: {
    x: number;
    y: number;
    tileEngine: TileEngine;
  }) {
    if (this.movingTo) {
      return;
    }

    console.log({ y, mapheight: tileEngine.mapheight });
    if (
      x >= 0 &&
      x < tileEngine.mapwidth &&
      y >= 0 &&
      y < tileEngine.mapheight &&
      !tileEngine.tileAtLayer("structures", {
        x: x,
        y: y,
      })
    ) {
      this.movingTo = { x, y };
    }
  }

  update() {
    this.advance();

    if (this.movingTo) {
      const distancePerFrame = 1; // pixels
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
