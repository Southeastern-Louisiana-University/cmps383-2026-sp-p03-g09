using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Features.Auth;

namespace Selu383.SP26.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> userManager;

    public UsersController(UserManager<User> userManager)
    {
        this.userManager = userManager;
    }

    [HttpGet]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await userManager.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .OrderBy(u => u.UserName)
            .ToListAsync();

        var dtos = new List<UserDto>();

        foreach (var u in users)
        {
            var roles = u.UserRoles.Select(ur => ur.Role!.Name!).ToArray();
            var points = u.LoyaltyPoints;

            dtos.Add(new UserDto
            {
                Id = u.Id,
                UserName = u.UserName!,
                Roles = roles,
                LoyaltyPoints = points,
                MemberSince = u.MemberSince,
                ThemeColor = u.ThemeColor,
                Tier = points switch
                {
                    >= 1000 => "golden paw",
                    >= 500 => "silver paw",
                    _ => "cub"
                }
            });
        }

        return Ok(dtos);
    }

    [HttpPut("{id}/loyalty-points")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<UserDto>> UpdateLoyaltyPoints(int id, [FromBody] UpdateLoyaltyPointsDto dto)
    {
        var user = await userManager.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();

        user.LoyaltyPoints = dto.LoyaltyPoints;
        await userManager.UpdateAsync(user);

        var roles = user.UserRoles.Select(ur => ur.Role!.Name!).ToArray();
        var points = user.LoyaltyPoints;

        return Ok(new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Roles = roles,
            LoyaltyPoints = points,
            MemberSince = user.MemberSince,
            ThemeColor = user.ThemeColor,
            Tier = points switch
            {
                >= 1000 => "golden paw",
                >= 500 => "silver paw",
                _ => "cub"
            }
        });
    }

    // ⭐ NEW: THEME COLOR ENDPOINT
    [HttpPut("{id}/theme-color")]
    public async Task<ActionResult<UserDto>> UpdateThemeColor(int id, [FromBody] UpdateThemeColorDto dto)
    {
        var user = await userManager.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();

        user.ThemeColor = dto.ThemeColor;

        await userManager.UpdateAsync(user);

        var roles = user.UserRoles.Select(ur => ur.Role!.Name!).ToArray();
        var points = user.LoyaltyPoints;

        return Ok(new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Roles = roles,
            LoyaltyPoints = points,
            MemberSince = user.MemberSince,
            ThemeColor = user.ThemeColor,
            Tier = points switch
            {
                >= 1000 => "golden paw",
                >= 500 => "silver paw",
                _ => "cub"
            }
        });
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<UserDto>> Create(CreateUserDto dto)
    {
        using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

        var newUser = new User
        {
            UserName = dto.UserName,
        };

        var createResult = await userManager.CreateAsync(newUser, dto.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest();
        }

        try
        {
            var roleResult = await userManager.AddToRolesAsync(newUser, dto.Roles);
            if (!roleResult.Succeeded)
            {
                return BadRequest();
            }
        }
        catch (InvalidOperationException e)
        when (e.Message.StartsWith("Role") && e.Message.EndsWith("does not exist."))
        {
            return BadRequest();
        }

        transaction.Complete();

        return Ok(new UserDto
        {
            Id = newUser.Id,
            Roles = dto.Roles,
            UserName = newUser.UserName,
        });
    }
}

// DTOs
public class UpdateThemeColorDto
{
    public string? ThemeColor { get; set; }
}

public class UpdateLoyaltyPointsDto
{
    public int LoyaltyPoints { get; set; }
}
