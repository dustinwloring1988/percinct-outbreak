import { useEffect, useState, useRef, useCallback } from 'react';
import { GamepadManager, type GamepadInputState } from '@/lib/game/gamepad-manager';

export interface MenuItemRef {
  element: HTMLElement;
  key: string;
}

export interface GamepadNavigationOptions {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect?: () => void;
  onBack?: () => void;
  autoInit?: boolean;
}

export function useGamepadNavigation(
  options: GamepadNavigationOptions = {}
) {
  const {
    onNavigate,
    onSelect,
    onBack,
    autoInit = true
  } = options;

  const gamepadManagerRef = useRef<GamepadManager | null>(null);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'up' | 'down' | 'left' | 'right' | 'select' | 'back' | null>(null);
  const menuItemsRef = useRef<MenuItemRef[]>([]);
  const activeRef = useRef(autoInit);

  // Initialize GamepadManager
  useEffect(() => {
    if (typeof window !== 'undefined') {
      gamepadManagerRef.current = new GamepadManager();

      const checkGamepadConnection = () => {
        const isConnected = gamepadManagerRef.current?.isGamepadConnected() ?? false;
        setGamepadConnected(isConnected);

        if (isConnected && !activeRef.current) {
          activeRef.current = true;
        }
      };

      // Check connection immediately and then every 500ms
      checkGamepadConnection();
      const interval = setInterval(checkGamepadConnection, 500);

      return () => {
        gamepadManagerRef.current?.destroy();
        clearInterval(interval);
      };
    }
  }, []);

  // Update gamepad state and handle input
  useEffect(() => {
    if (!activeRef.current || !gamepadManagerRef.current) return;

    const handleInput = () => {
      if (!gamepadManagerRef.current || !menuItemsRef.current.length) return;

      gamepadManagerRef.current.update();

      const gamepadState = gamepadManagerRef.current.getGamepadState();
      if (!gamepadState) return;

      // Handle navigation - set pending actions that will be processed
      if (gamepadManagerRef.current.isButtonPressed('up')) {
        setPendingAction('up');
      } else if (gamepadManagerRef.current.isButtonPressed('down')) {
        setPendingAction('down');
      } else if (gamepadManagerRef.current.isButtonPressed('left')) {
        setPendingAction('left');
      } else if (gamepadManagerRef.current.isButtonPressed('right')) {
        setPendingAction('right');
      }

      // Handle selection
      if (gamepadManagerRef.current.isButtonPressed('a') ||
          gamepadManagerRef.current.isButtonPressed('start')) {
        setPendingAction('select');
      }

      // Handle back/cancel
      if (gamepadManagerRef.current.isButtonPressed('b') ||
          gamepadManagerRef.current.isButtonPressed('select')) {
        setPendingAction('back');
      }
    };

    const interval = setInterval(handleInput, 100); // Check every 100ms
    return () => clearInterval(interval);
  }, []);

  // Process pending actions after functions are available
  useEffect(() => {
    if (!pendingAction) return;

    switch (pendingAction) {
      case 'up':
        if (onNavigate) {
          onNavigate('up');
        } else {
          if (menuItemsRef.current.length > 0) {
            setFocusedIndex(prev => (prev > 0 ? prev - 1 : menuItemsRef.current.length - 1));
          }
        }
        break;
      case 'down':
        if (onNavigate) {
          onNavigate('down');
        } else {
          if (menuItemsRef.current.length > 0) {
            setFocusedIndex(prev => (prev < menuItemsRef.current.length - 1 ? prev + 1 : 0));
          }
        }
        break;
      case 'left':
        if (onNavigate) {
          onNavigate('left');
        } else {
          if (menuItemsRef.current.length > 0) {
            setFocusedIndex(prev => (prev > 0 ? prev - 1 : menuItemsRef.current.length - 1));
          }
        }
        break;
      case 'right':
        if (onNavigate) {
          onNavigate('right');
        } else {
          if (menuItemsRef.current.length > 0) {
            setFocusedIndex(prev => (prev < menuItemsRef.current.length - 1 ? prev + 1 : 0));
          }
        }
        break;
      case 'select':
        if (onSelect) {
          onSelect();
        } else if (focusedKey && menuItemsRef.current.length) {
          // Find and click the focused element
          const focusedItem = menuItemsRef.current.find(item => item.key === focusedKey);
          focusedItem?.element.click();
        }
        break;
      case 'back':
        if (onBack) {
          onBack();
        }
        break;
    }

    setPendingAction(null); // Reset the pending action after processing
  }, [pendingAction, onNavigate, onSelect, onBack, focusedKey]);

  // Focus the currently selected menu item
  useEffect(() => {
    if (focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
      const item = menuItemsRef.current[focusedIndex];
      setFocusedKey(item.key);
      // Use setTimeout to ensure DOM is updated before focusing
      setTimeout(() => {
        item.element.focus?.();
      }, 0);
    }
  }, [focusedIndex]);

  // Auto-focus the first menu item when gamepad is connected and there are menu items
  useEffect(() => {
    if (gamepadConnected && menuItemsRef.current.length > 0 && focusedIndex === 0) {
      setTimeout(() => {
        const firstItem = menuItemsRef.current[0];
        if (firstItem) {
          firstItem.element.focus?.();
          setFocusedKey(firstItem.key);
        }
      }, 0);
    }
  }, [gamepadConnected, focusedIndex, menuItemsRef]);

  const registerMenuItem = useCallback((element: HTMLElement | null, key: string) => {
    if (!element) return;

    const existingIndex = menuItemsRef.current.findIndex(item => item.key === key);

    if (existingIndex !== -1) {
      // Update existing item
      menuItemsRef.current[existingIndex] = { element, key };
    } else {
      // Add new item
      menuItemsRef.current.push({ element, key });

      // If this is the first item, set it as focused
      if (menuItemsRef.current.length === 1) {
        setFocusedIndex(0);
      }
    }

    // Set the element as focusable if it's not already
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }

    return () => {
      // Remove item when unmounting
      menuItemsRef.current = menuItemsRef.current.filter(item => item.key !== key);
    };
  }, []);

  const clearMenuItems = useCallback(() => {
    menuItemsRef.current = [];
    setFocusedIndex(0);
  }, []);

  return {
    registerMenuItem,
    clearMenuItems,
    gamepadConnected,
    focusedIndex,
    focusedKey,
  };
}