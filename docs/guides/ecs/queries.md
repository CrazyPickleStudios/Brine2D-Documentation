---
title: ECS Queries
description: Master entity querying and filtering in Brine2D's ECS
---

# ECS Queries

Queries are how you **find and filter entities** in Brine2D's ECS. Think of them like LINQ or SQL queries - you specify what you're looking for, and the ECS returns matching entities efficiently.

## What Are Queries?

**Queries find entities** based on:
- Components they have
- Tags they contain
- Properties and conditions
- Spatial relationships

```csharp
// Find all entities with Health component
var withHealth = world.GetEntitiesWithComponent<HealthComponent>();

// Find all enemies
var enemies = world.GetEntitiesByTag("Enemy");

// Find entities with multiple components
var moving = world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();
```

---

## Basic Queries

### Query All Entities

```csharp
// Get all entities in the world
IReadOnlyList<Entity> allEntities = world.Entities;

foreach (var entity in allEntities)
{
    Console.WriteLine($"{entity.Name} ({entity.Id})");
}
```

### Query by Single Component

```csharp
// Get all entities with a specific component
var withHealth = world.GetEntitiesWithComponent<HealthComponent>();

foreach (var entity in withHealth)
{
    var health = entity.GetComponent<HealthComponent>()!;
    Console.WriteLine($"{entity.Name}: {health.Current}/{health.Max} HP");
}
```

### Query by Multiple Components

```csharp
// Get entities that have BOTH components
var moving = world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();

foreach (var entity in moving)
{
    var transform = entity.GetComponent<TransformComponent>()!;
    var velocity = entity.GetComponent<VelocityComponent>()!;
    
    Console.WriteLine($"{entity.Name} at {transform.Position}, moving {velocity.Velocity}");
}
```

### Query by Tag

```csharp
// Get all entities with a specific tag
var enemies = world.GetEntitiesByTag("Enemy");

foreach (var enemy in enemies)
{
    Console.WriteLine($"Enemy: {enemy.Name}");
}

// Check multiple tags (manual filtering)
var bossEnemies = world.GetEntitiesByTag("Enemy")
    .Where(e => e.Tags.Contains("Boss"));
```

---

## Finding Specific Entities

### Find by Name

```csharp
// Find first entity with exact name
var player = world.GetEntityByName("Player");

if (player != null)
{
    Console.WriteLine($"Found player: {player.Id}");
}
```

### Find by ID

```csharp
// Find entity by unique ID
Guid entityId = someEntity.Id;
var found = world.GetEntityById(entityId);

if (found != null)
{
    Console.WriteLine($"Found entity: {found.Name}");
}
```

### Find by Predicate

```csharp
// Find first entity matching custom condition
var boss = world.FindEntity(e => 
    e.Tags.Contains("Enemy") && 
    e.Name.Contains("Boss") &&
    e.IsActive
);

if (boss != null)
{
    Console.WriteLine($"Found boss: {boss.Name}");
}
```

---

## Filtering Queries

### LINQ-Style Filtering

```csharp
using System.Linq;

// Get active enemies with low health
var weakEnemies = world.GetEntitiesByTag("Enemy")
    .Where(e => e.IsActive)
    .Where(e =>
    {
        var health = e.GetComponent<HealthComponent>();
        return health != null && health.Percentage < 0.3f;
    });

// Get all projectiles moving right
var rightMoving = world.GetEntitiesWithComponent<VelocityComponent>()
    .Where(e => e.Tags.Contains("Projectile"))
    .Where(e => e.GetComponent<VelocityComponent>()!.Velocity.X > 0);

// Get enemies within view distance of player
var nearbyEnemies = world.GetEntitiesByTag("Enemy")
    .Where(e =>
    {
        var enemyTransform = e.GetComponent<TransformComponent>();
        var playerTransform = player.GetComponent<TransformComponent>();
        
        if (enemyTransform == null || playerTransform == null) return false;
        
        var distance = Vector2.Distance(enemyTransform.Position, playerTransform.Position);
        return distance < 500f;
    });
```

### Component-Based Filtering

```csharp
// Get entities with Health AND Velocity but NOT Dead tag
var aliveMoving = world.GetEntitiesWithComponents<HealthComponent, VelocityComponent>()
    .Where(e => !e.Tags.Contains("Dead"));

// Get entities that optionally have a component
var entities = world.GetEntitiesWithComponent<TransformComponent>();

foreach (var entity in entities)
{
    var transform = entity.GetComponent<TransformComponent>()!;
    var velocity = entity.GetComponent<VelocityComponent>(); // May be null
    
    if (velocity != null)
    {
        // Entity is moving
        Console.WriteLine($"{entity.Name} is moving at {velocity.Velocity}");
    }
    else
    {
        // Entity is stationary
        Console.WriteLine($"{entity.Name} is stationary");
    }
}
```

### Tag Combinations

```csharp
// Entities with multiple tags (AND logic)
var bossEnemies = world.GetEntitiesByTag("Enemy")
    .Where(e => e.Tags.Contains("Boss"));

// Entities with any of several tags (OR logic)
var targetable = world.Entities
    .Where(e => e.Tags.Contains("Enemy") || e.Tags.Contains("Destructible"));

// Entities without specific tag (NOT logic)
var nonHostile = world.Entities
    .Where(e => !e.Tags.Contains("Enemy"));
```

---

## Spatial Queries

### Distance-Based Queries

```csharp
// Extension method for radius queries
public static class SpatialQueryExtensions
{
    public static IEnumerable<Entity> WithinRadius(
        this IEnumerable<Entity> entities,
        Vector2 center,
        float radius)
    {
        var radiusSquared = radius * radius;
        
        return entities.Where(e =>
        {
            var transform = e.GetComponent<TransformComponent>();
            if (transform == null) return false;
            
            // Use DistanceSquared for better performance (avoid sqrt)
            var distanceSquared = Vector2.DistanceSquared(transform.Position, center);
            return distanceSquared <= radiusSquared;
        });
    }
}

// Usage
var playerPos = player.GetComponent<TransformComponent>()!.Position;
var nearbyEnemies = world.GetEntitiesByTag("Enemy")
    .WithinRadius(playerPos, 200f);

foreach (var enemy in nearbyEnemies)
{
    Console.WriteLine($"Enemy {enemy.Name} is nearby!");
}
```

### Rectangle-Based Queries

```csharp
public static class SpatialQueryExtensions
{
    public static IEnumerable<Entity> InRectangle(
        this IEnumerable<Entity> entities,
        RectangleF bounds)
    {
        return entities.Where(e =>
        {
            var transform = e.GetComponent<TransformComponent>();
            return transform != null && bounds.Contains(transform.Position);
        });
    }
    
    public static IEnumerable<Entity> InRectangle(
        this IEnumerable<Entity> entities,
        float x, float y, float width, float height)
    {
        return entities.InRectangle(new RectangleF(x, y, width, height));
    }
}

// Usage - find entities in camera viewport
var camera = _cameraManager.GetCamera("main");
var viewport = new RectangleF(
    camera.Position.X - camera.ViewportWidth / 2,
    camera.Position.Y - camera.ViewportHeight / 2,
    camera.ViewportWidth,
    camera.ViewportHeight
);

var visibleEntities = world.GetEntitiesWithComponent<SpriteComponent>()
    .InRectangle(viewport);
```

### Nearest Entity Queries

```csharp
public static class SpatialQueryExtensions
{
    public static Entity? GetNearest(
        this IEnumerable<Entity> entities,
        Vector2 position)
    {
        Entity? nearest = null;
        float nearestDistanceSquared = float.MaxValue;
        
        foreach (var entity in entities)
        {
            var transform = entity.GetComponent<TransformComponent>();
            if (transform == null) continue;
            
            var distanceSquared = Vector2.DistanceSquared(transform.Position, position);
            
            if (distanceSquared < nearestDistanceSquared)
            {
                nearest = entity;
                nearestDistanceSquared = distanceSquared;
            }
        }
        
        return nearest;
    }
    
    public static IEnumerable<Entity> GetNNearest(
        this IEnumerable<Entity> entities,
        Vector2 position,
        int count)
    {
        return entities
            .Select(e => new
            {
                Entity = e,
                Transform = e.GetComponent<TransformComponent>()
            })
            .Where(x => x.Transform != null)
            .OrderBy(x => Vector2.DistanceSquared(x.Transform!.Position, position))
            .Take(count)
            .Select(x => x.Entity);
    }
}

// Usage
var playerPos = player.GetComponent<TransformComponent>()!.Position;

// Find nearest enemy
var nearestEnemy = world.GetEntitiesByTag("Enemy")
    .GetNearest(playerPos);

// Find 3 nearest enemies
var closestEnemies = world.GetEntitiesByTag("Enemy")
    .GetNNearest(playerPos, 3);
```

---

## Advanced Queries

### Component Property Queries

```csharp
// Find entities with health below 50%
var lowHealth = world.GetEntitiesWithComponent<HealthComponent>()
    .Where(e =>
    {
        var health = e.GetComponent<HealthComponent>()!;
        return health.Percentage < 0.5f;
    });

// Find entities moving faster than 100 units/sec
var fastMoving = world.GetEntitiesWithComponent<VelocityComponent>()
    .Where(e =>
    {
        var velocity = e.GetComponent<VelocityComponent>()!;
        return velocity.Velocity.Length() > 100f;
    });

// Find entities in specific state
var chasingEnemies = world.GetEntitiesWithComponent<AIControllerComponent>()
    .Where(e =>
    {
        var ai = e.GetComponent<AIControllerComponent>()!;
        return ai.Behavior == AIBehavior.Chase;
    });
```

### Complex Multi-Condition Queries

```csharp
// Find active enemies with health, not dead, within range
var targets = world.GetEntitiesByTag("Enemy")
    .Where(e => e.IsActive)
    .Where(e => !e.Tags.Contains("Dead"))
    .Where(e => e.HasComponent<HealthComponent>())
    .Where(e => e.HasComponent<TransformComponent>())
    .Where(e =>
    {
        var enemyPos = e.GetComponent<TransformComponent>()!.Position;
        var distance = Vector2.Distance(playerPos, enemyPos);
        return distance < attackRange;
    })
    .Where(e =>
    {
        var health = e.GetComponent<HealthComponent>()!;
        return health.Current > 0;
    });
```

### Grouped Queries

```csharp
// Group entities by tag
var entitiesByTag = world.Entities
    .SelectMany(e => e.Tags.Select(tag => new { Entity = e, Tag = tag }))
    .GroupBy(x => x.Tag)
    .ToDictionary(g => g.Key, g => g.Select(x => x.Entity).ToList());

// Group entities by health range
var entitiesByHealthRange = world.GetEntitiesWithComponent<HealthComponent>()
    .GroupBy(e =>
    {
        var health = e.GetComponent<HealthComponent>()!.Percentage;
        if (health > 0.75f) return "High";
        if (health > 0.25f) return "Medium";
        return "Low";
    })
    .ToDictionary(g => g.Key, g => g.ToList());

// Group enemies by AI behavior
var enemiesByBehavior = world.GetEntitiesByTag("Enemy")
    .Where(e => e.HasComponent<AIControllerComponent>())
    .GroupBy(e => e.GetComponent<AIControllerComponent>()!.Behavior)
    .ToDictionary(g => g.Key, g => g.ToList());
```

---

## Query Optimization

### Caching Queries

For queries that run frequently, cache the results:

```csharp
public class EnemyManager
{
    private readonly IEntityWorld _world;
    private List<Entity>? _cachedEnemies;
    private bool _isDirty = true;
    
    public EnemyManager(IEntityWorld world)
    {
        _world = world;
        
        // Invalidate cache when entities change
        _world.OnEntityCreated += _ => _isDirty = true;
        _world.OnEntityDestroyed += _ => _isDirty = true;
        _world.OnComponentAdded += (_, _) => _isDirty = true;
        _world.OnComponentRemoved += (_, _) => _isDirty = true;
    }
    
    public IEnumerable<Entity> GetEnemies()
    {
        if (_isDirty || _cachedEnemies == null)
        {
            _cachedEnemies = _world.GetEntitiesByTag("Enemy").ToList();
            _isDirty = false;
        }
        
        return _cachedEnemies;
    }
    
    public IEnumerable<Entity> GetActiveEnemies()
    {
        return GetEnemies().Where(e => e.IsActive);
    }
}
```

### Early Termination

Stop searching when you find what you need:

```csharp
// ❌ Slow - checks all entities
var hasAnyEnemies = world.GetEntitiesByTag("Enemy").Count() > 0;

// ✅ Fast - stops at first match
var hasAnyEnemies = world.GetEntitiesByTag("Enemy").Any();

// ❌ Slow - finds all then takes first
var firstEnemy = world.GetEntitiesByTag("Enemy").ToList().First();

// ✅ Fast - stops at first match
var firstEnemy = world.GetEntitiesByTag("Enemy").FirstOrDefault();
```

### Minimize Component Lookups

```csharp
// ❌ Slow - multiple lookups per entity
foreach (var entity in world.Entities)
{
    if (entity.HasComponent<HealthComponent>())
    {
        var health = entity.GetComponent<HealthComponent>();
        var transform = entity.GetComponent<TransformComponent>();
        // Process...
    }
}

// ✅ Fast - query guarantees components exist
var entities = world.GetEntitiesWithComponents<HealthComponent, TransformComponent>();

foreach (var entity in entities)
{
    var health = entity.GetComponent<HealthComponent>()!;
    var transform = entity.GetComponent<TransformComponent>()!;
    // Process...
}
```

### Use Tags Over Components

When possible, use tags instead of empty marker components:

```csharp
// ❌ Slower - component check
public class EnemyComponent : Component { } // Empty marker

var enemies = world.GetEntitiesWithComponent<EnemyComponent>();

// ✅ Faster - tag check
entity.Tags.Add("Enemy");

var enemies = world.GetEntitiesByTag("Enemy");
```

---

## Query Patterns

### Singleton Queries

For entities that should be unique:

```csharp
public static class WorldExtensions
{
    public static Entity GetPlayer(this IEntityWorld world)
    {
        var player = world.GetEntitiesByTag("Player").FirstOrDefault();
        
        if (player == null)
            throw new InvalidOperationException("Player not found in world");
        
        return player;
    }
    
    public static Entity? TryGetPlayer(this IEntityWorld world)
    {
        return world.GetEntitiesByTag("Player").FirstOrDefault();
    }
}

// Usage
var player = world.GetPlayer(); // Throws if not found
var player = world.TryGetPlayer(); // Returns null if not found
```

### Query Builders

Fluent API for complex queries:

```csharp
public class EntityQuery
{
    private IEnumerable<Entity> _entities;
    
    public EntityQuery(IEntityWorld world)
    {
        _entities = world.Entities;
    }
    
    public EntityQuery WithTag(string tag)
    {
        _entities = _entities.Where(e => e.Tags.Contains(tag));
        return this;
    }
    
    public EntityQuery WithoutTag(string tag)
    {
        _entities = _entities.Where(e => !e.Tags.Contains(tag));
        return this;
    }
    
    public EntityQuery WithComponent<T>() where T : Component
    {
        _entities = _entities.Where(e => e.HasComponent<T>());
        return this;
    }
    
    public EntityQuery WithoutComponent<T>() where T : Component
    {
        _entities = _entities.Where(e => !e.HasComponent<T>());
        return this;
    }
    
    public EntityQuery Active()
    {
        _entities = _entities.Where(e => e.IsActive);
        return this;
    }
    
    public EntityQuery Inactive()
    {
        _entities = _entities.Where(e => !e.IsActive);
        return this;
    }
    
    public EntityQuery Where(Func<Entity, bool> predicate)
    {
        _entities = _entities.Where(predicate);
        return this;
    }
    
    public IEnumerable<Entity> Execute() => _entities;
    
    public Entity? FirstOrDefault() => _entities.FirstOrDefault();
    
    public int Count() => _entities.Count();
}

// Usage
var query = new EntityQuery(world)
    .WithTag("Enemy")
    .WithoutTag("Dead")
    .WithComponent<HealthComponent>()
    .Active()
    .Where(e =>
    {
        var health = e.GetComponent<HealthComponent>()!;
        return health.Percentage < 0.5f;
    });

var lowHealthEnemies = query.Execute();
var count = query.Count();
```

### Reusable Query Predicates

```csharp
public static class EntityPredicates
{
    public static Func<Entity, bool> IsAlive => e =>
    {
        if (!e.IsActive) return false;
        if (e.Tags.Contains("Dead")) return false;
        
        var health = e.GetComponent<HealthComponent>();
        return health == null || health.Current > 0;
    };
    
    public static Func<Entity, bool> IsEnemy => e =>
        e.Tags.Contains("Enemy") && IsAlive(e);
    
    public static Func<Entity, bool> InCombat => e =>
    {
        var ai = e.GetComponent<AIControllerComponent>();
        return ai != null && 
               (ai.Behavior == AIBehavior.Chase || ai.Behavior == AIBehavior.Attack);
    };
    
    public static Func<Entity, bool> WithinDistance(Vector2 position, float distance) =>
        e =>
        {
            var transform = e.GetComponent<TransformComponent>();
            return transform != null &&
                   Vector2.Distance(transform.Position, position) <= distance;
        };
}

// Usage
var aliveEnemies = world.Entities.Where(EntityPredicates.IsEnemy);
var combatEnemies = aliveEnemies.Where(EntityPredicates.InCombat);
var nearbyEnemies = aliveEnemies.Where(EntityPredicates.WithinDistance(playerPos, 500f));
```

---

## Query Performance Tips

### Do's and Don'ts

```csharp
// ✅ DO: Query for specific components upfront
var moving = world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();

// ❌ DON'T: Query all and filter with HasComponent
var moving = world.Entities.Where(e => e.HasComponent<TransformComponent>() && e.HasComponent<VelocityComponent>());

// ✅ DO: Use Any() for existence checks
var hasEnemies = world.GetEntitiesByTag("Enemy").Any();

// ❌ DON'T: Use Count() for existence checks
var hasEnemies = world.GetEntitiesByTag("Enemy").Count() > 0;

// ✅ DO: Use FirstOrDefault() for single results
var player = world.GetEntitiesByTag("Player").FirstOrDefault();

// ❌ DON'T: Use ToList().First() for single results
var player = world.GetEntitiesByTag("Player").ToList().First();

// ✅ DO: Filter on tags before component checks
var targets = world.GetEntitiesByTag("Enemy")
    .Where(e => e.HasComponent<HealthComponent>());

// ❌ DON'T: Check components before tags
var targets = world.Entities
    .Where(e => e.HasComponent<HealthComponent>())
    .Where(e => e.Tags.Contains("Enemy"));
```

### Benchmark Your Queries

```csharp
using System.Diagnostics;

public static class QueryBenchmark
{
    public static void BenchmarkQuery(string name, Action query, int iterations = 1000)
    {
        var sw = Stopwatch.StartNew();
        
        for (int i = 0; i < iterations; i++)
        {
            query();
        }
        
        sw.Stop();
        
        Console.WriteLine($"{name}: {sw.ElapsedMilliseconds}ms ({iterations} iterations)");
        Console.WriteLine($"  Average: {sw.Elapsed.TotalMilliseconds / iterations:F4}ms per query");
    }
}

// Usage
QueryBenchmark.BenchmarkQuery("Tag Query", () =>
{
    var enemies = world.GetEntitiesByTag("Enemy").ToList();
});

QueryBenchmark.BenchmarkQuery("Component Query", () =>
{
    var moving = world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>().ToList();
});
```

---

## Debugging Queries

### Query Result Inspector

```csharp
public static class QueryDebugger
{
    public static void InspectQuery(string queryName, IEnumerable<Entity> results)
    {
        var resultList = results.ToList();
        
        Console.WriteLine($"=== Query: {queryName} ===");
        Console.WriteLine($"Results: {resultList.Count}");
        
        if (resultList.Count > 0)
        {
            Console.WriteLine("Entities:");
            foreach (var entity in resultList.Take(10)) // Show first 10
            {
                var components = string.Join(", ", entity.GetAllComponents().Select(c => c.GetType().Name));
                var tags = string.Join(", ", entity.Tags);
                Console.WriteLine($"  - {entity.Name} (Tags: {tags}, Components: {components})");
            }
            
            if (resultList.Count > 10)
            {
                Console.WriteLine($"  ... and {resultList.Count - 10} more");
            }
        }
        else
        {
            Console.WriteLine("  (No results)");
        }
    }
}

// Usage
var enemies = world.GetEntitiesByTag("Enemy");
QueryDebugger.InspectQuery("All Enemies", enemies);
```

---

## Quick Reference

### Basic Queries

```csharp
world.Entities                                      // All entities
world.GetEntityByName("Player")                     // By name
world.GetEntityById(guid)                           // By ID
world.GetEntitiesByTag("Enemy")                     // By tag
world.GetEntitiesWithComponent<T>()                 // By component
world.GetEntitiesWithComponents<T1, T2>()           // By multiple components
world.FindEntity(e => /* condition */)              // By predicate
```

### LINQ Filters

```csharp
.Where(e => condition)                              // Filter
.FirstOrDefault()                                   // First match
.Any()                                              // Has any
.Count()                                            // Count matches
.OrderBy(e => value)                                // Sort
.Take(n)                                            // Limit results
.Skip(n)                                            // Skip results
```

### Spatial Queries

```csharp
entities.WithinRadius(position, radius)             // Within distance
entities.InRectangle(bounds)                        // Within rectangle
entities.GetNearest(position)                       // Nearest entity
entities.GetNNearest(position, count)               // N nearest entities
```

---

## Next Steps

Now that you've mastered queries, explore related topics:

<div class="grid cards" markdown>

-   **Components Guide**

    ---

    Design effective components for querying

    [:octicons-arrow-right-24: Components Guide](components.md)

-   **Systems Guide**

    ---

    Use queries in systems for performance

    [:octicons-arrow-right-24: Systems Guide](systems.md)

-   **Entities Guide**

    ---

    Learn more about entity management

    [:octicons-arrow-right-24: Entities Guide](entities.md)

</div>

---

**Remember:** Efficient queries are key to performant ECS games. Start simple, optimize when needed, and always profile your queries!