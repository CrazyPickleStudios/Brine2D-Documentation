---
title: Mouse Input
description: Handle mouse position, clicks, scroll wheel, cursor, and relative mode in Brine2D
---

# Mouse Input

Handle mouse input using the `Input` framework property (`IInputContext`) available in every scene.

---

## Quick Start

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var mousePos = Input.MousePosition;

    if (Input.IsMouseButtonPressed(MouseButton.Left))
        SpawnAt(mousePos);

    if (Input.ScrollWheelDelta != 0)
        _zoom += Input.ScrollWheelDelta * 0.1f;
}
```

---

## Mouse Position

```csharp
// Absolute position in screen coordinates (top-left origin)
var pos = Input.MousePosition; // Vector2

// Movement delta since last frame (useful for camera/look control)
var delta = Input.MouseDelta; // Vector2
_cameraAngle += delta.X * _sensitivity;
```

---

## Mouse Buttons

```csharp
// Button held down
if (Input.IsMouseButtonDown(MouseButton.Left))
    DrawBrush(Input.MousePosition);

// Button just clicked this frame
if (Input.IsMouseButtonPressed(MouseButton.Left))
    SelectUnit(Input.MousePosition);

// Button just released
if (Input.IsMouseButtonReleased(MouseButton.Left))
    DropItem();

// Any mouse button pressed (attract/lobby screens)
if (Input.IsAnyMouseButtonPressed())
    StartGame();
```

**Available buttons:** `Left`, `Right`, `Middle`, `X1`, `X2`

---

## Scroll Wheel

```csharp
// Vertical scroll (positive = up, negative = down)
var scroll = Input.ScrollWheelDelta; // float
if (scroll > 0) ZoomIn();
if (scroll < 0) ZoomOut();

// Horizontal scroll (trackpads, horizontal scroll wheels)
var hScroll = Input.ScrollWheelDeltaX; // float
```

---

## Cursor Visibility

```csharp
// Hide the cursor (e.g. custom cursor or in-game reticle)
Input.IsCursorVisible = false;

// Show it again
Input.IsCursorVisible = true;
```

---

## Relative Mouse Mode

When enabled the cursor is hidden, captured to the window, and `MouseDelta` reports frame-to-frame motion. `MousePosition` is not updated in this mode. Use it for first-person cameras and drag operations where you want unlimited movement range.

```csharp
// Enable for FPS-style look
Input.IsRelativeMouseMode = true;

protected override void OnUpdate(GameTime gameTime)
{
    if (Input.IsRelativeMouseMode)
    {
        _cameraYaw   += Input.MouseDelta.X * _sensitivity;
        _cameraPitch += Input.MouseDelta.Y * _sensitivity;
    }
}

// Disable when returning to a menu
Input.IsRelativeMouseMode = false;
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
    _dragOffset = Input.MousePosition - _dragStart;

if (Input.IsMouseButtonReleased(MouseButton.Left))
    _isDragging = false;
```

### Camera Pan with Middle Mouse

```csharp
if (Input.IsMouseButtonDown(MouseButton.Middle))
    _cameraPosition -= Input.MouseDelta;
```

### Zoom with Scroll Wheel

```csharp
var scroll = Input.ScrollWheelDelta;
if (scroll != 0)
    _zoom = Math.Clamp(_zoom + scroll * 0.1f, 0.5f, 3.0f);
```

---

## Troubleshooting

### Mouse Position Seems Wrong

- `MousePosition` is in screen coordinates (top-left origin).
- If using a camera, convert with `camera.ScreenToWorld(pos)`.

### Scroll Wheel Not Working

- `ScrollWheelDelta` is a `float`, check `!= 0`.
- Poll in `OnUpdate`, not `OnRender`.
- The value resets each frame -- do not accumulate it.

### `MouseDelta` Always Zero

- The mouse must actually be moving over the window.
- In relative mode, `MouseDelta` reports the captured motion even when the cursor is at the window edge.

---

## Summary

| Property / Method | Returns | Usage |
|-------------------|---------|-------|
| `MousePosition` | `Vector2` | Absolute screen position |
| `MouseDelta` | `Vector2` | Frame-to-frame movement |
| `ScrollWheelDelta` | `float` | Vertical scroll (positive = up) |
| `ScrollWheelDeltaX` | `float` | Horizontal scroll |
| `IsMouseButtonDown()` | `bool` | Button held |
| `IsMouseButtonPressed()` | `bool` | Button just clicked |
| `IsMouseButtonReleased()` | `bool` | Button just released |
| `IsAnyMouseButtonPressed()` | `bool` | Any button pressed this frame |
| `IsCursorVisible` | `bool` | Show / hide OS cursor |
| `IsRelativeMouseMode` | `bool` | Capture mouse for unlimited movement |

---

## Next Steps

- **[Keyboard Input](keyboard.md)**
- **[Gamepad Input](gamepad.md)**
- **[Input Layers](layers.md)**