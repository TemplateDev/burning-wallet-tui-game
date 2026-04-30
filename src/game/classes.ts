export class PlayerState {
    private initialMoney: number = 500;
    private initialHeat: number = 30;
    private money: number;
    private heat: number;
    private onAction: () => void;
    
    // Initial values
    constructor(onAction?: () => void) {
        this.money = this.initialMoney;
        this.heat = this.initialHeat;
        this.onAction = onAction || (() => {});
    }

    private _clampHeat(heat: number) {
        return Math.max(Math.min(heat, 100), 0)
    }
    
    // Get the current amount of money
    getMoney(): number {
        return this.money;
    }

    // Get the current amount of heat
    getHeat(): number {
        return this.heat;
    }

    // Adds +5 heat
    addHeat() {
        this.heat = this._clampHeat(this.heat + 5);
    }

    // Resets the money and heat back to initial values.
    reset() {
        this.money = this.initialMoney;
        this.heat = this.initialHeat;
    }

    // Determines if no money is left
    isBroke(): boolean {
        return this.money === 0;
    }

    // Gain more money with a slight consequence
    earnSmall() {
        this.money += 50;
        this.heat = this._clampHeat(this.heat + 10);
        this?.onAction(); 
    }

    // Gain big bonus with heavier consequence
    earnBig() {
        this.money += 120;
        this.heat = this._clampHeat(this.heat + 25);
        this?.onAction();
    }

    // Burn little money for moderate reduction
    burnSmall() {
        this.money = Math.max(this.money - 50, 0);
        this.heat = this._clampHeat(this.heat - 10);
        this?.onAction();
    }

    // Burn a lot of money for massive reduction
    burnBig() {
        this.money = Math.max(this.money - 100, 0);
        this.heat = this._clampHeat(this.heat - 25);
        this?.onAction();
    }

    // Applys a penalty based on heat
    applyPenalty() {
        if (this.heat >= 30) {
            this.money = Math.max(this.money - 50, 0);
        } else if (this.heat < 60) {
            this.money = Math.max(this.money - 100, 0);
        } else if (this.heat < 80) {
            this.money = Math.max(this.money - 150, 0);
        } else {
            this.money = Math.max(this.money - 200, 0);
        }
    }
}

export class Game {
    private player: PlayerState;
    private round: number;
    private actionsLeft: number;
    private inSession: boolean;
    private onWin: () => void;
    private onLose: () => void;
    private onPlayerAction: () => void;

    constructor(onWin?: () => void, onLose?: () => void) {
        this.onPlayerAction = () => this.update();
        this.player = new PlayerState(this.onPlayerAction);
        this.inSession = false;
        this.round = 1;
        this.actionsLeft = 2;
        this.onWin = onWin || (() => {});
        this.onLose = onLose || (() => {});
    }
    
    // Starts a new game
    newGame() {
        this.player.reset();
        this.round = 1;
        this.actionsLeft = 2;
        this.inSession = true;
    }

    private update() {
        this.actionsLeft -= 1;
        if (this.actionsLeft == 0) {
            this.nextRound();
        }
    }

    // Get the player state
    getPlayer() {
        return this.player;
    }

    // Finishes the game and runs the callback
    win() {
        if (!this.inSession) { return; }
        this.inSession = false;
        this?.onWin();
    }

    // Finishes the game and runs the callback
    lose() {
        if (!this.inSession) { return; }
        this.inSession = false;
        this?.onLose();
    }

    // Progresses the game and applies the penalty.
    // If the player is broke or reaches the target round, the game starts.
    nextRound() {
        // If the player is broke, lose
        if (this.player.isBroke()) {
            return this.lose();
        }

        // If the player finishes the target, win
        if (this.round == 20) {
            return this.win();
        }

        // Apply the penalty
        this.player.applyPenalty();
        
        // Increase the round
        this.round += 1;
        this.actionsLeft = 2;
    }
}
