import { SpriteClass } from "kontra";

type SuperProps = ConstructorParameters<typeof SpriteClass>[0];

export default class Chest extends SpriteClass {
  init(props: SuperProps) {
    super.init({
      ...props,
      width: 16,
      height: 16,
      anchor: { x: 0, y: 0 },
    });
    this.playAnimation("chest");
  }
}
