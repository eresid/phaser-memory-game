class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.image("bg", "assets/sprites/background.avif");
    this.load.image("card", "assets/sprites/card.avif");
    this.load.image("card1", "assets/sprites/card1.avif");
    this.load.image("card2", "assets/sprites/card2.avif");
    this.load.image("card3", "assets/sprites/card3.avif");
    this.load.image("card4", "assets/sprites/card4.avif");
    this.load.image("card5", "assets/sprites/card5.avif");

    this.load.audio("card", "assets/sounds/card.mp3");
    this.load.audio("complete", "assets/sounds/complete.mp3");
    this.load.audio("success", "assets/sounds/success.mp3");
    this.load.audio("theme", "assets/sounds/theme.mp3");
    this.load.audio("timeout", "assets/sounds/timeout.mp3");
  }

  createText() {
    this.timeoutText = this.add.text(10, 330, "", {
      font: "36px CurseCasual",
      fill: "#ffffff",
    });
  }

  onTimerTick() {
    this.timeoutText.setText("Time: " + this.timeout);

    if (this.timeout <= 0) {
      this.timer.paused = true;
      this.sounds.timeout.play();
      this.restart();
    } else {
      --this.timeout;
    }
  }

  createTimer() {
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      callbackScope: this,
      loop: true,
    });
  }

  createSounds() {
    this.sounds = {
      card: this.sound.add("card"),
      complete: this.sound.add("complete"),
      success: this.sound.add("success"),
      theme: this.sound.add("theme"),
      timeout: this.sound.add("timeout"),
    };
    this.sounds.theme.play({ volume: 0.1 });
  }

  create() {
    this.timeout = config.timeout;
    this.createSounds();
    this.createTimer();
    this.createBackground();
    this.createText();
    this.createCards();
    this.start();
  }

  restart() {
    let count = 0;
    let onCardMoveComplete = () => {
      ++count;
      if (count >= this.cards.length) {
        this.start();
      }
    };
    this.cards.forEach((card) => {
      // card.depth = 1/card.position.delay/100;
      card.move({
        x: this.sys.game.config.width + card.width,
        y: this.sys.game.config.height + card.height,
        delay: card.position.delay,
        callback: onCardMoveComplete,
      });
    });
  }

  start() {
    this.initCardsPositions();
    this.timeout = config.timeout;
    this.openedCard = null;
    this.openedCardsCount = 0;
    this.timer.paused = false;
    this.initCards();
    this.showCards();
  }

  initCards() {
    let positions = Phaser.Utils.Array.Shuffle(this.positions);

    this.cards.forEach((card) => {
      card.init(positions.pop());
    });
  }

  showCards() {
    this.cards.forEach((card) => {
      card.depth = card.position.delay;
      card.move({
        x: card.position.x,
        y: card.position.y,
        delay: card.position.delay,
      });
    });
  }

  createBackground() {
    this.add.sprite(0, 0, "bg").setOrigin(0, 0);
  }

  createCards() {
    this.cards = [];

    for (let value of config.cards) {
      for (let i = 0; i < 2; i++) {
        this.cards.push(new Card(this, value));
      }
    }

    // add listener for all setInteractive objects
    this.input.on("gameobjectdown", this.onCardClicked, this);
  }

  onCardClicked(pointer, card) {
    if (card.opened) {
      return false;
    }

    this.sounds.card.play();

    if (this.openedCard) {
      // there is already an open card
      if (this.openedCard.value === card.value) {
        // if the images match - save 2 opened cards
        this.sounds.success.play();
        this.openedCard = null;
        ++this.openedCardsCount;
      } else {
        // if the images are different - hide the previous card
        this.openedCard.close();
        this.openedCard = card;
      }
    } else {
      // there is no open card yet
      this.openedCard = card;
    }

    card.open(() => {
      if (this.openedCardsCount === this.cards.length / 2) {
        this.sounds.complete.play();
        this.restart();
      }
    });
  }

  initCardsPositions() {
    let positions = [];
    let cardTexture = this.textures.get("card").getSourceImage();
    let cardWidth = cardTexture.width + 4;
    let cardHeight = cardTexture.height + 4;
    let offsetX =
      (this.sys.game.config.width - cardWidth * config.cols) / 2 +
      cardWidth / 2;
    let offsetY =
      (this.sys.game.config.height - cardHeight * config.rows) / 2 +
      cardHeight / 2;

    let id = 0;
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        ++id;
        positions.push({
          delay: id * 100,
          x: offsetX + col * cardWidth,
          y: offsetY + row * cardHeight,
        });
      }
    }

    this.positions = positions;
  }
}
