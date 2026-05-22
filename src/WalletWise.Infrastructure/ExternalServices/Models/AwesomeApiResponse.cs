using System.Text.Json.Serialization;

namespace WalletWise.Infrastructure.ExternalServices.Models;

public class CotacaoInfo
{
    [JsonPropertyName("bid")]
    public string Bid { get; set; } = string.Empty;
}

public class DailyItem
{
    [JsonPropertyName("high")]
    public string High { get; set; } = string.Empty;

    [JsonPropertyName("low")]
    public string Low { get; set; } = string.Empty;

    [JsonPropertyName("bid")]
    public string Bid { get; set; } = string.Empty;
}
