import { angleToTarget, movePoint, SpriteClass } from "kontra";

type Orientation = "vertical" | "horizontal";

type SuperProps = ConstructorParameters<typeof SpriteClass>[0];
type Props = SuperProps & { orientation: Orientation };

export default class Cart extends SpriteClass {
  private movingTo: null | { x: number; y: number } = null;
  private orientation: Orientation;

  constructor(props: Props) {
    super(props);
    this.orientation = props.orientation;
  }

  init(props: Props) {
    super.init({
      ...props,
      width: 16,
      height: 16,
      anchor: { x: 0, y: 0 },
    });
    this.orientation = props.orientation;

    this.playAnimation("cart");
  }

  moveTo(x: number, y: number): boolean {
    if (this.movingTo) {
      return false;
    }

    if (
      (this.orientation === "vertical" && x !== this.x) ||
      (this.orientation === "horizontal" && y !== this.y)
    ) {
      return false;
    }

    this.movingTo = { x, y };
    return true;
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
