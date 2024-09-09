import { angleToTarget, movePoint, SpriteClass, Animation } from "kontra";

type SuperProps = Exclude<
  ConstructorParameters<typeof SpriteClass>[0],
  "animations"
>;
interface Props {
  x: number;
  y: number;
  animations: {
    atRest: Animation;
    up?: Animation;
    down?: Animation;
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

    let scaledDirection = direction;
    let scaleX = 1;
    let translateX = 0;
    if (direction === "left") {
      scaledDirection = "right";
      scaleX = -1;
      translateX = 16;
    }

    const animationExists = !!this.animations[scaledDirection];
    if (animationExists) {
      this.movingTo = { x, y };
      this.playAnimation(scaledDirection);
      this.scaleX = scaleX;
      this.translateX = translateX;
      return true;
    }

    return false;
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
      this.scaleX = 1;
      this.translateX = 0;
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
