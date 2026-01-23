---
title: Gamepad Input
description: Handle gamepad and controller input in Brine2D - buttons, sticks, triggers, and rumble
---

# Gamepad Input

Learn how to handle gamepad and controller input in your Brine2D games.

## Overview

Brine2D's gamepad input system provides:

- **Button States** - Down, pressed, released
- **Analog Sticks** - Left and right thumbsticks
- **Triggers** - Left and right analog triggers
- **D-Pad** - Digital directional input
- **Multiple Controllers** - Support up to 4+ gamepads
- **Vibration** - Haptic feedback/rumble
- **Hot-Plugging** - Connect/disconnect detection

**Powered by:** SDL3 gamepad system

**Supports:** Xbox, PlayStation, Nintendo Switch, and generic controllers

---

## Setup

### Inject Input Service

In your scene:

~~~csharp
using Brine2D.Engine;
using Brine2D.Input;
using Microsoft.Extensions.Logging;

public class GameScene : Scene
{
    private readonly IInputService _input;
    
    public GameScene(
        IInputService input,
        ILogger<GameScene> logger) : base(logger)
    {
        _input = input;
    }
}
~~~

---

## Gamepad Detection

### Check Gamepad Connection

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    // Check if any gamepad is connected
    if (_input.IsGamepadConnected(0))
    {
        Logger.LogInformation("Gamepad 0 is connected");
    }
    
    // Check all gamepads
    for (int i = 0; i < 4; i++)
    {
        if (_input.IsGamepadConnected(i))
        {
            Logger.LogInformation("Gamepad {Index} connected", i);
        }
    }
}
~~~

---

### Get Gamepad Name

~~~csharp
protected override void OnInitialize()
{
    for (int i = 0; i < 4; i++)
    {
        if (_input.IsGamepadConnected(i))
        {
            var name = _input.GetGamepadName(i);
            Logger.LogInformation("Gamepad {Index}: {Name}", i, name);
        }
    }
}
~~~

---

## Gamepad Buttons

### Available Buttons

~~~csharp
GamepadButton.A             // Face button (Xbox A, PS Cross)
GamepadButton.B             // Face button (Xbox B, PS Circle)
GamepadButton.X             // Face button (Xbox X, PS Square)
GamepadButton.Y             // Face button (Xbox Y, PS Triangle)

GamepadButton.DPadUp        // D-pad up
GamepadButton.DPadDown      // D-pad down
GamepadButton.DPadLeft      // D-pad left
GamepadButton.DPadRight     // D-pad right

GamepadButton.LeftShoulder  // Left bumper (LB/L1)
GamepadButton.RightShoulder // Right bumper (RB/R1)

GamepadButton.LeftStick     // Left stick click (L3)
GamepadButton.RightStick    // Right stick click (R3)

GamepadButton.Start         // Start button (Options/+)
GamepadButton.Back          // Back button (Share/-)
GamepadButton.Guide         // Guide button (Xbox/PS/Home)
~~~

---

### IsGamepadButtonDown

Check if button is currently held down:

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    int gamepadIndex = 0;
    
    // Continuous action while held
    if (_input.IsGamepadButtonDown(gamepadIndex, GamepadButton.A))
    {
        ChargeAttack(gameTime);
    }
    
    // Accelerate while held
    if (_input.IsGamepadButtonDown(gamepadIndex, GamepadButton.RightShoulder))
    {
        Accelerate();
    }
}
~~~

**Use for:**
- Continuous actions
- Holding to charge
- Acceleration/boost

---

### IsGamepadButtonPressed

Check if button was just pressed this frame:

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    int gamepadIndex = 0;
    
    // Jump once per press
    if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.A))
    {
        Jump();
    }
    
    // Shoot once per press
    if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.X))
    {
        Shoot();
    }
    
    // Open menu
    if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.Start))
    {
        OpenMenu();
    }
}
~~~

**Use for:**
- Single actions (jump, shoot, interact)
- Menu navigation
- Toggle actions

---

### IsGamepadButtonReleased

Check if button was just released this frame:

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    int gamepadIndex = 0;
    
    // Charge attack - release to fire
    if (_input.IsGamepadButtonDown(gamepadIndex, GamepadButton.A))
    {
        _chargeTime += (float)gameTime.DeltaTime;
    }
    
    if (_input.IsGamepadButtonReleased(gamepadIndex, GamepadButton.A))
    {
        FireChargedAttack(_chargeTime);
        _chargeTime = 0f;
    }
}
~~~

**Use for:**
- Charge mechanics
- Hold-and-release actions
- Button up detection

---

## Button State Diagram

~~~mermaid
stateDiagram-v2
    [*] --> ButtonUp: Initial state
    
    ButtonUp --> ButtonPressed: Button pressed
    ButtonPressed --> ButtonDown: Next frame
    
    ButtonDown --> ButtonDown: Button held
    ButtonDown --> ButtonReleased: Button released
    
    ButtonReleased --> ButtonUp: Next frame
    ButtonUp --> ButtonUp: Button not pressed
    
    note right of ButtonPressed
        IsGamepadButtonPressed() = true
        IsGamepadButtonDown() = true
    end note
    
    note right of ButtonDown
        IsGamepadButtonPressed() = false
        IsGamepadButtonDown() = true
    end note
    
    note right of ButtonReleased
        IsGamepadButtonPressed() = false
        IsGamepadButtonDown() = false
        IsGamepadButtonReleased() = true
    end note
    
    note right of ButtonUp
        IsGamepadButtonPressed() = false
        IsGamepadButtonDown() = false
        IsGamepadButtonReleased() = false
    end note
~~~

---

## Analog Sticks

### Get Stick Position

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    int gamepadIndex = 0;
    
    // Left stick (movement)
    var leftStick = _input.GetGamepadLeftStick(gamepadIndex);
    
    // Right stick (camera)
    var rightStick = _input.GetGamepadRightStick(gamepadIndex);
    
    Logger.LogDebug("Left: ({X}, {Y}), Right: ({X}, {Y})",
        leftStick.X, leftStick.Y,
        rightStick.X, rightStick.Y);
}
~~~

**Returns:** `Vector2` with values from -1.0 to 1.0
- `X` = Horizontal axis (left = -1, right = 1)
- `Y` = Vertical axis (up = -1, down = 1)

---

### Movement with Left Stick

~~~csharp
public class GamepadMovement
{
    private readonly IInputService _input;
    private Vector2 _position;
    private readonly float _speed = 200f;
    private const int GamepadIndex = 0;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        var leftStick = _input.GetGamepadLeftStick(GamepadIndex);
        
        // Apply dead zone
        if (leftStick.Length() > 0.15f)
        {
            // Move player
            _position += leftStick * _speed * deltaTime;
        }
    }
}
~~~

---

### Camera with Right Stick

~~~csharp
public class GamepadCamera
{
    private readonly IInputService _input;
    private float _yaw = 0f;
    private float _pitch = 0f;
    private readonly float _sensitivity = 2.0f;
    private const int GamepadIndex = 0;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        var rightStick = _input.GetGamepadRightStick(GamepadIndex);
        
        // Apply dead zone
        if (rightStick.Length() > 0.15f)
        {
            _yaw += rightStick.X * _sensitivity * deltaTime;
            _pitch -= rightStick.Y * _sensitivity * deltaTime;
            
            // Clamp pitch
            _pitch = Math.Clamp(_pitch, -89f, 89f);
        }
    }
}
~~~

---

### Dead Zones

Prevent stick drift with dead zones:

~~~csharp
public class DeadZone
{
    public static Vector2 ApplyDeadZone(Vector2 stick, float threshold = 0.15f)
    {
        var magnitude = stick.Length();
        
        if (magnitude < threshold)
        {
            return Vector2.Zero; // Below threshold, ignore
        }
        
        // Re-normalize above threshold
        var normalized = stick / magnitude;
        var adjusted = (magnitude - threshold) / (1f - threshold);
        
        return normalized * adjusted;
    }
}

// Usage
var leftStick = _input.GetGamepadLeftStick(0);
var adjusted = DeadZone.ApplyDeadZone(leftStick, 0.15f);
_position += adjusted * _speed * deltaTime;
~~~

---

## Triggers

### Get Trigger Values

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    int gamepadIndex = 0;
    
    // Get trigger values (0.0 to 1.0)
    var leftTrigger = _input.GetGamepadLeftTrigger(gamepadIndex);
    var rightTrigger = _input.GetGamepadRightTrigger(gamepadIndex);
    
    Logger.LogDebug("LT: {LT:F2}, RT: {RT:F2}", 
        leftTrigger, rightTrigger);
}
~~~

**Returns:** `float` from 0.0 (not pressed) to 1.0 (fully pressed)

---

### Trigger as Acceleration

~~~csharp
public class VehicleControl
{
    private readonly IInputService _input;
    private float _speed = 0f;
    private const float MaxSpeed = 500f;
    private const int GamepadIndex = 0;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Right trigger = accelerate
        var accelerate = _input.GetGamepadRightTrigger(GamepadIndex);
        
        // Left trigger = brake/reverse
        var brake = _input.GetGamepadLeftTrigger(GamepadIndex);
        
        if (accelerate > 0.1f)
        {
            _speed += accelerate * MaxSpeed * deltaTime;
        }
        
        if (brake > 0.1f)
        {
            _speed -= brake * MaxSpeed * deltaTime;
        }
        
        // Apply friction
        _speed *= 0.95f;
        
        _speed = Math.Clamp(_speed, -MaxSpeed * 0.5f, MaxSpeed);
    }
}
~~~

---

### Trigger as Aim Down Sights

~~~csharp
public class AimControl
{
    private readonly IInputService _input;
    private float _aimAmount = 0f;
    private const int GamepadIndex = 0;

    public void Update(GameTime gameTime)
    {
        // Left trigger to aim
        var aimInput = _input.GetGamepadLeftTrigger(GamepadIndex);
        
        // Smooth aim transition
        var deltaTime = (float)gameTime.DeltaTime;
        var targetAim = aimInput > 0.5f ? 1f : 0f;
        _aimAmount = Lerp(_aimAmount, targetAim, 10f * deltaTime);
    }
    
    private float Lerp(float a, float b, float t)
    {
        return a + (b - a) * Math.Clamp(t, 0f, 1f);
    }
    
    public float GetAimAmount() => _aimAmount;
}
~~~

---

## D-Pad

### D-Pad Buttons

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    int gamepadIndex = 0;
    
    // Check D-pad buttons
    if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.DPadUp))
    {
        NavigateUp();
    }
    
    if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.DPadDown))
    {
        NavigateDown();
    }
    
    if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.DPadLeft))
    {
        NavigateLeft();
    }
    
    if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.DPadRight))
    {
        NavigateRight();
    }
}
~~~

---

### D-Pad as Vector

Convert D-pad to direction vector:

~~~csharp
public class DPadInput
{
    private readonly IInputService _input;
    private const int GamepadIndex = 0;

    public Vector2 GetDPadDirection()
    {
        var direction = Vector2.Zero;
        
        if (_input.IsGamepadButtonDown(GamepadIndex, GamepadButton.DPadUp))
            direction.Y -= 1;
        
        if (_input.IsGamepadButtonDown(GamepadIndex, GamepadButton.DPadDown))
            direction.Y += 1;
        
        if (_input.IsGamepadButtonDown(GamepadIndex, GamepadButton.DPadLeft))
            direction.X -= 1;
        
        if (_input.IsGamepadButtonDown(GamepadIndex, GamepadButton.DPadRight))
            direction.X += 1;
        
        // Normalize diagonal movement
        if (direction != Vector2.Zero)
        {
            direction = Vector2.Normalize(direction);
        }
        
        return direction;
    }
}
~~~

---

## Vibration / Rumble

### Basic Rumble

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    int gamepadIndex = 0;
    
    // Fire weapon
    if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.X))
    {
        Shoot();
        
        // Rumble for 200ms
        _input.RumbleGamepad(
            gamepadIndex,
            lowFrequency: 0.3f,
            highFrequency: 0.7f,
            durationMs: 200);
    }
}
~~~

**Parameters:**
- `lowFrequency` - Low-frequency motor (0.0 to 1.0)
- `highFrequency` - High-frequency motor (0.0 to 1.0)
- `durationMs` - Duration in milliseconds

---

### Rumble Patterns

~~~csharp
public class RumbleController
{
    private readonly IInputService _input;
    private const int GamepadIndex = 0;

    // Light rumble (subtle feedback)
    public void LightRumble()
    {
        _input.RumbleGamepad(GamepadIndex, 0.2f, 0.2f, 100);
    }
    
    // Heavy rumble (strong impact)
    public void HeavyRumble()
    {
        _input.RumbleGamepad(GamepadIndex, 0.8f, 0.8f, 300);
    }
    
    // Explosion rumble (low frequency dominant)
    public void ExplosionRumble()
    {
        _input.RumbleGamepad(GamepadIndex, 1.0f, 0.3f, 500);
    }
    
    // Electric rumble (high frequency dominant)
    public void ElectricRumble()
    {
        _input.RumbleGamepad(GamepadIndex, 0.2f, 1.0f, 150);
    }
    
    // Heartbeat rumble
    public void HeartbeatRumble()
    {
        _input.RumbleGamepad(GamepadIndex, 0.5f, 0.0f, 100);
        // Schedule second beat (would need timer)
    }
}
~~~

---

### Stop Rumble

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    int gamepadIndex = 0;
    
    // Stop all rumble
    if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.Start))
    {
        _input.StopGamepadRumble(gamepadIndex);
    }
}
~~~

---

## Multiple Gamepads

### Player Assignments

~~~csharp
public class PlayerManager
{
    private readonly IInputService _input;
    private readonly Dictionary<int, Player> _players = new();

    public void Update(GameTime gameTime)
    {
        // Check for join input on each gamepad
        for (int i = 0; i < 4; i++)
        {
            if (_input.IsGamepadConnected(i) && 
                !_players.ContainsKey(i))
            {
                // Join on Start button
                if (_input.IsGamepadButtonPressed(i, GamepadButton.Start))
                {
                    JoinPlayer(i);
                }
            }
        }
        
        // Update all players
        foreach (var (gamepadIndex, player) in _players)
        {
            UpdatePlayer(player, gamepadIndex, gameTime);
        }
    }
    
    private void JoinPlayer(int gamepadIndex)
    {
        var player = new Player { GamepadIndex = gamepadIndex };
        _players[gamepadIndex] = player;
        Logger.LogInformation("Player {Index} joined", gamepadIndex);
    }
    
    private void UpdatePlayer(Player player, int gamepadIndex, GameTime gameTime)
    {
        var leftStick = _input.GetGamepadLeftStick(gamepadIndex);
        
        if (leftStick.Length() > 0.15f)
        {
            var deltaTime = (float)gameTime.DeltaTime;
            player.Position += leftStick * player.Speed * deltaTime;
        }
        
        if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.A))
        {
            player.Jump();
        }
    }
}
~~~

---

### Split-Screen Input

~~~csharp
public class SplitScreenGame
{
    private readonly IInputService _input;
    private readonly Player _player1;
    private readonly Player _player2;

    public void Update(GameTime gameTime)
    {
        // Player 1 (Gamepad 0)
        UpdatePlayerInput(_player1, 0, gameTime);
        
        // Player 2 (Gamepad 1)
        UpdatePlayerInput(_player2, 1, gameTime);
    }
    
    private void UpdatePlayerInput(Player player, int gamepadIndex, GameTime gameTime)
    {
        if (!_input.IsGamepadConnected(gamepadIndex))
            return;
        
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Movement
        var leftStick = _input.GetGamepadLeftStick(gamepadIndex);
        if (leftStick.Length() > 0.15f)
        {
            player.Position += leftStick * player.Speed * deltaTime;
        }
        
        // Actions
        if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.A))
        {
            player.Jump();
        }
        
        if (_input.IsGamepadButtonPressed(gamepadIndex, GamepadButton.X))
        {
            player.Shoot();
        }
    }
}
~~~

---

## Common Patterns

### Complete Movement System

~~~csharp
public class GamepadPlayerController
{
    private readonly IInputService _input;
    private Vector2 _position;
    private Vector2 _velocity;
    private bool _isGrounded = true;
    
    private const int GamepadIndex = 0;
    private const float MoveSpeed = 200f;
    private const float JumpForce = 500f;
    private const float Gravity = 980f;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Horizontal movement from left stick
        var leftStick = _input.GetGamepadLeftStick(GamepadIndex);
        var moveInput = DeadZone.ApplyDeadZone(leftStick, 0.15f);
        
        _velocity.X = moveInput.X * MoveSpeed;
        
        // Jump on A button
        if (_input.IsGamepadButtonPressed(GamepadIndex, GamepadButton.A) && 
            _isGrounded)
        {
            _velocity.Y = -JumpForce;
            _isGrounded = false;
        }
        
        // Apply gravity
        if (!_isGrounded)
        {
            _velocity.Y += Gravity * deltaTime;
        }
        
        // Apply velocity
        _position += _velocity * deltaTime;
        
        // Ground check (simplified)
        if (_position.Y >= 500f)
        {
            _position.Y = 500f;
            _velocity.Y = 0;
            _isGrounded = true;
        }
    }
}
~~~

---

### Menu Navigation

~~~csharp
public class GamepadMenu
{
    private readonly IInputService _input;
    private int _selectedIndex = 0;
    private readonly int _menuItemCount;
    private float _navigationCooldown = 0f;
    private const float CooldownTime = 0.2f;
    private const int GamepadIndex = 0;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Update cooldown
        if (_navigationCooldown > 0)
        {
            _navigationCooldown -= deltaTime;
        }
        
        if (_navigationCooldown <= 0)
        {
            // Navigate with left stick
            var leftStick = _input.GetGamepadLeftStick(GamepadIndex);
            
            if (leftStick.Y < -0.5f)
            {
                NavigateUp();
                _navigationCooldown = CooldownTime;
            }
            else if (leftStick.Y > 0.5f)
            {
                NavigateDown();
                _navigationCooldown = CooldownTime;
            }
            
            // Navigate with D-pad
            if (_input.IsGamepadButtonPressed(GamepadIndex, GamepadButton.DPadUp))
            {
                NavigateUp();
                _navigationCooldown = CooldownTime;
            }
            else if (_input.IsGamepadButtonPressed(GamepadIndex, GamepadButton.DPadDown))
            {
                NavigateDown();
                _navigationCooldown = CooldownTime;
            }
        }
        
        // Select with A
        if (_input.IsGamepadButtonPressed(GamepadIndex, GamepadButton.A))
        {
            SelectMenuItem(_selectedIndex);
        }
        
        // Back with B
        if (_input.IsGamepadButtonPressed(GamepadIndex, GamepadButton.B))
        {
            GoBack();
        }
    }
    
    private void NavigateUp()
    {
        _selectedIndex--;
        if (_selectedIndex < 0)
        {
            _selectedIndex = _menuItemCount - 1;
        }
    }
    
    private void NavigateDown()
    {
        _selectedIndex++;
        if (_selectedIndex >= _menuItemCount)
        {
            _selectedIndex = 0;
        }
    }
}
~~~

---

### Dual-Stick Shooter

~~~csharp
public class DualStickShooter
{
    private readonly IInputService _input;
    private Vector2 _position;
    private float _shootCooldown = 0f;
    private const float ShootDelay = 0.15f;
    private const int GamepadIndex = 0;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Movement with left stick
        var leftStick = _input.GetGamepadLeftStick(GamepadIndex);
        if (leftStick.Length() > 0.15f)
        {
            _position += leftStick * 200f * deltaTime;
        }
        
        // Aiming with right stick
        var rightStick = _input.GetGamepadRightStick(GamepadIndex);
        if (rightStick.Length() > 0.3f)
        {
            // Shoot in aim direction
            if (_shootCooldown <= 0)
            {
                ShootProjectile(rightStick);
                _shootCooldown = ShootDelay;
                
                // Light rumble on shoot
                _input.RumbleGamepad(GamepadIndex, 0.2f, 0.4f, 50);
            }
        }
        
        // Update cooldown
        if (_shootCooldown > 0)
        {
            _shootCooldown -= deltaTime;
        }
    }
    
    private void ShootProjectile(Vector2 direction)
    {
        var normalized = Vector2.Normalize(direction);
        // Create projectile with direction
    }
}
~~~

---

## Complete Example

~~~csharp
using Brine2D.Core;
using Brine2D.Engine;
using Brine2D.Input;
using Brine2D.Rendering;
using Microsoft.Extensions.Logging;
using System.Numerics;

public class GamepadDemoScene : Scene
{
    private readonly IInputService _input;
    private readonly IRenderer _renderer;
    
    private Vector2 _playerPosition = new(400, 300);
    private readonly float _speed = 200f;
    private const int GamepadIndex = 0;

    public GamepadDemoScene(
        IInputService input,
        IRenderer renderer,
        ILogger<GamepadDemoScene> logger) : base(logger)
    {
        _input = input;
        _renderer = renderer;
    }

    protected override void OnInitialize()
    {
        // Check gamepad connection
        if (_input.IsGamepadConnected(GamepadIndex))
        {
            var name = _input.GetGamepadName(GamepadIndex);
            Logger.LogInformation("Gamepad connected: {Name}", name);
        }
        else
        {
            Logger.LogWarning("No gamepad connected");
        }
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        if (!_input.IsGamepadConnected(GamepadIndex))
            return;
        
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Movement with left stick
        var leftStick = _input.GetGamepadLeftStick(GamepadIndex);
        if (leftStick.Length() > 0.15f)
        {
            _playerPosition += leftStick * _speed * deltaTime;
        }
        
        // Jump on A button
        if (_input.IsGamepadButtonPressed(GamepadIndex, GamepadButton.A))
        {
            Logger.LogInformation("Jump!");
            _input.RumbleGamepad(GamepadIndex, 0.3f, 0.3f, 100);
        }
        
        // Shoot on X button
        if (_input.IsGamepadButtonPressed(GamepadIndex, GamepadButton.X))
        {
            Logger.LogInformation("Shoot!");
            _input.RumbleGamepad(GamepadIndex, 0.2f, 0.5f, 150);
        }
        
        // Open menu on Start
        if (_input.IsGamepadButtonPressed(GamepadIndex, GamepadButton.Start))
        {
            Logger.LogInformation("Menu opened");
        }
    }

    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(new Color(20, 20, 30));
        
        // Draw player
        _renderer.DrawRectangleFilled(
            _playerPosition.X - 16,
            _playerPosition.Y - 16,
            32, 32,
            Color.Blue);
        
        // Draw instructions
        if (_input.IsGamepadConnected(GamepadIndex))
        {
            var name = _input.GetGamepadName(GamepadIndex);
            _renderer.DrawText($"Controller: {name}", 10, 10, Color.White);
            _renderer.DrawText("Left Stick: Move", 10, 30, Color.White);
            _renderer.DrawText("A: Jump", 10, 50, Color.White);
            _renderer.DrawText("X: Shoot", 10, 70, Color.White);
            _renderer.DrawText("Start: Menu", 10, 90, Color.White);
            
            // Show stick positions
            var leftStick = _input.GetGamepadLeftStick(GamepadIndex);
            var rightStick = _input.GetGamepadRightStick(GamepadIndex);
            _renderer.DrawText($"Left Stick: ({leftStick.X:F2}, {leftStick.Y:F2})", 
                10, 120, Color.White);
            _renderer.DrawText($"Right Stick: ({rightStick.X:F2}, {rightStick.Y:F2})", 
                10, 140, Color.White);
            
            // Show triggers
            var leftTrigger = _input.GetGamepadLeftTrigger(GamepadIndex);
            var rightTrigger = _input.GetGamepadRightTrigger(GamepadIndex);
            _renderer.DrawText($"Triggers: L:{leftTrigger:F2} R:{rightTrigger:F2}", 
                10, 160, Color.White);
        }
        else
        {
            _renderer.DrawText("No gamepad connected!", 10, 10, Color.Red);
            _renderer.DrawText("Please connect a controller", 10, 30, Color.White);
        }
    }
}
~~~

---

## Best Practices

### DO

1. **Check gamepad connection**
   ~~~csharp
   // ✅ Good - check before use
   if (_input.IsGamepadConnected(0))
   {
       var input = _input.GetGamepadLeftStick(0);
   }
   ~~~

2. **Apply dead zones**
   ~~~csharp
   // ✅ Good - prevent stick drift
   var stick = _input.GetGamepadLeftStick(0);
   if (stick.Length() > 0.15f)
   {
       // Use input
   }
   ~~~

3. **Normalize diagonal stick input**
   ~~~csharp
   // ✅ Good - consistent speed
   var stick = _input.GetGamepadLeftStick(0);
   if (stick.Length() > 0.15f)
   {
       stick = Vector2.Normalize(stick);
   }
   ~~~

4. **Use appropriate button states**
   ~~~csharp
   // ✅ Good - continuous action
   if (_input.IsGamepadButtonDown(0, GamepadButton.A))
   {
       ChargeAttack();
   }
   
   // ✅ Good - single action
   if (_input.IsGamepadButtonPressed(0, GamepadButton.A))
   {
       Jump();
   }
   ~~~

5. **Support multiple control schemes**
   ~~~csharp
   // ✅ Good - keyboard OR gamepad
   var moveInput = Vector2.Zero;
   
   if (_input.IsGamepadConnected(0))
   {
       moveInput = _input.GetGamepadLeftStick(0);
   }
   else
   {
       if (_input.IsKeyDown(Keys.W)) moveInput.Y -= 1;
       if (_input.IsKeyDown(Keys.S)) moveInput.Y += 1;
       if (_input.IsKeyDown(Keys.A)) moveInput.X -= 1;
       if (_input.IsKeyDown(Keys.D)) moveInput.X += 1;
   }
   ~~~

### DON'T

1. **Don't forget connection checks**
   ~~~csharp
   // ❌ Bad - crashes if not connected!
   var input = _input.GetGamepadLeftStick(0);
   
   // ✅ Good - check first
   if (_input.IsGamepadConnected(0))
   {
       var input = _input.GetGamepadLeftStick(0);
   }
   ~~~

2. **Don't use pressed for continuous actions**
   ~~~csharp
   // ❌ Bad - only moves one frame
   if (_input.IsGamepadButtonPressed(0, GamepadButton.A))
   {
       MoveForward();
   }
   
   // ✅ Good - moves while held
   if (_input.IsGamepadButtonDown(0, GamepadButton.A))
   {
       MoveForward();
   }
   ~~~

3. **Don't ignore dead zones**
   ~~~csharp
   // ❌ Bad - stick drift causes movement
   var stick = _input.GetGamepadLeftStick(0);
   _position += stick * speed * deltaTime;
   
   // ✅ Good - apply dead zone
   var stick = _input.GetGamepadLeftStick(0);
   if (stick.Length() > 0.15f)
   {
       _position += stick * speed * deltaTime;
   }
   ~~~

4. **Don't overuse rumble**
   ~~~csharp
   // ❌ Bad - rumbles 60 times per second!
   protected override void OnUpdate(GameTime gameTime)
   {
       _input.RumbleGamepad(0, 1.0f, 1.0f, 100);
   }
   
   // ✅ Good - rumble on events
   if (_input.IsGamepadButtonPressed(0, GamepadButton.X))
   {
       _input.RumbleGamepad(0, 0.3f, 0.5f, 150);
   }
   ~~~

---

## Troubleshooting

### Problem: Gamepad not detected

**Symptom:** `IsGamepadConnected()` returns false.

**Solutions:**

1. **Check SDL3 input is registered:**
   ~~~csharp
   // In Program.cs
   builder.Services.AddSDL3Input(); // Required!
   ~~~

2. **Verify gamepad is actually connected:**
   - Check USB connection
   - Try different USB port
   - Test gamepad in other applications

3. **Check gamepad index:**
   ~~~csharp
   // Try all indices
   for (int i = 0; i < 4; i++)
   {
       if (_input.IsGamepadConnected(i))
       {
           Logger.LogInformation("Gamepad {Index} found", i);
       }
   }
   ~~~

---

### Problem: Stick drift

**Symptom:** Character moves without touching stick.

**Solution:** Apply dead zone:

~~~csharp
const float DeadZone = 0.15f; // 15%

var stick = _input.GetGamepadLeftStick(0);
if (stick.Length() < DeadZone)
{
    stick = Vector2.Zero; // Ignore small movements
}
~~~

---

### Problem: Diagonal movement faster

**Symptom:** Moving diagonally is faster than cardinal directions.

**Solution:** Normalize stick input:

~~~csharp
var stick = _input.GetGamepadLeftStick(0);

if (stick.Length() > 0.15f)
{
    // Normalize to prevent faster diagonal movement
    if (stick.Length() > 1.0f)
    {
        stick = Vector2.Normalize(stick);
    }
}

_position += stick * speed * deltaTime;
~~~

---

### Problem: Rumble not working

**Symptom:** No vibration feedback.

**Solutions:**

1. **Check gamepad supports rumble:**
   ~~~csharp
   // Not all gamepads support rumble
   // Xbox and PlayStation controllers do
   ~~~

2. **Verify gamepad is connected:**
   ~~~csharp
   if (_input.IsGamepadConnected(0))
   {
       _input.RumbleGamepad(0, 0.5f, 0.5f, 500);
   }
   ~~~

3. **Check duration:**
   ~~~csharp
   // Duration too short might not be noticeable
   _input.RumbleGamepad(0, 0.5f, 0.5f, 100); // Minimum ~100ms
   ~~~

---

### Problem: Wrong button mapping

**Symptom:** Buttons don't match expected layout.

**Solution:** SDL3 uses standard mapping (Xbox layout):

~~~csharp
// Xbox Layout:
// A = Bottom button
// B = Right button  
// X = Left button
// Y = Top button

// PlayStation equivalents:
// A = Cross (X)
// B = Circle (O)
// X = Square (□)
// Y = Triangle (△)

// Nintendo equivalents (different!):
// A = Right button (B)
// B = Bottom button (A)
// X = Top button (Y)
// Y = Left button (X)
~~~

---

## Platform Differences

### Controller Layouts

| Layout | A | B | X | Y |
|--------|---|---|---|---|
| **Xbox** | Bottom | Right | Left | Top |
| **PlayStation** | Cross | Circle | Square | Triangle |
| **Nintendo** | Right | Bottom | Top | Left |

**Note:** SDL3 uses Xbox layout regardless of physical controller.

---

### Button Prompts

Show correct prompts based on controller:

~~~csharp
public class ButtonPrompts
{
    private readonly IInputService _input;

    public string GetJumpPrompt(int gamepadIndex)
    {
        var name = _input.GetGamepadName(gamepadIndex);
        
        if (name.Contains("Xbox", StringComparison.OrdinalIgnoreCase))
        {
            return "A";
        }
        else if (name.Contains("PlayStation", StringComparison.OrdinalIgnoreCase) ||
                 name.Contains("DualShock", StringComparison.OrdinalIgnoreCase) ||
                 name.Contains("DualSense", StringComparison.OrdinalIgnoreCase))
        {
            return "✕"; // Cross
        }
        else if (name.Contains("Nintendo", StringComparison.OrdinalIgnoreCase) ||
                 name.Contains("Switch", StringComparison.OrdinalIgnoreCase))
        {
            return "B";
        }
        else
        {
            return "A"; // Default to Xbox
        }
    }
}
~~~

---

## Summary

**Gamepad components:**

| Component | Method | Range |
|-----------|--------|-------|
| **Left Stick** | `GetGamepadLeftStick()` | -1.0 to 1.0 (X, Y) |
| **Right Stick** | `GetGamepadRightStick()` | -1.0 to 1.0 (X, Y) |
| **Left Trigger** | `GetGamepadLeftTrigger()` | 0.0 to 1.0 |
| **Right Trigger** | `GetGamepadRightTrigger()` | 0.0 to 1.0 |
| **Buttons** | `IsGamepadButton___()` | bool |

**Button states:**

| Method | Usage | Example |
|--------|-------|---------|
| `IsGamepadButtonDown()` | Button held | Charge attack, accelerate |
| `IsGamepadButtonPressed()` | Button just pressed | Jump, shoot, select |
| `IsGamepadButtonReleased()` | Button just released | Release charged attack |

**Common buttons:**

| Button | Xbox | PlayStation | Nintendo |
|--------|------|-------------|----------|
| **A** | A | Cross (✕) | B |
| **B** | B | Circle (○) | A |
| **X** | X | Square (□) | Y |
| **Y** | Y | Triangle (△) | X |
| **LB** | LB | L1 | L |
| **RB** | RB | R1 | R |
| **LT** | LT | L2 | ZL |
| **RT** | RT | R2 | ZR |

**Dead zone:** Recommended 0.15 (15%) to prevent drift

**Rumble:** `RumbleGamepad(index, low, high, ms)`

---

## Next Steps

- **[Keyboard Input](keyboard.md)** - Keyboard input handling
- **[Mouse Input](mouse.md)** - Mouse and cursor control
- **[Input Layers](layers.md)** - Priority-based input
- **[First Game](../../getting-started/first-game.md)** - Build a complete game

---

## Quick Reference

~~~csharp
// Inject input service
public GameScene(IInputService input, ...) : base(...)
{
    _input = input;
}

// Check connection
if (_input.IsGamepadConnected(0))
{
    var name = _input.GetGamepadName(0);
}

// Buttons
if (_input.IsGamepadButtonDown(0, GamepadButton.A))     // Held
if (_input.IsGamepadButtonPressed(0, GamepadButton.A))  // Just pressed
if (_input.IsGamepadButtonReleased(0, GamepadButton.A)) // Just released

// Analog sticks
var leftStick = _input.GetGamepadLeftStick(0);   // Movement
var rightStick = _input.GetGamepadRightStick(0); // Camera

// Dead zone
if (leftStick.Length() > 0.15f)
{
    _position += leftStick * speed * deltaTime;
}

// Triggers
var leftTrigger = _input.GetGamepadLeftTrigger(0);   // 0.0 to 1.0
var rightTrigger = _input.GetGamepadRightTrigger(0); // 0.0 to 1.0

// D-Pad
if (_input.IsGamepadButtonPressed(0, GamepadButton.DPadUp))

// Rumble
_input.RumbleGamepad(0, lowFreq: 0.5f, highFreq: 0.5f, durationMs: 200);

// Stop rumble
_input.StopGamepadRumble(0);

// Multiple gamepads
for (int i = 0; i < 4; i++)
{
    if (_input.IsGamepadConnected(i))
    {
        UpdatePlayer(i, gameTime);
    }
}
~~~

---

Ready to learn about input layers? Check out [Input Layers](layers.md)!