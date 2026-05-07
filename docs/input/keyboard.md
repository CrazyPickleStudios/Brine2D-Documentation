---
title: Keyboard Input
description: Handle keyboard input in Brine2D games
---

# Keyboard Input

Handle keyboard input using the `Input` framework property (`IInputContext`) available in every scene.

---

## Quick Start

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var deltaTime = (float)gameTime.DeltaTime;

    // Continuous movement (held)
    if (Input.IsKeyDown(Key.W)) _position.Y -= _speed * deltaTime;
    if (Input.IsKeyDown(Key.S)) _position.Y += _speed * deltaTime;
    if (Input.IsKeyDown(Key.A)) _position.X -= _speed * deltaTime;
    if (Input.IsKeyDown(Key.D)) _position.X += _speed * deltaTime;

    // One-shot action (just pressed this frame)
    if (Input.IsKeyPressed(Key.Space)) Jump();

    // Release action
    if (Input.IsKeyReleased(Key.E)) ReleaseChargedAttack();
}
```

---

## The Three Methods

### `IsKeyDown` -- Key Currently Held

Returns `true` every frame while the key is held. Use for continuous actions like movement.

```csharp
if (Input.IsKeyDown(Key.W))
    _position.Y -= _speed * deltaTime;
```

### `IsKeyPressed` -- Just Pressed This Frame

Returns `true` only on the **first frame** the key is pressed. Use for one-shot actions.

```csharp
if (Input.IsKeyPressed(Key.Space))
    Jump(); // Called once per press, not every frame
```

### `IsKeyReleased` -- Just Released This Frame

Returns `true` only on the frame the key is released.

```csharp
if (Input.IsKeyReleased(Key.E))
    ReleaseChargedAttack();
```

### `IsAnyKeyPressed` -- Any Key This Frame

Returns `true` if any key was pressed this frame. Useful for "press any key to continue" screens.

```csharp
if (Input.IsAnyKeyPressed())
    StartGame();
```

---

## Common Patterns

### WASD + Normalized Diagonal Movement

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var direction = Vector2.Zero;
    if (Input.IsKeyDown(Key.W)) direction.Y -= 1;
    if (Input.IsKeyDown(Key.S)) direction.Y += 1;
    if (Input.IsKeyDown(Key.A)) direction.X -= 1;
    if (Input.IsKeyDown(Key.D)) direction.X += 1;

    if (direction != Vector2.Zero)
        direction = Vector2.Normalize(direction);

    _position += direction * _speed * (float)gameTime.DeltaTime;
}
```

### Sprint Modifier

```csharp
var speed = Input.IsKeyDown(Key.LeftShift) ? _sprintSpeed : _walkSpeed;
_position += direction * speed * deltaTime;
```

### Key Combinations

```csharp
if (Input.IsKeyDown(Key.LeftControl) && Input.IsKeyPressed(Key.S))
    SaveGame();
```

### Menu Navigation

```csharp
if (Input.IsKeyPressed(Key.Up))     _selectedIndex--;
if (Input.IsKeyPressed(Key.Down))   _selectedIndex++;
if (Input.IsKeyPressed(Key.Enter))  SelectMenuItem(_selectedIndex);
```

---

## The `Key` Enum

```csharp
using Brine2D.Input;

Key.A through Key.Z           // Letters
Key.D0 through Key.D9         // Number row
Key.F1 through Key.F24        // Function keys
Key.Space                     // Spacebar
Key.Enter                     // Enter/Return
Key.Escape                    // Escape
Key.LeftShift, Key.RightShift
Key.LeftControl, Key.RightControl
Key.LeftAlt, Key.RightAlt
Key.Up, Key.Down, Key.Left, Key.Right   // Arrow keys
Key.Tab, Key.Backspace, Key.Delete
Key.LeftSuper, Key.RightSuper           // Windows/Command key
Key.CapsLock
```

---

## Text Input

For text fields and chat boxes, use the dedicated text input API instead of polling individual keys. This correctly handles Unicode, IME, and keyboard layouts:

```csharp
Input.StartTextInput();

protected override void OnUpdate(GameTime gameTime)
{
    if (!Input.IsTextInputActive) return;

    var text = Input.GetTextInput();
    if (!string.IsNullOrEmpty(text))
        _textBuffer += text;

    if (Input.IsBackspacePressed() && _textBuffer.Length > 0)
        _textBuffer = _textBuffer[..^1];

    if (Input.IsDeletePressed())
        // Handle forward delete

    if (Input.IsReturnPressed())
    {
        SubmitText(_textBuffer);
        Input.StopTextInput();
    }
}
```

!!! note
    `IsBackspacePressed()`, `IsReturnPressed()`, and `IsDeletePressed()` fire on key-repeat
    (held key) for expected text-editing behavior. They work regardless of whether text input
    mode is active.

---

## Troubleshooting

### Keys Not Responding

1. **Check you are in `OnUpdate`**, not `OnRender`
2. **Click the game window** -- input only works when focused

### Action Repeats Unexpectedly

Use `IsKeyPressed`, not `IsKeyDown`:

```csharp
// Wrong -- fires every frame while held
if (Input.IsKeyDown(Key.Space)) Jump();

// Correct -- fires once per press
if (Input.IsKeyPressed(Key.Space)) Jump();
```

### Diagonal Movement Is Faster

Normalize the direction vector:

```csharp
if (direction != Vector2.Zero)
    direction = Vector2.Normalize(direction);
```

---

## Summary

| Method | Usage |
|--------|-------|
| `IsKeyDown(key)` | Key currently held -- movement, sprint |
| `IsKeyPressed(key)` | Key just pressed -- jump, shoot, toggle |
| `IsKeyReleased(key)` | Key just released -- charge attacks |
| `IsAnyKeyPressed()` | Any key pressed -- attract screens |

---

## Next Steps

- **[Mouse Input](mouse.md)**
- **[Gamepad Input](gamepad.md)**
- **[Input Actions](actions.md)** -- Rebindable logical actions
- **[Input Layers](layers.md)**