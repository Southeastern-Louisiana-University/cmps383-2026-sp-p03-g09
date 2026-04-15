using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Rewards;

namespace Selu383.SP26.Api.Controllers;

[Route("api/rewards")]
[ApiController]
public class RewardsController(DataContext dataContext, UserManager<User> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RewardDto>>> GetAll()
    {
        var rewards = await dataContext.Set<Reward>()
            .OrderBy(x => x.PointCost)
            .Select(x => new RewardDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                PointCost = x.PointCost,
                Category = x.Category
            })
            .ToListAsync();

        return Ok(rewards);
    }

    [HttpPost("{id}/redeem")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Redeem(int id)
    {
        var reward = await dataContext.Set<Reward>().FindAsync(id);
        if (reward == null)
        {
            return NotFound();
        }

        var userId = User.GetCurrentUserId();
        var user = await userManager.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return Unauthorized();
        }

        if (user.LoyaltyPoints < reward.PointCost)
        {
            return BadRequest("Not enough points.");
        }

        user.LoyaltyPoints -= reward.PointCost;
        await userManager.UpdateAsync(user);

        return Ok(new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Roles = user.UserRoles.Select(r => r.Role!.Name).ToArray()!,
            LoyaltyPoints = user.LoyaltyPoints,
            MemberSince = user.MemberSince,
            Tier = GetTier(user.LoyaltyPoints)
        });
    }

    private static string GetTier(int points) => points switch
    {
        >= 1000 => "golden paw",
        >= 500 => "silver paw",
        _ => "cub"
    };
}
