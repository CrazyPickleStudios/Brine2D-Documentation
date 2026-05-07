---
title: Gamepad Support
description: Controller and gamepad input in Brine2D
---

# Gamepad Support

Handle gamepad input using the `Input` framework property (`IInputContext`) available in every scene.

---

## Quick Start

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    if (!Input.IsGamepadConnected()) return;

    if (Input.IsGamepadButtonPressed(GamepadButton.A)) Jump();

    var leftStick = Input.GetGamepadLeftStick(); // Radial deadzone applied automatically
    _position += leftStick * _speed * (float)gameTime.DeltaTime;
}
```

---

## Connection

```csharp
// Check default gamepad (index 0)
if (Input.IsGamepadConnected())
    HandleGamepadInput();

// Specific slot
if (Input.IsGamepadConnected(gamepadIndex: 1))
    HandlePlayer2();

// How many gamepads are currently connected
int count = Input.ConnectedGamepadCount;
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

// Any button pressed on a specific gamepad
if (Input.IsAnyGamepadButtonPressed(gamepadIndex: 0)) ConfirmSelection();

// Any button on any gamepad (multiplayer join)
if (Input.IsAnyGamepadButtonPressedOnAny(out int joinedIndex))
    RegisterPlayer(joinedIndex);
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

`GetGamepadLeftStick()` and `GetGamepadRightStick()` return a `Vector2` in the range -1 to 1 with a **radial deadzone already applied** (default 0.15). Values inside the deadzone are reported as `Vector2.Zero`; the remaining range is rescaled smoothly to 0--1.

```csharp
var leftStick  = Input.GetGamepadLeftStick();   // Movement
var rightStick = Input.GetGamepadRightStick();  // Camera/aim

_position += leftStick * _speed * deltaTime;
```

### Adjusting the Deadzone

```csharp
Input.GamepadDeadzone = 0.20f; // Default is 0.15
```

---

## Triggers

```csharp
// 0.0 (not pressed) to 1.0 (fully pressed)
var leftTrigger  = Input.GetGamepadTrigger(GamepadAxis.LeftTrigger);
var rightTrigger = Input.GetGamepadTrigger(GamepadAxis.RightTrigger);

// One-shot: trigger just crossed the deadzone threshold this frame
if (Input.IsGamepadTriggerPressed(GamepadAxis.RightTrigger)) Fire();

// One-shot: trigger just dropped below the deadzone threshold
if (Input.IsGamepadTriggerReleased(GamepadAxis.RightTrigger)) StopFire();
```

---

## Raw Axes

Use `GetGamepadAxis` for raw access to any axis without the stick helpers' radial deadzone:

```csharp
var leftX  = Input.GetGamepadAxis(GamepadAxis.LeftX);
var leftY  = Input.GetGamepadAxis(GamepadAxis.LeftY);

// Edge detection on raw axes
if (Input.IsGamepadAxisPressed(GamepadAxis.LeftX))  StartMoving();
if (Input.IsGamepadAxisReleased(GamepadAxis.LeftX)) StopMoving();
```

!!! note
    `GetGamepadAxis` returns the raw hardware value without rescaling. For consistent 2D
    directional input prefer `GetGamepadLeftStick()` / `GetGamepadRightStick()`.

**Available axes:** `LeftX`, `LeftY`, `RightX`, `RightY`, `LeftTrigger`, `RightTrigger`

---

## Rumble / Haptic Feedback

```csharp
// Low-frequency (left, thud) and high-frequency (right, buzz) motors
// Intensity: 0.0 (off) -- 1.0 (max)
Input.RumbleGamepad(lowFrequency: 0.5f, highFrequency: 0.8f,
    duration: TimeSpan.FromMilliseconds(200));

// Stop rumble immediately
Input.RumbleGamepad(0f, 0f, TimeSpan.Zero);

// Trigger motors (Xbox impulse triggers)
Input.RumbleGamepadTriggers(leftTrigger: 0.3f, rightTrigger: 1.0f,
    duration: TimeSpan.FromMilliseconds(100));
```

Rumble is enabled by default. Configure it at startup via `InputOptions`:

```csharp
services.Configure<InputOptions>(opts =>
{
    opts.EnableRumble = false; // Disable globally
    opts.MaxGamepads  = 4;     // Default
});
```

---

## Multiple Gamepads

```csharp
for (int i = 0; i < Input.ConnectedGamepadCount; i++)
{
    if (!Input.IsGamepadConnected(i)) continue;

    var stick = Input.GetGamepadLeftStick(i);
    if (Input.IsGamepadButtonPressed(GamepadButton.A, i))
        PlayerJump(i);
}
```

---

## Combined Keyboard + Gamepad

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    var direction = Vector2.Zero;

    // Keyboard
    if (Input.IsKeyDown(Key.W)) direction.Y -= 1;
    if (Input.IsKeyDown(Key.S)) direction.Y += 1;
    if (Input.IsKeyDown(Key.A)) direction.X -= 1;
    if (Input.IsKeyDown(Key.D)) direction.X += 1;

    // Gamepad (add to keyboard so either works)
    if (Input.IsGamepadConnected())
        direction += Input.GetGamepadLeftStick();

    if (direction != Vector2.Zero)
        direction = Vector2.Normalize(direction);

    _position += direction * _speed * (float)gameTime.DeltaTime;
}
```

---

## Troubleshooting

### Gamepad Not Detected

1. Verify the controller is connected and recognized by your OS.
2. Check `Input.IsGamepadConnected()` returns `true`.
3. Test with keyboard first to verify game logic works.

### Stick Drift

The built-in radial deadzone handles this. If drift is still noticeable, increase it slightly:

```csharp
Input.GamepadDeadzone = 0.20f;
```

---

## Summary

| Component | API | Notes |
|-----------|-----|-------|
| **Left Stick** | `GetGamepadLeftStick()` | -1 to 1, radial deadzone applied |
| **Right Stick** | `GetGamepadRightStick()` | -1 to 1, radial deadzone applied |
| **Triggers** | `GetGamepadTrigger(axis)` | 0 to 1 |
| **Buttons** | `IsGamepadButton{Down/Pressed/Released}()` | bool |
| **Rumble** | `RumbleGamepad()` | 0.0--1.0 intensity |
| **Deadzone** | `GamepadDeadzone` | Default 0.15 |

---

## Next Steps

- **[Keyboard Input](keyboard.md)**
- **[Mouse Input](mouse.md)**
- **[Input Actions](actions.md)** -- Rebindable logical actions
- **[Input Layers](layers.md)**