---
title: Input Layers
description: Priority-based input routing to prevent UI and game from receiving input simultaneously
---

# Input Layers

Master priority-based input routing to handle UI overlays, pause menus, and complex input scenarios in Brine2D.

## 📖 Overview

**Input Layers** solve a common problem: when a player clicks a button on a pause menu, the game world shouldn't also react to that click!

Brine2D's `InputLayerManager` routes input through **priority-based layers**:
- ✅ **UI Layer** (Priority 1000) - Menus, dialogs, HUD
- ✅ **Game Layer** (Priority 0) - Game world, player controls
- ✅ **Input consumption** - Higher priority layers can block lower ones
- ✅ **Automatic routing** - No manual checks needed

~~~mermaid
graph TB
    A["Player Input<br/>(Keyboard/Mouse)"] --> B["InputLayerManager"]
    
    B --> C["Layer 1: UI Canvas<br/>(Priority 1000)"]
    C -->|"Consumed?<br/>YES"| D["Stop<br/>(Game doesn't see input)"]
    C -->|"Consumed?<br/>NO"| E["Layer 2: Game<br/>(Priority 0)"]
    
    E --> F["Game Handles Input"]

    style A fill:#4a3d1f,stroke:#ce9178,stroke-width:2px,color:#fff
    style B fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C fill:#1e3a5f,stroke:#569cd6,stroke-width:2px,color:#fff
    style D fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style E fill:#3d3d2a,stroke:#dcdcaa,stroke-width:2px,color:#fff
    style F fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
~~~

**Example Scenario:**
1. Player opens pause menu (UI layer)
2. Player clicks "Resume" button
3. UI layer **consumes** the click (handles it)
4. Game layer **never sees** the click (doesn't spawn units, shoot, etc.)

---

## 🎯 Prerequisites

- ✅ [Keyboard Input](keyboard.md) - Basic input handling
- ✅ [Mouse Input](mouse.md) - Mouse handling
- ✅ [Scenes](../../concepts/scenes.md) - Scene structure

---

## 🚀 Quick Example

### Problem: UI Clicks Affect Game

~~~csharp
// ❌ BAD - Both UI and game handle the same click!
protected override void OnUpdate(GameTime gameTime)
{
    // UI handles click
    if (_input.IsMouseButtonPressed(MouseButton.Left))
    {
        CheckButtonClicked(); // Button clicked!
    }
    
    // Game ALSO handles same click!
    if (_input.IsMouseButtonPressed(MouseButton.Left))
    {
        SpawnUnitAtMouse(); // Oops! Spawned unit under button!
    }
}
~~~

### Solution: Input Layers

~~~csharp InputLayerExample.cs
using Brine2D.Core;
using Brine2D.Input;
using Brine2D.Rendering;
using Brine2D.UI;
using Microsoft.Extensions.Logging;

public class InputLayerScene : Scene
{
    private readonly IInputService _input;
    private readonly InputLayerManager _inputLayerManager;
    private readonly UICanvas _uiCanvas;
    private readonly IRenderer _renderer;
    
    public InputLayerScene(
        IInputService input,
        InputLayerManager inputLayerManager,
        UICanvas uiCanvas,
        IRenderer renderer,
        ILogger<InputLayerScene> logger
    ) : base(logger)
    {
        _input = input;
        _inputLayerManager = inputLayerManager;
        _uiCanvas = uiCanvas;
        _renderer = renderer;
    }
    
    protected override void OnInitialize()
    {
        // Register UI layer (high priority)
        _inputLayerManager.RegisterLayer(_uiCanvas);
        
        // Add a button
        var button = new UIButton("Click Me", new Vector2(100, 100), new Vector2(150, 50));
        button.OnClick += () => Logger.LogInformation("Button clicked!");
        _uiCanvas.Add(button);
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Process input through layers
        _inputLayerManager.ProcessInput();
        
        // ✅ GOOD - Only handle game input if NOT consumed by UI
        if (!_inputLayerManager.MouseConsumed)
        {
            if (_input.IsMouseButtonPressed(MouseButton.Left))
            {
                SpawnUnitAtMouse(); // Only spawns if NOT clicking UI!
            }
        }
        
        if (!_inputLayerManager.KeyboardConsumed)
        {
            HandleGameKeyboard(); // Only if UI isn't typing
        }
    }
}
~~~

**Result:** Clicking button doesn't affect game world! 🎯

---

## 🏗️ Setup

### 1. Register Service

~~~csharp Program.cs
using Brine2D.Hosting;
using Brine2D.Input;
using Brine2D.UI;

var builder = GameApplication.CreateBuilder(args);

// Add input layer manager
builder.Services.AddInputLayerManager();

// Add UI canvas (implements IInputLayer)
builder.Services.AddSingleton<UICanvas>();

// ... other services ...

var game = builder.Build();
await game.RunAsync<MyScene>();
~~~

---

### 2. Inject Dependencies

~~~csharp MyScene.cs
public class MyScene : Scene
{
    private readonly IInputService _input;
    private readonly InputLayerManager _layerManager;
    private readonly UICanvas _uiCanvas;
    
    public MyScene(
        IInputService input,
        InputLayerManager layerManager,
        UICanvas uiCanvas,
        ILogger<MyScene> logger
    ) : base(logger)
    {
        _input = input;
        _layerManager = layerManager;
        _uiCanvas = uiCanvas;
    }
}
~~~

---

### 3. Register Layers

~~~csharp
protected override void OnInitialize()
{
    // Register UI layer (priority 1000)
    _layerManager.RegisterLayer(_uiCanvas);
    
    // Can register custom layers too
    // _layerManager.RegisterLayer(myCustomLayer);
}
~~~

---

### 4. Process Input Every Frame

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    // IMPORTANT: Call this BEFORE checking input!
    _layerManager.ProcessInput();
    
    // Now safe to check consumption
    if (!_layerManager.MouseConsumed)
    {
        HandleGameMouseInput();
    }
    
    if (!_layerManager.KeyboardConsumed)
    {
        HandleGameKeyboardInput();
    }
}
~~~

---

## 🎛️ Input Layer Interface

### IInputLayer

Implement this interface to create custom layers:

~~~csharp
public interface IInputLayer
{
    /// <summary>
    /// Priority (higher = processed first).
    /// UI = 1000, Game = 0
    /// </summary>
    int Priority { get; }
    
    /// <summary>
    /// Process keyboard input.
    /// Return TRUE to consume (block lower layers).
    /// </summary>
    bool ProcessKeyboardInput(IInputService input);
    
    /// <summary>
    /// Process mouse input.
    /// Return TRUE to consume (block lower layers).
    /// </summary>
    bool ProcessMouseInput(IInputService input);
}
~~~

---

### Priority System

| Priority | Layer Type | Example |
|----------|------------|---------|
| **1000+** | Critical UI | Modal dialogs, error messages |
| **1000** | UI | Menus, HUD, buttons |
| **500** | Overlay | Console, debug menu |
| **0** | Game | Player controls, world interaction |
| **-1000** | Background | Always processes (logging, etc.) |

**Rule:** Higher priority = processed first, can block lower priorities.

---

## 🎯 Consumption Flags

### Check Consumption

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    _layerManager.ProcessInput();
    
    // Check if keyboard was consumed
    if (_layerManager.KeyboardConsumed)
    {
        // UI is typing, don't handle game keyboard
        return;
    }
    
    // Check if mouse was consumed
    if (_layerManager.MouseConsumed)
    {
        // UI is clicking, don't handle game mouse
        return;
    }
    
    // Safe to process game input
    HandleGameInput();
}
~~~

---

### When Input is Consumed

**Keyboard consumed when:**
- Text input field is focused
- Dropdown is open (arrow keys)
- Dialog is active (Enter/Escape)

**Mouse consumed when:**
- Hovering over button
- Dragging slider
- Clicking checkbox
- Scrolling in UI element

---

## 🎮 Common Patterns

### Pattern 1: Game with UI Overlay

~~~csharp
public class GameWithUIScene : Scene
{
    private readonly IInputService _input;
    private readonly InputLayerManager _layerManager;
    private readonly UICanvas _uiCanvas;
    
    private Vector2 _playerPosition = new Vector2(400, 300);
    
    protected override void OnInitialize()
    {
        // Register UI layer
        _layerManager.RegisterLayer(_uiCanvas);
        
        // Add pause button
        var pauseBtn = new UIButton("Pause", new Vector2(10, 10), new Vector2(100, 40));
        pauseBtn.OnClick += TogglePause;
        _uiCanvas.Add(pauseBtn);
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Process layers
        _layerManager.ProcessInput();
        
        // Only handle game input if UI didn't consume it
        if (!_layerManager.KeyboardConsumed)
        {
            HandlePlayerMovement(gameTime);
        }
        
        if (!_layerManager.MouseConsumed)
        {
            HandleWorldClicks();
        }
    }
    
    private void HandlePlayerMovement(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        var movement = Vector2.Zero;
        
        if (_input.IsKeyDown(Keys.W)) movement.Y -= 1;
        if (_input.IsKeyDown(Keys.S)) movement.Y += 1;
        if (_input.IsKeyDown(Keys.A)) movement.X -= 1;
        if (_input.IsKeyDown(Keys.D)) movement.X += 1;
        
        if (movement != Vector2.Zero)
        {
            movement = Vector2.Normalize(movement);
            _playerPosition += movement * 200f * deltaTime;
        }
    }
}
~~~

---

### Pattern 2: Pause Menu

~~~csharp
public class PauseMenuLayer : IInputLayer
{
    private readonly IInputService _input;
    private bool _isPaused = false;
    
    public int Priority => 2000; // Higher than normal UI
    
    public bool ProcessKeyboardInput(IInputService input)
    {
        // Toggle pause on Escape
        if (input.IsKeyPressed(Keys.Escape))
        {
            _isPaused = !_isPaused;
        }
        
        // Consume ALL keyboard when paused
        return _isPaused;
    }
    
    public bool ProcessMouseInput(IInputService input)
    {
        // Consume ALL mouse when paused
        return _isPaused;
    }
}

// Register it:
protected override void OnInitialize()
{
    var pauseLayer = new PauseMenuLayer(_input);
    _layerManager.RegisterLayer(pauseLayer);
}
~~~

---

### Pattern 3: Console Overlay

~~~csharp
public class DebugConsoleLayer : IInputLayer
{
    private bool _consoleOpen = false;
    
    public int Priority => 500; // Between UI and game
    
    public bool ProcessKeyboardInput(IInputService input)
    {
        // Toggle with ~ key
        if (input.IsKeyPressed(Keys.Grave))
        {
            _consoleOpen = !_consoleOpen;
            return true; // Consume the ~ key
        }
        
        // Consume all keyboard if console is open
        if (_consoleOpen)
        {
            HandleConsoleInput(input);
            return true;
        }
        
        return false; // Don't consume if closed
    }
    
    public bool ProcessMouseInput(IInputService input)
    {
        // Console doesn't use mouse
        return false;
    }
}
~~~

---

### Pattern 4: Multiple UI Layers

~~~csharp
protected override void OnInitialize()
{
    // Layer 1: Modal dialog (highest priority)
    var dialogLayer = new DialogLayer();
    _layerManager.RegisterLayer(dialogLayer); // Priority: 2000
    
    // Layer 2: Main UI
    _layerManager.RegisterLayer(_uiCanvas); // Priority: 1000
    
    // Layer 3: Game
    var gameLayer = new GameInputLayer();
    _layerManager.RegisterLayer(gameLayer); // Priority: 0
}

// Processing order:
// 1. Dialog (if active, blocks everything else)
// 2. Main UI (if clicking buttons, blocks game)
// 3. Game (only if neither dialog nor UI consumed input)
~~~

---

## 🛠️ Custom Input Layer

### Create Custom Layer

~~~csharp CustomLayer.cs
using Brine2D.Input;
using System.Numerics;

public class GameInputLayer : IInputLayer
{
    private readonly IInputService _input;
    private readonly Action<Vector2> _onWorldClick;
    
    public int Priority => 0; // Game priority
    
    public GameInputLayer(IInputService input, Action<Vector2> onWorldClick)
    {
        _input = input;
        _onWorldClick = onWorldClick;
    }
    
    public bool ProcessKeyboardInput(IInputService input)
    {
        // Game doesn't consume keyboard (allows other layers to see it)
        return false;
    }
    
    public bool ProcessMouseInput(IInputService input)
    {
        if (input.IsMouseButtonPressed(MouseButton.Left))
        {
            var mousePos = input.MousePosition;
            _onWorldClick?.Invoke(mousePos);
            
            // Don't consume - allow lower layers (if any)
            return false;
        }
        
        return false;
    }
}
~~~

---

### Use Custom Layer

~~~csharp
protected override void OnInitialize()
{
    // Create custom game layer
    var gameLayer = new GameInputLayer(_input, OnWorldClick);
    _layerManager.RegisterLayer(gameLayer);
    
    // Also register UI layer
    _layerManager.RegisterLayer(_uiCanvas);
}

private void OnWorldClick(Vector2 position)
{
    Logger.LogInformation("Clicked world at: {Pos}", position);
}
~~~

---

## 🎯 Advanced Techniques

### Conditional Consumption

Only consume input under certain conditions:

~~~csharp
public class ConditionalUILayer : IInputLayer
{
    private readonly UICanvas _canvas;
    private bool _isMenuOpen = false;
    
    public int Priority => 1000;
    
    public bool ProcessKeyboardInput(IInputService input)
    {
        // Only consume if menu is open
        if (!_isMenuOpen)
            return false;
        
        // Handle menu keyboard
        // ...
        
        return true; // Consume
    }
    
    public bool ProcessMouseInput(IInputService input)
    {
        // Only consume if actually hovering UI
        var mousePos = input.MousePosition;
        bool hoveringUI = IsMouseOverUI(mousePos);
        
        if (hoveringUI)
        {
            // Handle UI click
            return true; // Consume
        }
        
        return false; // Don't consume, game can handle
    }
}
~~~

---

### Dynamic Priority

Change priority at runtime:

~~~csharp
public class DynamicPriorityLayer : IInputLayer
{
    private int _priority = 0;
    
    public int Priority => _priority;
    
    public void SetPriority(int priority)
    {
        _priority = priority;
        // Re-sort layers (not automatic - would need manager support)
    }
    
    // ... ProcessInput methods ...
}
~~~

---

### Input Recording

Log all input through layers:

~~~csharp
public class InputRecorderLayer : IInputLayer
{
    private readonly ILogger _logger;
    
    public int Priority => -1000; // Lowest (always processes)
    
    public bool ProcessKeyboardInput(IInputService input)
    {
        // Log keyboard input (for replay/debug)
        // ...
        
        return false; // Never consume (always pass through)
    }
    
    public bool ProcessMouseInput(IInputService input)
    {
        // Log mouse input
        // ...
        
        return false; // Never consume
    }
}
~~~

---

## 🐛 Troubleshooting

### Problem: Game Still Receives UI Clicks

**Symptom:** Clicking button also spawns unit

**Solutions:**

1. **Check ProcessInput is called**
   ~~~csharp
   protected override void OnUpdate(GameTime gameTime)
   {
       // ❌ Forgot this!
       // _layerManager.ProcessInput();
       
       // ✅ Call it FIRST
       _layerManager.ProcessInput();
       
       if (!_layerManager.MouseConsumed)
       {
           HandleGameInput();
       }
   }
   ~~~

2. **Check consumption flag**
   ~~~csharp
   // ❌ Bad - ignores consumption
   if (_input.IsMouseButtonPressed(MouseButton.Left))
   {
       SpawnUnit();
   }
   
   // ✅ Good - respects consumption
   if (!_layerManager.MouseConsumed && 
       _input.IsMouseButtonPressed(MouseButton.Left))
   {
       SpawnUnit();
   }
   ~~~

3. **Verify layer is registered**
   ~~~csharp
   protected override void OnInitialize()
   {
       _layerManager.RegisterLayer(_uiCanvas); // Don't forget!
   }
   ~~~

---

### Problem: UI Not Consuming Input

**Symptom:** UI layer doesn't block game input

**Solution:** Ensure UICanvas returns true when appropriate:

~~~csharp
// UICanvas.ProcessMouseInput should return true when:
// - Hovering over button
// - Clicking UI element
// - Dragging slider
// etc.

public bool ProcessMouseInput(IInputService input)
{
    HandleButtonInput();
    // ... other UI handling ...
    
    bool isInteractingWithUI = 
        _hoveredButton != null || 
        _pressedButton != null || 
        _activeSlider?.IsDragging == true;
    
    return isInteractingWithUI; // TRUE = consume
}
~~~

---

### Problem: Text Input Leaks to Game

**Symptom:** Typing "W" in textbox also moves player

**Solution:** UICanvas consumes ALL keyboard when focused:

~~~csharp
public bool ProcessKeyboardInput(IInputService input)
{
    // If text input is focused, consume ALL keyboard
    if (_focusedTextInput != null && _focusedTextInput.IsFocused)
    {
        HandleTextInputKeyboard();
        return true; // Block game from seeing ANY keys
    }
    
    return false;
}
~~~

---

## ✅ Best Practices

### DO

1. **Always call ProcessInput first**
   ~~~csharp
   protected override void OnUpdate(GameTime gameTime)
   {
       _layerManager.ProcessInput(); // First!
       
       if (!_layerManager.KeyboardConsumed)
       {
           // Game keyboard
       }
   }
   ~~~

2. **Check consumption flags**
   ~~~csharp
   if (!_layerManager.MouseConsumed)
   {
       HandleGameMouse();
   }
   ~~~

3. **Use appropriate priorities**
   - Critical UI: 2000+
   - Normal UI: 1000
   - Game: 0
   - Background: -1000

4. **Return true when consuming**
   ~~~csharp
   public bool ProcessKeyboardInput(IInputService input)
   {
       if (ShouldBlockGameInput())
       {
           return true; // Consume
       }
       
       return false; // Pass through
   }
   ~~~

5. **Unregister layers when done**
   ~~~csharp
   protected override Task OnUnloadAsync(CancellationToken ct)
   {
       _layerManager.UnregisterLayer(_myLayer);
       return Task.CompletedTask;
   }
   ~~~

### DON'T

1. **Don't forget ProcessInput**
   ~~~csharp
   // ❌ Bad
   protected override void OnUpdate(GameTime gameTime)
   {
       // Forgot _layerManager.ProcessInput();
       
       if (_input.IsKeyDown(Keys.W)) // Wrong!
   }
   ~~~

2. **Don't check input before ProcessInput**
   ~~~csharp
   // ❌ Bad order
   if (_input.IsMouseButtonPressed(MouseButton.Left)) // Too early!
       SpawnUnit();
   
   _layerManager.ProcessInput(); // Too late!
   
   // ✅ Good order
   _layerManager.ProcessInput(); // First
   
   if (!_layerManager.MouseConsumed && 
       _input.IsMouseButtonPressed(MouseButton.Left))
       SpawnUnit();
   ~~~

3. **Don't ignore consumption flags**
   ~~~csharp
   // ❌ Bad
   if (_input.IsKeyDown(Keys.W))
       MovePlayer(); // Moves even when typing!
   
   // ✅ Good
   if (!_layerManager.KeyboardConsumed && 
       _input.IsKeyDown(Keys.W))
       MovePlayer();
   ~~~

4. **Don't hardcode priorities**
   ~~~csharp
   // ❌ Bad
   public int Priority => 1237; // Magic number!
   
   // ✅ Good
   public const int UI_PRIORITY = 1000;
   public int Priority => UI_PRIORITY;
   ~~~

---

## 📊 Summary

| Concept | Purpose |
|---------|---------|
| **Input Layer** | Object that processes input at a priority |
| **InputLayerManager** | Routes input through layers by priority |
| **Priority** | Higher values = processed first |
| **Consumption** | Returning true = block lower layers |
| **KeyboardConsumed** | Check before handling game keyboard |
| **MouseConsumed** | Check before handling game mouse |

**Typical Priorities:**
- Dialog/Modal: **2000**
- UI/Menu: **1000**
- Game: **0**
- Background: **-1000**

---

## 🔗 Next Steps

- **[UI Components](../ui/buttons.md)** - Build interactive UI
- **[Text Input](text-input.md)** - Handle text fields
- **[Player Movement](../mechanics/movement.md)** - Implement player controls
- **[Pause Menu](../ui/menus.md)** - Create pause/menu systems

---

Ready to build UI? Check out [UI Components](../ui/buttons.md)! 🎛️✨