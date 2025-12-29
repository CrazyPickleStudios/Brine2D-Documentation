---
title: Guides Overview
description: Practical guides for building games with Brine2D
---

# Guides Overview

Welcome to the **Brine2D Guides**! These practical, task-focused tutorials will help you build real game features step-by-step.

## What You'll Learn

Guides are organized by feature area, each with complete working examples you can copy and adapt for your games.

---

## Guide Categories

### Getting Started

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Quick Start](getting-started/quick-start.md)** | Create your first game in 5 minutes | ⭐ Beginner |
| **[Project Structure](getting-started/project-structure.md)** | Organize your game project | ⭐ Beginner |
| **[Configuration](getting-started/configuration.md)** | Set up game settings and options | ⭐ Beginner |

---

### Input Handling

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Keyboard Input](input/keyboard.md)** | Handle keyboard controls | ⭐ Beginner |
| **[Mouse Input](input/mouse.md)** | Implement mouse interaction | ⭐ Beginner |
| **[Gamepad Support](input/gamepad.md)** | Add controller support | ⭐⭐ Intermediate |
| **[Input Layers](input/input-layers.md)** | Priority-based input routing | ⭐⭐ Intermediate |
| **[Text Input](input/text-input.md)** | Handle text fields and chat | ⭐⭐ Intermediate |

---

### Rendering & Graphics

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Drawing Basics](rendering/drawing-basics.md)** | Shapes, colors, and primitives | ⭐ Beginner |
| **[Loading Textures](rendering/textures.md)** | Load and display images | ⭐ Beginner |
| **[Sprite Rendering](rendering/sprites.md)** | Draw sprites and sprite sheets | ⭐ Beginner |
| **[Animation](rendering/animation.md)** | Create sprite animations | ⭐⭐ Intermediate |
| **[Camera System](rendering/camera.md)** | Implement camera movement | ⭐⭐ Intermediate |
| **[Text Rendering](rendering/text.md)** | Display text and fonts | ⭐ Beginner |
| **[Particle Effects](rendering/particles.md)** | Add visual effects | ⭐⭐⭐ Advanced |

---

### Audio & Sound

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Sound Effects](audio/sound-effects.md)** | Play sounds (jump, shoot, etc.) | ⭐ Beginner |
| **[Background Music](audio/music.md)** | Add looping music | ⭐ Beginner |
| **[Audio Mixing](audio/mixing.md)** | Control volume and balance | ⭐⭐ Intermediate |
| **[3D Audio](audio/spatial-audio.md)** | Position-based sound | ⭐⭐⭐ Advanced |

---

### Collision Detection

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Basic Collision](collision/basics.md)** | Rectangle and circle collision | ⭐ Beginner |
| **[Collision Response](collision/response.md)** | Bounce, slide, and push | ⭐⭐ Intermediate |
| **[Collision Layers](collision/layers.md)** | Selective collision filtering | ⭐⭐ Intermediate |
| **[Spatial Partitioning](collision/optimization.md)** | Optimize collision detection | ⭐⭐⭐ Advanced |

---

### Tilemaps & Levels

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Tiled Integration](tilemaps/tiled.md)** | Load Tiled JSON maps | ⭐⭐ Intermediate |
| **[Tilemap Rendering](tilemaps/rendering.md)** | Efficient tilemap drawing | ⭐⭐ Intermediate |
| **[Tilemap Collision](tilemaps/collision.md)** | Tile-based collision | ⭐⭐ Intermediate |
| **[Layer Management](tilemaps/layers.md)** | Background, foreground layers | ⭐⭐ Intermediate |

---

### UI & Menus

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Buttons](ui/buttons.md)** | Create clickable buttons | ⭐ Beginner |
| **[Labels & Text](ui/labels.md)** | Display UI text | ⭐ Beginner |
| **[Sliders](ui/sliders.md)** | Volume and setting sliders | ⭐⭐ Intermediate |
| **[Text Input](ui/text-input.md)** | Name entry, chat boxes | ⭐⭐ Intermediate |
| **[Dialogs](ui/dialogs.md)** | Modal popup windows | ⭐⭐ Intermediate |
| **[Menus](ui/menus.md)** | Main menu, pause menu | ⭐⭐ Intermediate |
| **[HUD](ui/hud.md)** | Health bars, score display | ⭐ Beginner |

---

### Game Mechanics

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Player Movement](mechanics/movement.md)** | WASD, 8-direction, smooth | ⭐ Beginner |
| **[Jump & Gravity](mechanics/jumping.md)** | Platformer physics | ⭐⭐ Intermediate |
| **[Shooting](mechanics/shooting.md)** | Projectile system | ⭐⭐ Intermediate |
| **[Enemy AI](mechanics/enemy-ai.md)** | Simple enemy behavior | ⭐⭐ Intermediate |
| **[Health System](mechanics/health.md)** | Damage and death | ⭐ Beginner |
| **[Inventory](mechanics/inventory.md)** | Item management | ⭐⭐⭐ Advanced |
| **[Save/Load](mechanics/save-load.md)** | Game state persistence | ⭐⭐⭐ Advanced |

---

### Architecture & Patterns

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Component System](architecture/components.md)** | Entity-component pattern | ⭐⭐⭐ Advanced |
| **[State Machines](architecture/state-machines.md)** | Manage game/entity states | ⭐⭐ Intermediate |
| **[Event System](architecture/events.md)** | Decouple with events | ⭐⭐ Intermediate |
| **[Object Pooling](architecture/pooling.md)** | Reduce allocations | ⭐⭐⭐ Advanced |

---

### Performance & Optimization

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Profiling](performance/profiling.md)** | Measure performance | ⭐⭐ Intermediate |
| **[Reducing Allocations](performance/gc.md)** | Minimize garbage collection | ⭐⭐⭐ Advanced |
| **[Draw Call Batching](performance/batching.md)** | Optimize rendering | ⭐⭐⭐ Advanced |
| **[Asset Streaming](performance/streaming.md)** | Load assets on demand | ⭐⭐⭐ Advanced |

---

### Testing & Debugging

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Unit Testing](testing/unit-tests.md)** | Test game logic | ⭐⭐ Intermediate |
| **[Debug Visualization](testing/debug-draw.md)** | Visualize collisions, paths | ⭐ Beginner |
| **[Logging](testing/logging.md)** | Effective log messages | ⭐ Beginner |
| **[Hot Reload](testing/hot-reload.md)** | Fast iteration | ⭐⭐ Intermediate |

---

### Packaging & Distribution

| Guide | Description | Difficulty |
|-------|-------------|------------|
| **[Publishing](packaging/publishing.md)** | Build release versions | ⭐⭐ Intermediate |
| **[Cross-Platform](packaging/cross-platform.md)** | Windows, Linux, macOS | ⭐⭐⭐ Advanced |
| **[Installers](packaging/installers.md)** | Create setup programs | ⭐⭐ Intermediate |

---

## Learning Paths

### Path 1: Complete Beginner

Start here if you're new to game development:

1. **[Quick Start](getting-started/quick-start.md)** - Get something on screen
2. **[Keyboard Input](input/keyboard.md)** - Make it interactive
3. **[Drawing Basics](rendering/drawing-basics.md)** - Understand rendering
4. **[Loading Textures](rendering/textures.md)** - Add graphics
5. **[Player Movement](mechanics/movement.md)** - Create player control

**Result:** A simple game with a player you can move around!

---

### Path 2: Intermediate Developer

You've built simple games before:

1. **[Sprite Rendering](rendering/sprites.md)** - Work with sprite sheets
2. **[Animation](rendering/animation.md)** - Bring sprites to life
3. **[Basic Collision](collision/basics.md)** - Add physics
4. **[Camera System](rendering/camera.md)** - Follow the player
5. **[Tiled Integration](tilemaps/tiled.md)** - Build levels

**Result:** A platformer or top-down game with levels!

---

### Path 3: Advanced Developer

You want to optimize and polish:

1. **[Component System](architecture/components.md)** - Clean architecture
2. **[Object Pooling](architecture/pooling.md)** - Reduce GC pressure
3. **[Spatial Partitioning](collision/optimization.md)** - Fast collision
4. **[Profiling](performance/profiling.md)** - Find bottlenecks
5. **[Asset Streaming](performance/streaming.md)** - Large game optimization

**Result:** A polished, performant game ready for release!

---

## How to Use These Guides

### Structure

Each guide follows this format:

1. **Overview** - What you'll build
2. **Prerequisites** - What you need to know first
3. **Step-by-Step** - Complete walkthrough
4. **Complete Code** - Copy-paste ready examples
5. **Explanation** - How it works
6. **Common Issues** - Troubleshooting
7. **Next Steps** - Related guides

---

### Code Examples

All code examples are:
- ✅ **Complete** - No placeholder comments
- ✅ **Tested** - Works with Brine2D .NET 10
- ✅ **Commented** - Explains key concepts
- ✅ **Copy-Paste Ready** - Use immediately

---

### Difficulty Levels

| Symbol | Level | Description |
|--------|-------|-------------|
| ⭐ | **Beginner** | No prior experience needed |
| ⭐⭐ | **Intermediate** | Some game dev experience helpful |
| ⭐⭐⭐ | **Advanced** | Requires solid C# and game dev knowledge |

---

## Complete Examples

### Example 1: Simple Platformer

Combines these guides:
- Player Movement
- Jump & Gravity
- Basic Collision
- Camera System
- Tilemap Rendering

**[See Full Tutorial →](examples/platformer.md)**

---

### Example 2: Top-Down Shooter

Combines these guides:
- Player Movement
- Shooting
- Enemy AI
- Health System
- Particle Effects

**[See Full Tutorial →](examples/shooter.md)**

---

### Example 3: Menu System

Combines these guides:
- Buttons
- Sliders
- Text Input
- Dialogs
- Save/Load

**[See Full Tutorial →](examples/menu-system.md)**

---

## Find What You Need

### By Feature

- Need to load sprites? → [Loading Textures](rendering/textures.md)
- Want controller support? → [Gamepad Support](input/gamepad.md)
- Adding sound? → [Sound Effects](audio/sound-effects.md)
- Building UI? → [UI Guides](ui/)

### By Problem

- "My game is slow" → [Performance Guides](performance/)
- "Collisions aren't working" → [Collision Guides](collision/)
- "How do I organize my code?" → [Architecture Guides](architecture/)

---

## Contributing

Found something unclear? Want to add a guide?

1. Check existing guides for style
2. Follow the template structure
3. Include complete code examples
4. Test everything works

**[Contribution Guidelines →](../contributing.md)**

---

## Need Help?

- **Discord:** Join our community
- **GitHub Issues:** Report problems
- **Stack Overflow:** Tag `brine2d`
- **Twitter:** [@Brine2D](https://twitter.com/brine2d)

---

## Quick Reference

| I want to... | Go to... |
|-------------|----------|
| **Move a character** | [Player Movement](mechanics/movement.md) |
| **Handle clicks** | [Mouse Input](input/mouse.md) |
| **Play a sound** | [Sound Effects](audio/sound-effects.md) |
| **Show a button** | [Buttons](ui/buttons.md) |
| **Detect collision** | [Basic Collision](collision/basics.md) |
| **Load a level** | [Tiled Integration](tilemaps/tiled.md) |
| **Follow the player** | [Camera System](rendering/camera.md) |
| **Animate a sprite** | [Animation](rendering/animation.md) |
| **Display health bar** | [HUD](ui/hud.md) |
| **Save progress** | [Save/Load](mechanics/save-load.md) |

---

Ready to start building? Pick a guide and let's code!

**[Begin with Quick Start →](getting-started/quick-start.md)**