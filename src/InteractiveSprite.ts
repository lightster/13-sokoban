import { angleToTarget, movePoint, SpriteClass, Animation } from "kontra";

interface Props {
  x: number;
  y: number;
  direction?: "up" | "down" | "left" | "right";
  flipHorizontally?: boolean;
  animations: {
    atRest: Animation;
    up?: Animation;
    down?: Animation;
    left?: Animation;
    right?: Animation;
  };
}

type Coordinate = { x: number; y: number };

function directionBetween(
  from: Coordinate,
  to: Coordinate,
): "up" | "down" | "left" | "right" | "atRest" {
  if (from.x !== to.x) {
    return to.x - from.x < 0 ? "left" : "right";
  }
  if (from.y !== to.y) {
    return to.y - from.y < 0 ? "up" : "down";
  }

  return "atRest";
}

export default class InteractiveSprite extends SpriteClass {
  private movingTo: null | { x: number; y: number } = null;

  // enforce typing of props passed in more strictly
  constructor(props: Props) {
    super(props);
  }

  init(props: Props) {
    super.init({
      ...props,
      width: 16,
      height: 16,
      anchor: { x: 0, y: 0 },
    });

    this.playAnimation("atRest");
  }

  isMoving(): boolean {
    return !!this.movingTo;
  }

  moveTo(x: number, y: number): boolean {
    if (this.movingTo) {
      return false;
    }

    const direction = directionBetween(this, { x, y });
    if (direction === "atRest") {
      return false;
    }

    if (!this.animations[direction]) {
      return false;
    }

    let scaleX = 1;
    let translateX = 0;
    if (this.direction === "left") {
      scaleX = -1;
      translateX = 16;
    }

    this.movingTo = { x, y };
    this.playAnimation(direction);
    this.scaleX = scaleX;
    this.translateX = translateX;
    return true;
  }

  playAnimation(name: string) {
    if (this.currentAnimationName !== name) {
      this.currentAnimationName = name;
      super.playAnimation(name);
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
    } else if (this.currentAnimationName !== "atRest") {
      this.scaleX = this.direction === "left" ? -1 : 1;
      this.translateX = this.direction === "left" ? 16 : 0;
      this.playAnimation("atRest");
    }
  }

  render() {
    if (!this.translateX) {
      super.render();
      return;
    }

    const context = this.context;
    context.save();

    this.context.translate(this.translateX, 0);

    super.render();

    context.restore();
  }
}
