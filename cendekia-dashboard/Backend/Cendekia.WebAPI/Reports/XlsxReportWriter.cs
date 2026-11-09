using System.Globalization;
using System.Xml;
using Cendekia.Application.Services;
using ClosedXML.Excel;

namespace Cendekia.WebAPI.Reports;

public static class XlsxReportWriter
{
    private const int HeaderRow = 6;

    public static byte[] Write(ApplicantReport report)
    {
        if (report.Rows.Count > XLHelper.MaxRowNumber - HeaderRow)
            throw new InvalidOperationException("Jumlah baris melebihi kapasitas Excel. Persempit filter laporan.");

        var headers = new[] { "No." }.Concat(report.Headers).ToArray();
        var lastColumn = headers.Length;
        var lastRow = HeaderRow + report.Rows.Count;
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add(report.SheetName);
        sheet.ShowGridLines = false;
        sheet.Style.Font.FontName = "Calibri";
        sheet.Style.Font.FontSize = 11;
        sheet.Style.Font.FontColor = XLColor.FromHtml("#172F4E");
        sheet.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        sheet.Style.NumberFormat.Format = "@";
        sheet.RowHeight = 24;
        for (var column = 1; column <= lastColumn; column++)
            sheet.Column(column).Width = ColumnWidth(headers[column - 1]);

        var title = sheet.Range(1, 1, 1, lastColumn).Merge();
        title.FirstCell().Value = $"LAPORAN {report.SheetName.ToUpperInvariant()}";
        title.Style.Font.Bold = true;
        title.Style.Font.FontSize = 20;
        title.Style.Font.FontColor = XLColor.White;
        title.Style.Fill.BackgroundColor = XLColor.FromHtml("#173F6D");
        title.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        sheet.Row(1).Height = 46;

        sheet.Range(2, 1, 2, 6).Merge().FirstCell().Value = $"Jumlah pendaftar: {report.Rows.Count.ToString("N0", CultureInfo.GetCultureInfo("id-ID"))} orang";
        sheet.Range(2, 7, 2, lastColumn).Merge().FirstCell().Value = $"Diekspor: {ApplicantReport.Wib(report.GeneratedAtUtc)} WIB";
        sheet.Row(2).Style.Font.Bold = true;
        sheet.Row(2).Height = 32;
        sheet.Range(2, 1, 2, lastColumn).Style.Fill.BackgroundColor = XLColor.FromHtml("#F3F6FA");
        sheet.Range(2, 1, 2, lastColumn).Style.Alignment.Indent = 1;
        sheet.Range(2, 7, 2, lastColumn).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        sheet.Range(2, 7, 2, lastColumn).Style.Font.Bold = false;
        sheet.Range(2, 7, 2, lastColumn).Style.Font.FontSize = 10;
        sheet.Range(2, 7, 2, lastColumn).Style.Font.FontColor = XLColor.FromHtml("#60758C");
        foreach (var (row, text) in new[] { (3, report.FilterSummary), (4, report.SearchSummary) })
        {
            var summary = sheet.Range(row, 1, row, lastColumn).Merge();
            summary.FirstCell().Value = Text(text);
            summary.Style.Font.FontSize = 10;
            summary.Style.Font.FontColor = XLColor.FromHtml("#60758C");
            summary.Style.Fill.BackgroundColor = XLColor.FromHtml("#F3F6FA");
            summary.Style.Alignment.WrapText = true;
            summary.Style.Alignment.Indent = 1;
            sheet.Row(row).Height = 26;
        }
        sheet.Row(5).Height = 14;

        sheet.Cell(HeaderRow, 1).InsertData(new[] { headers });
        var heading = sheet.Range(HeaderRow, 1, HeaderRow, lastColumn);
        heading.Style.Font.Bold = true;
        heading.Style.Font.FontColor = XLColor.White;
        heading.Style.Fill.BackgroundColor = XLColor.FromHtml("#205994");
        heading.Style.Alignment.WrapText = true;
        sheet.Row(HeaderRow).Height = 36;
        heading.Style.Alignment.Indent = 1;
        if (report.Rows.Count > 0)
        {
            // Explicit strings keep phone/NISN zeros and user input starting '=' as text.
            var rows = report.Rows.Select((values, index) => new[] { (index + 1).ToString(CultureInfo.InvariantCulture) }.Concat(values.Select(Text)).ToArray());
            sheet.Cell(HeaderRow + 1, 1).InsertData(rows);
            sheet.Rows(HeaderRow + 1, lastRow).Height = 32;
            sheet.Range(HeaderRow + 1, 1, lastRow, lastColumn).Style.Alignment.WrapText = true;
            sheet.Range(HeaderRow + 1, 1, lastRow, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            for (var row = HeaderRow + 1; row <= lastRow; row++)
            {
                if ((row - HeaderRow) % 2 == 0)
                    sheet.Range(row, 1, row, lastColumn).Style.Fill.BackgroundColor = XLColor.FromHtml("#F5F8FC");
                var source = report.Rows[row - HeaderRow - 1];
                var lines = 1;
                for (var column = 2; column <= lastColumn; column++)
                {
                    var cell = sheet.Cell(row, column);
                    var header = headers[column - 1];
                    if (header is "Nama calon siswa" or "Nama peserta") cell.Style.Font.Bold = true;
                    if (header == "Nomor pendaftaran") cell.Style.Font.FontColor = XLColor.FromHtml("#205994");
                    if (header is "Gelombang" or "Kelas" or "Kelas tujuan" or "Jenis kelamin") cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    if (header.StartsWith("Status", StringComparison.Ordinal)) StatusStyle(cell, source[column - 2]);
                    var capacity = Math.Max(1, sheet.Column(column).Width - 4);
                    lines = Math.Max(lines, (source[column - 2] ?? "").Split('\n').Sum(line => Math.Max(1, (int)Math.Ceiling(line.Length / capacity))));
                }
                sheet.Row(row).Height = Math.Clamp(lines * 14 + 10, 32, 409);
            }
        }
        var table = sheet.Range(HeaderRow, 1, lastRow, lastColumn);
        table.Style.Border.InsideBorder = XLBorderStyleValues.None;
        table.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
        table.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        table.Style.Border.BottomBorderColor = XLColor.FromHtml("#E4EBF3");
        table.Style.Border.OutsideBorderColor = XLColor.FromHtml("#DDE6F0");
        heading.Style.Border.BottomBorder = XLBorderStyleValues.Medium;
        heading.Style.Border.BottomBorderColor = XLColor.FromHtml("#87B4E0");
        table.SetAutoFilter();
        sheet.SheetView.FreezeRows(HeaderRow);

        var page = sheet.PageSetup;
        page.PrintAreas.Add(1, 1, lastRow, lastColumn);
        page.SetRowsToRepeatAtTop(HeaderRow, HeaderRow);
        page.PageOrientation = XLPageOrientation.Landscape;
        page.PaperSize = XLPaperSize.A3Paper;
        page.FitToPages(lastColumn > 24 ? 2 : 1, 0);
        if (lastColumn > 24) page.SetColumnsToRepeatAtLeft(1, 2);
        page.CenterHorizontally = true;
        page.Margins.Left = page.Margins.Right = 0.25;
        page.Margins.Top = 0.35;
        page.Margins.Bottom = 0.4;
        page.Margins.Header = 0.15;
        page.Margins.Footer = 0.2;
        page.Footer.Left.AddText("&8SMPIT Cendekia Purwakarta - Dokumen internal");
        page.Footer.Center.AddText("&8Data sesuai filter saat ekspor");
        page.Footer.Right.AddText("&8Halaman &P dari &N");

        using var output = new MemoryStream();
        workbook.SaveAs(output);
        return output.ToArray();
    }

    private static double ColumnWidth(string header) => header switch
    {
        "No." => 6,
        "Nomor pendaftaran" => 26,
        "Nama calon siswa" or "Nama peserta" or "Asal sekolah" => 30,
        "Tahun ajaran" or "Gelombang" or "Kelas" or "Kelas tujuan" => 15,
        "NISN" or "Tanggal lahir" or "Jenis kelamin" => 18,
        "WhatsApp" => 21,
        "Email" => 34,
        "Alamat" => 44,
        "Acara" => 34,
        "Waktu submit (WIB)" => 25,
        _ => Math.Clamp(header.Length + 8, 20, 32)
    };

    private static void StatusStyle(IXLCell cell, string value)
    {
        var (background, foreground) = value switch
        {
            "Diterima" or "Terverifikasi" or "Lunas" => ("#EAF5EE", "#216644"),
            "Ditolak" or "Dibatalkan" => ("#FCEEEE", "#A23A3A"),
            "Baru" or "Belum bayar" => ("#FFF6E5", "#8A611D"),
            _ => ("#EAF1FA", "#27598C")
        };
        cell.Style.Font.Bold = true;
        cell.Style.Font.FontColor = XLColor.FromHtml(foreground);
        cell.Style.Fill.BackgroundColor = XLColor.FromHtml(background);
        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
    }

    private static string Text(string? value) => new((value ?? "").Where(XmlConvert.IsXmlChar).Take(32767).ToArray());
}
