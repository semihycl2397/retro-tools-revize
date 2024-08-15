import React, { useState, useEffect } from "react";
import { List, Input, message } from "antd";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Buttons from "@/components/atoms/buttons/button";
import TopVotedComments from "@/components/organisms/room/TopVotedComments";

interface RoomTaskProps {
  roomId: string;
}

interface MeetingNote {
  id: string;
  description: string;
  timestamp: Date;
}

const RoomTask: React.FC<RoomTaskProps> = ({ roomId }) => {
  const [description, setDescription] = useState<string>("");
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);

  useEffect(() => {
    if (!roomId) {
      console.error("roomId is undefined. Cannot query Firestore.");
      return;
    }

    const fetchMeetingNotes = async () => {
      try {
        const q = query(
          collection(db, "meeting_notes"),
          where("room_id", "==", roomId)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const notes: MeetingNote[] = [];
          querySnapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() } as MeetingNote);
          });
          setMeetingNotes(notes);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching meeting notes: ", error);
      }
    };

    fetchMeetingNotes();
  }, [roomId]);

  const handleSaveMeetingNote = async () => {
    if (description.trim() === "") {
      message.error("Description cannot be empty");
      return;
    }

    try {
      const meetingNotesRef = collection(db, "meeting_notes");
      await addDoc(meetingNotesRef, {
        room_id: roomId,
        description: description,
        timestamp: new Date(),
      });
      setDescription("");
      message.success("Meeting note saved successfully");
    } catch (error) {
      console.error("Error saving meeting note: ", error);
      message.error("Failed to save meeting note");
    }
  };

  return (
    <div>
      <h3>Meeting Notes</h3>
      <Input.TextArea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter your meeting notes here..."
        rows={4}
      />
      <Buttons
        htmlType="button"
        onClick={handleSaveMeetingNote}
        text="Save Meeting Note"
      />

      <h4 style={{ marginTop: "20px" }}>Notes</h4>
      <List
        dataSource={meetingNotes}
        renderItem={(note) => (
          <List.Item key={note.id}>
            <List.Item.Meta description={note.description} />
          </List.Item>
        )}
      />

      {/* Top Voted Comments and Groups */}
      <TopVotedComments roomId={roomId} />

      <a href="/room-lists">
        <Buttons text="For Export" />
      </a>
    </div>
  );
};

export default RoomTask;
