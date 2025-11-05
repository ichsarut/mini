import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TimePeriodReport,
  UserReport,
  DayStatsReport,
  CategoryReport,
  SummaryReport,
  MonthlyLeaveReport,
} from "@/lib/reports";
import { formatDateShort } from "@/lib/dateUtils";
import { loadSarabunFont, addSarabunFonts } from "@/lib/pdfFonts";

// สร้าง PDF สำหรับรายงานสรุปภาพรวม
export const generateSummaryPDF = async (
  summary: SummaryReport
): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  // Header - ใช้ฟอนต์ Bold
  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text("รายงานสรุปภาพรวมการลา", 14, 20);

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );

  let yPos = 45;

  // Summary Cards
  doc.setFont("Sarabun", "bold");
  doc.setFontSize(14);
  doc.text("สรุปข้อมูล", 14, yPos);
  yPos += 10;

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(10);
  const summaryData = [
    ["จำนวนการจองทั้งหมด", `${summary.totalBookings} ครั้ง`],
    ["จำนวนวันลาทั้งหมด", `${summary.totalDays} วัน`],
    ["จำนวนผู้ใช้", `${summary.totalUsers} คน`],
    ["เฉลี่ยวัน/ครั้ง", `${summary.averageDaysPerBooking} วัน`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["รายการ", "จำนวน"]],
    body: summaryData,
    theme: "striped",
    headStyles: {
      fillColor: [34, 197, 94],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Category Breakdown
  doc.setFont("Sarabun", "bold");
  doc.setFontSize(14);
  doc.text("สรุปตามประเภทการลา", 14, yPos);
  yPos += 10;

  const categoryData = [
    [
      "ในประเทศ",
      `${summary.domesticBookings} ครั้ง`,
      `${summary.domesticDays} วัน`,
    ],
    [
      "นอกประเทศ",
      `${summary.internationalBookings} ครั้ง`,
      `${summary.internationalDays} วัน`,
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["ประเภท", "จำนวนครั้ง", "จำนวนวัน"]],
    body: categoryData,
    theme: "striped",
    headStyles: {
      fillColor: [99, 102, 241],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Highlights
  if (summary.mostPopularDay || summary.mostActiveUser) {
    doc.setFont("Sarabun", "bold");
    doc.setFontSize(14);
    doc.text("ไฮไลท์", 14, yPos);
    yPos += 10;

    const highlights: string[][] = [];
    if (summary.mostPopularDay) {
      highlights.push([
        "วันยอดนิยม",
        summary.mostPopularDay.dateDisplay,
        `${summary.mostPopularDay.bookingCount} การจอง`,
      ]);
    }
    if (summary.mostActiveUser) {
      highlights.push([
        "ผู้ใช้ที่ลาบ่อยที่สุด",
        summary.mostActiveUser.userName,
        `${summary.mostActiveUser.totalDays} วัน`,
      ]);
    }

    autoTable(doc, {
      startY: yPos,
      head: [["ประเภท", "รายละเอียด", "จำนวน"]],
      body: highlights,
      theme: "striped",
      headStyles: {
        fillColor: [251, 191, 36],
        font: "Sarabun",
        fontStyle: "bold",
      },
      styles: { font: "Sarabun", fontSize: 10 },
    });
  }

  doc.save(`รายงานสรุปภาพรวม_${new Date().toISOString().split("T")[0]}.pdf`);
};

// สร้าง PDF สำหรับรายงานตามช่วงเวลา
export const generateTimePeriodPDF = async (
  reports: TimePeriodReport[],
  periodType: "month" | "year"
): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text(
    `รายงานตามช่วงเวลา (${periodType === "month" ? "รายเดือน" : "รายปี"})`,
    14,
    20
  );

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );

  const tableData = reports.map((report) => {
    const periodLabel =
      periodType === "month"
        ? report.period.replace(/(\d{4})-(\d{2})/, (_, year, month) => {
            const months = [
              "มกราคม",
              "กุมภาพันธ์",
              "มีนาคม",
              "เมษายน",
              "พฤษภาคม",
              "มิถุนายน",
              "กรกฎาคม",
              "สิงหาคม",
              "กันยายน",
              "ตุลาคม",
              "พฤศจิกายน",
              "ธันวาคม",
            ];
            return `${months[parseInt(month) - 1]} ${parseInt(year) + 543}`;
          })
        : `ปี ${parseInt(report.period) + 543}`;

    return [
      periodLabel,
      `${report.totalBookings}`,
      `${report.totalDays}`,
      `${report.domesticBookings} (${report.domesticDays} วัน)`,
      `${report.internationalBookings} (${report.internationalDays} วัน)`,
    ];
  });

  autoTable(doc, {
    startY: 45,
    head: [["ช่วงเวลา", "การจอง", "วันลา", "ในประเทศ", "นอกประเทศ"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [34, 197, 94],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 9 },
  });

  doc.save(
    `รายงานตามช่วงเวลา_${periodType}_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
};

// สร้าง PDF สำหรับรายงานตามประเภท
export const generateCategoryPDF = async (
  reports: CategoryReport[]
): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text("รายงานตามประเภทการลา", 14, 20);

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );

  const tableData = reports.map((report) => [
    report.categoryLabel,
    `${report.totalBookings}`,
    `${report.totalDays}`,
    `${report.averageDays}`,
    `${report.uniqueUsers}`,
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      [
        "ประเภท",
        "จำนวนครั้ง",
        "วันลาทั้งหมด",
        "เฉลี่ยวัน/ครั้ง",
        "จำนวนผู้ใช้",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [99, 102, 241],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 10 },
  });

  doc.save(`รายงานตามประเภท_${new Date().toISOString().split("T")[0]}.pdf`);
};

// สร้าง PDF สำหรับรายงานตามผู้ใช้
export const generateUserPDF = async (reports: UserReport[]): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text("รายงานตามผู้ใช้", 14, 20);

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );

  const tableData = reports.map((report, index) => [
    index + 1,
    report.userName,
    `${report.totalBookings}`,
    `${report.totalDays}`,
    `${report.domesticBookings} (${report.domesticDays} วัน)`,
    `${report.internationalBookings} (${report.internationalDays} วัน)`,
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      [
        "ลำดับ",
        "ชื่อผู้ใช้",
        "จำนวนครั้ง",
        "วันลาทั้งหมด",
        "ในประเทศ",
        "นอกประเทศ",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [34, 197, 94],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 9 },
  });

  doc.save(`รายงานตามผู้ใช้_${new Date().toISOString().split("T")[0]}.pdf`);
};

// สร้าง PDF สำหรับรายงานสถิติวัน
export const generateDayStatsPDF = async (
  reports: DayStatsReport[]
): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text("รายงานสถิติวัน (วันที่มีการลามากที่สุด)", 14, 20);

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );
  doc.text(`แสดง ${reports.length} อันดับแรก`, 14, 37);

  const tableData = reports.map((report, index) => [
    index + 1,
    report.dateDisplay,
    `${report.bookingCount}`,
    report.users.join(", "),
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["อันดับ", "วันที่", "จำนวนการจอง", "ผู้ใช้"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [251, 191, 36],
      font: "Sarabun",
      fontStyle: "bold",
    },
    styles: { font: "Sarabun", fontSize: 9 },
    columnStyles: {
      3: { cellWidth: 80 }, // กำหนดความกว้างคอลัมน์ผู้ใช้
    },
  });

  doc.save(`รายงานสถิติวัน_${new Date().toISOString().split("T")[0]}.pdf`);
};

// สร้าง PDF สำหรับรายงานการลาแบบรายเดือน
export const generateMonthlyLeavePDF = async (
  reports: MonthlyLeaveReport[],
  year: number,
  month: number
): Promise<void> => {
  const doc = new jsPDF();

  // โหลดและเพิ่มฟอนต์ Sarabun
  const fonts = await loadSarabunFont();
  addSarabunFonts(doc, fonts);

  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  doc.setFont("Sarabun", "bold");
  doc.setFontSize(20);
  doc.text(`รายงานการลาเดือน${monthNames[month]} ${year + 543}`, 14, 20);

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(12);
  doc.text(
    `วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`,
    14,
    30
  );

  let yPos = 45;
  let pageNumber = 1;

  // กรองเฉพาะวันที่มีการลา
  const daysWithLeaves = reports.filter((day) => day.bookings.length > 0);

  if (daysWithLeaves.length === 0) {
    doc.setFont("Sarabun", "normal");
    doc.setFontSize(12);
    doc.text("ไม่มีข้อมูลการลาในเดือนนี้", 14, yPos);
    doc.save(
      `รายงานการลา_${monthNames[month]}_${year + 543}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
    return;
  }

  // แบ่งข้อมูลเป็นหลายหน้า (ถ้ามีมาก)
  const itemsPerPage = 25;
  let currentPage = 0;
  let startIndex = 0;

  while (startIndex < daysWithLeaves.length) {
    if (pageNumber > 1) {
      doc.addPage();
      yPos = 20;
    }

    const endIndex = Math.min(startIndex + itemsPerPage, daysWithLeaves.length);
    const pageData = daysWithLeaves.slice(startIndex, endIndex);

    // สร้างตารางสำหรับหน้านี้
    const tableData = pageData.map((day) => {
      const bookingInfo = day.bookings
        .map((b) => {
          if (b.isMultiDay) {
            return `${b.userName} (${b.categoryLabel}) [${formatDateShort(
              new Date(b.startDate)
            )} - ${b.endDate ? formatDateShort(new Date(b.endDate)) : ""}]`;
          }
          return `${b.userName} (${b.categoryLabel})`;
        })
        .join(", ");

      return [
        `${day.dayOfWeek} ${day.dateDisplay}`,
        day.bookings.length > 0 ? `${day.bookings.length} คน` : "-",
        bookingInfo || "-",
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [["วันที่", "จำนวนคน", "รายชื่อผู้ลา"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [34, 197, 94],
        font: "Sarabun",
        fontStyle: "bold",
      },
      styles: { font: "Sarabun", fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 110 },
      },
      didParseCell: function (data: any) {
        // ถ้า cell มีข้อมูลมากเกินไป ให้ wrap text
        if (
          data.column.index === 2 &&
          data.cell.text &&
          data.cell.text.length > 50
        ) {
          data.cell.text = data.cell.text;
          data.cell.styles.cellPadding = {
            top: 2,
            right: 2,
            bottom: 2,
            left: 2,
          };
        }
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // เพิ่มหมายเลขหน้า
    doc.setFont("Sarabun", "normal");
    doc.setFontSize(10);
    doc.text(
      `หน้า ${pageNumber}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );

    startIndex = endIndex;
    pageNumber++;
  }

  doc.save(
    `รายงานการลา_${monthNames[month]}_${year + 543}_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
};
