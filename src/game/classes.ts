import { loadConfig, type GameConfig } from "../config/loader";

export class PlayerState {
    private config: GameConfig;
    private money: number;
    private heat: number;
    private onAction: () => void;
    private onEnd?: () => void;
    
    constructor(onAction?: () => void, onEnd?: () => void) {
        this.config = loadConfig();
        this.money = this.config.initialMoney;
        this.heat = this.config.initialHeat;
        this.onAction = onAction || (() => {});
        if (onEnd) this.onEnd = onEnd;
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
        this.money = this.config.initialMoney;
        this.heat = this.config.initialHeat;
    }

    // Determines if no money is left
    isBroke(): boolean {
        return this.money <= 0;
    }

    // Gain more money with a slight consequence
    earnSmall() {
        this.money += this.config.money.earnSmall;
        this.heat = this._clampHeat(this.heat + this.config.heat.earnSmall);
        this?.onAction(); 
    }

    // Gain big bonus with heavier consequence
    earnBig() {
        this.money += this.config.money.earnBig;
        this.heat = this._clampHeat(this.heat + this.config.heat.earnBig);
        this?.onAction();
    }

    // Burn little money for moderate reduction
    burnSmall() {
        this.money = Math.max(this.money + this.config.money.burnSmall, 0);
        this.heat = this._clampHeat(this.heat + this.config.heat.burnSmall);
        if (this.money === 0) {
            this?.onEnd?.();
        }
        this?.onAction();
    }

    // Burn a lot of money for massive reduction
    burnBig() {
        this.money = Math.max(this.money + this.config.money.burnBig, 0);
        this.heat = this._clampHeat(this.heat + this.config.heat.burnBig);
        if (this.money === 0) {
            this?.onEnd?.();
        }
        this?.onAction();
    }

    // Increases heat by a specified amount
    increaseHeat(amount: number) {
        this.heat = this._clampHeat(this.heat + amount);
    }

    // Decreases heat by a specified amount
    decreaseHeat(amount: number) {
        this.heat = this._clampHeat(this.heat - amount);
    }

    // Applys a penalty based on heat
    applyPenalty() {
        const penalty = this.config.penalty.find((p) => this.heat < p.threshold);
        if (penalty) {
            this.money = Math.max(this.money - penalty.loss, 0);
            if (this.money === 0) {
                this?.onEnd?.();
            }
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
    private onChange: () => void;
    private config: GameConfig;

    constructor(onWin?: () => void, onLose?: () => void, onChange?: () => void) {
        this.config = loadConfig();
        this.onChange = onChange || (() => {});
        this.onPlayerAction = () => this.update();
        this.player = new PlayerState(this.onPlayerAction, this.lose);
        this.inSession = false;
        this.round = 1;
        this.actionsLeft = this.config.actionsPerRound;
        this.onWin = onWin || (() => {});
        this.onLose = onLose || (() => {});
    }
    
    // Starts a new game
    newGame() {
        this.player.reset();
        this.round = 1;
        this.actionsLeft = this.config.actionsPerRound;
        this.inSession = true;
        this?.onChange();
    }

    private checkStatus() {
        // If the player is broke, lose
        if (this.player.isBroke()) {
            return this.lose();
        }

        // If the player finishes the target, win
        if (this.round >= this.config.targetRound) {
            return this.win();
        }
    }

    private update() {
        // Check if the game should end
        this.checkStatus();
        
        this.actionsLeft -= 1;
        if (this.actionsLeft == 0) {
            this.nextRound();
            return;
        }

        this?.onChange();
    }

    getRound(): number {
        return this.round;
    }

    getActionsLeft(): number {
        return this.actionsLeft;
    }

    isInSession(): boolean {
        return this.inSession;
    }

    // Get the player state
    getPlayer() {
        return this.player;
    }

    skipTurn() {
        if (!this.inSession) { return; }
        if (this.actionsLeft <= 0) { return; }

        // Find the appropriate skip tier based on current heat
        const currentHeat = this.player.getHeat();
        const applicableTier = this.config.skipTiers
            .filter(tier => currentHeat >= tier.threshold)
            .sort((a, b) => b.threshold - a.threshold)[0];
        
        const heatReduction = applicableTier ? applicableTier.reduction : 2;
        this.player.decreaseHeat(heatReduction);
        
        this.actionsLeft = 1;
        this.update();
    }

    // Finishes the game and runs the callback
    win() {
        if (!this.inSession) { return; }
        this.inSession = false;
        this?.onWin();
        this?.onChange();
    }

    // Finishes the game and runs the callback
    lose() {
        if (!this.inSession) { return; }
        this.inSession = false;
        this?.onChange();
        this?.onLose();
    }

    // Progresses the game and applies the penalty.
    // If the player is broke or reaches the target round, the game starts.
    nextRound() {
        
        // Apply the penalty
        this.player.applyPenalty();
        
        // Increase heat
        this.player.increaseHeat(this.config.heatIncreasePerRound);
        
        // Increase the round
        this.round += 1;
        this.actionsLeft = this.config.actionsPerRound;
        
        // Check if the game should end
        this.checkStatus();

        this?.onChange();
    }
}
