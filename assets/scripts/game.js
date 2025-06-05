const scene = new Phaser.Scene("Game");

scene.preload = function () {
  this.load.image("background", "assets/sprites/background.avif");
  this.load.image("card", "assets/sprites/card.avif");
};

scene.create = function () {
  // this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'bg');
  this.add.sprite(0, 0, "background").setOrigin(0, 0);

  const cardsPositions = this.getCardsPositions();
  for (let position of cardsPositions) {
    this.add.sprite(position.x, position.y, "card").setOrigin(0, 0);
  }
};

scene.getCardsPositions = function () {
  const positions = [];

  const cardTexture = this.textures.get("card").getSourceImage();

  const cardWidth = cardTexture.width + 4;
  const cardHeight = cardTexture.height + 4;
  const offsetX = (this.sys.game.config.width - cardWidth * config.cols) / 2;
  const offsetY = (this.sys.game.config.height - cardHeight * config.rows) / 2;

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      positions.push({
        x: offsetX + col * cardWidth,
        y: offsetY + row * cardHeight,
      });
    }
  }

  return positions;
};

const config = {
  type: Phaser.AUTO, // webgl or canvas
  width: 1280,
  height: 720,
  rows: 2,
  cols: 5,
  scene: scene,
};

const game = new Phaser.Game(config);
