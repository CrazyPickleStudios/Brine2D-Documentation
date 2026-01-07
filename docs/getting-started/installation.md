---
title: Installation
description: Install Brine2D and set up your development environment
---

# Installation

Get Brine2D installed and ready for game development in just a few minutes.

## Prerequisites

Before you begin, make sure you have:

- **[.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)** or later
- A code editor:
  - **[Visual Studio 2022](https://visualstudio.microsoft.com/)** (17.9+) - Full IDE with debugging
  - **[Visual Studio Code](https://code.visualstudio.com/)** - Lightweight with C# extension
  - **[JetBrains Rider](https://www.jetbrains.com/rider/)** - Cross-platform IDE
- **Basic C# knowledge** - Familiarity with C# and .NET

!!! tip "Verify .NET Installation"
    Open a terminal and run:
    ```bash
    dotnet --version
    ```
    You should see `10.0.x` or higher.

---

## Installation Methods

Choose the method that works best for you:

### Method 1: NuGet Package (Recommended)

The easiest way to get started. Perfect for most users.

**1. Create a new project:**

```bash
dotnet new console -n MyGame
cd MyGame
```

**2. Add Brine2D:**

```bash
dotnet add package Brine2D.Desktop --version
```

**3. Done!** You're ready to start coding.

---

### Method 2: Visual Studio (GUI)

If you prefer Visual Studio's interface:

**1. Create a new project:**

- File → New → Project
- Select **Console App** (.NET 10)
- Name it `MyGame`
- Click **Create**

**2. Add NuGet Package:**

- Right-click project → **Manage NuGet Packages**
- Click **Browse** tab
- Check **Include prerelease**
- Search for `Brine2D.Desktop`
- Click **Install**

**3. Done!** Start coding in `Program.cs`.

---

### Method 3: Building from Source

For contributors or users who want the latest development version:

**1. Clone the repository:**

```bash
git clone https://github.com/CrazyPickleStudios/Brine2D.git
cd Brine2D
```

**2. Build the solution:**

```bash
dotnet build
```

**3. Reference in your game project:**

Create your game project in a separate directory:

```bash
cd ..
dotnet new console -n MyGame
cd MyGame
```

Add project references:

```bash
dotnet add reference ../Brine2D/src/Brine2D.Core/Brine2D.Core.csproj
dotnet add reference ../Brine2D/src/Brine2D.Engine/Brine2D.Engine.csproj
dotnet add reference ../Brine2D/src/Brine2D.Hosting/Brine2D.Hosting.csproj
dotnet add reference ../Brine2D/src/Brine2D.Rendering.SDL/Brine2D.Rendering.SDL.csproj
dotnet add reference ../Brine2D/src/Brine2D.Input.SDL/Brine2D.Input.SDL.csproj
dotnet add reference ../Brine2D/src/Brine2D.Audio.SDL/Brine2D.Audio.SDL.csproj
dotnet add reference ../Brine2D/src/Brine2D.UI/Brine2D.UI.csproj
dotnet add reference ../Brine2D/src/Brine2D.ECS/Brine2D.ECS.csproj
```

---

## Package Options

Brine2D offers flexible package options depending on your needs:

### Brine2D.Desktop (Recommended)

**The all-in-one package.** Includes everything you need for desktop game development.

```bash
dotnet add package Brine2D.Desktop --version
```

**Includes:**

- ✅ Core abstractions (`Brine2D.Core`)
- ✅ Game engine (`Brine2D.Engine`)
- ✅ Hosting system (`Brine2D.Hosting`)
- ✅ Entity Component System (`Brine2D.ECS`)
- ✅ SDL3 rendering (`Brine2D.Rendering.SDL`)
- ✅ SDL3 input (`Brine2D.Input.SDL`)
- ✅ SDL3 audio (`Brine2D.Audio.SDL`)
- ✅ UI framework (`Brine2D.UI`)

**Perfect for:** 99% of users. Just install and start building!

---

### Individual Packages (Advanced)

For advanced users who want fine-grained control:

**Core Packages:**

```bash
# Core abstractions and types
dotnet add package Brine2D.Core

# Game loop, scene management, and transitions
dotnet add package Brine2D.Engine

# ASP.NET-style hosting
dotnet add package Brine2D.Hosting

# Entity Component System
dotnet add package Brine2D.ECS
```

**Abstraction Layers:**

```bash
# Rendering abstractions (IRenderer, ITexture, etc.)
dotnet add package Brine2D.Rendering

# Input abstractions (IInputService)
dotnet add package Brine2D.Input

# Audio abstractions (IAudioService)
dotnet add package Brine2D.Audio
```

**SDL3 Implementations:**

```bash
# SDL3 rendering backend
dotnet add package Brine2D.Rendering.SDL

# SDL3 input backend
dotnet add package Brine2D.Input.SDL

# SDL3 audio backend
dotnet add package Brine2D.Audio.SDL
```

**Extensions:**

```bash
# UI components (buttons, inputs, dialogs, tabs, etc.)
dotnet add package Brine2D.UI
```

**Use case:** Custom setups, plugin development, or minimal dependencies.

---

## Verify Installation

Let's verify everything is working correctly.

### 1. Create a Test Program

Replace your `Program.cs` with:

```csharp
using Brine2D.Core;
using Brine2D.Hosting;
using Brine2D.Input;
using Brine2D.Input.SDL;
using Brine2D.Rendering;
using Brine2D.Rendering.SDL;
using Microsoft.Extensions.Logging;

var builder = GameApplication.CreateBuilder(args);

builder.Services.AddSDL3Rendering(options =>
{
    options.WindowTitle = "Brine2D Installation Test";
    options.WindowWidth = 800;
    options.WindowHeight = 600;
});

builder.Services.AddSDL3Input();
builder.Services.AddScene<TestScene>();

var game = builder.Build();
await game.RunAsync<TestScene>();

public class TestScene : Scene
{
    private readonly IRenderer _renderer;
    private readonly IInputService _input;
    private readonly IGameContext _context;

    public TestScene(
        IRenderer renderer,
        IInputService input,
        IGameContext context,
        ILogger<TestScene> logger
    ) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _context = context;
    }

    protected override void OnRender(GameTime gameTime)
    {
        // Frame management happens automatically!
        _renderer.DrawRectangleFilled(350, 250, 100, 100, Color.White);
        _renderer.DrawText("Installation successful!", 250, 280, Color.White);
        _renderer.DrawText("Press ESC to exit", 280, 320, Color.White);
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Keys.Escape))
        {
            _context.RequestExit();
        }
    }
}
```

!!! tip Automatic Frame Management"
    Notice we don't call `Clear()`, `BeginFrame()`, or `EndFrame()` - the framework handles this automatically!

### 2. Run the Test

```bash
dotnet run
```

**Expected result:**

- A window opens with a blue background
- White square in the center
- Text: "Installation successful!"
- Pressing **ESC** closes the window

✅ **If you see this, Brine2D is installed correctly!**

---

## Troubleshooting

### "Could not find package Brine2D.Desktop"

**Solution:**
1. Make sure you're targeting .NET 10:
   
   ```xml
   <TargetFramework>net10.0</TargetFramework>
   ```

2. Include prerelease packages:
   
   ```bash
   dotnet add package Brine2D.Desktop --prerelease
   ```

3. Try restoring packages explicitly:
   
   ```bash
   dotnet restore
   ```

4. Check NuGet.org is accessible:
   
   ```bash
   dotnet nuget list source
   ```

---

### "SDL3 native libraries not found"

**Cause:** SDL3 native binaries aren't being copied to output.

**Solution:**

1. Clean and rebuild:
   
   ```bash
   dotnet clean
   dotnet build
   ```

2. Verify SDL3-CS packages are installed:
   
   ```bash
   dotnet list package
   ```
   
   You should see:

   - `SDL3-CS`
   - `SDL3-CS.Native`
   - `SDL3-CS.Native.TTF`
   - `SDL3-CS.Native.Image`
   - `SDL3-CS.Native.Mixer`

3. If issues persist, manually download SDL3 from [libsdl.org](https://libsdl.org) and place DLLs in your output directory.

---

### "Window doesn't appear" or "Black screen"

**Solution:**

1. Check logs for errors:
   
   ```bash
   dotnet run --verbosity normal
   ```

2. Frame management is automatic. If using manual control, make sure you're calling `BeginFrame()` and `EndFrame()`:
   
   ```csharp
   public override bool EnableAutomaticFrameManagement => false;
   
   protected override void OnRender(GameTime gameTime)
   {
       _renderer.Clear(Color.Black);
       _renderer.BeginFrame();
       
       // Your drawing code...
       
       _renderer.EndFrame();
   }
   ```

3. Verify graphics drivers are up to date.

---

### "Text renders as rectangles"

**Cause:** Default font isn't loading (rare).

**Solution:**

The embedded Roboto font should work automatically. If not:

1. Download a `.ttf` font (e.g., [Roboto Mono](https://fonts.google.com/specimen/Roboto+Mono))
2. Load it manually:

```csharp
protected override async Task OnLoadAsync(CancellationToken ct)
{
    var font = await _fontLoader.LoadFontAsync("path/to/font.ttf", 16, ct);
    _renderer.SetDefaultFont(font);
}
```

---

### ".NET 10 SDK not found"

**Solution:**

1. Download from [dotnet.microsoft.com](https://dotnet.microsoft.com/download/dotnet/10.0)
2. Install the SDK (not just the runtime)
3. Restart your terminal/IDE
4. Verify:
   
   ```bash
   dotnet --version
   ```

---

### Still Having Issues?

1. **Check GitHub Issues:** [github.com/CrazyPickleStudios/Brine2D/issues](https://github.com/CrazyPickleStudios/Brine2D/issues)
2. **Ask in Discussions:** [github.com/CrazyPickleStudios/Brine2D/discussions](https://github.com/CrazyPickleStudios/Brine2D/discussions)
3. **Create an issue:** Include:
   - OS and version
   - .NET SDK version
   - Full error message
   - Stack trace

---

## Platform-Specific Notes

### Windows

✅ **Fully supported** on Windows 10/11

No additional setup required. SDL3 native libraries are included via NuGet.

---

### Linux

⚠️ **Should work but untested**

SDL3 supports Linux, but we haven't tested Brine2D there yet.

**If you try it:**

1. Install .NET 10 SDK: [docs.microsoft.com/dotnet/core/install/linux](https://docs.microsoft.com/dotnet/core/install/linux)
2. Install SDL3 dependencies:
   
   ```bash
   # Ubuntu/Debian
   sudo apt-get install libsdl3-dev
   
   # Fedora
   sudo dnf install SDL3-devel
   ```

3. Let us know if it works! Open a discussion with your findings.

---

### macOS

⚠️ **Should work but untested**

SDL3 supports macOS, but we haven't tested Brine2D there yet.

**If you try it:**

1. Install .NET 10 SDK: [docs.microsoft.com/dotnet/core/install/macos](https://docs.microsoft.com/dotnet/core/install/macos)
2. Install SDL3 via Homebrew:
   
   ```bash
   brew install sdl3
   ```

3. Report your results! We'd love to hear from Mac users.

---

## Development Environment Setup

### Visual Studio 2022

**Recommended extensions:**

- **C# Dev Kit** (built-in)
- **GitHub Copilot** (optional, but helpful)
- **Hot Reload** (built-in, works great!)

**Settings:**

- Enable **Just My Code** for cleaner debugging
- Set **Output Verbosity** to `Normal` to see Brine2D logs

---

### Visual Studio Code

**Required extensions:**

1. [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit)
2. [C#](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)

**Recommended extensions:**

- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- [C# XML Documentation Comments](https://marketplace.visualstudio.com/items?itemName=k--kato.docomment)

**Launch configuration (`.vscode/launch.json`):**

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": ".NET Launch",
            "type": "coreclr",
            "request": "launch",
            "preLaunchTask": "build",
            "program": "${workspaceFolder}/bin/Debug/net10.0/MyGame.dll",
            "args": [],
            "cwd": "${workspaceFolder}",
            "console": "internalConsole",
            "stopAtEntry": false
        }
    ]
}
```

---

### JetBrains Rider

**Setup:**

- Rider 2024.1+ recommended
- .NET 10 SDK detected automatically
- NuGet restore happens on project open

**Tips:**

- Use **Run/Debug Configurations** for different scenes
- Enable **Hot Reload** for faster iteration
- Use **Solution-Wide Analysis** to catch issues early

---

## Next Steps

Now that Brine2D is installed:

1. **[Quick Start →](quickstart.md)** - Build your first game in 5 minutes
2. **[First Game →](first-game.md)** - Create a complete game with collision and scoring
3. **[FeatureDemos →](../samples/index.md)** - Explore 6 interactive demos showcasing features
4. **[Core Concepts →](../concepts/index.md)** - Deep dive into Brine2D's architecture

---

## Keeping Brine2D Updated

### Check for Updates

```bash
dotnet list package --outdated
```

### Update to Latest Version

```bash
dotnet add package Brine2D.Desktop
```

### Pre-release Versions

To use the latest pre-release (alpha/beta):

```bash
dotnet add package Brine2D.Desktop --prerelease
```

**Current version:** `0.5.0-beta`

---

## Uninstalling

To remove Brine2D from a project:

```bash
dotnet remove package Brine2D.Desktop
```

Clean up build artifacts:

```bash
dotnet clean
```

---

✅ **Installation complete!** Ready to build your first game? Head to the [Quick Start](quickstart.md) guide!