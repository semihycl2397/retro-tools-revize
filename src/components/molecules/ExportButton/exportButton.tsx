import React from "react";
import Buttons from "@/components/atoms/buttons/button";
import { Room } from "@/types/dashboard";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { message } from "antd";
import styles from "./index.module.scss";
interface ExportButtonProps {
  room: Room;
  fetchRoomData: (roomId: string) => Promise<any>;
}

const ExportButton: React.FC<ExportButtonProps> = ({ room, fetchRoomData }) => {
  const handleExport = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      const fontBytes = await fetch("/fonts/Roboto-Regular.ttf").then((res) =>
        res.arrayBuffer()
      );
      const customFont = await pdfDoc.embedFont(fontBytes);

      let page = pdfDoc.addPage([600, 400]);

      const addPageHeader = (page: any, title: string) => {
        page.setFont(customFont);
        page.setFontSize(16);
        page.drawText(title, {
          x: 50,
          y: 350,
          color: rgb(0, 0, 0),
        });
      };

      addPageHeader(page, "Oda Detayları");

      page.setFontSize(12);
      page.drawText(`- Şablon Adı: ${room.templateName}`, {
        x: 50,
        y: 320,
      });
      page.drawText(`- Durum: ${room.is_active ? "Aktif" : "Pasif"}`, {
        x: 50,
        y: 300,
      });
      page.drawText(
        `- Oluşturulma Tarihi: ${new Date(
          room.created_at.seconds * 1000
        ).toLocaleDateString()}`,
        {
          x: 50,
          y: 280,
        }
      );

      let currentY = 240;

      const roomData = await fetchRoomData(room.id);

      if (!roomData) {
        throw new Error("Room data could not be fetched");
      }

      const { steps, comments, meetingNotes } = roomData;

      const checkAndAddPage = () => {
        if (currentY < 50) {
          page = pdfDoc.addPage([600, 400]);
          currentY = 350;
        }
      };

      steps.forEach((step: any) => {
        page.setFontSize(14);
        page.drawText(`Adım: ${step.name}`, {
          x: 50,
          y: currentY,
        });
        currentY -= 30;
        checkAndAddPage();

        page.setFontSize(12);
        const stepComments = comments[step.id];
        if (stepComments && stepComments.length > 0) {
          stepComments.forEach((comment: any) => {
            page.drawText(`• ${comment.message}`, {
              x: 70,
              y: currentY,
            });
            currentY -= 20;
            checkAndAddPage();
          });
        } else {
          page.drawText("• Bu adım için yorum bulunmamaktadır.", {
            x: 70,
            y: currentY,
          });
          currentY -= 20;
          checkAndAddPage();
        }

        currentY -= 30;
        checkAndAddPage();
      });

      if (meetingNotes.length > 0) {
        page.setFontSize(14);
        page.drawText("Toplantı Notları:", {
          x: 50,
          y: currentY,
        });
        currentY -= 20;
        checkAndAddPage();

        meetingNotes.forEach((note: any, index: number) => {
          page.setFontSize(12);
          page.drawText(`• Not ${index + 1}: ${note.description}`, {
            x: 70,
            y: currentY,
          });
          currentY -= 20;
          checkAndAddPage();
        });
      } else {
        page.drawText("Toplantı notları bulunmamaktadır.", {
          x: 50,
          y: currentY,
        });
        currentY -= 20;
        checkAndAddPage();
      }

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Oda_${room.id}.pdf`;
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
      className={styles.exportButton}
    />
  );
};

export default ExportButton;
