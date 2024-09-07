import { SpriteClass } from "kontra";

type SuperProps = ConstructorParameters<typeof SpriteClass>[0];

export default class Chest extends SpriteClass {
  private isOpening: boolean = false;

  init(props: SuperProps) {
    super.init({
      ...props,
      width: 16,
      height: 16,
      anchor: { x: 0, y: 0 },
    });
    this.playAnimation("closed");
  }

  open() {
    if (this.isOpening) {
      return;
    }

    this.playAnimation("opening");
    this.isOpening = true;
  }
}
