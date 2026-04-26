using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP26.Api.Data;
using Selu383.SP26.Api.Extensions;
using Selu383.SP26.Api.Features.Auth;
using Selu383.SP26.Api.Features.Locations;
using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Controllers;

[Route("api/locations")]
[ApiController]
public class LocationsController(DataContext dataContext) : ControllerBase
{
    [HttpGet]
    public IQueryable<LocationDto> GetAll()
    {
        return dataContext.Set<Location>()
            .Select(x => new LocationDto
            {
                Id = x.Id,
                Name = x.Name,
                Address = x.Address,
                TableCount = x.TableCount,
                ManagerId = x.ManagerId,
                OpenHour = x.OpenHour,
                CloseHour = x.CloseHour,
            });
    }

    [HttpGet("{id}")]
    public ActionResult<LocationDto> GetById(int id)
    {
        var result = dataContext.Set<Location>()
            .FirstOrDefault(x => x.Id == id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(new LocationDto
        {
            Id = result.Id,
            Name = result.Name,
            Address = result.Address,
            TableCount = result.TableCount,
            ManagerId = result.ManagerId,
            OpenHour = result.OpenHour,
            CloseHour = result.CloseHour,
        });
    }

    [HttpGet("{id}/available-tables")]
    public async Task<ActionResult<List<int>>> GetAvailableTables(int id, [FromQuery] DateTime time)
    {
        var location = await dataContext.Set<Location>().FindAsync(id);
        if (location == null) return NotFound();

        if (location.OpenHour.HasValue && location.CloseHour.HasValue)
        {
            var localHour = time.ToLocalTime().Hour;
            if (localHour < location.OpenHour.Value || localHour >= location.CloseHour.Value)
            {
                return BadRequest("Location is closed at that time.");
            }
        }

        var windowStart = time.AddMinutes(-90);
        var windowEnd   = time.AddMinutes(90);

        var takenTables = await dataContext.Set<Order>()
            .Where(o =>
                o.LocationId  == id &&
                o.OrderType   == "dine_in" &&
                o.TableNumber != null &&
                o.PickupTime  >= windowStart &&
                o.PickupTime  <= windowEnd)
            .Select(o => o.TableNumber!.Value)
            .ToListAsync();

        var available = Enumerable.Range(1, location.TableCount)
            .Except(takenTables)
            .ToList();

        return Ok(available);
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public ActionResult<LocationDto> Create(LocationDto dto)
    {
        if (dto.TableCount < 1)
        {
            return BadRequest();
        }

        var location = new Location
        {
            Name = dto.Name,
            Address = dto.Address,
            TableCount = dto.TableCount,
            ManagerId = dto.ManagerId,
            OpenHour = dto.OpenHour,
            CloseHour = dto.CloseHour,
        };

        dataContext.Set<Location>().Add(location);
        dataContext.SaveChanges();

        dto.Id = location.Id;

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize]
    public ActionResult<LocationDto> Update(int id, LocationDto dto)
    {
        if (dto.TableCount < 1)
        {
            return BadRequest();
        }

        var location = dataContext.Set<Location>()
            .FirstOrDefault(x => x.Id == id);

        if (location == null)
        {
            return NotFound();
        }

        if (!User.IsInRole(RoleNames.Admin) && User.GetCurrentUserId() != location.ManagerId)
        {
            return Forbid();
        }

        location.Name = dto.Name;
        location.Address = dto.Address;
        location.TableCount = dto.TableCount;
        location.ManagerId = dto.ManagerId;
        location.OpenHour = dto.OpenHour;
        location.CloseHour = dto.CloseHour;

        dataContext.SaveChanges();

        dto.Id = location.Id;

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public ActionResult Delete(int id)
    {
        var location = dataContext.Set<Location>()
            .FirstOrDefault(x => x.Id == id);

        if (location == null)
        {
            return NotFound();
        }

        if (!User.IsInRole(RoleNames.Admin) && User.GetCurrentUserId() != location.ManagerId)
        {
            return Forbid();
        }

        dataContext.Set<Location>().Remove(location);
        dataContext.SaveChanges();

        return Ok();
    }
}
