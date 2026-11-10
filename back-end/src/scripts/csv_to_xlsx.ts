import * as XLSX from 'xlsx';
import * as fs from 'fs';

const csvFilePath = './data/NEW_RULES.csv';
const xlsxFilePath = './data/RULES.xlsx';

const csvData = fs.readFileSync(csvFilePath, 'utf8');

const lines = csvData.split('\n');
const headers = lines[0].split(',');
const rows = lines.slice(1).map(line => line.split(','));

const jsonData = rows.map(row => {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
        obj[header] = row[index] || '';
    });
    return obj;
});

const worksheet = XLSX.utils.json_to_sheet(jsonData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

XLSX.writeFile(workbook, xlsxFilePath);

console.log(`Archivo XLSX guardado en: ${xlsxFilePath}`);