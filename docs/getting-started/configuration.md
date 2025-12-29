---
title: Configuration
description: Configure Brine2D with JSON files and code-based options
---

# Configuration

Brine2D uses **JSON-based configuration** just like ASP.NET Core. Settings are loaded from `gamesettings.json` and can be bound to strongly-typed option classes.

## The ASP.NET Way

If you've used ASP.NET Core, this will be instantly familiar:

| ASP.NET Core | Brine2D | Purpose |
|--------------|---------|---------|
| `appsettings.json` | `gamesettings.json` | Main configuration file |
| `appsettings.Development.json` | `gamesettings.Development.json` | Environment-specific settings |
| `IOptions<T>` | `IOptions<RenderingOptions>` | Strongly-typed configuration |
| `builder.Configuration` | `builder.Configuration` | Configuration API |

## Quick Example

```csharp
// Load from gamesettings.json
builder.Services.AddSDL3Rendering(options =>
{
    builder.Configuration.GetSection("Rendering").Bind(options);
});

// Or configure in code
builder.Services.AddSDL3Rendering(options =>
{
    options.WindowTitle = "My Game";
    options.WindowWidth = 1920;
    options.WindowHeight = 1080;
    options.VSync = true;
});
```

---

## The `gamesettings.json` File

Create a `gamesettings.json` file in your project root:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Brine2D": "Debug",
      "Brine2D.Rendering": "Information",
      "Brine2D.Input": "Warning"
    }
  },
  "Rendering": {
    "WindowTitle": "My Brine2D Game",
    "WindowWidth": 1280,
    "WindowHeight": 720,
    "Fullscreen": false,
    "VSync": true,
    "Resizable": true,
    "Backend": "GPU",
    "PreferredGPUDriver": null
  }
}
```

### Make Sure It's Copied to Output

Update your `.csproj` to copy the file:

```xml
<ItemGroup>
  <None Update="gamesettings.json">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>
```

---

## Configuration Sections

### Logging

Controls logging output for different parts of the engine.

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Brine2D": "Debug",
      "Brine2D.Rendering": "Information",
      "Brine2D.Input": "Warning",
      "Brine2D.Audio": "Information",
      "Microsoft": "Warning"
    }
  }
}
```

**Log Levels:**
- `Trace` - Very detailed, for deep debugging
- `Debug` - Detailed debugging information
- `Information` - General informational messages
- `Warning` - Warning messages
- `Error` - Error messages
- `Critical` - Critical failures
- `None` - No logging

**Example Usage:**

```csharp
builder.Logging.SetMinimumLevel(LogLevel.Debug);
builder.Logging.AddConsole();
builder.Logging.AddDebug(); // Visual Studio Output window
```

---

### Rendering

Controls window and rendering settings.

```json
{
  "Rendering": {
    "WindowTitle": "My Game",
    "WindowWidth": 1280,
    "WindowHeight": 720,
    "Fullscreen": false,
    "VSync": true,
    "Resizable": true,
    "Backend": "GPU",
    "PreferredGPUDriver": "Vulkan"
  }
}
```

#### Options:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `WindowTitle` | `string` | `"Brine2D Game"` | Window title text |
| `WindowWidth` | `int` | `1280` | Window width in pixels |
| `WindowHeight` | `int` | `720` | Window height in pixels |
| `Fullscreen` | `bool` | `false` | Start in fullscreen mode |
| `VSync` | `bool` | `true` | Enable vertical sync |
| `Resizable` | `bool` | `true` | Allow window resizing |
| `Backend` | `string` | `"GPU"` | Graphics backend: `"GPU"`, `"LegacyRenderer"`, or `"Auto"` |
| `PreferredGPUDriver` | `string?` | `null` | GPU driver: `"Vulkan"`, `"Metal"`, `"D3D11"`, `"D3D12"`, or `null` (auto) |

#### Graphics Backends:

- **`GPU`** - Modern SDL3 GPU API (recommended)
  - Supports Vulkan, Metal, D3D11, D3D12
  - Better performance
  - Cross-platform shader system
  
- **`LegacyRenderer`** - SDL3's traditional 2D renderer
  - More compatible with older hardware
  - Simpler API
  - Faster startup

- **`Auto`** - Automatically selects GPU if available, falls back to Legacy

#### GPU Drivers:

If using `Backend: "GPU"`, you can specify a preferred driver:

```json
{
  "Rendering": {
    "Backend": "GPU",
    "PreferredGPUDriver": "Vulkan"
  }
}
```

- **`null` (default)** - Auto-select best driver for platform
- **`Vulkan`** - Windows, Linux, Android
- **`Metal`** - macOS, iOS
- **`D3D11`** - Windows (older GPUs)
- **`D3D12`** - Windows (modern GPUs)

---

## Environment-Specific Configuration

Just like ASP.NET, you can have different settings per environment.

### File Structure:

```
MyGame/
├── gamesettings.json              # Base settings
├── gamesettings.Development.json  # Development overrides
├── gamesettings.Production.json   # Production overrides
└── Program.cs
```

### Example: Development Settings

**`gamesettings.Development.json`:**

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Brine2D": "Trace"
    }
  },
  "Rendering": {
    "WindowTitle": "My Game [DEV]",
    "VSync": false
  }
}
```

### Set the Environment:

```bash
# Windows (PowerShell)
$env:DOTNET_ENVIRONMENT = "Development"
dotnet run

# Linux/macOS
DOTNET_ENVIRONMENT=Development dotnet run
```

Or in Visual Studio, set it in **Project Properties > Debug > Environment Variables**.

---

## Code-Based Configuration

You can configure options entirely in code:

```csharp
using Brine2D.Hosting;
using Brine2D.Rendering.SDL;

var builder = GameApplication.CreateBuilder(args);

// Method 1: Inline configuration
builder.Services.AddSDL3Rendering(options =>
{
    options.WindowTitle = "My Game";
    options.WindowWidth = 1920;
    options.WindowHeight = 1080;
    options.Fullscreen = true;
    options.VSync = true;
    options.Backend = GraphicsBackend.GPU;
    options.PreferredGPUDriver = "Vulkan";
});

// Method 2: Bind from configuration
builder.Services.AddSDL3Rendering(options =>
{
    builder.Configuration.GetSection("Rendering").Bind(options);
    
    // Override specific values
    options.WindowTitle = "Overridden Title";
});

// Method 3: Mix both
builder.Services.AddSDL3Rendering(options =>
{
    // Load base from JSON
    builder.Configuration.GetSection("Rendering").Bind(options);
    
    // Override based on logic
    if (args.Contains("--fullscreen"))
    {
        options.Fullscreen = true;
    }
});
```

---

## Accessing Configuration in Scenes

You can inject `IConfiguration` or `IOptions<T>` into your scenes:

```csharp
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

public class GameScene : Scene
{
    private readonly IConfiguration _configuration;
    private readonly RenderingOptions _renderingOptions;
    
    public GameScene(
        IConfiguration configuration,
        IOptions<RenderingOptions> renderingOptions,
        ILogger<GameScene> logger
    ) : base(logger)
    {
        _configuration = configuration;
        _renderingOptions = renderingOptions.Value;
    }
    
    protected override void OnInitialize()
    {
        // Access configuration
        var windowTitle = _configuration["Rendering:WindowTitle"];
        
        // Access strongly-typed options
        var width = _renderingOptions.WindowWidth;
        var height = _renderingOptions.WindowHeight;
        
        Logger.LogInformation("Window: {Title} ({Width}x{Height})", 
            windowTitle, width, height);
    }
}
```

---

## Custom Configuration Sections

You can add your own configuration sections:

### 1. Define Your Options Class

```csharp
public class GameplayOptions
{
    public const string SectionName = "Gameplay";
    
    public int StartingLives { get; set; } = 3;
    public float PlayerSpeed { get; set; } = 200f;
    public bool EnableCheats { get; set; } = false;
    public string Difficulty { get; set; } = "Normal";
}
```

### 2. Add to `gamesettings.json`

```json
{
  "Gameplay": {
    "StartingLives": 5,
    "PlayerSpeed": 250.0,
    "EnableCheats": false,
    "Difficulty": "Hard"
  }
}
```

### 3. Register and Use

```csharp
// Register in Program.cs
builder.Services.Configure<GameplayOptions>(
    builder.Configuration.GetSection(GameplayOptions.SectionName)
);

// Inject into scene
public class GameScene : Scene
{
    private readonly GameplayOptions _gameplay;
    
    public GameScene(
        IOptions<GameplayOptions> gameplay,
        ILogger<GameScene> logger
    ) : base(logger)
    {
        _gameplay = gameplay.Value;
    }
    
    protected override void OnInitialize()
    {
        Logger.LogInformation("Starting with {Lives} lives at {Difficulty} difficulty", 
            _gameplay.StartingLives, _gameplay.Difficulty);
    }
}
```

---

## Hot Reload

Configuration files support **hot reload** by default:

```csharp
// In GameApplicationBuilder, this is already set up:
Configuration.AddJsonFile("gamesettings.json", 
    optional: true, 
    reloadOnChange: true);  // ← Hot reload enabled
```

### Using `IOptionsMonitor` for Hot Reload

If you need to detect configuration changes at runtime:

```csharp
using Microsoft.Extensions.Options;

public class GameScene : Scene
{
    private readonly IOptionsMonitor<RenderingOptions> _renderingMonitor;
    
    public GameScene(
        IOptionsMonitor<RenderingOptions> renderingMonitor,
        ILogger<GameScene> logger
    ) : base(logger)
    {
        _renderingMonitor = renderingMonitor;
        
        // Subscribe to changes
        _renderingMonitor.OnChange(options =>
        {
            Logger.LogInformation("Configuration changed! New window size: {Width}x{Height}", 
                options.WindowWidth, options.WindowHeight);
        });
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Always get current value
        var currentOptions = _renderingMonitor.CurrentValue;
    }
}
```

---

## Command-Line Arguments

Override configuration with command-line arguments:

```bash
# Command-line args are already added by default in CreateBuilder
# They override JSON settings

# Run with:
dotnet run --Rendering:WindowWidth=1920 --Rendering:Fullscreen=true
```

### In `gamesettings.json`:
```json
{
  "Rendering": {
    "WindowWidth": 1280,
    "Fullscreen": false
  }
}
```

### Override via CLI:
```bash
dotnet run --Rendering:WindowWidth=1920 --Rendering:Fullscreen=true
```

Result: Window will be 1920 pixels wide and fullscreen.

---

## Configuration Providers

Brine2D uses Microsoft's configuration system, which supports multiple providers:

```csharp
var builder = GameApplication.CreateBuilder(args);

// JSON files (default)
builder.Configuration.AddJsonFile("gamesettings.json", optional: true, reloadOnChange: true);
builder.Configuration.AddJsonFile("secrets.json", optional: true);

// Environment variables
builder.Configuration.AddEnvironmentVariables(prefix: "GAME_");

// Command-line arguments (already added by default)
builder.Configuration.AddCommandLine(args);

// User secrets (for development)
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// In-memory values (for testing)
builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
{
    ["Rendering:WindowTitle"] = "Test Window"
});
```

**Priority Order** (last wins):
1. JSON files
2. Environment variables
3. Command-line arguments
4. In-memory overrides

---

## Common Patterns

### Pattern 1: Debug vs Release Settings

```csharp
builder.Services.AddSDL3Rendering(options =>
{
    builder.Configuration.GetSection("Rendering").Bind(options);
    
#if DEBUG
    options.WindowTitle += " [DEBUG]";
    options.VSync = false; // Better for debugging
#endif
});
```

### Pattern 2: Dynamic Resolution

```csharp
builder.Services.AddSDL3Rendering(options =>
{
    builder.Configuration.GetSection("Rendering").Bind(options);
    
    // Let user override via CLI
    if (args.Contains("--720p"))
    {
        options.WindowWidth = 1280;
        options.WindowHeight = 720;
    }
    else if (args.Contains("--1080p"))
    {
        options.WindowWidth = 1920;
        options.WindowHeight = 1080;
    }
});
```

### Pattern 3: Platform-Specific Settings

```csharp
builder.Services.AddSDL3Rendering(options =>
{
    builder.Configuration.GetSection("Rendering").Bind(options);
    
    // Auto-select best backend per platform
    if (OperatingSystem.IsWindows())
    {
        options.PreferredGPUDriver = "D3D12";
    }
    else if (OperatingSystem.IsMacOS())
    {
        options.PreferredGPUDriver = "Metal";
    }
    else if (OperatingSystem.IsLinux())
    {
        options.PreferredGPUDriver = "Vulkan";
    }
});
```

---

## Best Practices

### **DO: Use JSON for User-Configurable Settings**

Settings players might want to change (resolution, volume, graphics quality) should be in JSON.

### **DO: Use Code for Developer Settings**

Settings developers control (debug flags, profiling) can be in code.

### **DO: Validate Configuration**

```csharp
builder.Services.AddSDL3Rendering(options =>
{
    builder.Configuration.GetSection("Rendering").Bind(options);
    
    // Validate
    if (options.WindowWidth < 640 || options.WindowHeight < 480)
    {
        throw new InvalidOperationException("Window size too small!");
    }
});
```

### **DO: Use Strongly-Typed Options**

Avoid magic strings—create option classes for your settings.

### **DON'T: Hardcode Secrets**

Never put API keys, passwords, or tokens in `gamesettings.json` that gets committed to Git. Use **User Secrets** or environment variables.

### **DON'T: Reload Configuration Mid-Frame**

If you need to apply new settings (like resolution), do it between scenes, not during rendering.

---

## Example: Complete Configuration

**`gamesettings.json`:**

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Brine2D": "Debug"
    }
  },
  "Rendering": {
    "WindowTitle": "My Awesome Game",
    "WindowWidth": 1280,
    "WindowHeight": 720,
    "Fullscreen": false,
    "VSync": true,
    "Resizable": true,
    "Backend": "GPU",
    "PreferredGPUDriver": null
  },
  "Gameplay": {
    "StartingLives": 3,
    "PlayerSpeed": 200.0,
    "Difficulty": "Normal"
  }
}
```

**`Program.cs`:**

```csharp
using Brine2D.Hosting;
using Brine2D.Input.SDL;
using Brine2D.Rendering.SDL;

var builder = GameApplication.CreateBuilder(args);

// Configure rendering from JSON
builder.Services.AddSDL3Rendering(options =>
{
    builder.Configuration.GetSection("Rendering").Bind(options);
});

builder.Services.AddSDL3Input();

// Register custom options
builder.Services.Configure<GameplayOptions>(
    builder.Configuration.GetSection("Gameplay")
);

builder.Services.AddScene<GameScene>();

var game = builder.Build();
await game.RunAsync<GameScene>();
```

---

## Next Steps

- [Your First Game](first-game.md) - Build a complete game
- [Project Structure](project-structure.md) - Understanding the architecture
- [Scene Management](../concepts/scenes.md) - Deep dive into scenes
- [Logging Guide](../guides/logging.md) - Using `ILogger<T>` effectively

---

Configuration in Brine2D works exactly like ASP.NET—if you know one, you know the other!