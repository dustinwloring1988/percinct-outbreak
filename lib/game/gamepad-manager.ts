// Gamepad Manager for handling controller input
// Handles gamepad detection and button mapping for navigation and gameplay

export interface GamepadInputState {
  // Navigation buttons (typically D-pad and analog sticks)
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;

  // Action buttons
  a: boolean; // usually "A" or "Cross"
  b: boolean; // usually "B" or "Circle"
  x: boolean; // usually "X" or "Square"
  y: boolean; // usually "Y" or "Triangle"
  
  // Shoulder buttons
  leftShoulder: boolean;
  rightShoulder: boolean;
  leftTrigger: boolean;
  rightTrigger: boolean;

  // Directional inputs (analog sticks)
  leftStickX: number;  // -1 to 1
  leftStickY: number;  // -1 to 1
  rightStickX: number; // -1 to 1
  rightStickY: number; // -1 to 1

  // Menu navigation
  start: boolean; // Start button
  select: boolean; // Select/Back button

  // Stick press buttons
  leftStickPressed: boolean; // L3 (left stick pressed)
  rightStickPressed: boolean; // R3 (right stick pressed)

  // Current gamepad index
  gamepadIndex: number | null;
}

export class GamepadManager {
  private gamepadState: Map<number, GamepadInputState> = new Map();
  private previousGamepadState: Map<number, GamepadInputState> = new Map();
  
  // Configuration for button mapping
  private buttonMap: Record<string, string> = {
    // PlayStation and XBox mapping
    '0': 'a',      // A / Cross
    '1': 'b',      // B / Circle
    '2': 'x',      // X / Square
    '3': 'y',      // Y / Triangle
    '4': 'leftShoulder',  // L1
    '5': 'rightShoulder', // R1
    '6': 'leftTrigger',   // L2
    '7': 'rightTrigger',  // R2
    '8': 'select',        // Select/Back
    '9': 'start',         // Start
    '12': 'up',           // D-pad up
    '13': 'down',         // D-pad down
    '14': 'left',         // D-pad left
    '15': 'right',        // D-pad right
    '10': 'leftStickPressed',  // L3 (left stick press)
    '11': 'rightStickPressed', // R3 (right stick press)
  };

  // Axis thresholds for analog stick input
  private readonly AXIS_THRESHOLD = 0.5;

  constructor() {
    // Listen for gamepad connection events
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
  }

  private handleGamepadConnected = (e: GamepadEvent) => {
    console.log(`Gamepad connected: ${e.gamepad.id}`);
    this.initializeGamepadState(e.gamepad.index);
  }

  private handleGamepadDisconnected = (e: GamepadEvent) => {
    console.log(`Gamepad disconnected: ${e.gamepad.id}`);
    this.gamepadState.delete(e.gamepad.index);
    this.previousGamepadState.delete(e.gamepad.index);
  }

  private initializeGamepadState(index: number) {
    const initialState: GamepadInputState = {
      up: false,
      down: false,
      left: false,
      right: false,
      a: false,
      b: false,
      x: false,
      y: false,
      leftShoulder: false,
      rightShoulder: false,
      leftTrigger: false,
      rightTrigger: false,
      leftStickX: 0,
      leftStickY: 0,
      rightStickX: 0,
      rightStickY: 0,
      start: false,
      select: false,
      leftStickPressed: false,
      rightStickPressed: false,
      gamepadIndex: index
    };

    this.gamepadState.set(index, initialState);
    this.previousGamepadState.set(index, { ...initialState });
  }

  // Get current gamepad state if any gamepad is connected
  getCurrentGamepadIndex(): number | null {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        return i;
      }
    }
    return null;
  }

  // Get the primary gamepad state
  getGamepadState(index?: number): GamepadInputState | null {
    if (index === undefined) {
      index = this.getCurrentGamepadIndex();
    }
    
    if (index !== null) {
      return this.gamepadState.get(index) || null;
    }
    return null;
  }

  // Get the previous gamepad state
  getPreviousGamepadState(index?: number): GamepadInputState | null {
    if (index === undefined) {
      index = this.getCurrentGamepadIndex();
    }
    
    if (index !== null) {
      return this.previousGamepadState.get(index) || null;
    }
    return null;
  }

  // Check if a button was pressed (just pressed this frame)
  isButtonPressed(button: keyof Omit<GamepadInputState, 'leftStickX' | 'leftStickY' | 'rightStickX' | 'rightStickY' | 'gamepadIndex'>, index?: number): boolean {
    const current = this.getGamepadState(index);
    const previous = this.getPreviousGamepadState(index);

    if (!current || !previous) return false;

    return current[button] && !previous[button];
  }

  // Check if a button is currently held down
  isButtonDown(button: keyof Omit<GamepadInputState, 'leftStickX' | 'leftStickY' | 'rightStickX' | 'rightStickY' | 'gamepadIndex'>, index?: number): boolean {
    const current = this.getGamepadState(index);
    return !!current?.[button];
  }

  // Update gamepad state from browser gamepad API
  update() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      
      if (gamepad) {
        // Ensure we have state initialized for this gamepad
        if (!this.gamepadState.has(i)) {
          this.initializeGamepadState(i);
        }

        // Store previous state for button press detection
        const prevState = this.gamepadState.get(i);
        if (prevState) {
          this.previousGamepadState.set(i, { ...prevState });
        }

        // Create new state
        const newState: GamepadInputState = {
          up: false,
          down: false,
          left: false,
          right: false,
          a: false,
          b: false,
          x: false,
          y: false,
          leftShoulder: false,
          rightShoulder: false,
          leftTrigger: false,
          rightTrigger: false,
          leftStickX: 0,
          leftStickY: 0,
          rightStickX: 0,
          rightStickY: 0,
          start: false,
          select: false,
          leftStickPressed: false,
          rightStickPressed: false,
          gamepadIndex: i
        };

        // Process buttons
        for (let j = 0; j < gamepad.buttons.length; j++) {
          const button = gamepad.buttons[j];
          const buttonName = this.buttonMap[j];
          
          if (buttonName && button.pressed) {
            (newState as any)[buttonName] = true;
          }
        }

        // Process axes for D-pad simulation
        if (gamepad.axes.length >= 4) {
          // Left stick (usually axes 0, 1)
          newState.leftStickX = gamepad.axes[0] || 0;
          newState.leftStickY = gamepad.axes[1] || 0;
          
          // Right stick (usually axes 2, 3)
          newState.rightStickX = gamepad.axes[2] || 0;
          newState.rightStickY = gamepad.axes[3] || 0;
          
          // Simulate D-pad from left stick when past threshold
          if (newState.leftStickX < -this.AXIS_THRESHOLD) newState.left = true;
          if (newState.leftStickX > this.AXIS_THRESHOLD) newState.right = true;
          if (newState.leftStickY < -this.AXIS_THRESHOLD) newState.up = true;
          if (newState.leftStickY > this.AXIS_THRESHOLD) newState.down = true;
        } else if (gamepad.axes.length >= 2) {
          // Some gamepads only have 2 axes (left stick only)
          newState.leftStickX = gamepad.axes[0] || 0;
          newState.leftStickY = gamepad.axes[1] || 0;
          
          // Simulate D-pad from left stick
          if (newState.leftStickX < -this.AXIS_THRESHOLD) newState.left = true;
          if (newState.leftStickX > this.AXIS_THRESHOLD) newState.right = true;
          if (newState.leftStickY < -this.AXIS_THRESHOLD) newState.up = true;
          if (newState.leftStickY > this.AXIS_THRESHOLD) newState.down = true;
        }

        // Apply new state
        this.gamepadState.set(i, newState);
      } else if (this.gamepadState.has(i)) {
        // Gamepad was disconnected, but we still have state - clean up
        this.gamepadState.delete(i);
        this.previousGamepadState.delete(i);
      }
    }
  }

  // Cleanup event listeners
  destroy() {
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
  }

  // Check if any gamepad is connected
  isGamepadConnected(): boolean {
    return this.getCurrentGamepadIndex() !== null;
  }
}