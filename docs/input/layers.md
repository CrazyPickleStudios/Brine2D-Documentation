---
title: Input Layers
description: Priority-based input routing for UI and game input in Brine2D
---

# Input Layers

Input layers let you control which part of your game receives input first. When a dialog is open, it should consume input before the game logic sees it.

---

## Setup

First, call `UseInputLayers()` during app startup so `InputLayerManager` is registered in DI:

```csharp
var builder = Brine2DApp.CreateBuilder(args);
builder.UseInputLayers();
```

Then inject `InputLayerManager` into your scene:

```csharp
public class GameScene : Scene
{
    private readonly InputLayerManager _layerManager;

    public GameScene(InputLayerManager layerManager)
    {
        _layerManager = layerManager;
    }
}
```

---

## Implementing a Layer

Create a class that implements `IInputLayer`:

```csharp
public class UiInputLayer : IInputLayer
{
    public int Priority => 1000; // Higher = processed first

    public bool ProcessKeyboardInput(IInputContext input, bool consumed)
    {
        if (consumed) return false; // Already handled by a higher layer

        if (input.IsKeyPressed(Key.Escape))
        {
            CloseMenu();
            return true; // Consume -- game layer won't see this
        }

        return false;
    }

    public bool ProcessMouseInput(IInputContext input, bool consumed)
    {
        if (consumed) return false;

        if (input.IsMouseButtonPressed(MouseButton.Left) && HitTestUi(input.MousePosition))
        {
            HandleUiClick(input.MousePosition);
            return true; // Consume
        }

        return false;
    }

    // Override only when this layer needs to intercept gamepad input (e.g. modal dialogs)
    public bool ProcessGamepadInput(IInputContext input, bool consumed) => false;
}
```

---

## Registering and Unregistering

Register layers in `OnEnter` and unregister in `OnExit`:

```csharp
private readonly UiInputLayer _uiLayer = new();

protected override void OnEnter()
{
    _layerManager.RegisterLayer(_uiLayer);
}

protected override void OnExit()
{
    _layerManager.UnregisterLayer(_uiLayer);
}
```

---

## Processing Input Each Frame

Call `ProcessInput()` once at the top of `OnUpdate`, then check the consumed flags:

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    _layerManager.ProcessInput(); // Always first

    if (!_layerManager.KeyboardConsumed)
        HandleGameKeyboard();

    if (!_layerManager.MouseConsumed)
        HandleGameMouse();

    if (!_layerManager.GamepadConsumed)
        HandleGameGamepad();
}
```

---

## How It Works

1. **Layers are sorted by `Priority`** -- highest processes first.
2. **Every layer is always called** -- the `consumed` parameter tells a layer whether a higher-priority layer already claimed that category. Layers receiving `consumed: true` should skip gameplay logic but may still perform cleanup (e.g. cancel a drag, reset hover state).
3. **Return `true` to consume** -- prevents lower-priority layers from acting on that input category.
4. **Check `KeyboardConsumed` / `MouseConsumed` / `GamepadConsumed`** in your scene to skip raw polling when a layer already handled it.

**Typical priority values:**

| Layer | Priority | Purpose |
|-------|----------|---------|
| Dialog/Modal | 2000 | Critical UI |
| Normal UI | 1000 | Menus, HUD |
| Game | 0 | Player input |
| Background | -1000 | Ambient input |

---

## Best Practices

1. **Call `UseInputLayers()` at startup** before building the app
2. **Always call `ProcessInput()` first** in `OnUpdate`
3. **Check consumption flags** before raw polling in the scene
4. **Return `true` only when your layer truly handled the input**
5. **Unregister layers in `OnExit`** to avoid stale handlers

---

## Next Steps

- **[Keyboard Input](keyboard.md)**
- **[Mouse Input](mouse.md)**
- **[UI](../ui/index.md)**