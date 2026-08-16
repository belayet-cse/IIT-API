import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const NAVY = rgb(10 / 255, 18 / 255, 41 / 255);
const GOLD = rgb(201 / 255, 168 / 255, 76 / 255);
const MUTED = rgb(90 / 255, 95 / 255, 110 / 255);

export interface CertificateData {
  learnerName: string;
  programTitle: string;
  completedAt: Date;
  referenceCode: string;
}

function centerText(
  page: import('pdf-lib').PDFPage,
  text: string,
  font: import('pdf-lib').PDFFont,
  size: number,
  y: number,
  color: ReturnType<typeof rgb>,
  pageWidth: number,
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (pageWidth - width) / 2, y, size, font, color });
}

// A single-page, on-demand-generated certificate — nothing is persisted to
// disk (Vercel's serverless filesystem is ephemeral), so this is regenerated
// fresh from Enrollment/Program/User data on every download request.
export async function generateCertificatePdf(
  data: CertificateData,
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([792, 612]); // US Letter, landscape
  const { width, height } = page.getSize();

  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  // Border
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

  centerText(
    page,
    'INSTITUTE OF INTERNATIONAL TRADE',
    helveticaBold,
    14,
    height - 100,
    NAVY,
    width,
  );
  centerText(
    page,
    'Certificate of Completion',
    timesItalic,
    28,
    height - 150,
    GOLD,
    width,
  );

  centerText(
    page,
    'This certifies that',
    helvetica,
    13,
    height - 210,
    MUTED,
    width,
  );
  centerText(
    page,
    data.learnerName,
    helveticaBold,
    26,
    height - 250,
    NAVY,
    width,
  );
  centerText(
    page,
    'has successfully completed the certification program',
    helvetica,
    13,
    height - 285,
    MUTED,
    width,
  );
  centerText(
    page,
    data.programTitle,
    helveticaBold,
    20,
    height - 320,
    NAVY,
    width,
  );

  const dateLabel = data.completedAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  centerText(
    page,
    `Completed on ${dateLabel}`,
    helvetica,
    12,
    height - 370,
    MUTED,
    width,
  );
  centerText(
    page,
    `Reference: ${data.referenceCode}`,
    helvetica,
    10,
    60,
    MUTED,
    width,
  );

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
