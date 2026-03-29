---
title: Keyboard Input
description: Handle keyboard input in Brine2D — key states, movement, and common patterns
---

# Keyboard Input

Handle keyboard input using the `Input` framework property (`IInputContext`).

---

## Quick Start

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var deltaTime = (float)gameTime.DeltaTime;

    // WASD movement
    if (Input.IsKeyDown(Key.W)) _position.Y -= _speed * deltaTime;
    if (Input.IsKeyDown(Key.S)) _position.Y += _speed * deltaTime;
    if (Input.IsKeyDown(Key.A)) _position.X -= _speed * deltaTime;
    if (Input.IsKeyDown(Key.D)) _position.X += _speed * deltaTime;

    // One-shot actions
    if (Input.IsKeyPressed(Key.Space)) Jump();
    if (Input.IsKeyPressed(Key.Escape)) PauseGame();
}
```

---

## Key States

### IsKeyDown — Held This Frame

Returns `true` every frame the key is held down. Use for continuous actions like movement.

```csharp
if (Input.IsKeyDown(Key.W))
{
    _position.Y -= speed * deltaTime;
}
```

### IsKeyPressed — Just Pressed This Frame

Returns `true` only on the **first frame** the key is pressed. Use for one-shot actions.

```csharp
if (Input.IsKeyPressed(Key.Space))
{
    Jump(); // Once per press, not 60 times per second
}
```

### IsKeyReleased — Just Released This Frame

Returns `true` only on the frame the key is released. Use for charge-release mechanics.

```csharp
if (Input.IsKeyReleased(Key.E))
{
    ReleaseChargedAttack();
}
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

    // Normalize prevents diagonal from being 41% faster
    if (direction != Vector2.Zero)
    {
        direction = Vector2.Normalize(direction);
    }

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
{
    SaveGame();
}
```

### Menu Navigation

```csharp
if (Input.IsKeyPressed(Key.Up))    _selectedIndex--;
if (Input.IsKeyPressed(Key.Down))  _selectedIndex++;
if (Input.IsKeyPressed(Key.Return)) SelectMenuItem(_selectedIndex);
```

---

## The Key Enum

Brine2D uses the `Key` enum (not `Keys`):

```csharp
using Brine2D.Input;

Key.A through Key.Z       // Letters
Key.D0 through Key.D9     // Number row
Key.F1 through Key.F12    // Function keys
Key.Space                 // Spacebar
Key.Return                // Enter
Key.Escape                // Escape
Key.LeftShift, Key.RightShift
Key.LeftControl, Key.RightControl
Key.LeftAlt, Key.RightAlt
Key.Up, Key.Down, Key.Left, Key.Right  // Arrow keys
Key.Tab, Key.Backspace, Key.Delete
```

---

## Text Input

For text fields and chat input, use the dedicated text input API:

```csharp
// Enable text input mode
Input.StartTextInput();

protected override void OnUpdate(GameTime gameTime)
{
    if (Input.IsTextInputActive)
    {
        var text = Input.GetTextInput();
        if (!string.IsNullOrEmpty(text))
        {
            _textBuffer += text;
        }

        if (Input.IsBackspacePressed() && _textBuffer.Length > 0)
        {
            _textBuffer = _textBuffer[..^1];
        }

        if (Input.IsReturnPressed())
        {
            SubmitText(_textBuffer);
            Input.StopTextInput();
        }
    }
}
```

---

## Troubleshooting

### Keys not responding

1. **Check you're in OnUpdate**, not OnRender
2. **Check window has focus** — click the game window
3. **Check spelling** — it's `Key.Space`, not `Key.Space`

### Action repeats unexpectedly

Use `IsKeyPressed`, not `IsKeyDown`:

```csharp
// :x: Wrong — repeats every frame
if (Input.IsKeyDown(Key.Space))
{
    Jump(); // Jumps 60 times per second!
}

// :white_check_mark: Correct — once per press
if (Input.IsKeyPressed(Key.Space))
{
    Jump();
}
```

### Diagonal movement is faster

Normalize the direction vector:

```csharp
if (direction != Vector2.Zero)
{
    direction = Vector2.Normalize(direction);
}
```

---

## Summary

| Method | Usage | Example |
|--------|-------|---------|
| `IsKeyDown()` | Key currently held | Movement, sprint |
| `IsKeyPressed()` | Key just pressed | Jump, shoot, toggle |
| `IsKeyReleased()` | Key just released | Charge attacks |

---

## Next Steps

- **[Mouse Input](mouse.md)** — Handle mouse input
- **[Gamepad Input](gamepad.md)** — Controller support
- **[Input Layers](layers.md)** — Priority-based input