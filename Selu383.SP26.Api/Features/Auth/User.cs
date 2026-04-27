using Microsoft.AspNetCore.Identity;

namespace Selu383.SP26.Api.Features.Auth;

public class User : IdentityUser<int>
{
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    public int LoyaltyPoints { get; set; }
    public DateTime? MemberSince { get; set; }

    // ⭐ NEW
    public string? ThemeColor { get; set; }
}