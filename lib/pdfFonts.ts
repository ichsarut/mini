/**
 * ฟังก์ชันสำหรับโหลดและฝังฟอนต์ Sarabun ใน jsPDF
 * ต้องเรียกใช้ก่อนสร้าง PDF
 */

export const loadSarabunFont = async (): Promise<{
  regular: string;
  bold: string;
}> => {
  // โหลดฟอนต์จาก public folder
  const regularResponse = await fetch("/fonts/sarabun-regular.ttf");
  const boldResponse = await fetch("/fonts/sarabun-bold.ttf");

  const regularBlob = await regularResponse.blob();
  const boldBlob = await boldResponse.blob();

  // แปลงเป็น base64
  const regularBase64 = await blobToBase64(regularBlob);
  const boldBase64 = await blobToBase64(boldBlob);

  return {
    regular: regularBase64,
    bold: boldBase64,
  };
};

// Helper function: แปลง Blob เป็น base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // ตัด "data:application/octet-stream;base64," ออก
      const base64 = base64String.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// ฟังก์ชันสำหรับเพิ่มฟอนต์ Sarabun ลงใน jsPDF document
export const addSarabunFonts = (doc: any, fonts: { regular: string; bold: string }): void => {
  try {
    // เพิ่มฟอนต์ Sarabun Regular
    doc.addFileToVFS("Sarabun-Regular.ttf", fonts.regular);
    doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
    
    // เพิ่มฟอนต์ Sarabun Bold
    doc.addFileToVFS("Sarabun-Bold.ttf", fonts.bold);
    doc.addFont("Sarabun-Bold.ttf", "Sarabun", "bold");
    
    // ตั้งค่าเป็นฟอนต์เริ่มต้น
    doc.setFont("Sarabun", "normal");
  } catch (error) {
    console.error("Failed to add Sarabun fonts:", error);
    // ถ้าเพิ่มฟอนต์ไม่สำเร็จ ให้ใช้ฟอนต์ default
    doc.setFont("helvetica", "normal");
  }
};

