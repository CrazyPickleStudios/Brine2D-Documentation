---
title: Keyboard Input
description: Handle keyboard input in Brine2D - key presses, combinations, and text input
---

# Keyboard Input

Learn how to handle keyboard input in your Brine2D games.

## Overview

Brine2D's keyboard input system provides:

- **Key States** - Down, pressed, released
- **All Keys** - Full keyboard support
- **Text Input** - Character input for text fields
- **Modifier Keys** - Shift, Ctrl, Alt detection
- **Key Combinations** - Multi-key input
- **Input Layers** - Priority-based input handling

**Powered by:** SDL3 input system

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

## Key States

### IsKeyDown

Check if key is currently held down:

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    // Continuous movement while key held
    if (_input.IsKeyDown(Keys.W))
    {
        _playerY -= _speed * (float)gameTime.DeltaTime;
    }
    
    if (_input.IsKeyDown(Keys.S))
    {
        _playerY += _speed * (float)gameTime.DeltaTime;
    }
    
    if (_input.IsKeyDown(Keys.A))
    {
        _playerX -= _speed * (float)gameTime.DeltaTime;
    }
    
    if (_input.IsKeyDown(Keys.D))
    {
        _playerX += _speed * (float)gameTime.DeltaTime;
    }
}
~~~

**Use for:**
- Continuous actions (movement, holding)
- Repeated actions while held
- Analog-style input

---

### IsKeyPressed

Check if key was just pressed this frame:

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    // Jump only once per press
    if (_input.IsKeyPressed(Keys.Space))
    {
        Jump();
    }
    
    // Shoot once per press
    if (_input.IsKeyPressed(Keys.X))
    {
        Shoot();
    }
    
    // Toggle pause
    if (_input.IsKeyPressed(Keys.Escape))
    {
        TogglePause();
    }
}
~~~

**Use for:**
- Single actions (jump, shoot, interact)
- Menu navigation
- Toggle actions
- One-time events

---

### IsKeyReleased

Check if key was just released this frame:

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    // Charge attack - release to fire
    if (_input.IsKeyDown(Keys.Space))
    {
        _chargeTime += (float)gameTime.DeltaTime;
    }
    
    if (_input.IsKeyReleased(Keys.Space))
    {
        FireChargedAttack(_chargeTime);
        _chargeTime = 0f;
    }
}
~~~

**Use for:**
- Charge mechanics
- Hold-and-release actions
- Detecting key up events

---

## Key State Diagram

~~~mermaid
stateDiagram-v2
    [*] --> KeyUp: Initial state
    
    KeyUp --> KeyPressed: Key pressed
    KeyPressed --> KeyDown: Next frame
    
    KeyDown --> KeyDown: Key held
    KeyDown --> KeyReleased: Key released
    
    KeyReleased --> KeyUp: Next frame
    KeyUp --> KeyUp: Key not pressed
    
    note right of KeyPressed
        IsKeyPressed() = true
        IsKeyDown() = true
    end note
    
    note right of KeyDown
        IsKeyPressed() = false
        IsKeyDown() = true
    end note
    
    note right of KeyReleased
        IsKeyPressed() = false
        IsKeyDown() = false
        IsKeyReleased() = true
    end note
    
    note right of KeyUp
        IsKeyPressed() = false
        IsKeyDown() = false
        IsKeyReleased() = false
    end note
~~~

---

## Available Keys

### Letter Keys

~~~csharp
Keys.A, Keys.B, Keys.C, ... Keys.Z
~~~

---

### Number Keys

~~~csharp
// Top row numbers
Keys.D1, Keys.D2, Keys.D3, ... Keys.D0

// Numpad
Keys.Numpad1, Keys.Numpad2, ... Keys.Numpad0
~~~

---

### Function Keys

~~~csharp
Keys.F1, Keys.F2, Keys.F3, ... Keys.F12
~~~

---

### Arrow Keys

~~~csharp
Keys.Up, Keys.Down, Keys.Left, Keys.Right
~~~

---

### Modifier Keys

~~~csharp
Keys.LeftShift, Keys.RightShift
Keys.LeftCtrl, Keys.RightCtrl
Keys.LeftAlt, Keys.RightAlt
Keys.LeftSuper, Keys.RightSuper  // Windows/Command key
~~~

---

### Special Keys

~~~csharp
// Common
Keys.Space
Keys.Enter
Keys.Escape
Keys.Backspace
Keys.Tab

// Navigation
Keys.Home, Keys.End
Keys.PageUp, Keys.PageDown
Keys.Insert, Keys.Delete

// Punctuation
Keys.Comma, Keys.Period
Keys.Slash, Keys.Backslash
Keys.Semicolon, Keys.Quote
Keys.LeftBracket, Keys.RightBracket
Keys.Minus, Keys.Equals

// Lock keys
Keys.CapsLock
Keys.NumLock
Keys.ScrollLock
~~~

---

## Common Patterns

### Movement (WASD)

~~~csharp
public class PlayerMovement
{
    private readonly IInputService _input;
    private Vector2 _position;
    private readonly float _speed = 200f;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        var direction = Vector2.Zero;
        
        // WASD movement
        if (_input.IsKeyDown(Keys.W)) direction.Y -= 1;
        if (_input.IsKeyDown(Keys.S)) direction.Y += 1;
        if (_input.IsKeyDown(Keys.A)) direction.X -= 1;
        if (_input.IsKeyDown(Keys.D)) direction.X += 1;
        
        // Normalize diagonal movement
        if (direction != Vector2.Zero)
        {
            direction = Vector2.Normalize(direction);
        }
        
        _position += direction * _speed * deltaTime;
    }
}
~~~

---

### Movement (Arrow Keys)

~~~csharp
public class PlayerMovement
{
    private readonly IInputService _input;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        var direction = Vector2.Zero;
        
        // Arrow key movement
        if (_input.IsKeyDown(Keys.Up)) direction.Y -= 1;
        if (_input.IsKeyDown(Keys.Down)) direction.Y += 1;
        if (_input.IsKeyDown(Keys.Left)) direction.X -= 1;
        if (_input.IsKeyDown(Keys.Right)) direction.X += 1;
        
        if (direction != Vector2.Zero)
        {
            direction = Vector2.Normalize(direction);
        }
        
        _position += direction * _speed * deltaTime;
    }
}
~~~

---

### Jump

~~~csharp
public class PlayerJump
{
    private readonly IInputService _input;
    private bool _isGrounded;
    private Vector2 _velocity;
    private const float JumpForce = 500f;

    public void Update(GameTime gameTime)
    {
        // Jump only when grounded
        if (_input.IsKeyPressed(Keys.Space) && _isGrounded)
        {
            _velocity.Y = -JumpForce;
            _isGrounded = false;
        }
    }
}
~~~

---

### Shooting

~~~csharp
public class PlayerShooting
{
    private readonly IInputService _input;
    private float _shootCooldown;
    private const float ShootDelay = 0.2f;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Update cooldown
        if (_shootCooldown > 0)
        {
            _shootCooldown -= deltaTime;
        }
        
        // Shoot on key press if ready
        if (_input.IsKeyPressed(Keys.X) && _shootCooldown <= 0)
        {
            Shoot();
            _shootCooldown = ShootDelay;
        }
    }
    
    private void Shoot()
    {
        // Create projectile
    }
}
~~~

---

### Sprint

~~~csharp
public class PlayerSprint
{
    private readonly IInputService _input;
    private readonly float _walkSpeed = 200f;
    private readonly float _sprintSpeed = 400f;

    public float GetCurrentSpeed()
    {
        // Sprint when Shift held
        return _input.IsKeyDown(Keys.LeftShift) 
            ? _sprintSpeed 
            : _walkSpeed;
    }
}
~~~

---

## Modifier Keys

### Shift Detection

~~~csharp
public class ShiftModifier
{
    private readonly IInputService _input;

    public bool IsShiftHeld()
    {
        return _input.IsKeyDown(Keys.LeftShift) || 
               _input.IsKeyDown(Keys.RightShift);
    }
    
    public void Update()
    {
        if (IsShiftHeld())
        {
            // Sprint, run, or alternate action
        }
    }
}
~~~

---

### Ctrl Detection

~~~csharp
public class CtrlModifier
{
    private readonly IInputService _input;

    public bool IsCtrlHeld()
    {
        return _input.IsKeyDown(Keys.LeftCtrl) || 
               _input.IsKeyDown(Keys.RightCtrl);
    }
    
    public void Update()
    {
        // Ctrl+S = Save
        if (IsCtrlHeld() && _input.IsKeyPressed(Keys.S))
        {
            SaveGame();
        }
        
        // Ctrl+L = Load
        if (IsCtrlHeld() && _input.IsKeyPressed(Keys.L))
        {
            LoadGame();
        }
    }
}
~~~

---

### Alt Detection

~~~csharp
public class AltModifier
{
    private readonly IInputService _input;

    public bool IsAltHeld()
    {
        return _input.IsKeyDown(Keys.LeftAlt) || 
               _input.IsKeyDown(Keys.RightAlt);
    }
    
    public void Update()
    {
        // Alt+Enter = Toggle fullscreen
        if (IsAltHeld() && _input.IsKeyPressed(Keys.Enter))
        {
            ToggleFullscreen();
        }
    }
}
~~~

---

## Key Combinations

### Multiple Keys

~~~csharp
public class KeyCombos
{
    private readonly IInputService _input;

    public void Update()
    {
        // Ctrl+Shift+D = Debug mode
        if (IsCtrlHeld() && IsShiftHeld() && _input.IsKeyPressed(Keys.D))
        {
            ToggleDebugMode();
        }
        
        // Alt+F4 = Quit
        if (IsAltHeld() && _input.IsKeyPressed(Keys.F4))
        {
            QuitGame();
        }
    }
    
    private bool IsCtrlHeld()
    {
        return _input.IsKeyDown(Keys.LeftCtrl) || 
               _input.IsKeyDown(Keys.RightCtrl);
    }
    
    private bool IsShiftHeld()
    {
        return _input.IsKeyDown(Keys.LeftShift) || 
               _input.IsKeyDown(Keys.RightShift);
    }
    
    private bool IsAltHeld()
    {
        return _input.IsKeyDown(Keys.LeftAlt) || 
               _input.IsKeyDown(Keys.RightAlt);
    }
}
~~~

---

### Cheat Codes

Sequential key presses:

~~~csharp
public class CheatCodeDetector
{
    private readonly IInputService _input;
    private readonly Keys[] _konamiCode = 
    {
        Keys.Up, Keys.Up,
        Keys.Down, Keys.Down,
        Keys.Left, Keys.Right,
        Keys.Left, Keys.Right,
        Keys.B, Keys.A
    };
    
    private int _currentIndex = 0;
    private float _timeout = 0f;
    private const float ResetTime = 2.0f;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Update timeout
        if (_timeout > 0)
        {
            _timeout -= deltaTime;
            if (_timeout <= 0)
            {
                _currentIndex = 0; // Reset on timeout
            }
        }
        
        // Check next key in sequence
        var expectedKey = _konamiCode[_currentIndex];
        if (_input.IsKeyPressed(expectedKey))
        {
            _currentIndex++;
            _timeout = ResetTime;
            
            // Check if code complete
            if (_currentIndex >= _konamiCode.Length)
            {
                ActivateCheat();
                _currentIndex = 0;
            }
        }
        else if (HasAnyKeyPressed())
        {
            _currentIndex = 0; // Wrong key, reset
        }
    }
    
    private bool HasAnyKeyPressed()
    {
        // Check if any key was pressed
        // (Implementation depends on IInputService capabilities)
        return false;
    }
}
~~~

---

## Menu Navigation

~~~csharp
public class MenuController
{
    private readonly IInputService _input;
    private int _selectedIndex = 0;
    private readonly int _menuItemCount;

    public void Update()
    {
        // Navigate up
        if (_input.IsKeyPressed(Keys.Up) || 
            _input.IsKeyPressed(Keys.W))
        {
            _selectedIndex--;
            if (_selectedIndex < 0)
            {
                _selectedIndex = _menuItemCount - 1; // Wrap
            }
        }
        
        // Navigate down
        if (_input.IsKeyPressed(Keys.Down) || 
            _input.IsKeyPressed(Keys.S))
        {
            _selectedIndex++;
            if (_selectedIndex >= _menuItemCount)
            {
                _selectedIndex = 0; // Wrap
            }
        }
        
        // Select
        if (_input.IsKeyPressed(Keys.Enter) || 
            _input.IsKeyPressed(Keys.Space))
        {
            SelectMenuItem(_selectedIndex);
        }
        
        // Back
        if (_input.IsKeyPressed(Keys.Escape))
        {
            GoBack();
        }
    }
}
~~~

---

## Rebindable Controls

~~~csharp
public class KeyBindings
{
    private readonly Dictionary<string, Keys> _bindings = new()
    {
        ["MoveUp"] = Keys.W,
        ["MoveDown"] = Keys.S,
        ["MoveLeft"] = Keys.A,
        ["MoveRight"] = Keys.D,
        ["Jump"] = Keys.Space,
        ["Shoot"] = Keys.X,
        ["Interact"] = Keys.E
    };

    public Keys GetBinding(string action)
    {
        return _bindings.TryGetValue(action, out var key) ? key : Keys.Unknown;
    }

    public void SetBinding(string action, Keys key)
    {
        _bindings[action] = key;
    }

    public void ResetToDefaults()
    {
        _bindings["MoveUp"] = Keys.W;
        _bindings["MoveDown"] = Keys.S;
        _bindings["MoveLeft"] = Keys.A;
        _bindings["MoveRight"] = Keys.D;
        _bindings["Jump"] = Keys.Space;
        _bindings["Shoot"] = Keys.X;
        _bindings["Interact"] = Keys.E;
    }
}

// Usage
public class PlayerController
{
    private readonly IInputService _input;
    private readonly KeyBindings _bindings;

    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        var direction = Vector2.Zero;
        
        // Use bindings instead of hardcoded keys
        if (_input.IsKeyDown(_bindings.GetBinding("MoveUp")))
            direction.Y -= 1;
        if (_input.IsKeyDown(_bindings.GetBinding("MoveDown")))
            direction.Y += 1;
        if (_input.IsKeyDown(_bindings.GetBinding("MoveLeft")))
            direction.X -= 1;
        if (_input.IsKeyDown(_bindings.GetBinding("MoveRight")))
            direction.X += 1;
        
        if (_input.IsKeyPressed(_bindings.GetBinding("Jump")))
        {
            Jump();
        }
    }
}
~~~

---

## Input Buffering

Buffer inputs for more responsive controls:

~~~csharp
public class InputBuffer
{
    private readonly Dictionary<Keys, float> _buffer = new();
    private const float BufferTime = 0.15f; // 150ms buffer

    public void Update(IInputService input, GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Add pressed keys to buffer
        if (input.IsKeyPressed(Keys.Space))
        {
            _buffer[Keys.Space] = BufferTime;
        }
        
        // Decay buffer times
        var keysToRemove = new List<Keys>();
        foreach (var key in _buffer.Keys.ToList())
        {
            _buffer[key] -= deltaTime;
            if (_buffer[key] <= 0)
            {
                keysToRemove.Add(key);
            }
        }
        
        foreach (var key in keysToRemove)
        {
            _buffer.Remove(key);
        }
    }

    public bool IsInBuffer(Keys key)
    {
        return _buffer.ContainsKey(key);
    }

    public void Consume(Keys key)
    {
        _buffer.Remove(key);
    }
}

// Usage for jump buffering
public class PlayerJump
{
    private readonly InputBuffer _buffer;

    public void Update(GameTime gameTime)
    {
        _buffer.Update(_input, gameTime);
        
        // Check buffered jump when landing
        if (JustLanded() && _buffer.IsInBuffer(Keys.Space))
        {
            Jump();
            _buffer.Consume(Keys.Space);
        }
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

public class KeyboardDemoScene : Scene
{
    private readonly IInputService _input;
    private readonly IRenderer _renderer;
    
    private Vector2 _playerPosition = new(400, 300);
    private readonly float _speed = 200f;
    private bool _isRunning = false;

    public KeyboardDemoScene(
        IInputService input,
        IRenderer renderer,
        ILogger<KeyboardDemoScene> logger) : base(logger)
    {
        _input = input;
        _renderer = renderer;
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Sprint with Shift
        _isRunning = _input.IsKeyDown(Keys.LeftShift);
        var currentSpeed = _isRunning ? _speed * 2f : _speed;
        
        // WASD movement
        var direction = Vector2.Zero;
        if (_input.IsKeyDown(Keys.W)) direction.Y -= 1;
        if (_input.IsKeyDown(Keys.S)) direction.Y += 1;
        if (_input.IsKeyDown(Keys.A)) direction.X -= 1;
        if (_input.IsKeyDown(Keys.D)) direction.X += 1;
        
        // Normalize diagonal movement
        if (direction != Vector2.Zero)
        {
            direction = Vector2.Normalize(direction);
        }
        
        _playerPosition += direction * currentSpeed * deltaTime;
        
        // Actions on key press
        if (_input.IsKeyPressed(Keys.Space))
        {
            Logger.LogInformation("Jump!");
        }
        
        if (_input.IsKeyPressed(Keys.X))
        {
            Logger.LogInformation("Shoot!");
        }
        
        // Debug toggles
        if (_input.IsKeyDown(Keys.LeftCtrl) && 
            _input.IsKeyPressed(Keys.D))
        {
            Logger.LogInformation("Debug mode toggled");
        }
    }

    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(new Color(20, 20, 30));
        
        // Draw player
        var color = _isRunning ? Color.Red : Color.Blue;
        _renderer.DrawRectangleFilled(
            _playerPosition.X - 16,
            _playerPosition.Y - 16,
            32, 32,
            color);
        
        // Draw instructions
        _renderer.DrawText("WASD: Move", 10, 10, Color.White);
        _renderer.DrawText("Shift: Sprint", 10, 30, Color.White);
        _renderer.DrawText("Space: Jump", 10, 50, Color.White);
        _renderer.DrawText("X: Shoot", 10, 70, Color.White);
        _renderer.DrawText("Ctrl+D: Debug", 10, 90, Color.White);
    }
}
~~~

---

## Best Practices

### DO

1. **Use appropriate key state**
   ~~~csharp
   // ✅ Good - continuous movement
   if (_input.IsKeyDown(Keys.W))
   {
       MoveForward(deltaTime);
   }
   
   // ✅ Good - single action
   if (_input.IsKeyPressed(Keys.Space))
   {
       Jump();
   }
   ~~~

2. **Normalize diagonal movement**
   ~~~csharp
   // ✅ Good - consistent speed in all directions
   if (direction != Vector2.Zero)
   {
       direction = Vector2.Normalize(direction);
   }
   _position += direction * speed * deltaTime;
   ~~~

3. **Use deltaTime for movement**
   ~~~csharp
   // ✅ Good - frame-rate independent
   _position += velocity * (float)gameTime.DeltaTime;
   ~~~

4. **Support multiple keys**
   ~~~csharp
   // ✅ Good - WASD and arrow keys
   if (_input.IsKeyDown(Keys.W) || _input.IsKeyDown(Keys.Up))
   {
       MoveUp();
   }
   ~~~

5. **Make controls rebindable**
   ~~~csharp
   // ✅ Good - use key bindings
   var jumpKey = _bindings.GetBinding("Jump");
   if (_input.IsKeyPressed(jumpKey))
   {
       Jump();
   }
   ~~~

### DON'T

1. **Don't use IsKeyPressed for continuous actions**
   ~~~csharp
   // ❌ Bad - only moves one frame
   if (_input.IsKeyPressed(Keys.W))
   {
       _position.Y -= speed * deltaTime;
   }
   
   // ✅ Good - moves while held
   if (_input.IsKeyDown(Keys.W))
   {
       _position.Y -= speed * deltaTime;
   }
   ~~~

2. **Don't forget deltaTime**
   ~~~csharp
   // ❌ Bad - frame-rate dependent
   if (_input.IsKeyDown(Keys.W))
   {
       _position.Y -= speed;
   }
   
   // ✅ Good - frame-rate independent
   if (_input.IsKeyDown(Keys.W))
   {
       _position.Y -= speed * deltaTime;
   }
   ~~~

3. **Don't forget diagonal normalization**
   ~~~csharp
   // ❌ Bad - moves faster diagonally
   if (_input.IsKeyDown(Keys.W)) _velocity.Y = -1;
   if (_input.IsKeyDown(Keys.D)) _velocity.X = 1;
   // Diagonal: sqrt(1² + 1²) = 1.41 (41% faster!)
   
   // ✅ Good - consistent speed
   if (direction != Vector2.Zero)
   {
       direction = Vector2.Normalize(direction);
   }
   ~~~

4. **Don't hardcode keys everywhere**
   ~~~csharp
   // ❌ Bad - hard to rebind
   if (_input.IsKeyDown(Keys.W)) { ... }
   
   // ✅ Good - use bindings
   if (_input.IsKeyDown(_bindings.GetBinding("MoveUp"))) { ... }
   ~~~

---

## Troubleshooting

### Problem: Keys not responding

**Symptom:** Key presses don't register.

**Solutions:**

1. **Check input service is injected:**
   ~~~csharp
   public GameScene(IInputService input, ...) : base(...)
   {
       _input = input; // Store it!
   }
   ~~~

2. **Verify SDL3 input is registered:**
   ~~~csharp
   // In Program.cs
   builder.Services.AddSDL3Input(); // Required!
   ~~~

3. **Check input is polled in Update:**
   ~~~csharp
   protected override void OnUpdate(GameTime gameTime)
   {
       // Must be in Update, not Render!
       if (_input.IsKeyDown(Keys.Space)) { ... }
   }
   ~~~

---

### Problem: Movement too fast/slow

**Symptom:** Player moves incorrectly.

**Solution:** Use deltaTime:

~~~csharp
// ✅ Correct
_position += velocity * (float)gameTime.DeltaTime;

// ❌ Wrong
_position += velocity; // Speed depends on FPS!
~~~

---

### Problem: Diagonal movement faster

**Symptom:** Moving diagonally is 41% faster.

**Solution:** Normalize direction vector:

~~~csharp
var direction = GetInputDirection();
if (direction != Vector2.Zero)
{
    direction = Vector2.Normalize(direction); // Fix!
}
_position += direction * speed * deltaTime;
~~~

---

### Problem: Action repeats unexpectedly

**Symptom:** Jump/shoot happens multiple times.

**Solution:** Use IsKeyPressed, not IsKeyDown:

~~~csharp
// ❌ Wrong - repeats every frame
if (_input.IsKeyDown(Keys.Space))
{
    Jump(); // Jumps 60 times per second!
}

// ✅ Correct - once per press
if (_input.IsKeyPressed(Keys.Space))
{
    Jump(); // Jumps once
}
~~~

---

## Summary

**Key states:**

| Method | Usage | Example |
|--------|-------|---------|
| `IsKeyDown()` | Key currently held | Movement, sprint |
| `IsKeyPressed()` | Key just pressed | Jump, shoot, toggle |
| `IsKeyReleased()` | Key just released | Charge attacks |

**Common patterns:**

| Pattern | Keys | Code |
|---------|------|------|
| **WASD Movement** | W/A/S/D | `IsKeyDown()` + deltaTime |
| **Jump** | Space | `IsKeyPressed()` when grounded |
| **Sprint** | Shift | `IsKeyDown()` modifier |
| **Menu Navigate** | Arrow/Enter | `IsKeyPressed()` |

**Key groups:**

| Group | Keys |
|-------|------|
| **Movement** | WASD, Arrow keys |
| **Modifiers** | Shift, Ctrl, Alt |
| **Actions** | Space, Enter, E, X |
| **Numbers** | D1-D0, Numpad1-0 |
| **Function** | F1-F12 |

---

## Next Steps

- **[Mouse Input](mouse.md)** - Handle mouse input
- **[Gamepad Input](gamepad.md)** - Controller support
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

// Check key states
if (_input.IsKeyDown(Keys.W))        // Held down
if (_input.IsKeyPressed(Keys.Space)) // Just pressed
if (_input.IsKeyReleased(Keys.X))    // Just released

// WASD movement
var direction = Vector2.Zero;
if (_input.IsKeyDown(Keys.W)) direction.Y -= 1;
if (_input.IsKeyDown(Keys.S)) direction.Y += 1;
if (_input.IsKeyDown(Keys.A)) direction.X -= 1;
if (_input.IsKeyDown(Keys.D)) direction.X += 1;

// Normalize diagonal movement
if (direction != Vector2.Zero)
{
    direction = Vector2.Normalize(direction);
}

// Apply movement with deltaTime
_position += direction * speed * (float)gameTime.DeltaTime;

// Modifier keys
var isShiftHeld = _input.IsKeyDown(Keys.LeftShift) || 
                  _input.IsKeyDown(Keys.RightShift);

// Key combinations
if (IsCtrlHeld() && _input.IsKeyPressed(Keys.S))
{
    SaveGame();
}
~~~

---

Ready to learn about mouse input? Check out [Mouse Input](mouse.md)!