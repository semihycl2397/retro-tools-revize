import React from "react";
import { Table, Space, Button } from "antd";
import { TableProps } from "antd";
import { Room } from "@/types/dashboard";
import { useRouter } from "next/router";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import ExportButton from "@/components/molecules/ExportButton/exportButton";

interface RoomTableProps extends TableProps<Room> {
  data: Room[];
}

const RoomTable: React.FC<RoomTableProps> = ({ data, ...props }) => {
  const router = useRouter();

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
        isActive: roomData.is_active,
        steps: stepsList,
        comments: commentsData,
        meetingNotes,
      };
    } catch (error) {
      console.error("Error fetching room data:", error);
      return null;
    }
  };

  const columns = [
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (isActive ? "Active" : "Inactive"),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (createdAt: { seconds: number }) =>
        new Date(createdAt.seconds * 1000).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, room: Room) => (
        <Space size="middle">
          <ExportButton room={room} fetchRoomData={fetchRoomData} />
          <Button type="link" onClick={() => router.push(`/room/${room.id}`)}>
            View Room
          </Button>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" {...props} />;
};

export default RoomTable;
