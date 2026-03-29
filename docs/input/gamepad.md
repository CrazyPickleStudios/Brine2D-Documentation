---
title: Gamepad Input
description: Handle controller/gamepad input in Brine2D — buttons, sticks, triggers
---

# Gamepad Input

Handle gamepad/controller input using the `Input` framework property (`IInputContext`).
Brine2D uses **Xbox-style layout** via SDL3 — all controllers (PlayStation, Nintendo, etc.) are mapped to this layout automatically.

---

## Quick Start

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    if (!Input.IsGamepadConnected()) return;

    var deltaTime = (float)gameTime.DeltaTime;

    // Buttons
    if (Input.IsGamepadButtonPressed(GamepadButton.A)) Jump();
    if (Input.IsGamepadButtonDown(GamepadButton.X)) Attack();

    // Left stick for movement
    var leftStick = Input.GetGamepadLeftStick();
    if (leftStick.Length() > 0.15f)  // Dead zone
    {
        _position += leftStick * _speed * deltaTime;
    }

    // Right stick for aiming
    var rightStick = Input.GetGamepadRightStick();
    if (rightStick.Length() > 0.15f)
    {
        _aimDirection = Vector2.Normalize(rightStick);
    }

    // Triggers via axis API
    var rightTrigger = Input.GetGamepadAxis(GamepadAxis.RightTrigger);
    if (rightTrigger > 0.5f)
    {
        Fire();
    }
}
```

---

## Connection Check

```csharp
// Default gamepad (index 0)
if (Input.IsGamepadConnected())
{
    HandleGamepadInput();
}

// Specific gamepad index
if (Input.IsGamepadConnected(gamepadIndex: 1))
{
    HandlePlayer2Input();
}
```

---

## Buttons

```csharp
// Just pressed (one-shot)
if (Input.IsGamepadButtonPressed(GamepadButton.A)) Jump();

// Held down (continuous)
if (Input.IsGamepadButtonDown(GamepadButton.RightShoulder)) Sprint();

// Just released
if (Input.IsGamepadButtonReleased(GamepadButton.X)) ReleaseCharge();
```

**Available buttons:**

| GamepadButton | Xbox | PlayStation | Nintendo |
|---------------|------|-------------|----------|
| `A` | A | Cross | B |
| `B` | B | Circle | A |
| `X` | X | Square | Y |
| `Y` | Y | Triangle | X |
| `LeftShoulder` | LB | L1 | L |
| `RightShoulder` | RB | R1 | R |
| `Back` | Back | Select | - |
| `Start` | Start | Options | + |
| `LeftStick` | LS Click | L3 | LS Click |
| `RightStick` | RS Click | R3 | RS Click |
| `DPadUp/Down/Left/Right` | D-Pad | D-Pad | D-Pad |

---

## Analog Sticks

```csharp
// Left stick — typically movement
var leftStick = Input.GetGamepadLeftStick();  // Vector2, -1 to 1

// Right stick — typically camera/aim
var rightStick = Input.GetGamepadRightStick();  // Vector2, -1 to 1
```

### Dead Zone

Always apply a dead zone to prevent stick drift:

```csharp
var stick = Input.GetGamepadLeftStick();
if (stick.Length() > 0.15f)
{
    _position += stick * speed * deltaTime;
}
```

---

## Triggers and Axes

Use `GetGamepadAxis` for triggers and raw axis values:

```csharp
// Triggers (0.0 to 1.0)
var leftTrigger = Input.GetGamepadAxis(GamepadAxis.LeftTrigger);
var rightTrigger = Input.GetGamepadAxis(GamepadAxis.RightTrigger);

// Raw stick axes (-1.0 to 1.0)
var leftX = Input.GetGamepadAxis(GamepadAxis.LeftX);
var leftY = Input.GetGamepadAxis(GamepadAxis.LeftY);
```

**Available axes:** `LeftX`, `LeftY`, `RightX`, `RightY`, `LeftTrigger`, `RightTrigger`

---

## Multiple Gamepads

```csharp
for (int i = 0; i < 4; i++)
{
    if (Input.IsGamepadConnected(i))
    {
        var stick = Input.GetGamepadLeftStick(i);
        if (Input.IsGamepadButtonPressed(GamepadButton.A, i))
        {
            PlayerJump(i);
        }
    }
}
```

---

## Combined Input (Keyboard + Gamepad)

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var direction = Vector2.Zero;

    // Keyboard
    if (Input.IsKeyDown(Key.W)) direction.Y -= 1;
    if (Input.IsKeyDown(Key.S)) direction.Y += 1;
    if (Input.IsKeyDown(Key.A)) direction.X -= 1;
    if (Input.IsKeyDown(Key.D)) direction.X += 1;

    // Gamepad (add to keyboard — player can use either)
    if (Input.IsGamepadConnected())
    {
        var stick = Input.GetGamepadLeftStick();
        if (stick.Length() > 0.15f)
        {
            direction += stick;
        }
    }

    if (direction != Vector2.Zero)
    {
        direction = Vector2.Normalize(direction);
    }

    _position += direction * _speed * (float)gameTime.DeltaTime;
}
```

---

## Troubleshooting

### Gamepad not detected

1. Verify the controller is connected and recognized by your OS
2. Check `Input.IsGamepadConnected()` returns `true`
3. Test with keyboard first to verify game logic works

### Stick drift

Apply a dead zone — 0.15 (15%) is recommended:

```csharp
if (stick.Length() > 0.15f) { /* use stick */ }
```

---

## Summary

| Component | API | Range |
|-----------|-----|-------|
| **Left Stick** | `GetGamepadLeftStick()` | -1.0 to 1.0 (X, Y) |
| **Right Stick** | `GetGamepadRightStick()` | -1.0 to 1.0 (X, Y) |
| **Triggers** | `GetGamepadAxis(GamepadAxis.LeftTrigger)` | 0.0 to 1.0 |
| **Buttons** | `IsGamepadButton___()` | bool |

---

## Next Steps

- **[Keyboard Input](keyboard.md)** — Keyboard input handling
- **[Mouse Input](mouse.md)** — Mouse and cursor control
- **[Input Layers](layers.md)** — Priority-based input