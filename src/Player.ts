import { angleToTarget, movePoint, SpriteClass, TileEngineClass } from "kontra";

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

  move(dx: number, dy: number) {
    if (this.movingTo) {
      return;
    }

    const x = this.x + Math.sign(dx) * 16;
    const y = this.y + Math.sign(dy) * 16;

    if (
      this.parent instanceof TileEngineClass &&
      x >= 0 &&
      x < this.parent.mapwidth &&
      y >= 0 &&
      y < this.parent.mapheight &&
      !this.parent.tileAtLayer("structures", {
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
