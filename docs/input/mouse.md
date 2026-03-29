---
title: Mouse Input
description: Handle mouse position, clicks, scroll wheel, and drag in Brine2D
---

# Mouse Input

Handle mouse input using the `Input` framework property (`IInputContext`).

---

## Quick Start

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    // Position (Vector2 in screen coordinates)
    var mousePos = Input.MousePosition;

    // Click detection
    if (Input.IsMouseButtonPressed(MouseButton.Left))
    {
        SpawnAt(mousePos);
    }

    // Scroll wheel (float — positive = up)
    if (Input.ScrollWheelDelta != 0)
    {
        _zoom += Input.ScrollWheelDelta * 0.1f;
    }
}
```

---

## Mouse Position

```csharp
// Absolute position in screen coordinates
var pos = Input.MousePosition;  // Vector2
Logger.LogDebug(""Mouse at {X}, {Y}"", pos.X, pos.Y);

// Movement delta since last frame (for camera/look control)
var delta = Input.MouseDelta;  // Vector2
_cameraAngle += delta.X * _sensitivity;
```

---

## Mouse Buttons

```csharp
// Button held down
if (Input.IsMouseButtonDown(MouseButton.Left))
{
    DrawBrush(Input.MousePosition);
}

// Button just clicked this frame
if (Input.IsMouseButtonPressed(MouseButton.Left))
{
    SelectUnit(Input.MousePosition);
}

// Button just released
if (Input.IsMouseButtonReleased(MouseButton.Left))
{
    DropItem();
}
```

**Available buttons:** `Left`, `Right`, `Middle`, `X1`, `X2`

---

## Scroll Wheel

```csharp
var scroll = Input.ScrollWheelDelta;  // float
if (scroll > 0) ZoomIn();
if (scroll < 0) ZoomOut();
```

---

## Common Patterns

### Click Detection with Bounds

```csharp
if (Input.IsMouseButtonPressed(MouseButton.Left))
{
    var pos = Input.MousePosition;
    if (pos.X >= _buttonX && pos.X <= _buttonX + _buttonWidth &&
        pos.Y >= _buttonY && pos.Y <= _buttonY + _buttonHeight)
    {
        OnButtonClicked();
    }
}
```

### Drag and Drop

```csharp
if (Input.IsMouseButtonPressed(MouseButton.Left))
{
    _dragStart = Input.MousePosition;
    _isDragging = true;
}

if (_isDragging)
{
    var current = Input.MousePosition;
    _dragOffset = current - _dragStart;
}

if (Input.IsMouseButtonReleased(MouseButton.Left))
{
    _isDragging = false;
}
```

### Camera Pan with Middle Mouse

```csharp
if (Input.IsMouseButtonDown(MouseButton.Middle))
{
    var delta = Input.MouseDelta;
    _cameraPosition -= delta;
}
```

### Zoom with Scroll Wheel

```csharp
var scroll = Input.ScrollWheelDelta;
if (scroll != 0)
{
    _zoom = Math.Clamp(_zoom + scroll * 0.1f, 0.5f, 3.0f);
}
```

---

## Troubleshooting

### Mouse position seems wrong

- `MousePosition` returns screen coordinates (top-left origin)
- If using a camera, convert with `camera.ScreenToWorld(pos)`

### Scroll wheel not working

- `ScrollWheelDelta` is a `float`, not a `Vector2`
- Check in `OnUpdate`, not `OnRender`
- Value resets each frame — check `!= 0`, don't accumulate

### Mouse delta always zero

- `MouseDelta` reports frame-to-frame movement
- Verify the mouse is actually moving over the window

---

## Summary

| Property/Method | Returns | Usage |
|-----------------|---------|-------|
| `MousePosition` | `Vector2` | Absolute screen position |
| `MouseDelta` | `Vector2` | Frame-to-frame movement |
| `ScrollWheelDelta` | `float` | Scroll amount (positive = up) |
| `IsMouseButtonDown()` | `bool` | Button held |
| `IsMouseButtonPressed()` | `bool` | Button just clicked |
| `IsMouseButtonReleased()` | `bool` | Button just released |

---

## Next Steps

- **[Keyboard Input](keyboard.md)** — Keyboard input handling
- **[Gamepad Input](gamepad.md)** — Controller support
- **[Input Layers](layers.md)** — Priority-based input