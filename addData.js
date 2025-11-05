import express from "express";
import ExcelJS from "exceljs";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/submit", async (req, res) => {
  try {
    const { name, surname, title, organization, city, country, phone } =
      req.body;

    // Load existing Excel file (or create new if not exists)
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile("boomExcel.xlsx");
    } catch (err) {
      console.log("File not found, creating a new one...");
      workbook
        .addWorksheet("Sheet1")
        .addRow([
          "Name",
          "Surname",
          "Title",
          "Organization",
          "City",
          "Country",
          "Phone",
        ]);
    }

    const sheet = workbook.getWorksheet("Sheet1");

    // Add new row
    sheet.addRow([name, surname, title, organization, city, country, phone]);

    // Save Excel file
    await workbook.xlsx.writeFile("boomExcel.xlsx");

    res.send("✅ Data submitted successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error saving data.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
