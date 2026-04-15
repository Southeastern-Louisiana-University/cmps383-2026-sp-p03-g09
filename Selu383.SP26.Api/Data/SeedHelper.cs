using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.MenuItems;
using Selu383.SP26.Api.Features.Rewards;

namespace Selu383.SP26.Api.Data;

public static class SeedHelper
{
    public static async Task MigrateAndSeed(IServiceProvider serviceProvider)
    {
        var dataContext = serviceProvider.GetRequiredService<DataContext>();

        await dataContext.Database.MigrateAsync();

        await AddRoles(serviceProvider);
        await AddUsers(serviceProvider);
        await UpdateUserLoyaltyData(serviceProvider); // runs even when users pre-exist (e.g. Azure)

        await AddLocations(dataContext);
        await AddMenuItems(dataContext);
        await AddRewards(dataContext);
    }

    // Runs unconditionally to backfill loyalty data for users that existed before
    // the LoyaltyPoints / MemberSince columns were added (e.g. on Azure).
    // Only touches a user when both columns are still at their migration defaults
    // (points == 0 AND memberSince == null), so real earned points are never reset.
    private static async Task UpdateUserLoyaltyData(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();

        var defaults = new Dictionary<string, (int Points, DateTime Since)>
        {
            ["bob"]     = (1240, new DateTime(2026, 3,  1, 0, 0, 0, DateTimeKind.Utc)),
            ["sue"]     = ( 220, new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc)),
            ["galkadi"] = (   0, new DateTime(2026, 1,  1, 0, 0, 0, DateTimeKind.Utc)),
        };

        foreach (var (userName, (points, since)) in defaults)
        {
            var user = await userManager.FindByNameAsync(userName);
            if (user == null) continue;

            if (user.LoyaltyPoints == 0 && user.MemberSince == null)
            {
                user.LoyaltyPoints = points;
                user.MemberSince = since;
                await userManager.UpdateAsync(user);
            }
        }
    }

    private static async Task AddUsers(IServiceProvider serviceProvider)
    {
        const string defaultPassword = "Password123!";
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();

        if (userManager.Users.Any())
        {
            return;
        }

        var adminUser = new User
        {
            UserName = "galkadi",
            MemberSince = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        await userManager.CreateAsync(adminUser, defaultPassword);
        await userManager.AddToRoleAsync(adminUser, RoleNames.Admin);

        var bob = new User
        {
            UserName = "bob",
            LoyaltyPoints = 1240,
            MemberSince = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        await userManager.CreateAsync(bob, defaultPassword);
        await userManager.AddToRoleAsync(bob, RoleNames.User);

        var sue = new User
        {
            UserName = "sue",
            LoyaltyPoints = 220,
            MemberSince = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc)
        };
        await userManager.CreateAsync(sue, defaultPassword);
        await userManager.AddToRoleAsync(sue, RoleNames.User);
    }

    private static async Task AddRoles(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();
        if (roleManager.Roles.Any())
        {
            return;
        }
        await roleManager.CreateAsync(new Role
        {
            Name = RoleNames.Admin
        });

        await roleManager.CreateAsync(new Role
        {
            Name = RoleNames.User
        });
    }

    private static async Task AddLocations(DataContext dataContext)
    {
        if (dataContext.Set<Location>().Any())
        {
            return;
        }

        dataContext.Set<Location>().AddRange(
            new Location { Name = "Caffeinated Lions – Hammond", Address = "1514 N Morrison Blvd, Hammond, LA 70401", TableCount = 12 },
            new Location { Name = "Caffeinated Lions – New Orleans", Address = "800 Magazine St, New Orleans, LA 70130", TableCount = 20 },
            new Location { Name = "Caffeinated Lions – New York", Address = "45 W 29th St, New York, NY 10001", TableCount = 15 }
        );

        await dataContext.SaveChangesAsync();
    }

    private static List<MenuItemAddOn> DrinkAddOns() =>
    [
        new() { Label = "oat milk", Price = 0.75m },
        new() { Label = "almond milk", Price = 0.75m },
        new() { Label = "extra shot", Price = 1.00m },
        new() { Label = "vanilla syrup", Price = 0.50m },
        new() { Label = "caramel sauce", Price = 0.50m },
        new() { Label = "hazelnut syrup", Price = 0.50m },
        new() { Label = "extra whip", Price = 0.00m },
    ];

    private static async Task AddMenuItems(DataContext dataContext)
    {
        if (dataContext.Set<MenuItem>().Any())
        {
            return;
        }

        // Drinks
        dataContext.Set<MenuItem>().AddRange(
            new MenuItem
            {
                Name = "iced latte",
                Description = "espresso and milk served over ice for a refreshing coffee drink.",
                BasePrice = 5.50m,
                Category = "drinks",
                HasSizes = true,
                AddOns = DrinkAddOns()
            },
            new MenuItem
            {
                Name = "supernova",
                Description = "a unique coffee blend with a complex, balanced profile and subtle sweetness. delicious as espresso or paired with milk.",
                BasePrice = 7.95m,
                Category = "drinks",
                HasSizes = true,
                AddOns = DrinkAddOns()
            },
            new MenuItem
            {
                Name = "roaring frappe",
                Description = "cold brew, milk, and ice blended together with a signature syrup or flavor, topped with whipped cream.",
                BasePrice = 6.20m,
                Category = "drinks",
                HasSizes = true,
                AddOns = DrinkAddOns()
            },
            new MenuItem
            {
                Name = "black & white cold brew",
                Description = "cold brew made with both dark and light roast beans, finished with a drizzle of condensed milk.",
                BasePrice = 5.15m,
                Category = "drinks",
                HasSizes = true,
                AddOns = [
                    new() { Label = "oat milk", Price = 0.75m },
                    new() { Label = "almond milk", Price = 0.75m },
                    new() { Label = "extra condensed milk", Price = 0.50m },
                    new() { Label = "extra shot", Price = 1.00m },
                ]
            },
            new MenuItem
            {
                Name = "strawberry limeade",
                Description = "fresh lime juice blended with strawberry purée for a refreshing, tangy drink.",
                BasePrice = 5.00m,
                Category = "drinks",
                HasSizes = true,
                AddOns = [
                    new() { Label = "extra strawberry", Price = 0.50m },
                    new() { Label = "sugar-free syrup", Price = 0.00m },
                ]
            },
            new MenuItem
            {
                Name = "shaken lemonade",
                Description = "fresh lemon juice and simple syrup vigorously shaken for a bright, refreshing lemonade.",
                BasePrice = 5.00m,
                Category = "drinks",
                HasSizes = true,
                AddOns = [
                    new() { Label = "add strawberry", Price = 0.50m },
                    new() { Label = "add raspberry", Price = 0.50m },
                    new() { Label = "sugar-free syrup", Price = 0.00m },
                ]
            },
            new MenuItem
            {
                Name = "drip coffee",
                Description = "freshly brewed house blend drip coffee, served hot.",
                BasePrice = 3.50m,
                Category = "drinks",
                HasSizes = true,
                AddOns = [
                    new() { Label = "oat milk", Price = 0.75m },
                    new() { Label = "almond milk", Price = 0.75m },
                    new() { Label = "cream", Price = 0.00m },
                ]
            }
        );

        // Sweet Crepes
        dataContext.Set<MenuItem>().AddRange(
            new MenuItem
            {
                Name = "mannino honey crepe",
                Description = "a sweet crepe drizzled with mannino honey and topped with mixed berries.",
                BasePrice = 10.00m,
                Category = "sweet crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "downtowner",
                Description = "strawberries and bananas wrapped in a crepe, finished with nutella and hershey's chocolate sauce.",
                BasePrice = 10.75m,
                Category = "sweet crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "funky monkey",
                Description = "nutella and bananas wrapped in a crepe, served with whipped cream.",
                BasePrice = 10.00m,
                Category = "sweet crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "le s'mores",
                Description = "marshmallow cream and chocolate sauce inside a crepe, topped with graham cracker crumbs.",
                BasePrice = 9.50m,
                Category = "sweet crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "strawberry fields",
                Description = "fresh strawberries with hershey's chocolate drizzle and a dusting of powdered sugar.",
                BasePrice = 10.00m,
                Category = "sweet crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "bonjour",
                Description = "a sweet crepe filled with syrup and cinnamon, finished with powdered sugar.",
                BasePrice = 8.50m,
                Category = "sweet crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "banana foster",
                Description = "bananas with cinnamon in a crepe, topped with a generous drizzle of caramel sauce.",
                BasePrice = 8.95m,
                Category = "sweet crepes",
                HasSizes = false
            }
        );

        // Savory Crepes
        dataContext.Set<MenuItem>().AddRange(
            new MenuItem
            {
                Name = "matt's scrambled eggs",
                Description = "scrambled eggs and melted mozzarella cheese wrapped in a crepe.",
                BasePrice = 5.00m,
                Category = "savory crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "meanie mushroom",
                Description = "sautéed mushrooms, mozzarella, tomato, and bacon inside a delicate crepe.",
                BasePrice = 10.50m,
                Category = "savory crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "turkey club",
                Description = "sliced turkey, bacon, spinach, and tomato wrapped in a savory crepe.",
                BasePrice = 10.50m,
                Category = "savory crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "green machine",
                Description = "spinach, artichokes, and mozzarella cheese inside a fresh crepe.",
                BasePrice = 10.00m,
                Category = "savory crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "perfect pair",
                Description = "a unique combination of bacon and nutella wrapped in a crepe.",
                BasePrice = 10.00m,
                Category = "savory crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "crepe fromage",
                Description = "a savory crepe filled with a blend of cheeses.",
                BasePrice = 8.00m,
                Category = "savory crepes",
                HasSizes = false
            },
            new MenuItem
            {
                Name = "farmers market crepe",
                Description = "turkey, spinach, and mozzarella wrapped in a savory crepe.",
                BasePrice = 10.50m,
                Category = "savory crepes",
                HasSizes = false
            }
        );

        // Bagels
        var toastedToggle = new List<MenuItemToggle>
        {
            new() { Label = "toasted", DefaultOn = true }
        };

        dataContext.Set<MenuItem>().AddRange(
            new MenuItem
            {
                Name = "travis special",
                Description = "cream cheese, salmon, spinach, and a fried egg served on a freshly toasted bagel.",
                BasePrice = 14.00m,
                Category = "bagels",
                HasSizes = false,
                Toggles = [new() { Label = "toasted", DefaultOn = true }]
            },
            new MenuItem
            {
                Name = "crème brulagel",
                Description = "a toasted bagel with a caramelized sugar crust inspired by crème brûlée, served with cream cheese.",
                BasePrice = 8.00m,
                Category = "bagels",
                HasSizes = false,
                Toggles = [new() { Label = "toasted", DefaultOn = true }]
            },
            new MenuItem
            {
                Name = "the fancy one",
                Description = "smoked salmon, cream cheese, and fresh dill on a toasted bagel.",
                BasePrice = 13.00m,
                Category = "bagels",
                HasSizes = false,
                Toggles = [new() { Label = "toasted", DefaultOn = true }]
            },
            new MenuItem
            {
                Name = "breakfast bagel",
                Description = "a toasted bagel with your choice of ham, bacon, or sausage, a fried egg, and cheddar cheese.",
                BasePrice = 9.50m,
                Category = "bagels",
                HasSizes = false,
                Toggles = [new() { Label = "toasted", DefaultOn = true }]
            },
            new MenuItem
            {
                Name = "the classic",
                Description = "a toasted bagel with cream cheese.",
                BasePrice = 5.25m,
                Category = "bagels",
                HasSizes = false,
                Toggles = [new() { Label = "toasted", DefaultOn = true }]
            }
        );

        await dataContext.SaveChangesAsync();
    }

    private static async Task AddRewards(DataContext dataContext)
    {
        if (dataContext.Set<Reward>().Any())
        {
            return;
        }

        dataContext.Set<Reward>().AddRange(
            new Reward
            {
                Name = "free drip coffee",
                Description = "redeem for one free drip coffee of any size. a warm start to any morning.",
                PointCost = 50,
                Category = "drink"
            },
            new Reward
            {
                Name = "free iced latte",
                Description = "redeem for one free iced latte of any size. smooth, cold, and yours.",
                PointCost = 100,
                Category = "drink"
            },
            new Reward
            {
                Name = "free roaring frappe",
                Description = "redeem for one free roaring frappe of any size. blended to perfection.",
                PointCost = 150,
                Category = "drink"
            },
            new Reward
            {
                Name = "free bagel",
                Description = "redeem for one free bagel of your choice. toasted, of course.",
                PointCost = 175,
                Category = "food"
            },
            new Reward
            {
                Name = "free sweet crepe",
                Description = "redeem for one free sweet crepe of your choice. something sweet for something earned.",
                PointCost = 200,
                Category = "food"
            },
            new Reward
            {
                Name = "free drink of choice",
                Description = "redeem for one free drink of your choice, any size, any menu item. you've earned it.",
                PointCost = 250,
                Category = "drink"
            }
        );

        await dataContext.SaveChangesAsync();
    }
}
