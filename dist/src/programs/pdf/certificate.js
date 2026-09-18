"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificatePdf = generateCertificatePdf;
const pdf_lib_1 = require("pdf-lib");
const logo_1 = require("./logo");
const NAVY = (0, pdf_lib_1.rgb)(10 / 255, 18 / 255, 41 / 255);
const GOLD = (0, pdf_lib_1.rgb)(201 / 255, 168 / 255, 76 / 255);
const MUTED = (0, pdf_lib_1.rgb)(90 / 255, 95 / 255, 110 / 255);
function centerText(page, text, font, size, y, color, pageWidth) {
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (pageWidth - width) / 2, y, size, font, color });
}
async function generateCertificatePdf(data) {
    const doc = await pdf_lib_1.PDFDocument.create();
    const page = doc.addPage([792, 612]);
    const { width, height } = page.getSize();
    const helvetica = await doc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const timesItalic = await doc.embedFont(pdf_lib_1.StandardFonts.TimesRomanItalic);
    page.drawRectangle({
        x: 24,
        y: 24,
        width: width - 48,
        height: height - 48,
        borderColor: NAVY,
        borderWidth: 3,
    });
    page.drawRectangle({
        x: 34,
        y: 34,
        width: width - 68,
        height: height - 68,
        borderColor: GOLD,
        borderWidth: 1,
    });
    const logoImage = await doc.embedPng(Buffer.from(logo_1.IIT_LOGO_BASE64, 'base64'));
    const logoWidth = 140;
    const logoHeight = logoWidth / (logoImage.width / logoImage.height);
    page.drawImage(logoImage, {
        x: (width - logoWidth) / 2,
        y: height - 90,
        width: logoWidth,
        height: logoHeight,
    });
    centerText(page, 'Certificate of Completion', timesItalic, 28, height - 150, GOLD, width);
    centerText(page, 'This certifies that', helvetica, 13, height - 210, MUTED, width);
    centerText(page, data.learnerName, helveticaBold, 26, height - 250, NAVY, width);
    centerText(page, 'has successfully completed the certification program', helvetica, 13, height - 285, MUTED, width);
    centerText(page, data.programTitle, helveticaBold, 20, height - 320, NAVY, width);
    const dateLabel = data.completedAt.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
    centerText(page, `Completed on ${dateLabel}`, helvetica, 12, height - 370, MUTED, width);
    const signatureCenterX = width / 2;
    centerText(page, 'Institute of International Trade', timesItalic, 20, 148, NAVY, width);
    page.drawLine({
        start: { x: signatureCenterX - 90, y: 140 },
        end: { x: signatureCenterX + 90, y: 140 },
        thickness: 1,
        color: MUTED,
    });
    centerText(page, 'Authorized Signatory', helveticaBold, 11, 124, NAVY, width);
    centerText(page, `Reference: ${data.referenceCode}`, helvetica, 10, 60, MUTED, width);
    const bytes = await doc.save();
    return Buffer.from(bytes);
}
//# sourceMappingURL=certificate.js.map