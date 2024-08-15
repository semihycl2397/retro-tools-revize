import React, { useState, useEffect } from "react";
import { Row, Col, Card, List } from "antd";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import styles from "./index.module.scss";

interface Comment {
  id: string;
  message: string;
  likes: number;
  dislikes: number;
  step_id: string;
}

interface CommentGroup {
  id: string;
  comments: string[]; // Grup içindeki yorum ID'leri
  total_likes: number;
  total_dislikes: number;
}

const TopVotedComments: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [topComments, setTopComments] = useState<Comment[]>([]);
  const [topGroups, setTopGroups] = useState<CommentGroup[]>([]);

  useEffect(() => {
    const fetchTopCommentsAndGroups = async () => {
      const commentsQuery = query(
        collection(db, "comments"),
        where("room_id", "==", roomId)
      );
      const groupsQuery = query(
        collection(db, "comment_groups"),
        where("room_id", "==", roomId)
      );

      const commentsSnapshot = await getDocs(commentsQuery);
      const groupsSnapshot = await getDocs(groupsQuery);

      const allComments: Comment[] = [];
      const allGroups: CommentGroup[] = [];

      commentsSnapshot.forEach((doc) => {
        const data = doc.data() as Comment;
        allComments.push(data);
      });

      for (const groupDoc of groupsSnapshot.docs) {
        const groupData = groupDoc.data() as CommentGroup;
        const groupComments: Comment[] = [];

        // Her bir yorum ID'si için comments tablosundan ilgili veriyi çekiyoruz
        for (const commentId of groupData.comments) {
          const commentDoc = await getDoc(doc(db, "comments", commentId));
          if (commentDoc.exists()) {
            groupComments.push(commentDoc.data() as Comment);
          }
        }

        allGroups.push({
          ...groupData,
          comments: groupComments.map((c) => c.message), // Grup içindeki yorumların mesajlarını alıyoruz
        });
      }

      const topComments = allComments
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 5);

      const topGroups = allGroups
        .sort((a, b) => b.total_likes - a.total_likes)
        .slice(0, 5);

      setTopComments(topComments);
      setTopGroups(topGroups);
    };

    fetchTopCommentsAndGroups();
  }, [roomId]);

  const renderComment = (
    comment: Comment | CommentGroup,
    index: number,
    isGroup: boolean
  ) => (
    <Col span={12} key={comment.id} style={{ marginBottom: "16px" }}>
      <Card className={isGroup ? styles.commentCard : styles.singleCommentCard}>
        <p>{isGroup ? `Grup: ${comment.comments.join(", ")}` : comment.message}</p> {/* Grup içindeki yorumları virgülle ayırarak gösteriyoruz */}
        <p>
          Likes: {isGroup ? (comment as CommentGroup).total_likes : comment.likes} | Dislikes:{" "}
          {isGroup ? (comment as CommentGroup).total_dislikes : comment.dislikes}
        </p>
      </Card>
    </Col>
  );

  return (
    <div>
      <h3>En Çok Oy Alan Yorumlar ve Gruplar</h3>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <h4>En Çok Oy Alan Yorumlar</h4>
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={topComments}
            renderItem={(comment, index) => renderComment(comment, index, false)}
          />
        </Col>
        <Col span={12}>
          <h4>En Çok Oy Alan Yorum Grupları</h4>
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={topGroups}
            renderItem={(group, index) =>
              renderComment(group, index, true)
            }
          />
        </Col>
      </Row>
    </div>
  );
};

export default TopVotedComments;
