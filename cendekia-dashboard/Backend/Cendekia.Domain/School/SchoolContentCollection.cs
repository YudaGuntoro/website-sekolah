using System.ComponentModel.DataAnnotations;
namespace Cendekia.Domain.School;
public class SchoolContentCollection { [MaxLength(40)] public string Code { get; set; } = ""; }
