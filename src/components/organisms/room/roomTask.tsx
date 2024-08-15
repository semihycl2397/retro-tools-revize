import React, { useState, useEffect } from "react";
import { List, Input, message } from "antd";
import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Buttons from "@/components/atoms/buttons/button";
import TopVotedComments from "@/components/organisms/room/TopVotedComments";
import ExportButton from "@/components/molecules/ExportButton/exportButton";
import styles from "./index.module.scss";

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
      <div className={styles.roomTaskContainer}>
        <div className={styles.meetingNoteSection}>
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
        </div>

        <div className={styles.notesListSection}>
          <h3>Notes</h3>
          <List
            dataSource={meetingNotes}
            renderItem={(note) => (
              <List.Item key={note.id}>
                <List.Item.Meta description={note.description} />
              </List.Item>
            )}
          />
        </div>
      </div>

      <TopVotedComments roomId={roomId} />

      <ExportButton roomId={roomId} />
    </div>
  );
};

export default RoomTask;
