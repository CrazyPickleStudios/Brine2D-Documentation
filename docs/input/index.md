---
title: Input
description: Handle keyboard, mouse, and gamepad input in Brine2D games
---

# Input

Learn how to handle player input from keyboard, mouse, and gamepads in your Brine2D games.

---

## Quick Start

```csharp
using Brine2D.Input;

public class GameScene : Scene
{
    protected override void OnUpdate(GameTime gameTime)
    {
        var speed = 200f * (float)gameTime.DeltaTime;

        // Keyboard
        if (Input.IsKeyDown(Key.W)) _position.Y -= speed;
        if (Input.IsKeyDown(Key.S)) _position.Y += speed;
        if (Input.IsKeyDown(Key.A)) _position.X -= speed;
        if (Input.IsKeyDown(Key.D)) _position.X += speed;

        // Mouse
        if (Input.IsMouseButtonPressed(MouseButton.Left))
        {
            Logger.LogInformation("Clicked at {Pos}", Input.MousePosition);
        }

        // Gamepad
        if (Input.IsGamepadButtonDown(GamepadButton.A))
        {
            Logger.LogInformation("Gamepad A pressed");
        }
    }
}
```

---

## Topics

### Getting Started

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Keyboard](keyboard.md)** | Handle keyboard input | :star: Beginner |
| **[Mouse](mouse.md)** | Mouse position, clicks, and scroll wheel | :star: Beginner |

### Advanced

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Gamepad Support](gamepad.md)** | Controller/gamepad input | :star::star: Intermediate |
| **[Input Layers](layers.md)** | Priority-based input routing (for UI) | :star::star::star: Advanced |

---

## Key Concepts

### Framework Property

`Input` is a framework property on every scene, available from `OnLoadAsync` onwards:

```csharp
public class GameScene : Scene
{
    protected override void OnUpdate(GameTime gameTime)
    {
        // Use Input directly — no constructor injection needed
        if (Input.IsKeyDown(Key.W))
        {
            _position.Y -= 200f * (float)gameTime.DeltaTime;
        }
    }
}
```

If you need input in a service or behavior, inject `IInputContext` via constructor:

```csharp
public class PlayerMovementBehavior : EntityBehavior
{
    private readonly IInputContext _input;

    public PlayerMovementBehavior(IInputContext input)
    {
        _input = input;
    }

    protected override void Update(GameTime gameTime)
    {
        if (_input.IsKeyDown(Key.W))
        {
            var transform = Entity.GetRequiredComponent<TransformComponent>();
            transform.Position += new Vector2(0, -200f * (float)gameTime.DeltaTime);
        }
    }
}
```

---

### Input State

Understanding input state polling:

| Method | When True | Use Case |
|--------|-----------|----------|
| `IsKeyDown()` | Key is currently held | Continuous movement |
| `IsKeyPressed()` | Key was **just** pressed this frame | One-time actions (jump, shoot) |
| `IsKeyReleased()` | Key was **just** released this frame | Charge attacks, key-up events |

---

### Keyboard

```csharp
// Continuous input (movement)
if (Input.IsKeyDown(Key.W)) _position.Y -= speed;

// One-shot input (actions)
if (Input.IsKeyPressed(Key.Space)) Jump();
if (Input.IsKeyReleased(Key.E)) ReleaseCharge();
```

[:octicons-arrow-right-24: Full guide: Keyboard](keyboard.md)

---

### Mouse

```csharp
// Position (Vector2 in screen coordinates)
var pos = Input.MousePosition;

// Movement delta since last frame
var delta = Input.MouseDelta;

// Scroll wheel (float — positive = up)
var scroll = Input.ScrollWheelDelta;

// Buttons
if (Input.IsMouseButtonPressed(MouseButton.Left))
{
    SpawnAt(pos);
}
```

[:octicons-arrow-right-24: Full guide: Mouse](mouse.md)

---

### Gamepad

```csharp
if (Input.IsGamepadConnected())
{
    // Buttons (Xbox-style layout)
    if (Input.IsGamepadButtonPressed(GamepadButton.A)) Jump();

    // Analog sticks (Vector2, -1 to 1)
    var leftStick = Input.GetGamepadLeftStick();
    if (leftStick.Length() > 0.15f)
    {
        _position += leftStick * speed * deltaTime;
    }

    // Triggers via axis API (0.0 to 1.0)
    var rightTrigger = Input.GetGamepadAxis(GamepadAxis.RightTrigger);
}
```

[:octicons-arrow-right-24: Full guide: Gamepad Support](gamepad.md)

---

### Input Layers (UI Priority)

```csharp
// Create input layer for UI (higher priority)
var uiLayer = _inputLayerManager.CreateLayer("UI", priority: 100);
uiLayer.OnKeyPressed += (key) =>
{
    if (key == Key.Escape)
    {
        CloseMenu();
        return true;  // Consume input (don't pass to game)
    }
    return false;
};
```

[:octicons-arrow-right-24: Full guide: Input Layers](layers.md)

---

## Best Practices

### :white_check_mark: DO

1. **Use the `Input` framework property** in scenes
2. **Poll input in OnUpdate()** only
3. **Use deltaTime for movement** — frame-rate independent
4. **Check IsKeyPressed() for actions** — jump, shoot, etc.
5. **Use IsKeyDown() for continuous** — movement

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var deltaTime = (float)gameTime.DeltaTime;

    // Continuous movement
    if (Input.IsKeyDown(Key.W))
    {
        _position.Y -= _speed * deltaTime;
    }

    // One-time action
    if (Input.IsKeyPressed(Key.Space))
    {
        Jump();
    }
}
```

---

### :x: DON'T

1. **Don't poll input in OnRender()** — wrong lifecycle method
2. **Don't forget deltaTime** — movement will be FPS-dependent
3. **Don't use IsKeyPressed() for movement** — will be choppy

```csharp
// :x: Bad pattern
protected override void OnRender(GameTime gameTime)
{
    // Wrong — input in render!
    if (Input.IsKeyDown(Key.W))
    {
        _position.Y -= _speed;  // Also wrong — no deltaTime!
    }
}
```

---

## Troubleshooting

### Input Not Responding

**Symptom:** Keys/mouse don't do anything

**Solutions:**

1. **Check polling in OnUpdate:**

```csharp
// :white_check_mark: Correct
protected override void OnUpdate(GameTime gameTime)
{
    if (Input.IsKeyDown(Key.W)) { ... }
}
```

2. **Check window has focus:**
   - Click on the game window
   - Input only works when the window is focused

---

### Movement Too Fast/Slow

**Solution:** Always use deltaTime

```csharp
// :x: Wrong — FPS dependent
if (Input.IsKeyDown(Key.W))
{
    _position.Y -= 5;  // Moves 5 pixels per frame (300px/sec at 60fps!)
}

// :white_check_mark: Correct — consistent speed
if (Input.IsKeyDown(Key.W))
{
    _position.Y -= 200 * (float)gameTime.DeltaTime;  // 200 pixels per second
}
```

---

### Gamepad Not Detected

**Solution:** Check connection before reading input

```csharp
if (!Input.IsGamepadConnected())
{
    Logger.LogWarning("No gamepad connected");
    return;
}
```

---

## Related Topics

- [Keyboard](keyboard.md) — Complete keyboard guide
- [Mouse](mouse.md) — Mouse input details
- [Gamepad Support](gamepad.md) — Controller integration
- [Input Layers](layers.md) — Advanced input routing
- [Quick Start](../getting-started/quickstart.md) — Basic input example

---

**Ready to handle input?** Start with [Keyboard](keyboard.md)!