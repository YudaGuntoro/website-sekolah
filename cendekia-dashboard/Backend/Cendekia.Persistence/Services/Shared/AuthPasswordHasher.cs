using System.Security.Cryptography;
using System.Text;

namespace Cendekia.Persistence.Services.Shared;

public static class AuthPasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 600000;
    private const string Prefix = "pbkdf2-sha256$600000$";

    public static string CreateSalt()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(SaltSize));
    }

    public static string HashPassword(string password, string salt)
    {
        var saltBytes = Convert.FromBase64String(salt);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            saltBytes,
            Iterations,
            HashAlgorithmName.SHA256,
            HashSize);

        return Prefix + Convert.ToBase64String(hash);
    }

    public static bool VerifyPassword(string password, string salt, string expectedHash)
    {
        try {
            var current = expectedHash.StartsWith(Prefix, StringComparison.Ordinal);
            var expectedBytes = Convert.FromBase64String(current ? expectedHash[Prefix.Length..] : expectedHash);
            var saltBytes = Convert.FromBase64String(salt);
            var hash = Rfc2898DeriveBytes.Pbkdf2(Encoding.UTF8.GetBytes(password), saltBytes,
                current ? Iterations : 100000, HashAlgorithmName.SHA256, HashSize);
            return hash.Length == expectedBytes.Length && CryptographicOperations.FixedTimeEquals(hash, expectedBytes);
        }
        catch (FormatException) { return false; }
    }

    public static bool NeedsRehash(string hash) => !hash.StartsWith(Prefix, StringComparison.Ordinal);
}
