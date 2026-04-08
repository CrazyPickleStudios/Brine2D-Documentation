---
title: Input Layers
description: Priority-based input routing for UI and game input in Brine2D
---

# Input Layers

Input layers let you control which part of your game receives input first. When a dialog is open, it should consume input before the game logic sees it.

---

## Quick Start

```csharp
public class GameScene : Scene
{
    private readonly InputLayerManager _layerManager;

    public GameScene(InputLayerManager layerManager)
    {
        _layerManager = layerManager;
    }

    protected override void OnEnter()
    {
        var uiLayer = _layerManager.CreateLayer(""UI"", priority: 1000);
        var gameLayer = _layerManager.CreateLayer(""Game"", priority: 0);
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        _layerManager.ProcessInput();

        if (!_layerManager.KeyboardConsumed)
        {
            HandleGameKeyboard();
        }

        if (!_layerManager.MouseConsumed)
        {
            HandleGameMouse();
        }
    }
}
```

---

## How It Works

1. **Layers are processed by priority** - highest first
2. **A layer can consume input** - returning `true` blocks lower layers
3. **Check consumption flags** - `KeyboardConsumed`, `MouseConsumed`

**Typical priorities:**

| Layer | Priority | Purpose |
|-------|----------|---------|
| Dialog/Modal | 2000 | Critical UI |
| Normal UI | 1000 | Menus, HUD |
| Game | 0 | Player input |
| Background | -1000 | Ambient input |

---

## Best Practices

1. **Always call `ProcessInput()` first** in `OnUpdate`
2. **Check consumption flags** before handling game input
3. **Return `true`** from layer handlers to consume input
4. **Unregister layers** in `OnExit` or `OnUnloadAsync`

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    _layerManager.ProcessInput(); // Always first!

    if (!_layerManager.KeyboardConsumed && Input.IsKeyDown(Key.W))
    {
        MovePlayer();
    }
}
```

---

## Next Steps

- **[Keyboard Input](keyboard.md)** - Keyboard input handling
- **[Mouse Input](mouse.md)** - Mouse and cursor control
- **[UI](../ui/index.md)** - Build interactive UI