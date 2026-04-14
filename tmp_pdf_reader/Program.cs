using System;
using System.IO;
using UglyToad.PdfPig;

class Program
{
    static void Main()
    {
        string pdfPath = @"d:\app_carniceria\Carniceria_Propuesta_Cliente.pdf";
        string outPath = @"d:\app_carniceria\Carniceria_Propuesta_Cliente.txt";
        using (StreamWriter sw = new StreamWriter(outPath))
        {
            try {
                using (var document = PdfDocument.Open(pdfPath))
                {
                    foreach (var page in document.GetPages())
                    {
                        sw.WriteLine(page.Text);
                    }
                }
            } catch (Exception e) {
                sw.WriteLine(e.Message);
            }
        }
    }
}
