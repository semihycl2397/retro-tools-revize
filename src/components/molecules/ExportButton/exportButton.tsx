import React from "react";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { message } from "antd";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Buttons from "@/components/atoms/buttons/button";

interface ExportButtonProps {
  roomId: string;
}

const textToPDF = (text: string) => {
  return text
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/ü/g, "u")
    .replace(/İ/g, "I")
    .replace(/Ğ/g, "G")
    .replace(/Ş/g, "S")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")
    .replace(/Ü/g, "U");
};

const ExportButton: React.FC<ExportButtonProps> = ({ roomId }) => {
  const fetchRoomData = async (roomId: string) => {
    try {
      if (!roomId) {
        throw new Error("Invalid roomId");
      }

      const roomRef = doc(db, "rooms", roomId);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        console.error("No such room!");
        return null;
      }

      const roomData = roomDoc.data();

      const templateId = roomData.template_id;
      const templateRef = doc(db, "templates", templateId);
      const templateDoc = await getDoc(templateRef);

      if (!templateDoc.exists()) {
        console.error("No such template!");
        return null;
      }

      const templateData = templateDoc.data();

      const stepsList = templateData.step_names.map((step: any) => ({
        id: step.id,
        name: step.name,
      }));

      const commentsQuery = query(
        collection(db, "comments"),
        where("room_id", "==", roomId)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData: any = {};

      commentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!commentsData[data.step_id]) {
          commentsData[data.step_id] = [];
        }
        commentsData[data.step_id].push({
          ...data,
        });
      });

      const meetingNotesQuery = query(
        collection(db, "meeting_notes"),
        where("room_id", "==", roomId)
      );
      const meetingNotesSnapshot = await getDocs(meetingNotesQuery);
      const meetingNotes = meetingNotesSnapshot.docs.map((doc) => doc.data());

      return {
        templateId,
        templateName: templateData.name,
        isActive: roomData.is_active,
        created_at: roomData.created_at,
        steps: stepsList,
        comments: commentsData,
        meetingNotes,
      };
    } catch (error) {
      console.error("Error fetching room data:", error);
      return null;
    }
  };

  const handleExport = async () => {
    try {
      const roomData = await fetchRoomData(roomId);

      if (!roomData) {
        message.error("Room data could not be fetched");
        return;
      }

      const { templateName, isActive, created_at, steps, comments, meetingNotes } = roomData;

      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      const fontBytes = await fetch("/fonts/Roboto-Regular.ttf").then((res) =>
        res.arrayBuffer()
      );
      const customFont = await pdfDoc.embedFont(fontBytes);

      let page = pdfDoc.addPage([595, 842]);

      const addPageHeader = (page: any, title: string) => {
        page.setFont(customFont);
        page.setFontSize(16);
        page.drawText(textToPDF(title), {
          x: 50,
          y: 800,
          color: rgb(0, 0, 0),
        });
      };

      addPageHeader(page, "Oda Detayları");

      page.setFont(customFont);
      page.setFontSize(12);
      page.drawText(textToPDF(`- Şablon Adı: ${templateName}`), {
        x: 50,
        y: 770,
      });
      page.drawText(
        textToPDF(`- Durum: ${isActive ? "Aktif" : "Pasif"}`),
        {
          x: 50,
          y: 750,
        }
      );
      page.drawText(
        textToPDF(
          `- Oluşturulma Tarihi: ${new Date(
            created_at.seconds * 1000
          ).toLocaleDateString()}`
        ),
        {
          x: 50,
          y: 730,
        }
      );

      let currentY = 700;

      steps.forEach((step: any) => {
        page.setFontSize(14);
        page.drawText(textToPDF(`Adım: ${step.name}`), {
          x: 50,
          y: currentY,
        });
        currentY -= 20;

        const stepComments = comments[step.id];
        if (stepComments && stepComments.length > 0) {
          stepComments.forEach((comment: any) => {
            // Basit metin yerleşimi, satır sarma olmadan
            page.drawText(`• ${textToPDF(comment.message)}`, {
              x: 70,
              y: currentY,
            });
            currentY -= 20;
            if (currentY < 50) {
              page = pdfDoc.addPage([595, 842]);
              currentY = 800;
              page.setFont(customFont);
              page.setFontSize(12);
            }
          });
        } else {
          page.drawText(textToPDF("• Bu adım için yorum bulunmamaktadır."), {
            x: 70,
            y: currentY,
          });
          currentY -= 20;
        }

        currentY -= 20;
      });

      if (meetingNotes.length > 0) {
        page.setFontSize(14);
        page.drawText(textToPDF("Toplantı Notları:"), {
          x: 50,
          y: currentY,
        });
        currentY -= 20;

        meetingNotes.forEach((note: any, index: number) => {
          page.setFontSize(12);
          // Tek seferde uzun metin ekleyin, basitçe sayfa taşarsa yeni sayfa açın
          page.drawText(`• Not ${index + 1}: ${textToPDF(note.description)}`, {
            x: 70,
            y: currentY,
          });
          currentY -= 20;

          if (currentY < 50) {
            page = pdfDoc.addPage([595, 842]);
            currentY = 800;
            page.setFont(customFont);
            page.setFontSize(12);
          }
        });
      } else {
        page.drawText(textToPDF("Toplantı notları bulunmamaktadır."), {
          x: 50,
          y: currentY,
        });
        currentY -= 20;
      }

      const fileName = templateName
        ? `Oda_${templateName.replace(/\s+/g, "_")}.pdf`
        : `Oda_${new Date().toISOString().split("T")[0]}.pdf`;

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting room data:", error);
      message.error("Oda verileri dışa aktarılırken bir hata oluştu");
    }
  };

  return (
    <Buttons
      onClick={handleExport}
      text="Export"
    />
  );
};

export default ExportButton;
